import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
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

    const offer = await prisma.skillOffer.findUnique({
      where: { id: offerId },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    if (offer.buyerId !== authResult.userId) {
      return NextResponse.json(
        { error: "Unauthorized - This offer does not belong to you" },
        { status: 403 }
      );
    }

    if (offer.status !== "accepted") {
      return NextResponse.json(
        { error: "Only accepted offers can be confirmed" },
        { status: 400 }
      );
    }

    if (!offer.fulfillmentOtp || !offer.fulfillmentOtpExpiry) {
      return NextResponse.json(
        { error: "Fulfillment OTP is not available yet" },
        { status: 400 }
      );
    }

    if (new Date() > offer.fulfillmentOtpExpiry) {
      return NextResponse.json(
        { error: "Fulfillment OTP has expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Share this OTP with the skill provider to mark the offer as fulfilled",
      otp: offer.fulfillmentOtp,
      expiresAt: offer.fulfillmentOtpExpiry,
    });
  } catch (error) {
    console.error("Confirm skill offer error:", error);
    return NextResponse.json(
      { error: "Failed to confirm offer" },
      { status: 500 }
    );
  }
}
