import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const adminResult = await verifyAdmin(req);

    if (!adminResult.valid || !adminResult.userId) {
      return NextResponse.json(
        { error: "Unauthorized - Super-admin access required" },
        { status: 403 }
      );
    }

    const [
      totalUsers,
      totalSkillOwners,
      totalBusinesses,
      totalProducts,
      orderDisputes,
      offerDisputes,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          skills: {
            some: {},
          },
        },
      }),
      prisma.business.count(),
      prisma.product.count(),
      prisma.order.count({
        where: {
          isDisputed: true,
        },
      }),
      prisma.skillOffer.count({
        where: {
          status: "disputed",
        },
      }),
    ]);

    return NextResponse.json(
      {
        stats: {
          totalUsers,
          totalSkillOwners,
          totalBusinesses,
          totalProducts,
          totalDisputes: orderDisputes + offerDisputes,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin statistics" },
      { status: 500 }
    );
  }
}
