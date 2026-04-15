"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import { TotalSalesPie, TotalRevenuePie, PercentageCircle, TotalProfitsNumber } from "@/components/graphical-representation";

interface Business {
  id: string;
  name: string;
  industry: string;
  description: string;
  location: string;
}

interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  roi: number;
  monthlySalesData: { name: string; sales: number }[];
  annualSalesData: { name: string; sales: number }[];
  monthlyRevenueData: { name: string; revenue: number }[];
  annualRevenueData: { name: string; revenue: number }[];
  salesPeriod: string;
  salesMonth: string;
  revenuePeriod: string;
  revenueMonth: string;
  year: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = months[new Date().getMonth()];

  const [salesPeriod, setSalesPeriod] = useState<"monthly" | "annual">("monthly");
  const [salesMonth, setSalesMonth] = useState(currentMonth);
  const [revenuePeriod, setRevenuePeriod] = useState<"monthly" | "annual">("monthly");
  const [revenueMonth, setRevenueMonth] = useState(currentMonth);

  const fetchStats = async () => {
    try {
      const queryParams = new URLSearchParams({
        salesPeriod,
        salesMonth: salesPeriod === "monthly" ? salesMonth : "",
        revenuePeriod,
        revenueMonth: revenuePeriod === "monthly" ? revenueMonth : "",
        year: new Date().getFullYear().toString()
      });

      const statsResponse = await fetch(`/api/dashboard/stats?${queryParams}`, {
        method: "GET",
        credentials: "include",
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/businesses", {
          method: "GET",
          credentials: "include",
        });

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch businesses");
        }

        const data = await response.json();
        setBusinesses(data.businesses || []);

        // Fetch aggregated stats
        await fetchStats();
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // Refetch stats when period/month changes
  useEffect(() => {
    if (!loading) {
      fetchStats();
    }
  }, [salesPeriod, salesMonth, revenuePeriod, revenueMonth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="md" />
          <p className="text-zinc-600 dark:text-zinc-400 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Overview of your businesses and performance
          </p>
        </div>

        {/* Aggregate Stats Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
            Total Performance
          </h2>

          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Total Sales Pie Chart */}
              <div className="lg:col-span-1">
                <TotalSalesPie
                  monthlySalesData={stats.monthlySalesData || []}
                  annualSalesData={stats.annualSalesData || []}
                  period={salesPeriod}
                  onPeriodChange={(period) => setSalesPeriod(period as "monthly" | "annual")}
                  months={months}
                  selectedMonth={salesMonth}
                  onMonthChange={setSalesMonth}
                />
              </div>

              {/* Total Revenue Pie Chart */}
              <div className="lg:col-span-1">
                <TotalRevenuePie
                  monthlyRevenueData={stats.monthlyRevenueData || []}
                  annualRevenueData={stats.annualRevenueData || []}
                  period={revenuePeriod}
                  onPeriodChange={(period) => setRevenuePeriod(period as "monthly" | "annual")}
                  months={months}
                  selectedMonth={revenueMonth}
                  onMonthChange={setRevenueMonth}
                />
              </div>
            </div>
          )}

          {/* ROI and Profits Row */}
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ROI Percentage Circle */}
              <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">
                  Return on Investment (ROI)
                </h3>
                <div className="flex justify-center">
                  <PercentageCircle
                    value={stats.roi}
                    label="ROI"
                    size={200}
                    strokeWidth={20}
                    color="#22c55e"
                  />
                </div>
              </div>

              {/* Total Profits Number */}
              <div>
                <TotalProfitsNumber amount={stats.totalProfit} />
              </div>
            </div>
          )}
        </div>

        {/* Businesses Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              My Businesses
            </h2>
            <Link
              href="/add-business"
              className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors font-medium"
            >
              Add Business
            </Link>
          </div>

          {businesses.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-12 text-center">
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                You haven't created any businesses yet
              </p>
              <Link
                href="/add-business"
                className="inline-block bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2 rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors font-medium"
              >
                Create Your First Business
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business) => (
                <Link
                  key={business.id}
                  href={`/dashboard/business/${business.id}`}
                  className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                    {business.name}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                    {business.industry}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-3">
                    {business.description}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    📍 {business.location}
                  </p>
                  <div className="mt-4 text-right">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      View Dashboard →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
