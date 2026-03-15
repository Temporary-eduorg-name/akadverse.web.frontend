import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PUBLIC_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
};

export async function GET() {
  try {
    // Single optimized query: fetch products with order count, sorted by popularity
    const products = await prisma.product.findMany({
      include: {
        business: {
          select: {
            id: true,
            name: true,
          },
        },
        orderItems: {
          select: {
            quantity: true,
          },
        },
      },
      orderBy: {
        orderItems: {
          _count: "desc",
        },
      },
      take: 20,
    });

    // Remove orderItems array from response, keep business
    const cleanedProducts = products.map((product: any) => {
      const { orderItems, ...rest } = product;
      return rest;
    });

    return NextResponse.json({ products: cleanedProducts }, { status: 200, headers: PUBLIC_CACHE_HEADERS });
  } catch (error) {
    console.error("Get trending products error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching trending products" },
      { status: 500 }
    );
  }
}
