import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
  sendNegotiationFromBuyerToSkillOwnerEmail
} from "@/lib/email.service";

type SkillOfferUpdateWithMeta = Prisma.SkillOfferUncheckedUpdateInput & {
  rejectedBy?: string | null;
  cancelledAt?: Date | string | null;
  cancelledBy?: string | null;
  cancellationReason?: string | null;
};

type SkillCounterOfferCreateWithActor =
  Prisma.SkillCounterOfferUncheckedCreateInput & {
    madeBy?: string;
  };

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ offerId: string }> }
) {
  try {
    const params = await context.params;
    const authResult = verifyAuth(req);
    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const offerId = params.offerId;
    const { action, counterPrice, reason } = await req.json();

    // Verify offer belongs to current user
    const offer = await prisma.skillOffer.findUnique({
      where: { id: offerId },
      include: { skill: true, buyer: true },
    });

    if (!offer) {
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      );
    }

    if (offer.buyerId !== authResult.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    let updatedOffer;
    const latestPrice =
      offer.currentPrice ??
      offer.skillOwnerAcceptedPrice ??
      offer.buyerAcceptedPrice ??
      offer.originalPrice;

    if (action === "accept") {
      if (offer.status !== "negotiated") {
        return NextResponse.json(
          { error: "Only negotiated offers can be accepted by buyer" },
          { status: 400 }
        );
      }

      await prisma.skillOffer.update({
        where: { id: offerId },
        data: {
          status: "ongoing",
          buyerAcceptedPrice: latestPrice,
        },
      });

      updatedOffer = await prisma.skillOffer.findUnique({
        where: { id: offerId },
        include: { skill: true, buyer: true },
      });
    } else if (action === "reject") {
      if (!["pending", "negotiated"].includes(offer.status)) {
        return NextResponse.json(
          { error: "Only pending or negotiated offers can be rejected" },
          { status: 400 }
        );
      }

      const rejectData: SkillOfferUpdateWithMeta = {
        status: "rejected",
        rejectedAt: new Date(),
        rejectedBy: "buyer",
      };

      await prisma.skillOffer.update({
        where: { id: offerId },
        data: rejectData,
      });

      updatedOffer = await prisma.skillOffer.findUnique({
        where: { id: offerId },
        include: { skill: true, buyer: true },
      });
    } else if (action === "negotiate") {
      if (!["pending", "negotiated"].includes(offer.status)) {
        return NextResponse.json(
          { error: "Only pending or negotiated offers can be negotiated" },
          { status: 400 }
        );
      }

      if (!counterPrice || Number.isNaN(counterPrice) || counterPrice <= 0) {
        return NextResponse.json(
          { error: "A valid counterPrice is required" },
          { status: 400 }
        );
      }

      await prisma.skillOffer.update({
        where: { id: offerId },
        data: {
          status: "negotiated",
          currentPrice: counterPrice,
          buyerAcceptedPrice: counterPrice,
        },
      });

      const counterOfferData: SkillCounterOfferCreateWithActor = {
        offerId,
        counterPrice,
        madeBy: "buyer",
        reason: reason?.trim() || "Counter offer from buyer",
      };

      await prisma.skillCounterOffer.create({
        data: counterOfferData,
      });

      // Get skill owner details and send email
      const skillOwner = await prisma.skill.findUnique({
        where: { id: offer.skill.id },
        select: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (skillOwner) {
        const buyerName = `${offer.buyer.firstName} ${offer.buyer.lastName}`.trim();
        const skillOwnerName = `${skillOwner.user.firstName} ${skillOwner.user.lastName}`.trim();

        await sendNegotiationFromBuyerToSkillOwnerEmail(
          skillOwner.user.email,
          skillOwnerName,
          buyerName,
          offer.skill.name,
          counterPrice,
          reason
        );

        // Create notification for skill owner
        await prisma.skillNotification.create({
          data: {
            skillId: offer.skillId,
            message: `${buyerName} sent a counter offer of ₦${counterPrice.toLocaleString()} for ${offer.skill.name}`,
            type: "counter_offer",
          },
        });
      }

      updatedOffer = await prisma.skillOffer.findUnique({
        where: { id: offerId },
        include: { skill: true, buyer: true },
      });

    } else if (action === "cancel") {
      if (offer.status !== "ongoing") {
        return NextResponse.json(
          { error: "Only ongoing offers can be cancelled" },
          { status: 400 }
        );
      }

      if (!reason || reason.trim().length < 5) {
        return NextResponse.json(
          { error: "Please provide a cancellation reason (at least 5 characters)" },
          { status: 400 }
        );
      }

      const cancelData: SkillOfferUpdateWithMeta = {
        status: "cancelled",
        cancelledAt: new Date(),
        cancelledBy: "buyer",
        cancellationReason: reason.trim(),
      };

      await prisma.skillOffer.update({
        where: { id: offerId },
        data: cancelData,
      });

      updatedOffer = await prisma.skillOffer.findUnique({
        where: { id: offerId },
        include: { skill: true, buyer: true },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    if (updatedOffer?.skill) {
      await prisma.skillNotification.create({
        data: {
          skillId: updatedOffer.skillId,
          message: `Buyer updated offer for ${updatedOffer.skill.name} to ${updatedOffer.status}.`,
          type: "offer_update",
        },
      });
    }

    return NextResponse.json(
      { offer: updatedOffer },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update offer error:", error);
    return NextResponse.json(
      { error: "Failed to update offer" },
      { status: 500 }
    );
  }
}
