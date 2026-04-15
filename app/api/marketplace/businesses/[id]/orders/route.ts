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
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const businessId = params.id;

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, userId: true },
    });

    if (!business || business.userId !== authResult.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { businessId },
      include: {
         user: {
           select: {
             id: true,
             email: true,
             firstName: true,
             lastName: true,
           },
         },
        items: {
          include: {
            product: {
              select: {
                 id: true,
                name: true,
                 secure_url: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching orders" },
      { status: 500 }
    );
  }
}
