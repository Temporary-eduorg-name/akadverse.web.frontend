import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PUBLIC_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const skillType = searchParams.get("type") as string;

    if (!skillType) {
      return NextResponse.json(
        { error: "Skill type is required" },
        { status: 400 }
      );
    }

    const skills = await prisma.skill.findMany({
      where: {
        name: {
          contains: skillType,
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        displayName: true,
        expertiseLevel: true,
        startingPrice: true,
        profilePicture: true,
        yearsOfExperience: true,
        userId: true,
        visitors: true,
        serviceDays: true,
        serviceTimes: true,
        achievements: true,
        instagram: true,
        linkedin: true,
        twitter: true,
        website: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            offers: true,
            reviews: true,
          },
        },
      },
      orderBy: { visitors: "desc" },
    });

    return NextResponse.json(
      { skills },
      { status: 200, headers: PUBLIC_CACHE_HEADERS }
    );
  } catch (error) {
    console.error("Get skills by type error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching skills" },
      { status: 500 }
    );
  }
}
