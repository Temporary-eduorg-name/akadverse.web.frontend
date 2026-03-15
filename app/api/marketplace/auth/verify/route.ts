import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const authResult = verifyAuth(req);

  if (!authResult.valid) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  return NextResponse.json(
    {
      authenticated: true,
      userId: authResult.userId,
      role: authResult.role,
    },
    { status: 200 }
  );
}
