import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type GmailFolder = "inbox" | "starred" | "sent" | "spam" | "trash";

const FOLDER_TO_LABEL: Record<GmailFolder, string> = {
  inbox: "INBOX",
  starred: "STARRED",
  sent: "SENT",
  spam: "SPAM",
  trash: "TRASH",
};

async function refreshAccessToken(userId: string, refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!res.ok) return null;

    const data: { access_token: string; expires_in?: number } = await res.json();
    const tokenExpiry = data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000)
      : null;

    await prisma.emailConnection.update({
      where: { userId },
      data: { accessToken: data.access_token, tokenExpiry },
    });

    return data.access_token;
  } catch {
    return null;
  }
}

interface GmailPart {
  mimeType?: string;
  body?: { data?: string; size?: number };
  parts?: GmailPart[];
  filename?: string;
}

function extractTextBody(payload: GmailPart): string {
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return Buffer.from(payload.body.data, "base64url").toString("utf-8");
  }
  if (Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      const result = extractTextBody(part);
      if (result) return result;
    }
  }
  return "";
}

function hasAttachments(payload: GmailPart): boolean {
  if (Array.isArray(payload.parts)) {
    return payload.parts.some(
      (p) => typeof p.filename === "string" && p.filename.length > 0,
    );
  }
  return false;
}

interface GmailMessage {
  id: string;
  labelIds?: string[];
  snippet?: string;
  payload?: GmailPart & { headers?: { name: string; value: string }[] };
}

function parseGmailMessage(msg: GmailMessage) {
  const headers = msg.payload?.headers ?? [];
  const getHeader = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";

  const from = getHeader("From");
  const nameMatch = from.match(/^(.+?)\s*<(.+?)>$/);
  const sender = nameMatch ? nameMatch[1].replace(/"/g, "").trim() : from;
  const senderEmail = nameMatch ? nameMatch[2].trim() : from;

  const subject = getHeader("Subject") || "(No subject)";
  const date = getHeader("Date");

  const labelIds = msg.labelIds ?? [];
  const payload = msg.payload ?? {};
  const body = extractTextBody(payload) || msg.snippet || "";
  const snippet = msg.snippet ?? "";

  let timestamp = "";
  if (date) {
    const parsed = new Date(date);
    const now = new Date();
    const diff = now.getTime() - parsed.getTime();
    const dayMs = 86400000;
    if (diff < dayMs) {
      timestamp = parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diff < 7 * dayMs) {
      timestamp = parsed.toLocaleDateString([], { weekday: "short" });
    } else {
      timestamp = parsed.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  }

  return {
    id: msg.id,
    sender,
    senderEmail,
    subject,
    preview: snippet,
    body,
    isRead: !labelIds.includes("UNREAD"),
    isStarred: labelIds.includes("STARRED"),
    hasAttachment: hasAttachments(payload),
    timestamp,
    avatarColor: "",
  };
}

export async function GET(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth.valid || !auth.userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const folder = (searchParams.get("folder") ?? "inbox") as GmailFolder;
  const labelId = FOLDER_TO_LABEL[folder] ?? "INBOX";
  const limitParam = Number.parseInt(searchParams.get("limit") ?? "20", 10);
  const limit = Number.isNaN(limitParam) ? 20 : Math.min(Math.max(limitParam, 1), 20);

  const connection = await prisma.emailConnection.findUnique({
    where: { userId: auth.userId },
  });

  if (!connection) {
    return NextResponse.json({ error: "Gmail not connected" }, { status: 400 });
  }

  let accessToken = connection.accessToken;

  // Refresh token if expired
  if (connection.tokenExpiry && connection.tokenExpiry < new Date()) {
    const newToken = await refreshAccessToken(auth.userId, connection.refreshToken);
    if (!newToken) {
      return NextResponse.json(
        { error: "Access token expired and refresh failed" },
        { status: 401 },
      );
    }
    accessToken = newToken;
  }

  try {
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds=${labelId}&maxResults=${limit}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!listRes.ok) {
      return NextResponse.json({ error: "Failed to list messages" }, { status: 502 });
    }

    const listData: { messages?: { id: string }[] } = await listRes.json();
    const ids = (listData.messages ?? []).map((m) => m.id);

    if (ids.length === 0) {
      return NextResponse.json({ messages: [] });
    }

    const rawMessages = await Promise.all(
      ids.map((id) =>
        fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        ).then((r) => r.json() as Promise<GmailMessage>),
      ),
    );

    return NextResponse.json({ messages: rawMessages.map(parseGmailMessage) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

