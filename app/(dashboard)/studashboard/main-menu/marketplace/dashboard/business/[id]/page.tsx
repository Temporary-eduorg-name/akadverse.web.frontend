"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ProductsPage from "@/components/businessPages/ProductPage";
import AnalyticsComponent from "@/components/businessPages/AnalyticsComponent";
import OrdersComponent from "@/components/businessPages/OrdersComponent";
import ReviewsComponent from "@/components/businessPages/ReviewsComponent";
import NotificationsComponent from "@/components/businessPages/NotificationsComponent";
import LoadingSpinner from "@/components/LoadingSpinner";

interface BusinessDashboardData {
  business: {
    id: string;
    name: string;
    industry: string;
    description: string;
    location: string;
  };
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
}

export default function BusinessDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.id as string;

  const [data, setData] = useState<BusinessDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"analytics" | "products" | "orders" | "reviews" | "notifications">("analytics");
  const [hasPendingOrders, setHasPendingOrders] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = months[new Date().getMonth()];

  const [salesPeriod, setSalesPeriod] = useState<"monthly" | "annual">("monthly");
  const [salesMonth, setSalesMonth] = useState(currentMonth);
  const [revenuePeriod, setRevenuePeriod] = useState<"monthly" | "annual">("monthly");
  const [revenueMonth, setRevenueMonth] = useState(currentMonth);

  const fetchBusinessData = async () => {
    try {
      const queryParams = new URLSearchParams({
        salesPeriod,
        salesMonth: salesPeriod === "monthly" ? salesMonth : "",
        revenuePeriod,
        revenueMonth: revenuePeriod === "monthly" ? revenueMonth : "",
        year: new Date().getFullYear().toString()
      });

      const response = await fetch(`/api/marketplace/businesses/${businessId}?${queryParams}`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/studashboard/main-menu/marketplace");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch business data");
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching business data:", error);
      router.push("/studashboard/main-menu/marketplace/dashboard");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (businessId) {
        await fetchBusinessData();
        setLoading(false);
      }
    };

    loadData();
  }, [businessId, router]);

  // Refetch when period/month changes
  useEffect(() => {
    if (!loading && businessId) {
      fetchBusinessData();
    }
  }, [salesPeriod, salesMonth, revenuePeriod, revenueMonth]);

  useEffect(() => {
    if (!businessId) return;

    const eventSource = new EventSource(
      `/api/marketplace/realtime/events?scope=seller&businessId=${businessId}`
    );

    const onUpdate = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data) as {
          pending?: number;
          unreadNotifications?: number;
        };

        setHasPendingOrders((payload.pending ?? 0) > 0);
        setHasUnreadNotifications((payload.unreadNotifications ?? 0) > 0);
      } catch {
        // ignore malformed realtime payload
      }
    };

    eventSource.addEventListener("update", onUpdate);

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.removeEventListener("update", onUpdate);
      eventSource.close();
    };
  }, [businessId]);

  const refreshActivity = () => {
    // Trigger a manual re-check by forcing the SSE to give us fresh data
    // The SSE polls every 10 seconds, so this ensures we get updated soon
    // For instant feedback, the activity dot will update on the next SSE poll
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <LoadingSpinner size="md" />
          <p className="text-zinc-200 mt-4">Loading business dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">Business not found</p>
          <Link href="/studashboard/main-menu/marketplace/dashboard" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link
                href="/studashboard/main-menu/marketplace/dashboard"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                ← Back
              </Link>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                {data.business.name}
              </h1>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              {data.business.industry} • {data.business.location}
            </p>
          </div>
          <Link
            href={`/studashboard/main-menu/marketplace/dashboard/business/${businessId}/edit`}
            className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors font-medium"
          >
            Edit Business
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8 overflow-x-auto">
            {["analytics", "products", "orders", "reviews", "notifications"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-4 font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? "border-zinc-900 dark:border-white text-zinc-900 dark:text-white"
                    : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                } relative`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === "orders" && hasPendingOrders && (
                  <span className="absolute top-3 right-1 h-2 w-2 rounded-full bg-red-500" />
                )}
                {tab === "notifications" && hasUnreadNotifications && (
                  <span className="absolute top-3 right-1 h-2 w-2 rounded-full bg-red-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "analytics" && (
          <AnalyticsComponent
            stats={data.stats}
            monthlySalesData={data.monthlySalesData}
            annualSalesData={data.annualSalesData}
            monthlyRevenueData={data.monthlyRevenueData}
            annualRevenueData={data.annualRevenueData}
            months={months}
            salesPeriod={salesPeriod}
            salesMonth={salesMonth}
            revenuePeriod={revenuePeriod}
            revenueMonth={revenueMonth}
            onSalesPeriodChange={(period) => setSalesPeriod(period as "monthly" | "annual")}
            onSalesMonthChange={setSalesMonth}
            onRevenuePeriodChange={(period) => setRevenuePeriod(period as "monthly" | "annual")}
            onRevenueMonthChange={setRevenueMonth}
          />
        )}

        {activeTab === "products" && (
          <ProductsPage />
        )}

        {activeTab === "orders" && (
          <OrdersComponent onActivityChange={refreshActivity} />
        )}

        {activeTab === "reviews" && (
          <ReviewsComponent />
        )}

        {activeTab === "notifications" && (
          <NotificationsComponent onActivityChange={refreshActivity} />
        )}
      </div>
    </div>
  );
}
