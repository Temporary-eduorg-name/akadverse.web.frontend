import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PUBLIC_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
};

export async function GET(req: NextRequest) {
  try {
    // Fetch all products from all businesses, ordered by newest first
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 20, // Limit to 20 newest products
      include: {
        business: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    return NextResponse.json({ products }, { status: 200, headers: PUBLIC_CACHE_HEADERS });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching products" },
      { status: 500 }
    );
  }
}
