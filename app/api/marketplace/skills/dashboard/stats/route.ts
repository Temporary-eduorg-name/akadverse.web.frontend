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

    const searchParams = req.nextUrl.searchParams;
    const revenuePeriod = searchParams.get("revenuePeriod") || "monthly";
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    // Get all skills for this user
    const skills = await prisma.skill.findMany({
      where: { userId: authResult.userId },
      include: {
        offers: {
          select: {
            id: true,
            status: true,
            currentPrice: true,
            skillOwnerAcceptedPrice: true,
            createdAt: true,
          },
        },
      },
    });

    // Calculate top skills ranked by offers
    const topSkills = skills
      .map((skill, index) => ({
        name: skill.name,
        index: index + 1,
        offerCount: skill.offers.length,
      }))
      .sort((a, b) => b.offerCount - a.offerCount)
      .slice(0, 10);

    // Calculate offers by skill
    const offersData = skills.map((skill) => ({
      skillName: skill.name,
      totalOffers: skill.offers.length,
    }));

    // Calculate total offers and revenue
    const totalOffers = skills.reduce(
      (sum, skill) => sum + skill.offers.length,
      0
    );

    // Calculate revenue
    let totalRevenue = 0;
    skills.forEach((skill) => {
      skill.offers.forEach((offer) => {
        if (offer.status === "completed" || offer.status === "ongoing") {
          totalRevenue += offer.skillOwnerAcceptedPrice || offer.currentPrice || 0;
        }
      });
    });

    // Calculate monthly productivity (offers per month)
    const monthlyProductivity = getMonthlyProductivity(skills, year);

    // Count offers by status
    const offerStats = {
      pending: 0,
      negotiated: 0,
      ongoing: 0,
      completed: 0,
      rejected: 0,
      cancelled: 0,
      disputed: 0,
      ignored: 0,
    };

    skills.forEach((skill) => {
      skill.offers.forEach((offer) => {
        const status = offer.status as keyof typeof offerStats;
        if (status in offerStats) {
          offerStats[status]++;
        }
      });
    });

    return NextResponse.json(
      {
        totalOffers,
        totalRevenue,
        topSkills,
        offersData,
        monthlyProductivity,
        offerStats,
        revenueData: generateRevenueData(skills, revenuePeriod, year),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Skills dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}

function getMonthlyProductivity(
  skills: any[],
  year: number
): Array<{ month: string; offers: number }> {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthlyData: { [key: string]: number } = {};
  months.forEach((month) => {
    monthlyData[month] = 0;
  });

  skills.forEach((skill) => {
    skill.offers.forEach((offer: any) => {
      const offerDate = new Date(offer.createdAt);
      if (offerDate.getFullYear() === year) {
        const monthIndex = offerDate.getMonth();
        monthlyData[months[monthIndex]]++;
      }
    });
  });

  return months.map((month) => ({
    month,
    offers: monthlyData[month],
  }));
}

function generateRevenueData(
  skills: any[],
  period: string,
  year: number
): Array<{ name: string; value: number }> {
  if (period === "annual") {
    return [
      {
        name: "Total Revenue",
        value: skills.reduce((sum, skill) => {
          return (
            sum +
            skill.offers.reduce((offerSum: number, offer: any) => {
              if (
                (offer.status === "completed" || offer.status === "ongoing") &&
                new Date(offer.createdAt).getFullYear() === year
              ) {
                return (
                  offerSum +
                  (offer.skillOwnerAcceptedPrice || offer.currentPrice || 0)
                );
              }
              return offerSum;
            }, 0)
          );
        }, 0),
      },
    ];
  }

  // Monthly breakdown
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return months.map((month) => ({
    name: month,
    value: skills.reduce((sum, skill) => {
      return (
        sum +
        skill.offers.reduce((offerSum: number, offer: any) => {
          const offerDate = new Date(offer.createdAt);
          if (
            offerDate.getFullYear() === year &&
            offerDate.getMonth() === months.indexOf(month) &&
            (offer.status === "completed" || offer.status === "ongoing")
          ) {
            return (
              offerSum +
              (offer.skillOwnerAcceptedPrice || offer.currentPrice || 0)
            );
          }
          return offerSum;
        }, 0)
      );
    }, 0),
  }));
}
