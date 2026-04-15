import { NextRequest } from "next/server";
import { verifyAccessToken, verifyRefreshToken } from "@/lib/jwt";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export function verifyAuth(req: NextRequest): { valid: boolean; error?: string; userId?: string; role?: string } {
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  if (accessToken) {
    const decodedAccess = verifyAccessToken(accessToken);
    if (decodedAccess) {
      return { valid: true, userId: decodedAccess.userId, role: decodedAccess.role };
    }
  }

  if (refreshToken) {
    const decodedRefresh = verifyRefreshToken(refreshToken);
    if (decodedRefresh) {
      return { valid: true, userId: decodedRefresh.userId, role: decodedRefresh.role };
    }
  }

  return { valid: false, error: "Invalid or expired token" };
}

