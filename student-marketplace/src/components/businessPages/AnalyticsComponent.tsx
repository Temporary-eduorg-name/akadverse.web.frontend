"use client";

import {
  TotalSalesPie,
  TotalRevenuePie,
  ConversionRateDoughnut,
  RetentionRateDoughnut,
  PercentageCircle
} from "@/components/graphical-representation";

interface AnalyticsProps {
  stats: {
    totalSales: number;
    totalRevenue: number;
    totalProfit: number;
    roi: number;
    customerRetention: number;
    conversionRate: number;
    annualGrowth: number;
    averageRating: number;
  };
  monthlySalesData: { name: string; sales: number }[];
  annualSalesData: { name: string; sales: number }[];
  monthlyRevenueData: { name: string; revenue: number }[];
  annualRevenueData: { name: string; revenue: number }[];
  months: string[];
  salesPeriod: "monthly" | "annual";
  salesMonth: string;
  revenuePeriod: "monthly" | "annual";
  revenueMonth: string;
  onSalesPeriodChange: (period: string) => void;
  onSalesMonthChange: (month: string) => void;
  onRevenuePeriodChange: (period: string) => void;
  onRevenueMonthChange: (month: string) => void;
}

export default function AnalyticsComponent({
  stats,
  monthlySalesData,
  annualSalesData,
  monthlyRevenueData,
  annualRevenueData,
  months,
  salesPeriod,
  salesMonth,
  revenuePeriod,
  revenueMonth,
  onSalesPeriodChange,
  onSalesMonthChange,
  onRevenuePeriodChange,
  onRevenueMonthChange
}: AnalyticsProps) {
  return (
    <div>
      {/* Sales and Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Total Sales Pie Chart */}
        <TotalSalesPie
          monthlySalesData={monthlySalesData}
          annualSalesData={annualSalesData}
          period={salesPeriod}
          onPeriodChange={onSalesPeriodChange}
          months={months}
          selectedMonth={salesMonth}
          onMonthChange={onSalesMonthChange}
        />

        {/* Total Revenue Pie Chart */}
        <TotalRevenuePie
          monthlyRevenueData={monthlyRevenueData}
          annualRevenueData={annualRevenueData}
          period={revenuePeriod}
          onPeriodChange={onRevenuePeriodChange}
          months={months}
          selectedMonth={revenueMonth}
          onMonthChange={onRevenueMonthChange}
        />
      </div>

      {/* Second Row - Rate Doughnuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Conversion Rate Doughnut */}
        <ConversionRateDoughnut percentage={stats.conversionRate} />

        {/* Customer Retention Doughnut */}
        <RetentionRateDoughnut percentage={stats.customerRetention} />
      </div>

      {/* Third Row - ROI and Annual Growth with PercentageCircles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* ROI Percentage Circle */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">
            Return on Investment (ROI)
          </h3>
          <div className="flex justify-center">
            <PercentageCircle
              value={stats.roi}
              label="ROI"
              size={180}
              strokeWidth={18}
              color="#f97316"
            />
          </div>
        </div>

        {/* Annual Growth Rate Percentage Circle */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">
            Annual Growth Rate
          </h3>
          <div className="flex justify-center">
            <PercentageCircle
              value={stats.annualGrowth}
              label="Growth"
              size={180}
              strokeWidth={18}
              color="#3b82f6"
            />
          </div>
        </div>
      </div>

      {/* Fourth Row - Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Profit */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
            Total Profit
          </p>
          <p className="text-4xl font-bold text-purple-500">
            ₦{stats.totalProfit.toLocaleString()}
          </p>
        </div>

        {/* Average Rating */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
            Average Rating
          </p>
          <p className="text-4xl font-bold text-yellow-500">
            {stats.averageRating.toFixed(1)} ⭐
          </p>
        </div>
      </div>
    </div>
  );
}
