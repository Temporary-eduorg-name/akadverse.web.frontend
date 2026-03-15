import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = ["accepted", "rejected", "ignored"] as const;

type OfferStatus = (typeof ALLOWED_STATUSES)[number];

function generateOtp(length = 6): string {
  const digits = "0123456789";
  let otp = "";
  for (let index = 0; index < length; index += 1) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ offerId: string }> }
) {
  try {
    const params = await context.params;
    const authResult = verifyAuth(req);

    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { offerId } = params;
    const { status } = await req.json();

    if (!status || !ALLOWED_STATUSES.includes(status as OfferStatus)) {
      return NextResponse.json(
        { error: "Invalid status. Use accepted, rejected, or ignored." },
        { status: 400 }
      );
    }

    const offer = await prisma.skillOffer.findUnique({
      where: { id: offerId },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
        },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    if (offer.skill.userId !== authResult.userId) {
      return NextResponse.json(
        { error: "Unauthorized - You do not own this skill" },
        { status: 403 }
      );
    }

    const updateData: {
      status: OfferStatus;
      fulfillmentOtp?: string | null;
      fulfillmentOtpExpiry?: Date | null;
      fulfillmentOtpAttempts?: number;
    } = {
      status: status as OfferStatus,
    };

    if (status === "accepted") {
      updateData.fulfillmentOtp = generateOtp(6);
      updateData.fulfillmentOtpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      updateData.fulfillmentOtpAttempts = 0;
    } else {
      updateData.fulfillmentOtp = null;
      updateData.fulfillmentOtpExpiry = null;
      updateData.fulfillmentOtpAttempts = 0;
    }

    const updatedOffer = await prisma.skillOffer.update({
      where: { id: offerId },
      data: updateData,
    });

    await prisma.skillNotification.create({
      data: {
        skillId: offer.skill.id,
        type: status === "accepted" ? "offer_accepted" : "offer_rejected",
        message:
          status === "accepted"
            ? `Your offer for ${offer.skill.name} has been accepted.`
            : `Your offer for ${offer.skill.name} has been ${status}.`,
      },
    });

    await prisma.notification.create({
      data: {
        userId: offer.buyerId,
        type: "skill_offer_owner_update",
        message: `Your offer for ${offer.skill.name} is now ${updatedOffer.status}.`,
        link: "/activity/offers",
      },
    });

    return NextResponse.json({
      message: `Offer ${status} successfully`,
      offer: updatedOffer,
    });
  } catch (error) {
    console.error("Update skill offer status error:", error);
    return NextResponse.json(
      { error: "Failed to update offer status" },
      { status: 500 }
    );
  }
}
