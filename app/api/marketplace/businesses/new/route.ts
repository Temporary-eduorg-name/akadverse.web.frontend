import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PUBLIC_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
};

export async function GET() {
  try {
    const businesses = await prisma.business.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
      select: {
        id: true,
        name: true,
        industry: true,
        description: true,
        location: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ businesses }, { status: 200, headers: PUBLIC_CACHE_HEADERS });
  } catch (error) {
    console.error("Get new businesses error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching new businesses" },
      { status: 500 }
    );
  }
}
