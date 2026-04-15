import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch all schedules for the user
export async function GET(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth.valid || !auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const schedules = await prisma.schedule.findMany({
      where: { userId: auth.userId },
      include: { tasks: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }
}

// POST - Create a new schedule
export async function POST(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth.valid || !auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, color = "#3498db", focus = false } = body;

    if (!name) {
      return NextResponse.json({ error: "Schedule name is required" }, { status: 400 });
    }

    const schedule = await prisma.schedule.create({
      data: {
        userId: auth.userId,
        name,
        color,
        focus,
      },
      include: { tasks: true },
    });

    await prisma.notification.create({
      data: {
        userId: auth.userId,
        type: "schedule_created",
        message: `New schedule created: ${name}`,
      },
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
  }
}
