import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type UnifiedNotification = {
  id: string;
  source: "notification" | "skill";
  type: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: Date;
};

export async function GET(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth.valid || !auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") || "20");
    const cappedLimit = Math.min(Math.max(limit, 1), 50);

    const [notifications, skillNotifications, unreadNotificationCount, unreadSkillCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: auth.userId },
        orderBy: { createdAt: "desc" },
        take: cappedLimit,
      }),
      prisma.skillNotification.findMany({
        where: { skill: { userId: auth.userId } },
        orderBy: { createdAt: "desc" },
        take: cappedLimit,
      }),
      prisma.notification.count({
        where: { userId: auth.userId, read: false },
      }),
      prisma.skillNotification.count({
        where: { skill: { userId: auth.userId }, read: false },
      }),
    ]);

    const merged: UnifiedNotification[] = [
      ...notifications.map((item) => ({
        id: item.id,
        source: "notification" as const,
        type: item.type,
        message: item.message,
        read: item.read,
        link: item.link ?? null,
        createdAt: item.createdAt,
      })),
      ...skillNotifications.map((item) => ({
        id: item.id,
        source: "skill" as const,
        type: item.type,
        message: item.message,
        read: item.read,
        link: null,
        createdAt: item.createdAt,
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, cappedLimit);

    const unreadCount = unreadNotificationCount + unreadSkillCount;

    return NextResponse.json({ notifications: merged, unreadCount }, { status: 200 });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth.valid || !auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await Promise.all([
      prisma.notification.updateMany({
        where: { userId: auth.userId, read: false },
        data: { read: true },
      }),
      prisma.skillNotification.updateMany({
        where: { skill: { userId: auth.userId }, read: false },
        data: { read: true },
      }),
    ]);

    return NextResponse.json({ message: "Notifications marked as read" }, { status: 200 });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
