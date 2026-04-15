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

    const userId = authResult.userId;

    // Fetch all skill offers made by the user (as buyer)
    const offers = await prisma.skillOffer.findMany({
      where: {
        buyerId: userId,
      },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            displayName: true,
            profilePicture: true,
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      offers: offers.map((offer: any) => ({
        id: offer.id,
        skillId: offer.skillId,
        skill: {
          id: offer.skill.id,
          name: offer.skill.name,
          displayName: offer.skill.displayName,
          profilePicture: offer.skill.profilePicture,
          userId: offer.skill.userId,
        },
        originalPrice: offer.originalPrice,
        negotiatedPrice: offer.negotiatedPrice,
        status: offer.status,
        description: offer.description,
        fromDate: offer.fromDate,
        toDate: offer.toDate,
        createdAt: offer.createdAt,
        updatedAt: offer.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
