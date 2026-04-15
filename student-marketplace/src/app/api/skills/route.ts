import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PUBLIC_CACHE_HEADERS = {
    "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
};

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type") || "featured"; // "featured", "new", "trending", "my"
        const limit = Math.min(parseInt(searchParams.get("limit") as string) || 10, 50);
        const offset = Math.max(parseInt(searchParams.get("offset") as string) || 0, 0);

        // For "my" skills, verify authentication
        if (type === "my") {
            const authResult = verifyAuth(req);
            if (!authResult.valid || !authResult.userId) {
                return NextResponse.json(
                    { error: "Not authenticated" },
                    { status: 401 }
                );
            }

            const skills = await prisma.skill.findMany({
                where: { userId: authResult.userId },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    achievements: true,
                    displayName: true,
                    yearsOfExperience: true,
                    expertiseLevel: true,
                    startingPrice: true,
                    profilePicture: true,
                    visitors: true,
                    serviceDays: true,
                    serviceTimes: true,
                    userId: true,
                    _count: {
                        select: {
                            offers: true,
                            reviews: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: offset,
                take: limit,
            });
            return NextResponse.json({ skills }, { status: 200, headers: PUBLIC_CACHE_HEADERS });
        }

        // Build where clause for public skills
        const whereClause: any = {};

        // Determine sorting based on type
        let orderBy: any = { createdAt: "desc" };
        if (type === "trending") {
            orderBy = { visitors: "desc" };
        }

        // Fetch skills with full details for public display
        const [skills, total] = await prisma.$transaction([
            prisma.skill.findMany({
                where: whereClause,
                select: {
                    id: true,
                    name: true,
                    description: true,
                    achievements: true,
                    displayName: true,
                    yearsOfExperience: true,
                    expertiseLevel: true,
                    startingPrice: true,
                    profilePicture: true,
                    visitors: true,
                    serviceDays: true,
                    serviceTimes: true,
                    createdAt:true,
                    userId: true,
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    _count: {
                        select: {
                            offers: true,
                            reviews: true,
                        },
                    },
                },
                orderBy,
                skip: offset,
                take: limit,
            }),
            prisma.skill.count({ where: whereClause }),
        ]);

        return NextResponse.json(
            {
                skills,
                total,
                limit,
                offset,
            },
            { headers: PUBLIC_CACHE_HEADERS }
        );
    } catch (error) {
        console.error("Get skills error:", error);
        return NextResponse.json(
            { error: "An error occurred while fetching skills" },
            { status: 500 }
        );
    }
}
