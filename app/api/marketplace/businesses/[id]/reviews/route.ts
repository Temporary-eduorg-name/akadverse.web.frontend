import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = verifyAuth(req);

    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const params = await context.params;
    const business = await prisma.business.findUnique({
      where: { id: params.id },
      select: { id: true, userId: true },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    if (business.userId !== authResult.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const reviews = await prisma.review.findMany({
      where: { businessId: params.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error) {
    console.error("Get business reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch business reviews" },
      { status: 500 }
    );
  }
}