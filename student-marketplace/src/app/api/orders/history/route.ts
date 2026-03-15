import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const authResult = verifyAuth(req);
    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Fetch completed/disputed orders
    const orders = await prisma.order.findMany({
      where: {
        userId: authResult.userId,
        status: {
          in: ["delivered", "disputed"],
        },
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                secure_url: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        orders: orders.map((order: typeof orders[number]) => ({
          id: order.id,
          total: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
          expectedDeliveryDate: order.expectedDeliveryDate,
          business: order.business,
          isDisputed: order.isDisputed,
          disputeCreatedAt: order.disputeCreatedAt,
          disputeReason: order.disputeReason,
          items: order.items,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get order history error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching order history" },
      { status: 500 }
    );
  }
}
