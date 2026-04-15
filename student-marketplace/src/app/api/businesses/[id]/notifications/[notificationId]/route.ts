import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string; notificationId: string }> }
) {
  try {
    const authResult = verifyAuth(req);
    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const businessId = params.id;
    const notificationId = params.notificationId;

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, userId: true },
    });

    if (!business || business.userId !== authResult.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { read } = await req.json();
    if (typeof read !== "boolean") {
      return NextResponse.json(
        { error: "Invalid read value" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { id: true, businessId: true },
    });

    if (!notification || notification.businessId !== businessId) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read },
    });

    return NextResponse.json({ notification: updated }, { status: 200 });
  } catch (error) {
    console.error("Update notification error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; notificationId: string }> }
) {
  try {
    const authResult = verifyAuth(req);
    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const businessId = params.id;
    const notificationId = params.notificationId;

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, userId: true },
    });

    if (!business || business.userId !== authResult.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { id: true, businessId: true },
    });

    if (!notification || notification.businessId !== businessId) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return NextResponse.json(
      { message: "Notification deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete notification error:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting notification" },
      { status: 500 }
    );
  }
}
