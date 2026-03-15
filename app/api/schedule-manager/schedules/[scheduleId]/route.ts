import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ScheduleRouteContext = {
  params: Promise<{ scheduleId: string }>;
};

// GET - Fetch a specific schedule by ID
export async function GET(
  req: NextRequest,
  context: ScheduleRouteContext
) {
  const auth = verifyAuth(req);
  if (!auth.valid || !auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { scheduleId } = await context.params;

    const schedule = await prisma.schedule.findFirst({
      where: {
        id: scheduleId,
        userId: auth.userId,
      },
      include: { tasks: true },
    });

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}

// PUT - Update a schedule
export async function PUT(
  req: NextRequest,
  context: ScheduleRouteContext
) {
  const auth = verifyAuth(req);
  if (!auth.valid || !auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { scheduleId } = await context.params;

    const body = await req.json();
    const { name, color, focus } = body;

    const existingSchedule = await prisma.schedule.findFirst({
      where: {
        id: scheduleId,
        userId: auth.userId,
      },
    });

    if (!existingSchedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    const schedule = await prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        ...(name && { name }),
        ...(color && { color }),
        ...(focus !== undefined && { focus }),
      },
      include: { tasks: true },
    });

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
  }
}

// DELETE - Delete a schedule
export async function DELETE(
  req: NextRequest,
  context: ScheduleRouteContext
) {
  const auth = verifyAuth(req);
  if (!auth.valid || !auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { scheduleId } = await context.params;

    const existingSchedule = await prisma.schedule.findFirst({
      where: {
        id: scheduleId,
        userId: auth.userId,
      },
    });

    if (!existingSchedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    await prisma.schedule.delete({
      where: { id: scheduleId },
    });

    return NextResponse.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json({ error: "Failed to delete schedule" }, { status: 500 });
  }
}
