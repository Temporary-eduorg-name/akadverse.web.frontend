import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  sendOfferAcceptedEmail,
  sendOfferRejectedEmail,
  sendOfferNegotiatedEmail,
  sendOfferCompletedEmail,
  sendNewOfferToSkillOwnerEmail,
} from "@/lib/email.service";

function toEndOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const authResult = verifyAuth(req);

    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: skillId } = params;
    const { offerFrom, offerTo, currentPrice, description } = await req.json();

    if (!offerFrom || !offerTo) {
      return NextResponse.json(
        { error: "offerFrom and offerTo are required" },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: "Description of what you need is required" },
        { status: 400 }
      );
    }

    const fromDate = new Date(offerFrom);
    const toDate = new Date(offerTo);
    const normalizedToDate = toEndOfDay(toDate);

    if (
      Number.isNaN(fromDate.getTime()) ||
      Number.isNaN(toDate.getTime()) ||
      fromDate > normalizedToDate
    ) {
      return NextResponse.json(
        { error: "Invalid offer date range" },
        { status: 400 }
      );
    }

    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
      select: {
        id: true,
        name: true,
        startingPrice: true,
        userId: true,
      },
    });

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    if (skill.userId === authResult.userId) {
      return NextResponse.json(
        { error: "You cannot make an offer on your own skill" },
        { status: 400 }
      );
    }

    const proposedPrice =
      typeof currentPrice === "number" && currentPrice > 0
        ? currentPrice
        : null;

    const offer = await prisma.skillOffer.create({
      data: {
        skillId: skill.id,
        buyerId: authResult.userId,
        offerFrom: fromDate,
        offerTo: normalizedToDate,
        description: description.trim(),
        originalPrice: skill.startingPrice,
        currentPrice: proposedPrice,
      },
      include: {
        buyer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    await prisma.skillNotification.create({
      data: {
        skillId: skill.id,
        type: "new_offer",
        message: `You received a new offer for ${skill.name}.`,
      },
    });

    // Send email to skill owner
    const skillOwner = await prisma.user.findUnique({
      where: { id: skill.userId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (skillOwner) {
      const buyerName = `${offer.buyer.firstName} ${offer.buyer.lastName}`.trim();
      const skillOwnerName = `${skillOwner.firstName} ${skillOwner.lastName}`.trim();

      await sendNewOfferToSkillOwnerEmail(
        skillOwner.email,
        skillOwnerName,
        buyerName,
        skill.name,
        proposedPrice || skill.startingPrice,
        description.trim()
      );
    }

    return NextResponse.json(
      { message: "Offer submitted successfully", offer },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create skill offer error:", error);
    return NextResponse.json(
      { error: "Failed to create offer" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
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

    const skillId = params.id;
    const status = req.nextUrl.searchParams.get("status") || "all";

    // Verify skill ownership
    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
      select: { userId: true },
    });

    if (!skill || skill.userId !== authResult.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get offers grouped by status
    const where: any = { skillId };
    if (status !== "all") {
      where.status = status;
    }

    const offers = await prisma.skillOffer.findMany({
      where,
      include: {
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

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

    // Refetch after status updates
    const finalOffers = await prisma.skillOffer.findMany({
      where,
      include: {
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { offers: finalOffers },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get offers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
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

    const skillId = params.id;
    const { offerId, action, counterPrice } = await req.json();

    // Verify skill ownership
    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
      select: { userId: true },
    });

    if (!skill || skill.userId !== authResult.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const offer = await prisma.skillOffer.findUnique({
      where: { id: offerId },
      include: { buyer: true, skill: true },
    });

    if (!offer) {
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      );
    }

    let updatedOffer;

    if (action === "accept") {
      await prisma.skillOffer.update({
        where: { id: offerId },
        data: {
          status: "ongoing",
          skillOwnerAcceptedPrice: counterPrice || offer.currentPrice || offer.originalPrice,
        },
      });

      updatedOffer = await prisma.skillOffer.findUnique({
        where: { id: offerId },
        include: { buyer: true, skill: true },
      });

      // Create notification for buyer
      if (updatedOffer?.skill) {
        await prisma.skillNotification.create({
          data: {
            skillId: updatedOffer.skillId,
            message: `Your offer for ${updatedOffer.skill.name} has been accepted!`,
            type: "offer_accepted",
          },
        });
      }

      // Send email to buyer
      if (offer.buyer?.email && updatedOffer?.skill?.name) {
        const skillOwner = await prisma.user.findUnique({
          where: { id: authResult.userId },
          select: { firstName: true, lastName: true },
        });
        
        const skillOwnerName = `${skillOwner?.firstName || ""} ${skillOwner?.lastName || ""}`.trim();
        const buyerName = `${offer.buyer.firstName || ""} ${offer.buyer.lastName || ""}`.trim();
        const acceptedPrice = counterPrice || offer.currentPrice || offer.originalPrice;
        
        await sendOfferAcceptedEmail(
          offer.buyer.email,
          buyerName,
          skillOwnerName,
          updatedOffer.skill.name,
          acceptedPrice
        );
      }
    } else if (action === "reject") {
      await prisma.skillOffer.update({
        where: { id: offerId },
        data: {
          status: "rejected",
          rejectedAt: new Date(),
        },
      });

      updatedOffer = await prisma.skillOffer.findUnique({
        where: { id: offerId },
        include: { buyer: true, skill: true },
      });

      if (updatedOffer?.skill) {
        await prisma.skillNotification.create({
          data: {
            skillId: updatedOffer.skillId,
            message: `Your offer has been rejected.`,
            type: "offer_rejected",
          },
        });
      }

      // Send email to buyer
      if (offer.buyer?.email && updatedOffer?.skill?.name) {
        const skillOwner = await prisma.user.findUnique({
          where: { id: authResult.userId },
          select: { firstName: true, lastName: true },
        });
        
        const skillOwnerName = `${skillOwner?.firstName || ""} ${skillOwner?.lastName || ""}`.trim();
        const buyerName = `${offer.buyer.firstName || ""} ${offer.buyer.lastName || ""}`.trim();
        
        await sendOfferRejectedEmail(
          offer.buyer.email,
          buyerName,
          skillOwnerName,
          updatedOffer.skill.name
        );
      }
    } else if (action === "negotiate") {
      await prisma.skillOffer.update({
        where: { id: offerId },
        data: {
          status: "negotiated",
          currentPrice: counterPrice,
        },
      });

      updatedOffer = await prisma.skillOffer.findUnique({
        where: { id: offerId },
        include: { buyer: true, skill: true },
      });

      if (updatedOffer?.skill) {
        await prisma.skillNotification.create({
          data: {
            skillId: updatedOffer.skillId,
            message: `A counter offer of ₦${counterPrice} has been sent to you.`,
            type: "offer_negotiated",
          },
        });
      }

      // Send email to buyer
      if (offer.buyer?.email && updatedOffer?.skill?.name) {
        const skillOwner = await prisma.user.findUnique({
          where: { id: authResult.userId },
          select: { firstName: true, lastName: true },
        });
        
        const skillOwnerName = `${skillOwner?.firstName || ""} ${skillOwner?.lastName || ""}`.trim();
        const buyerName = `${offer.buyer.firstName || ""} ${offer.buyer.lastName || ""}`.trim();
        
        await sendOfferNegotiatedEmail(
          offer.buyer.email,
          buyerName,
          skillOwnerName,
          updatedOffer.skill.name,
          counterPrice
        );
      }
    } else if (action === "complete") {
      await prisma.skillOffer.update({
        where: { id: offerId },
        data: {
          status: "completed",
          completedAt: new Date(),
        },
      });

      updatedOffer = await prisma.skillOffer.findUnique({
        where: { id: offerId },
        include: { buyer: true, skill: true },
      });

      if (updatedOffer?.skill) {
        await prisma.skillNotification.create({
          data: {
            skillId: updatedOffer.skillId,
            message: `The skill offer has been completed!`,
            type: "offer_completed",
          },
        });
      }

      // Send email to buyer
      if (offer.buyer?.email && updatedOffer?.skill?.name) {
        const skillOwner = await prisma.user.findUnique({
          where: { id: authResult.userId },
          select: { firstName: true, lastName: true },
        });
        
        const skillOwnerName = `${skillOwner?.firstName || ""} ${skillOwner?.lastName || ""}`.trim();
        const buyerName = `${offer.buyer.firstName || ""} ${offer.buyer.lastName || ""}`.trim();
        const finalPrice = offer.buyerAcceptedPrice || offer.skillOwnerAcceptedPrice || offer.currentPrice || offer.originalPrice;
        
        await sendOfferCompletedEmail(
          offer.buyer.email,
          buyerName,
          skillOwnerName,
          updatedOffer.skill.name,
          finalPrice
        );
      }
    }

    if (updatedOffer && updatedOffer.status !== offer.status) {
      await prisma.notification.create({
        data: {
          userId: offer.buyerId,
          type: "skill_offer_owner_update",
          message: `Your offer for ${offer.skill.name} is now ${updatedOffer.status}.`,
          link: "/activity/offers",
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
