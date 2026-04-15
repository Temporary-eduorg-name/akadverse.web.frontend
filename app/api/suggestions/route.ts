import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { verifyAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

type SuggestionCategory = "suggestion" | "bug" | "feature" | "other";

type SuggestionAttachment = {
  name: string;
  size: number;
  type: string;
};

const VALID_CATEGORIES: SuggestionCategory[] = ["suggestion", "bug", "feature", "other"];

export async function POST(req: NextRequest) {
  try {
    const auth = verifyAuth(req);
    if (!auth.valid || !auth.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const category = body?.category as SuggestionCategory;
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const attachments = Array.isArray(body?.attachments)
      ? (body.attachments as SuggestionAttachment[])
      : [];

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    if (message.length < 8) {
      return NextResponse.json(
        { error: "Please provide more details (at least 8 characters)." },
        { status: 400 },
      );
    }

    const normalizedAttachments = attachments
      .filter((item) => typeof item?.name === "string")
      .slice(0, 10)
      .map((item) => ({
        name: item.name,
        size: Number(item.size) || 0,
        type: item.type || "unknown",
      }));

    const suggestion = await prisma.suggestion.create({
      data: {
        userId: auth.userId,
        category,
        message,
        hasAttachments: normalizedAttachments.length > 0,
        attachmentCount: normalizedAttachments.length,
        attachmentNames: normalizedAttachments.map((item) => item.name),
      },
      select: {
        id: true,
        category: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ message: "Suggestion submitted successfully", suggestion }, { status: 201 });
  } catch (error) {
    console.error("Create suggestion error:", error);
    return NextResponse.json({ error: "Failed to submit suggestion" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin.valid || !admin.userId) {
      return NextResponse.json({ error: "Unauthorized - Super-admin access required" }, { status: 403 });
    }

    const suggestions = await prisma.suggestion.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 300,
    });

    return NextResponse.json({ suggestions }, { status: 200 });
  } catch (error) {
    console.error("Get suggestions error:", error);
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 });
  }
}
