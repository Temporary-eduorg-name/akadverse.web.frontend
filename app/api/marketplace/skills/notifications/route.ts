import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const authResult = verifyAuth(req);
    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get count of unread notifications
    const unreadCount = await prisma.skillNotification.count({
      where: {
        read: false,
        skill: {
          userId: authResult.userId,
        },
      },
    });

    // Fetch all notifications for skills owned by this user
    const notifications = await prisma.skillNotification.findMany({
      where: {
        skill: {
          userId: authResult.userId,
        },
      },
      select: {
        id: true,
        skillId: true,
        message: true,
        type: true,
        read: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ unreadCount, notifications }, { status: 200 });
  } catch (error) {
    console.error("Get skill notifications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authResult = verifyAuth(req);
    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Mark all notifications as read for skills owned by this user
    await prisma.skillNotification.updateMany({
      where: {
        read: false,
        skill: {
          userId: authResult.userId,
        },
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({ message: "Notifications marked as read" }, { status: 200 });
  } catch (error) {
    console.error("Mark notifications as read error:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}