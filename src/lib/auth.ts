import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export function verifyAuth(req: NextRequest): { valid: boolean; error?: string; userId?: string; role?: string } {
  // Get token from cookies only
  const token = req.cookies.get("accessToken")?.value;

  if (!token) {
    return { valid: false, error: "No token provided" };
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return { valid: false, error: "Invalid or expired token" };
  }

  return { valid: true, userId: decoded.userId, role: decoded.role };
}

