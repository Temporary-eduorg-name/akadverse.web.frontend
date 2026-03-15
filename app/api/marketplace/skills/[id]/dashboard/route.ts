import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type OfferStat = {
    status: string;
    originalPrice: number;
    currentPrice: number | null;
    skillOwnerAcceptedPrice: number | null;
    buyerAcceptedPrice: number | null;
};

type ReviewStat = {
    rating: number;
};

export async function GET(
    req: NextRequest,
    context : { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const authResult = verifyAuth(req);
        if (!authResult.valid || !authResult.userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const skillId = params.id;

        // Fetch skill with ownership verification
        const skill = await prisma.skill.findUnique({
            where: { id: skillId },
            select: {
                id: true,
                name: true,
                description: true,
                displayName: true,
                expertiseLevel: true,
                startingPrice: true,
                yearsOfExperience: true,
                profilePicture: true,
                serviceDays: true,
                serviceTimes: true,
                visitors: true,
                userId: true,
            },
        });

        if (!skill) {
            return NextResponse.json({ error: "Skill not found" }, { status: 404 });
        }

        // Verify ownership
        if (skill.userId !== authResult.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Fetch offers statistics
        const offers = await prisma.skillOffer.findMany({
            where: { skillId },
            select: {
                id: true,
                status: true,
                originalPrice: true,
                currentPrice: true,
                skillOwnerAcceptedPrice: true,
                buyerAcceptedPrice: true,
                offerFrom: true,
                offerTo: true,
                fulfillmentOtpAttempts: true,
                buyer: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
        });

        const allOffers = (await prisma.skillOffer.findMany({
            where: { skillId },
            select: {
                status: true,
                originalPrice: true,
                currentPrice: true,
                skillOwnerAcceptedPrice: true,
                buyerAcceptedPrice: true,
            },
        })) as OfferStat[];

        const totalOffers = allOffers.length;
        const acceptedOffers = allOffers.filter((offer: OfferStat) => offer.status === "ongoing").length;
        const completedOffers = allOffers.filter((offer: OfferStat) => offer.status === "completed").length;

        // Calculate revenue (from completed offers only)
        const totalRevenue = allOffers
            .filter((offer: OfferStat) => offer.status === "completed")
            .reduce((sum: number, offer: OfferStat) => sum + (offer.skillOwnerAcceptedPrice || offer.buyerAcceptedPrice || offer.currentPrice || offer.originalPrice), 0);

        // Calculate average price
        const averagePrice =
            completedOffers > 0
                ? allOffers
                    .filter((offer: OfferStat) => offer.status === "completed")
                    .reduce((sum: number, offer: OfferStat) => sum + (offer.skillOwnerAcceptedPrice || offer.buyerAcceptedPrice || offer.currentPrice || offer.originalPrice), 0) /
                completedOffers
                : skill.startingPrice;

        // Fetch reviews statistics
        const reviews = await prisma.skillReview.findMany({
            where: { skillId },
            select: {
                id: true,
                rating: true,
                comment: true,
                sentiment: true,
                createdAt: true,
                buyer: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
        });

        const totalReviews = reviews.length;
        const averageRating =
            totalReviews > 0
                ? (reviews as ReviewStat[]).reduce((sum: number, review: ReviewStat) => sum + review.rating, 0) / totalReviews
                : 0;

        return NextResponse.json({
            skill,
            stats: {
                totalOffers,
                acceptedOffers,
                completedOffers,
                totalRevenue,
                averagePrice,
                totalReviews,
                averageRating,
            },
            recentOffers: offers,
            recentReviews: reviews,
        });
    } catch (error) {
        console.error("Skill dashboard error:", error);
        return NextResponse.json(
            { error: "An error occurred while fetching skill dashboard" },
            { status: 500 }
        );
    }
}
