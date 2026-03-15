import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = verifyAuth(req);
    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const businessId = params.id
    const url = new URL(req.url);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const selectedYear = Number(url.searchParams.get("year")) || now.getFullYear();
    const salesPeriod = url.searchParams.get("salesPeriod") === "annual" ? "annual" : "monthly";
    const revenuePeriod = url.searchParams.get("revenuePeriod") === "annual" ? "annual" : "monthly";
    const salesMonth = url.searchParams.get("salesMonth") || months[now.getMonth()];
    const revenueMonth = url.searchParams.get("revenueMonth") || months[now.getMonth()];
    const getMonthIndex = (monthName: string) => months.indexOf(monthName);

    const getMonthDateRange = (monthName: string, year: number) => {
      const monthIndex = getMonthIndex(monthName);
      const startDate = new Date(year, monthIndex, 1);
      const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
      return { startDate, endDate };
    };

    // Helper to get date range for a year
    const getYearDateRange = (year: number) => {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      return { startDate, endDate };
    };

    const salesDateRange = salesPeriod === "monthly"
      ? getMonthDateRange(salesMonth, selectedYear)
      : getYearDateRange(selectedYear);

    const revenueDateRange = revenuePeriod === "monthly"
      ? getMonthDateRange(revenueMonth, selectedYear)
      : getYearDateRange(selectedYear);

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        orders: {
          where: {
            status: "delivered",
            createdAt: {
              gte: salesDateRange.startDate,
              lte: salesDateRange.endDate,
            },
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        products: true,
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    if (business.userId !== authResult.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }
    // Helper to get date range for a month

    // Calculate date ranges for sales and revenue


    // Calculate metrics
    let totalSales = 0;
    let totalRevenue = 0;
    let totalProfit = 0;
    let totalCost = 0;
    let customerCount = 0;
    let repeatCustomerCount = 0;
    let ratingSum = 0;

    const monthlySalesMap = new Map<string, number>();
    const annualSalesMap = new Map<string, number>();
    const monthlyRevenueMap = new Map<string, number>();
    const annualRevenueMap = new Map<string, number>();

    // Process sales data (already filtered by sales date range)
    business.orders.forEach((order: any) => {
      customerCount++;

      order.items.forEach((item: any) => {
        const salesQuantity = item.quantity;
        const productName = item.product.name;

        // Add to appropriate sales map
        if (salesPeriod === "monthly") {
          monthlySalesMap.set(
            productName,
            (monthlySalesMap.get(productName) || 0) + salesQuantity
          );
        } else {
          annualSalesMap.set(
            productName,
            (annualSalesMap.get(productName) || 0) + salesQuantity
          );
        }

        totalSales += salesQuantity;
      });
    });

    // Fetch revenue data separately if date ranges differ
    if (salesDateRange.startDate.getTime() !== revenueDateRange.startDate.getTime() ||
      salesDateRange.endDate.getTime() !== revenueDateRange.endDate.getTime()) {

      const revenueBusiness = await prisma.business.findUnique({
        where: { id: businessId },
        include: {
          orders: {
            where: {
              status: "delivered",
              createdAt: {
                gte: revenueDateRange.startDate,
                lte: revenueDateRange.endDate,
              },
            },
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      if (revenueBusiness) {
        revenueBusiness.orders.forEach((order: any) => {
          totalRevenue += order.totalAmount;

          order.items.forEach((item: any) => {
            const productName = item.product.name;
            const productRevenue = item.price * item.quantity;
            const profit = (item.price - item.product.cost) * item.quantity;
            const cost = item.product.cost * item.quantity;

            // Add to appropriate revenue map
            if (revenuePeriod === "monthly") {
              monthlyRevenueMap.set(
                productName,
                (monthlyRevenueMap.get(productName) || 0) + productRevenue
              );
            } else {
              annualRevenueMap.set(
                productName,
                (annualRevenueMap.get(productName) || 0) + productRevenue
              );
            }

            totalProfit += profit;
            totalCost += cost;
          });
        });
      }
    } else {
      // Same date range, use already fetched data
      business.orders.forEach((order: any) => {
        totalRevenue += order.totalAmount;

        order.items.forEach((item: any) => {
          const productName = item.product.name;
          const productRevenue = item.price * item.quantity;
          const profit = (item.price - item.product.cost) * item.quantity;
          const cost = item.product.cost * item.quantity;

          // Add to appropriate revenue map
          if (revenuePeriod === "monthly") {
            monthlyRevenueMap.set(
              productName,
              (monthlyRevenueMap.get(productName) || 0) + productRevenue
            );
          } else {
            annualRevenueMap.set(
              productName,
              (annualRevenueMap.get(productName) || 0) + productRevenue
            );
          }

          totalProfit += profit;
          totalCost += cost;
        });
      });
    }

    const monthlySalesData = Array.from(monthlySalesMap).map(([name, sales]) => ({
      name,
      sales,
    }));
    const annualSalesData = Array.from(annualSalesMap).map(([name, sales]) => ({
      name,
      sales,
    }));
    const monthlyRevenueData = Array.from(monthlyRevenueMap).map(([name, revenue]) => ({
      name,
      revenue,
    }));
    const annualRevenueData = Array.from(annualRevenueMap).map(([name, revenue]) => ({
      name,
      revenue,
    }));

    // Calculate average rating
    business.products.forEach((product: any) => {
      ratingSum += product.rating * product.ratingCount;
    });
    const averageRating = totalSales > 0 ? ratingSum / totalSales : 0;

    const roi = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
    const conversionRate = business.visitors > 0 ? (customerCount / business.visitors) * 100 : 0;
    const customerRetention = customerCount > 0 ? (repeatCustomerCount / customerCount) * 100 : 0;

    return NextResponse.json({
      business: {
        id: business.id,
        name: business.name,
        industry: business.industry,
        description: business.description,
        location: business.location,
        bankName: business.bankName,
        accountNumber: business.accountNumber,
        paymentMethod: business.paymentMethod,
        serviceDays: business.serviceDays,
        serviceTimes: business.serviceTimes,
        instagram: business.instagram,
        linkedin: business.linkedin,
        website: business.website,
      },
      stats: {
        totalSales,
        totalRevenue,
        totalProfit,
        roi: parseFloat(roi.toFixed(2)),
        customerRetention: parseFloat(customerRetention.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        annualGrowth: 0, // This would need more historical data
        averageRating: parseFloat(averageRating.toFixed(2)),
      },
      monthlySalesData,
      annualSalesData,
      monthlyRevenueData,
      annualRevenueData,
      salesPeriod,
      salesMonth,
      revenuePeriod,
      revenueMonth,
      year: selectedYear,
    });
  } catch (error) {
    console.log("Business details error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching business details" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const businessId = params.id;
    const {
      name,
      industry,
      description,
      location,
      serviceDays,
      serviceTimes,
      yearEstablished,
      instagram,
      linkedin,
      website,
    } = await req.json();

    // Verify ownership
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    if (business.userId !== authResult.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const updated = await prisma.business.update({
      where: { id: businessId },
      data: {
        name,
        industry,
        description,
        location,
        serviceDays,
        serviceTimes,
        instagram,
        linkedin,
        website,
      },
    });

    return NextResponse.json(
      {
        message: "Business updated successfully",
        business: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update business error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating business" },
      { status: 500 }
    );
  }
}
