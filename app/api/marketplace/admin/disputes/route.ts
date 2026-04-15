import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

// Get all disputed orders and skill offers (super-admin only)
export async function GET(req: NextRequest) {
  try {
    const adminResult = await verifyAdmin(req);
    
    if (!adminResult.valid || !adminResult.userId) {
      return NextResponse.json(
        { error: "Unauthorized - Super-admin access required" },
        { status: 403 }
      );
    }

    const orderDisputes = await prisma.order.findMany({
      where: {
        isDisputed: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        disputeCreatedAt: "desc",
      },
    });

    const offerDisputes = await prisma.skillOffer.findMany({
      where: {
        status: "disputed",
      },
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        skill: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
        },
      },
      orderBy: {
        disputedAt: "desc",
      },
    });

    const disputes = [
      ...orderDisputes.map((order: (typeof orderDisputes)[number]) => ({
        id: order.id,
        type: "order" as const,
        status: order.status,
        totalAmount: order.totalAmount,
        disputeReason: order.disputeReason,
        disputeCreatedAt: order.disputeCreatedAt,
        user: order.user,
        business: order.business,
      })),
      ...offerDisputes.map((offer: (typeof offerDisputes)[number]) => ({
        id: offer.id,
        type: "offer" as const,
        status: offer.status,
        totalAmount:
          offer.currentPrice ??
          offer.skillOwnerAcceptedPrice ??
          offer.buyerAcceptedPrice ??
          offer.originalPrice,
        disputeReason: offer.disputeReason,
        disputeCreatedAt: offer.disputedAt,
        user: offer.buyer,
        business: {
          id: offer.skill.id,
          name: offer.skill.name,
          userId: offer.skill.userId,
        },
      })),
    ].sort((a, b) => {
      const aTime = a.disputeCreatedAt ? new Date(a.disputeCreatedAt).getTime() : 0;
      const bTime = b.disputeCreatedAt ? new Date(b.disputeCreatedAt).getTime() : 0;
      return bTime - aTime;
    });

    return NextResponse.json({ disputes });
  } catch (error) {
    console.error("Get disputes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch disputes" },
      { status: 500 }
    );
  }
}

