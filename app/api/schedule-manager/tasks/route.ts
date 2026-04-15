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

const getExpiredTaskIds = (
  tasks: Array<{ id: string; date: string; startTime: string; duration: number }>,
) => {
  const now = new Date();

  return tasks
    .filter((task) => toDateTime(task.date, addMinutes(task.startTime, task.duration)) < now)
    .map((task) => task.id);
};

const markIgnoredTasks = async (userId: string) => {
  const candidateWhere: any = {
    userId,
    completed: false,
    ignored: false,
  };

  const candidates = await prisma.task.findMany({
    where: candidateWhere,
    select: {
      id: true,
      title: true,
      date: true,
      startTime: true,
      duration: true,
    },
  });

  const expiredTaskIds = getExpiredTaskIds(candidates);
  if (expiredTaskIds.length === 0) {
    return;
  }

  const ignoredUpdate: any = {
    ignored: true,
    ignoredAt: new Date(),
  };

  await prisma.task.updateMany({
    where: {
      id: { in: expiredTaskIds },
      userId,
    },
    data: ignoredUpdate,
  });

  const expiredTaskTitles = candidates
    .filter((task) => expiredTaskIds.includes(task.id))
    .map((task) => ({
      userId,
      type: "task_deadline_reached",
      message: `Task deadline reached: ${task.title}`,
    }));

  if (expiredTaskTitles.length > 0) {
    await prisma.notification.createMany({
      data: expiredTaskTitles,
    });
  }
};

// GET - Fetch tasks with optional filters
export async function GET(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth.valid || !auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await markIgnoredTasks(auth.userId);

    const { searchParams } = new URL(req.url);
    const scheduleId = searchParams.get("scheduleId");
    const date = searchParams.get("date");
    const completed = searchParams.get("completed");
    const ignored = searchParams.get("ignored");

    const where: any = { userId: auth.userId };
    if (scheduleId) where.scheduleId = scheduleId;
    if (date) where.date = date;
    if (completed !== null) where.completed = completed === "true";
    if (ignored !== null) where.ignored = ignored === "true";

    const tasks = await prisma.task.findMany({
      where,
      include: { schedule: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// POST - Create a new task
export async function POST(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth.valid || !auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      scheduleId,
      title,
      category,
      details,
      date,
      startTime,
      duration,
      color = "#3498db",
      completed = false,
      ignored = false,
      focus = false,
    } = body;

    if (!title || !category || !date || !startTime || !duration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let schedule = null;
    if (scheduleId) {
      schedule = await prisma.schedule.findFirst({
        where: {
          id: scheduleId,
          userId: auth.userId,
        },
      });

      if (!schedule) {
        return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
      }
    }

    const expiresAt = toDateTime(date, addMinutes(startTime, parseInt(String(duration), 10)));
    const shouldIgnore = !completed && (ignored || expiresAt < new Date());

    const taskData: any = {
      userId: auth.userId,
      scheduleId: scheduleId || null,
      title,
      category,
      details,
      date,
      startTime,
      duration: parseInt(String(duration), 10),
      color: schedule?.color ?? color,
      completed,
      ignored: shouldIgnore,
      ignoredAt: shouldIgnore ? new Date() : null,
      focus,
    };

    const task = await prisma.task.create({
      data: taskData,
      include: { schedule: true },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
