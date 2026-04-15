import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PUBLIC_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
};

export async function GET() {
  try {
    // Single optimized query: fetch businesses with order count, sorted by popularity
    const businesses = await prisma.business.findMany({
      select: {
        id: true,
        name: true,
        industry: true,
        description: true,
        location: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        orders: {
          _count: "desc",
        },
      },
      take: 20,
    });

    // Remove orders array from response
    const cleanedBusinesses = businesses.map((business: any) => {
      const { orders, ...rest } = business;
      return rest;
    });

    return NextResponse.json({ businesses: cleanedBusinesses }, { status: 200, headers: PUBLIC_CACHE_HEADERS });
  } catch (error) {
    console.error("Get trending businesses error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching trending businesses" },
      { status: 500 }
    );
  }
}
