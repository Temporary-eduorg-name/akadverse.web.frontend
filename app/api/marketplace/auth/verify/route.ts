import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { generateAccessToken, verifyAccessToken, verifyRefreshToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  const authResult = verifyAuth(req);

  if (!authResult.valid) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  const accessToken = req.cookies.get("accessToken")?.value;
  const decodedAccess = accessToken ? verifyAccessToken(accessToken) : null;

  // If access token is missing/expired but refresh token is valid, issue a fresh access token.
  if (!decodedAccess) {
    const refreshToken = req.cookies.get("refreshToken")?.value;
    if (refreshToken) {
      const decodedRefresh = verifyRefreshToken(refreshToken);
      if (decodedRefresh) {
        const newAccessToken = generateAccessToken({
          userId: decodedRefresh.userId,
          email: decodedRefresh.email,
          role: decodedRefresh.role,
        });

        const refreshedResponse = NextResponse.json(
          {
            authenticated: true,
            userId: decodedRefresh.userId,
            role: decodedRefresh.role,
          },
          { status: 200 }
        );

        refreshedResponse.cookies.set("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60, // 1 hour
        });

        refreshedResponse.cookies.set("userId", decodedRefresh.userId, {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60, // 1 hour
        });

        return refreshedResponse;
      }
    }
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
