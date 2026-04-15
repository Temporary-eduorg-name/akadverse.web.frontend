import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PUBLIC_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
};

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category") || "";

    if (!category) {
      return NextResponse.json(
        { error: "Category parameter is required" },
        { status: 400 }
      );
    }

    const businesses = await prisma.business.findMany({
      where: {
        industry: {
          equals: category,
        },
      },
      select: {
        id: true,
        name: true,
        industry: true,
        description: true,
        location: true,
        visitors: true,
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
      orderBy: {
        visitors: "desc",
      },
      take: 50,
    });

    return NextResponse.json(
      {
        businesses,
        category,
      },
      { status: 200, headers: PUBLIC_CACHE_HEADERS }
    );
  } catch (error) {
    console.error("Category businesses error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching category businesses" },
      { status: 500 }
    );
  }
}
