import { NextRequest } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface AdminAuthResult {
  valid: boolean;
  userId?: string;
  role?: string;
  error?: string;
}

/**
 * Verify if the user is an admin
 * @param req - NextRequest object
 * @returns AdminAuthResult with validation details
 */
export async function verifyAdmin(req: NextRequest): Promise<AdminAuthResult> {
  // First verify basic authentication
  const authResult = verifyAuth(req);
  
  if (!authResult.valid || !authResult.userId) {
    return {
      valid: false,
      error: "Not authenticated",
    };
  }

  try {
    // Fetch user from database to check role
    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return {
        valid: false,
        error: "User not found",
      };
    }

    if (user.role !== "super-admin") {
      return {
        valid: false,
        error: "Unauthorized - Super-admin access required",
      };
    }

    return {
      valid: true,
      userId: user.id,
      role: user.role,
    };
  } catch (error) {
    console.error("Admin verification error:", error);
    return {
      valid: false,
      error: "Failed to verify admin permissions",
    };
  }
}

/**
 * Predefined super-admin emails that get super-admin role on signup.
 */
export const SUPER_ADMIN_EMAILS = [
  "superadmin@studentmarketplace.com",
  // Add more super-admin emails here
];

/**
 * Check if an email should have super-admin role.
 * @param email - Email to check
 * @returns true if email is in super-admin list
 */
export function isSuperAdminEmail(email: string): boolean {
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
}

// Backward-compatible alias for existing imports.
export const isAdminEmail = isSuperAdminEmail;
