import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        // Verify authentication using cookies
        const authResult = verifyAuth(req);
        if (!authResult.valid || !authResult.userId) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        // Get user's businesses
        const businesses = await prisma.business.findMany({
            where: { userId: authResult.userId },
            select: {
                id: true,
                name: true,
                location:true,
                industry:true,
                description: true,
            },
        });

        return NextResponse.json({ businesses }, { status: 200 });
    } catch (error) {
        console.error("Get businesses error:", error);
        return NextResponse.json(
            { error: "An error occurred while fetching businesses" },
            { status: 500 }
        );
    }
}
