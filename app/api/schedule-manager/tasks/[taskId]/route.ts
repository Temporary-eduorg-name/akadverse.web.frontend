import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const toDateTime = (dateKey: string, time: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const value = new Date(year, month - 1, day);
  value.setHours(hours, minutes, 0, 0);
  return value;
};

const addMinutes = (time: string, duration: number) => {
  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + duration;
  const nextHours = Math.floor(totalMinutes / 60) % 24;
  const nextMinutes = totalMinutes % 60;
  return `${String(nextHours).padStart(2, "0")}:${String(nextMinutes).padStart(2, "0")}`;
};

// GET - Fetch a specific task by ID
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  const auth = verifyAuth(req);
  if (!auth.valid || !auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = await context.params;

    const task = await prisma.task.findFirst({
      where: {
        id: params.taskId,
        userId: auth.userId,
      },
      include: { schedule: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

// PUT - Update a task
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  const auth = verifyAuth(req);
  if (!auth.valid || !auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = await context.params;

    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.taskId,
        userId: auth.userId,
      },
    }) as any;

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      scheduleId,
      title,
      category,
      details,
      date,
      startTime,
      duration,
      color,
      completed,
      ignored,
      focus,
    } = body;

    if (scheduleId) {
      const schedule = await prisma.schedule.findFirst({
        where: {
          id: scheduleId,
          userId: auth.userId,
        },
      });

      if (!schedule) {
        return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
      }
    }

    const nextDate = date ?? existingTask.date;
    const nextStartTime = startTime ?? existingTask.startTime;
    const nextDuration = duration !== undefined ? parseInt(String(duration), 10) : existingTask.duration;
    const nextCompleted = completed ?? existingTask.completed;
    const passed = toDateTime(nextDate, addMinutes(nextStartTime, nextDuration)) < new Date();
    const nextIgnored = nextCompleted ? false : ignored ?? (!nextCompleted && passed);

    const updateData: any = {
      ...(Object.prototype.hasOwnProperty.call(body, "scheduleId") && { scheduleId: scheduleId || null }),
      ...(title && { title }),
      ...(category && { category }),
      ...(Object.prototype.hasOwnProperty.call(body, "details") && { details }),
      ...(date && { date }),
      ...(startTime && { startTime }),
      ...(duration !== undefined && { duration: nextDuration }),
      ...(color && { color }),
      ...(completed !== undefined && { completed }),
      ignored: nextIgnored,
      ignoredAt: nextIgnored ? existingTask.ignoredAt ?? new Date() : null,
      ...(focus !== undefined && { focus }),
    };

    const task = await prisma.task.update({
      where: { id: params.taskId },
      data: updateData,
      include: { schedule: true },
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// DELETE - Delete a task
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  const auth = verifyAuth(req);
  if (!auth.valid || !auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = await context.params;

    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.taskId,
        userId: auth.userId,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id: params.taskId },
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
