import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_OTP_ATTEMPTS = 5;

export async function PUT(
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
    const { otp } = await req.json();

    if (!otp) {
      return NextResponse.json({ error: "OTP is required" }, { status: 400 });
    }

    const offer = await prisma.skillOffer.findUnique({
      where: { id: offerId },
      include: {
        skill: {
          select: {
            id: true,
            userId: true,
            name: true,
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

    if (offer.status !== "accepted") {
      return NextResponse.json(
        { error: "Offer must be accepted before fulfillment" },
        { status: 400 }
      );
    }

    if (!offer.fulfillmentOtp || !offer.fulfillmentOtpExpiry) {
      return NextResponse.json(
        { error: "Fulfillment OTP is not available" },
        { status: 400 }
      );
    }

    if (new Date() > offer.fulfillmentOtpExpiry) {
      return NextResponse.json(
        { error: "Fulfillment OTP has expired" },
        { status: 400 }
      );
    }

    if (offer.fulfillmentOtpAttempts >= MAX_OTP_ATTEMPTS) {
      return NextResponse.json(
        {
          error: `Maximum OTP attempts (${MAX_OTP_ATTEMPTS}) exceeded.`,
        },
        { status: 429 }
      );
    }

    if (otp !== offer.fulfillmentOtp) {
      await prisma.skillOffer.update({
        where: { id: offerId },
        data: {
          fulfillmentOtpAttempts: offer.fulfillmentOtpAttempts + 1,
        },
      });

      const attemptsLeft = MAX_OTP_ATTEMPTS - (offer.fulfillmentOtpAttempts + 1);
      return NextResponse.json(
        {
          error: `Invalid OTP. ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining.`,
          attemptsLeft,
        },
        { status: 400 }
      );
    }

    const updatedOffer = await prisma.skillOffer.update({
      where: { id: offerId },
      data: {
        status: "fulfilled",
        fulfillmentOtp: null,
        fulfillmentOtpExpiry: null,
      },
    });

    await prisma.skillNotification.create({
      data: {
        skillId: offer.skill.id,
        type: "offer_fulfilled",
        message: `Offer for ${offer.skill.name} has been fulfilled successfully.`,
      },
    });

    return NextResponse.json({
      message: "Offer marked as fulfilled successfully",
      offer: updatedOffer,
    });
  } catch (error) {
    console.error("Fulfill skill offer error:", error);
    return NextResponse.json(
      { error: "Failed to fulfill offer" },
      { status: 500 }
    );
  }
}
