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

    const url = new URL(req.url);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const selectedYear = Number(url.searchParams.get("year")) || now.getFullYear();
    const salesPeriod = url.searchParams.get("salesPeriod") === "annual" ? "annual" : "monthly";
    const revenuePeriod = url.searchParams.get("revenuePeriod") === "annual" ? "annual" : "monthly";
    const salesMonth = url.searchParams.get("salesMonth") || months[now.getMonth()];
    const revenueMonth = url.searchParams.get("revenueMonth") || months[now.getMonth()];

    const getMonthIndex = (monthName: string) => months.indexOf(monthName);
    
    // Helper to get date range for a month
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

    // Calculate date ranges for sales and revenue
    const salesDateRange = salesPeriod === "monthly" 
      ? getMonthDateRange(salesMonth, selectedYear)
      : getYearDateRange(selectedYear);
    
    const revenueDateRange = revenuePeriod === "monthly"
      ? getMonthDateRange(revenueMonth, selectedYear)
      : getYearDateRange(selectedYear);

    // Get business IDs for this user (lightweight query)
    const userBusinesses = await prisma.business.findMany({
      where: { userId: authResult.userId },
      select: { id: true, name: true },
    });

    const businessIds = userBusinesses.map(b => b.id);
    const businessCount = businessIds.length;

    if (businessIds.length === 0) {
      return NextResponse.json({
        totalSales: 0,
        totalRevenue: 0,
        totalProfit: 0,
        roi: 0,
        monthlySalesData: [],
        annualSalesData: [],
        monthlyRevenueData: [],
        annualRevenueData: [],
        businessCount: 0,
        salesPeriod,
        salesMonth,
        revenuePeriod,
        revenueMonth,
        year: selectedYear,
      });
    }

    // Query 1: Get sales data with minimal fields
    const salesOrders = await prisma.order.findMany({
      where: {
        businessId: { in: businessIds },
        status: "delivered",
        createdAt: {
          gte: salesDateRange.startDate,
          lte: salesDateRange.endDate,
        },
      },
      select: {
        business: {
          select: { name: true }
        },
        items: {
          select: {
            quantity: true,
            product: {
              select: { name: true }
            }
          }
        }
      }
    });

    // Process sales data
    let totalSales = 0;
    const monthlySalesMap = new Map<string, number>();
    const annualSalesMap = new Map<string, number>();

    salesOrders.forEach(order => {
      order.items.forEach(item => {
        const productLabel = `${item.product.name} (${order.business.name})`;
        const salesQuantity = item.quantity;

        if (salesPeriod === "monthly") {
          monthlySalesMap.set(
            productLabel,
            (monthlySalesMap.get(productLabel) || 0) + salesQuantity
          );
        } else {
          annualSalesMap.set(
            productLabel,
            (annualSalesMap.get(productLabel) || 0) + salesQuantity
          );
        }

        totalSales += salesQuantity;
      });
    });

    // Query 2: Get revenue data
    const revenueOrders = await prisma.order.findMany({
      where: {
        businessId: { in: businessIds },
        status: "delivered",
        createdAt: {
          gte: revenueDateRange.startDate,
          lte: revenueDateRange.endDate,
        },
      },
      select: {
        totalAmount: true,
        business: {
          select: { name: true }
        },
        items: {
          select: {
            quantity: true,
            price: true,
            product: {
              select: { cost: true }
            }
          }
        }
      }
    });

    // Process revenue data
    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    const monthlyRevenueMap = new Map<string, number>();
    const annualRevenueMap = new Map<string, number>();

    revenueOrders.forEach(order => {
      totalRevenue += order.totalAmount;
      
      if (revenuePeriod === "monthly") {
        monthlyRevenueMap.set(
          order.business.name,
          (monthlyRevenueMap.get(order.business.name) || 0) + order.totalAmount
        );
      } else {
        annualRevenueMap.set(
          order.business.name,
          (annualRevenueMap.get(order.business.name) || 0) + order.totalAmount
        );
      }

      order.items.forEach(item => {
        const profit = (item.price - item.product.cost) * item.quantity;
        const cost = item.product.cost * item.quantity;
        totalProfit += profit;
        totalCost += cost;
      });
    });

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

    const roi = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

    return NextResponse.json({
      totalSales,
      totalRevenue,
      totalProfit,
      roi: Number(roi.toFixed(2)),
      monthlySalesData,
      annualSalesData,
      monthlyRevenueData,
      annualRevenueData,
      businessCount,
      salesPeriod,
      salesMonth,
      revenuePeriod,
      revenueMonth,
      year: selectedYear,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching stats" },
      { status: 500 }
    );
  }
}
