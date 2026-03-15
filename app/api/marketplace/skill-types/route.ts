import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PUBLIC_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
};

export async function GET() {
  try {
    const skillTypes = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT name
      FROM SkillType
      ORDER BY name ASC
    `;

    return NextResponse.json(
      { skillTypes },
      { status: 200, headers: PUBLIC_CACHE_HEADERS }
    );
  } catch (error) {
    console.error("Get skill types error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching skill types" },
      { status: 500 }
    );
  }
}