import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const businessId = params.id;

    // Fetch business with products
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            stock: true,
            rating: true,
            secure_url: true,
            image: true,
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Fetch related businesses (same industry, excluding current business)
    const relatedBusinesses = await prisma.business.findMany({
      where: {
        industry: business.industry,
        id: {
          not: businessId,
        },
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      take: 4,
    });

    return NextResponse.json(
      {
        business: {
          id: business.id,
          name: business.name,
          industry: business.industry,
          description: business.description,
          location: business.location,
          serviceDays: business.serviceDays,
          serviceTimes: business.serviceTimes,
          instagram: business.instagram,
          linkedin: business.linkedin,
          website: business.website,
          createdAt: business.createdAt,
          products: business.products,
        },
        relatedBusinesses: relatedBusinesses.map((b: any) => ({
          id: b.id,
          name: b.name,
          industry: b.industry,
          description: b.description,
          location: b.location,
          productCount: b._count.products,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get public business error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching business" },
      { status: 500 }
    );
  }
}
