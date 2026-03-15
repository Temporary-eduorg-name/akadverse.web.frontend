import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth.valid || !auth.userId) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }

  try {
    const connection = await prisma.emailConnection.findUnique({
      where: { userId: auth.userId },
    });

    if (!connection) {
      return NextResponse.json({ connected: false });
    }

    const now = new Date();
    const isExpired = connection.tokenExpiry ? connection.tokenExpiry < now : false;

    // Expired with no refresh token â†’ truly disconnected
    if (isExpired && !connection.refreshToken) {
      return NextResponse.json({ connected: false, reason: "token_expired" });
    }

    return NextResponse.json({
      connected: true,
      email: connection.email,
      expired: isExpired,
    });
  } catch {
    return NextResponse.json({ connected: false }, { status: 500 });
  }
}

