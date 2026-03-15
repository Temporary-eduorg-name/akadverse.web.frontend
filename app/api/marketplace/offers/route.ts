import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toEndOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

export async function GET(req: NextRequest) {
  try {
    const authResult = verifyAuth(req);
    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const status = req.nextUrl.searchParams.get("status");

    // Get all offers made by this user
    const where: any = { buyerId: authResult.userId };
    if (status && status !== "all") {
      where.status = status;
    }

    const offers = await prisma.skillOffer.findMany({
      where,
      include: {
        skill: {
          select: { id: true, name: true, userId: true },
        },
        counterOffers: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    type OfferWithMeta = (typeof offers)[number] & {
      rejectedBy?: string | null;
      cancelledBy?: string | null;
      cancellationReason?: string | null;
      disputeReason?: string | null;
      disputedBy?: string | null;
      cancelledAt?: Date | null;
      disputedAt?: Date | null;
    };

    const offersWithMeta = offers as OfferWithMeta[];

    // Check for expired offers and mark as ignored
    const now = new Date();
    for (const offer of offers) {
      const offerExpiry = toEndOfDay(offer.offerTo);
      if (offer.status === "pending" && offerExpiry < now) {
        await prisma.skillOffer.update({
          where: { id: offer.id },
          data: {
            status: "ignored",
            ignoredAt: now,
          },
        });
      }
    }

    // Fetch skill owner info for each offer
    const offersWithOwnerInfo = await Promise.all(
      offersWithMeta.map(async (offer) => {
        const skillOwner = await prisma.user.findUnique({
          where: { id: offer.skill.userId },
          select: { firstName: true, lastName: true, email: true },
        });

        return {
          id: offer.id,
          skillId: offer.skill.id,
          skillName: offer.skill.name,
          skillOwnerName: skillOwner
            ? `${skillOwner.firstName} ${skillOwner.lastName}`
            : "Unknown",
          skillOwnerEmail: skillOwner?.email || "",
          status: offer.status,
          description: offer.description,
          originalPrice: offer.originalPrice,
          currentPrice: offer.currentPrice,
          skillOwnerAcceptedPrice: offer.skillOwnerAcceptedPrice,
          buyerAcceptedPrice: offer.buyerAcceptedPrice,
          rejectedBy: offer.rejectedBy ?? null,
          cancelledBy: offer.cancelledBy ?? null,
          cancellationReason: offer.cancellationReason ?? null,
          disputeReason: offer.disputeReason ?? null,
          disputedBy: offer.disputedBy ?? null,
          completedAt: offer.completedAt,
          rejectedAt: offer.rejectedAt,
          cancelledAt: offer.cancelledAt ?? null,
          disputedAt: offer.disputedAt ?? null,
          latestCounterOffer: offer.counterOffers[0] || null,
          offerFrom: offer.offerFrom,
          offerTo: offer.offerTo,
          createdAt: offer.createdAt,
          updatedAt: offer.updatedAt,
        };
      })
    );

    return NextResponse.json(
      { offers: offersWithOwnerInfo },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get user offers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}
