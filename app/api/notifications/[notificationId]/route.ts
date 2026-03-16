import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type NotificationRouteContext = {
  params: Promise<{ notificationId: string }>;
};

export async function PATCH(req: NextRequest, context: NotificationRouteContext) {
  const auth = verifyAuth(req);
  if (!auth.valid || !auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { notificationId } = await context.params;
    const [source, rawId] = notificationId.split(":");

    if (!source || !rawId || (source !== "notification" && source !== "skill")) {
      return NextResponse.json({ error: "Invalid notification id" }, { status: 400 });
    }

    if (source === "notification") {
      const existing = await prisma.notification.findUnique({
        where: { id: rawId },
        select: { id: true, userId: true },
      });

      if (!existing || existing.userId !== auth.userId) {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 });
      }

      const notification = await prisma.notification.update({
        where: { id: rawId },
        data: { read: true },
      });

      return NextResponse.json({ notification }, { status: 200 });
    }

    const existingSkill = await prisma.skillNotification.findUnique({
      where: { id: rawId },
      include: { skill: { select: { userId: true } } },
    });

    if (!existingSkill || existingSkill.skill.userId !== auth.userId) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    const notification = await prisma.skillNotification.update({
      where: { id: rawId },
      data: { read: true },
    });

    return NextResponse.json({ notification }, { status: 200 });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
