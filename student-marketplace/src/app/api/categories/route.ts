import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PUBLIC_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
};

export async function GET() {
  try {
    const categories = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT name
      FROM Category
      ORDER BY name ASC
    `;

    return NextResponse.json(
      { categories },
      { status: 200, headers: PUBLIC_CACHE_HEADERS }
    );
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching categories" },
      { status: 500 }
    );
  }
}