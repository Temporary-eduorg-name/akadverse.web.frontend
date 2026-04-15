import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
const EMAIL_PAGE = `${process.env.NEXT_LIVE_APP_URL_ALT}/studashboard/main-menu/essentials/email`;

export async function GET(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth.valid || !auth.userId) {
    return NextResponse.redirect(`${EMAIL_PAGE}?error=auth_failed`);
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");

  if (oauthError || !code) {
    return NextResponse.redirect(`${EMAIL_PAGE}?error=oauth_denied`);
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI_ALT!,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      return NextResponse.redirect(`${EMAIL_PAGE}?error=token_exchange`);
    }

    const tokenData: {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    } = await tokenResponse.json();

    const { access_token, refresh_token, expires_in } = tokenData;

    // Fetch the Gmail address
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
      { headers: { Authorization: `Bearer ${access_token}` } },
    );
    const userInfo: { email?: string } = await userInfoResponse.json();
    const email = userInfo.email ?? "";

    const tokenExpiry = expires_in
      ? new Date(Date.now() + expires_in * 1000)
      : null;

    await prisma.emailConnection.upsert({
      where: { userId: auth.userId },
      create: {
        userId: auth.userId,
        email,
        accessToken: access_token,
        refreshToken: refresh_token ?? "",
        tokenExpiry,
      },
      update: {
        email,
        accessToken: access_token,
        ...(refresh_token ? { refreshToken: refresh_token } : {}),
        tokenExpiry,
      },
    });

    return NextResponse.redirect(`${EMAIL_PAGE}?connected=true`);
  } catch {
    return NextResponse.redirect(`${EMAIL_PAGE}?error=server`);
  }
}

