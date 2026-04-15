import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOTP, getOTPExpiry, isOTPExpired } from "@/utils/otp";
import { 
  sendSkillOfferCompletionOtpEmail,
  sendOfferAcceptedToBuyerEmail,
  sendNegotiationFromSkillOwnerToBuyerEmail
} from "@/lib/email.service";
import { sendEmail } from "@/utils/email";

const MAX_OTP_ATTEMPTS = 5;

type SkillOfferUpdateWithMeta = Prisma.SkillOfferUncheckedUpdateInput & {
  rejectedBy?: string | null;
  cancelledAt?: Date | string | null;
  cancelledBy?: string | null;
  cancellationReason?: string | null;
  disputedAt?: Date | string | null;
  disputedBy?: string | null;
  disputeReason?: string | null;
};

type SkillCounterOfferCreateWithActor =
  Prisma.SkillCounterOfferUncheckedCreateInput & {
    madeBy?: string;
  };

function toEndOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

export async function GET(req: NextRequest) {
  try {
    const authResult = verifyAuth(req);
    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const status = req.nextUrl.searchParams.get("status");

    const where: Prisma.SkillOfferWhereInput = {
      skill: {
        userId: authResult.userId,
      },
    };

    if (status && status !== "all") {
      where.status = status;
    }

    const offers = await prisma.skillOffer.findMany({
      where,
      include: {
        skill: {
          select: {
            id: true,
            name: true,
          },
        },
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        counterOffers: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

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

    const finalOffers = await prisma.skillOffer.findMany({
      where,
      include: {
        skill: {
          select: {
            id: true,
            name: true,
          },
        },
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        counterOffers: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ offers: finalOffers }, { status: 200 });
  } catch (error) {
    console.error("Get dashboard skill offers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard offers" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authResult = verifyAuth(req);
    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const {
      offerId,
      action,
      counterPrice,
      reason,
      otp,
    }: {
      offerId?: string;
      action?:
        | "accept"
        | "reject"
        | "negotiate"
        | "send_completion_otp"
        | "complete"
        | "cancel"
        | "dispute";
      counterPrice?: number;
      reason?: string;
      otp?: string;
    } = await req.json();

    if (!offerId || !action) {
      return NextResponse.json(
        { error: "offerId and action are required" },
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
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    if (offer.skill.userId !== authResult.userId) {
      return NextResponse.json(
        { error: "Unauthorized - You do not own this skill offer" },
        { status: 403 }
      );
    }

    const latestPrice =
      offer.currentPrice ??
      offer.skillOwnerAcceptedPrice ??
      offer.buyerAcceptedPrice ??
      offer.originalPrice;

    let updatedOffer;

    if (action === "accept") {
      if (!["pending", "negotiated"].includes(offer.status)) {
        return NextResponse.json(
          { error: "Only pending or negotiated offers can be accepted" },
          { status: 400 }
        );
      }

      updatedOffer = await prisma.skillOffer.update({
        where: { id: offerId },
        data: {
          status: "ongoing",
          skillOwnerAcceptedPrice: latestPrice,
        },
      });

      // Get skill owner's full details including social links
      const skillWithOwner = await prisma.skill.findUnique({
        where: { id: offer.skill.id },
        select: {
          mostActiveSocial: true,
          instagram: true,
          linkedin: true,
          twitter: true,
          website: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Send email to buyer with skill owner's social links
      const buyerName = `${offer.buyer.firstName} ${offer.buyer.lastName}`.trim();
      const skillOwnerName = skillWithOwner
        ? `${skillWithOwner.user.firstName} ${skillWithOwner.user.lastName}`.trim()
        : "Skill Owner";

      if (skillWithOwner) {
        await sendOfferAcceptedToBuyerEmail(
          offer.buyer.email,
          buyerName,
          skillOwnerName,
          offer.skill.name,
          latestPrice,
          {
            mostActiveSocial: skillWithOwner.mostActiveSocial,
            instagram: skillWithOwner.instagram,
            linkedin: skillWithOwner.linkedin,
            twitter: skillWithOwner.twitter,
            website: skillWithOwner.website,
          }
        );
      }

      // Create notification for buyer
      // Note: We don't have a buyer notification table, so we skip this
    }

    if (action === "reject") {
      if (!["pending", "negotiated"].includes(offer.status)) {
        return NextResponse.json(
          { error: "Only pending or negotiated offers can be rejected" },
          { status: 400 }
        );
      }

      const rejectData: SkillOfferUpdateWithMeta = {
        status: "rejected",
        rejectedAt: new Date(),
        rejectedBy: "skill_owner",
      };

      updatedOffer = await prisma.skillOffer.update({
        where: { id: offerId },
        data: rejectData,
      });
    }

    if (action === "negotiate") {
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

      updatedOffer = await prisma.skillOffer.update({
        where: { id: offerId },
        data: {
          status: "negotiated",
          currentPrice: counterPrice,
        },
      });

      const counterData: SkillCounterOfferCreateWithActor = {
        offerId,
        counterPrice,
        madeBy: "skill_owner",
        reason: reason?.trim() || "Counter offer from skill owner",
      };

      await prisma.skillCounterOffer.create({
        data: counterData,
      });

      // Get skill owner's name
      const skillOwner = await prisma.skill.findUnique({
        where: { id: offer.skill.id },
        select: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      const buyerName = `${offer.buyer.firstName} ${offer.buyer.lastName}`.trim();
      const skillOwnerName = skillOwner
        ? `${skillOwner.user.firstName} ${skillOwner.user.lastName}`.trim()
        : "Skill Owner";

      // Send email to buyer about the counter offer
      await sendNegotiationFromSkillOwnerToBuyerEmail(
        offer.buyer.email,
        buyerName,
        skillOwnerName,
        offer.skill.name,
        counterPrice,
        reason
      );
    }

    if (action === "send_completion_otp") {
      if (offer.status !== "ongoing") {
        return NextResponse.json(
          { error: "Only ongoing offers can request completion OTP" },
          { status: 400 }
        );
      }

      const generatedOtp = generateOTP();
      const expiry = getOTPExpiry();

      updatedOffer = await prisma.skillOffer.update({
        where: { id: offerId },
        data: {
          fulfillmentOtp: generatedOtp,
          fulfillmentOtpExpiry: expiry,
          fulfillmentOtpAttempts: 0,
        },
      });

      const buyerName = `${offer.buyer.firstName || ""} ${offer.buyer.lastName || ""}`.trim();
      await sendSkillOfferCompletionOtpEmail(
        offer.buyer.email,
        buyerName || "Buyer",
        offer.skill.name,
        generatedOtp
      );
    }

    if (action === "complete") {
      if (offer.status !== "ongoing") {
        return NextResponse.json(
          { error: "Only ongoing offers can be completed" },
          { status: 400 }
        );
      }

      if (!otp || !otp.trim()) {
        return NextResponse.json(
          { error: "OTP is required" },
          { status: 400 }
        );
      }

      if (!offer.fulfillmentOtp || !offer.fulfillmentOtpExpiry) {
        return NextResponse.json(
          { error: "No completion OTP found. Send OTP first." },
          { status: 400 }
        );
      }

      if (isOTPExpired(offer.fulfillmentOtpExpiry)) {
        return NextResponse.json(
          { error: "Completion OTP has expired. Request a new OTP." },
          { status: 400 }
        );
      }

      if (offer.fulfillmentOtpAttempts >= MAX_OTP_ATTEMPTS) {
        return NextResponse.json(
          { error: `Maximum OTP attempts (${MAX_OTP_ATTEMPTS}) exceeded.` },
          { status: 429 }
        );
      }

      if (otp.trim() !== offer.fulfillmentOtp) {
        await prisma.skillOffer.update({
          where: { id: offerId },
          data: {
            fulfillmentOtpAttempts: offer.fulfillmentOtpAttempts + 1,
          },
        });

        const attemptsLeft = MAX_OTP_ATTEMPTS - (offer.fulfillmentOtpAttempts + 1);
        return NextResponse.json(
          {
            error: `Invalid OTP. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining.`,
          },
          { status: 400 }
        );
      }

      updatedOffer = await prisma.skillOffer.update({
        where: { id: offerId },
        data: {
          status: "completed",
          completedAt: new Date(),
          fulfillmentOtp: null,
          fulfillmentOtpExpiry: null,
          fulfillmentOtpAttempts: 0,
        },
      });
    }

    if (action === "cancel") {
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
        cancelledBy: "skill_owner",
        cancellationReason: reason.trim(),
      };

      updatedOffer = await prisma.skillOffer.update({
        where: { id: offerId },
        data: cancelData,
      });
    }

    if (action === "dispute") {
      if (offer.status !== "ongoing") {
        return NextResponse.json(
          { error: "Only ongoing offers can be disputed" },
          { status: 400 }
        );
      }

      if (!reason || reason.trim().length < 10) {
        return NextResponse.json(
          { error: "Please provide a dispute reason (at least 10 characters)" },
          { status: 400 }
        );
      }

      const disputeData: SkillOfferUpdateWithMeta = {
        status: "disputed",
        disputedAt: new Date(),
        disputedBy: "skill_owner",
        disputeReason: reason.trim(),
      };

      updatedOffer = await prisma.skillOffer.update({
        where: { id: offerId },
        data: disputeData,
      });

      const admins = await prisma.user.findMany({
        where: { role: "super-admin" },
        select: { id: true, email: true },
      });

      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            type: "skill_dispute",
            message: `A skill offer dispute was filed for ${offer.skill.name}.`,
            link: "/studashboard/main-menu/admin",
          })),
        });

        const buyerName = `${offer.buyer.firstName || ""} ${offer.buyer.lastName || ""}`.trim();
        for (const admin of admins) {
          await sendEmail({
            to: admin.email,
            subject: "New Skill Offer Dispute - Student Marketplace",
            text: `A skill offer dispute has been filed.\n\nOffer ID: ${offer.id}\nSkill: ${offer.skill.name}\nFiled by: Skill Owner\nBuyer: ${buyerName || offer.buyer.email} (${offer.buyer.email})\nReason: ${reason.trim()}\n\nPlease review this dispute in the admin dashboard.`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ef4444;">🚨 New Skill Offer Dispute</h2>
                <p>A dispute has been filed for skill offer <strong>#${offer.id}</strong>.</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Skill:</strong> ${offer.skill.name}</p>
                  <p><strong>Filed by:</strong> Skill Owner</p>
                  <p><strong>Buyer:</strong> ${buyerName || offer.buyer.email} (${offer.buyer.email})</p>
                  <p><strong>Reason:</strong> ${reason.trim()}</p>
                </div>
                <p>Please review this dispute in the admin dashboard.</p>
              </div>
            `,
          });
        }
      }
    }

    if (!updatedOffer) {
      return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }

    if (updatedOffer.status !== offer.status) {
      await prisma.notification.create({
        data: {
          userId: offer.buyer.id,
          type: "skill_offer_owner_update",
          message: `Your offer for ${offer.skill.name} is now ${updatedOffer.status}.`,
          link: "/activity/offers",
        },
      });
    }

    await prisma.skillNotification.create({
      data: {
        skillId: offer.skillId,
        type: "offer_update",
        message: `Offer for ${offer.skill.name} updated to ${updatedOffer.status}.`,
      },
    });

    return NextResponse.json({ offer: updatedOffer }, { status: 200 });
  } catch (error) {
    console.error("Update dashboard skill offer error:", error);
    return NextResponse.json(
      { error: "Failed to update dashboard offer" },
      { status: 500 }
    );
  }
}
