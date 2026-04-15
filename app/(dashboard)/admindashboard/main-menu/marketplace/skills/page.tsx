"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/src/LoadingSpinner";
import dynamic from "next/dynamic";
import SkillOffersManager from "@/src/SkillOffersManager";

// Dynamically import chart components
const RevenueChart = dynamic(
    () => import("@/components/graphical-representation/TotalRevenuePie"),
    { loading: () => <LoadingSpinner size="md" />, ssr: false }
);

const ProductivityChart = dynamic(
    () => import("@/components/graphical-representation/ProductivityTrendLine"),
    { loading: () => <LoadingSpinner size="md" />, ssr: false }
);

interface Skill {
    id: string;
    name: string;
    description: string;
    displayName: string;
    startingPrice: number;
    yearsOfExperience: number;
    timeOfEstablishment: string;
    _count: {
        offers: number;
        reviews: number;
    };
}

interface SkillStats {
    totalOffers: number;
    totalRevenue: number;
    topSkills: Array<{
        name: string;
        index: number;
        offerCount: number;
    }>;
    offersData: Array<{
        skillName: string;
        totalOffers: number;
    }>;
    monthlyProductivity: Array<{
        month: string;
        offers: number;
    }>;
    offerStats: {
        pending: number;
        negotiated: number;
        ongoing: number;
        completed: number;
        rejected: number;
        cancelled: number;
        disputed: number;
        ignored: number;
    };
    revenueData: Array<{
        name: string;
        value: number;
    }>;
}

export default function SkillsDashboardMainPage() {
    const router = useRouter();
    const [skills, setSkills] = useState<Skill[]>([]);
    const [stats, setStats] = useState<SkillStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<
        "analytics" | "offers" | "skills"
    >("analytics");
    const [revenuePeriod, setRevenuePeriod] = useState<"monthly" | "annual">(
        "monthly"
    );
    const [selectedYear, setSelectedYear] = useState<number>(
        new Date().getFullYear()
    );
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [revenueMonth, setRevenueMonth] = useState(months[new Date().getMonth()]);
    const safeSelectedYear = Number.isFinite(selectedYear)
        ? selectedYear
        : new Date().getFullYear();

    // Status stats for offers
    const [offerStats, setOfferStats] = useState({
        pending: 0,
        negotiated: 0,
        ongoing: 0,
        completed: 0,
        rejected: 0,
        cancelled: 0,
        disputed: 0,
        ignored: 0,
    });
    const eventSourceRef = useRef<EventSource | null>(null);

    const fetchSkillsData = async () => {
        try {
            const response = await fetch("/api/marketplace/skills?type=my", {
                credentials: "include",
            });

            if (response.status === 401) {
                router.push("/login");
                return;
            }

            if (!response.ok) throw new Error("Failed to fetch skills");

            const data = await response.json();
            setSkills(data.skills || []);

            // Calculate available years from skill establishment dates
            if (data.skills && data.skills.length > 0) {
                const establishmentYears = data.skills.map(
                    (skill: Skill) => new Date(skill.timeOfEstablishment).getFullYear()
                );
                
                const minYear = Math.min(...establishmentYears);
                const maxYear = new Date().getFullYear();
                
                // Generate all years from min to max
                const allYears = [];
                for (let year = maxYear; year >= minYear; year--) {
                    allYears.push(year);
                }
                
                setAvailableYears(allYears);
            }
        } catch (error) {
            console.error("Error fetching skills:", error);
            router.push("/login");
        }
    };

    const fetchSkillStats = async () => {
        try {
            const params = new URLSearchParams({
                revenuePeriod,
                year: safeSelectedYear.toString(),
            });

            const response = await fetch(
                `/api/marketplace/skills/dashboard/stats?${params}`,
                {
                    credentials: "include",
                }
            );

            if (!response.ok) throw new Error("Failed to fetch stats");

            const data = await response.json();
            setStats(data);
            setOfferStats(data.offerStats || offerStats);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            await fetchSkillsData();
            setLoading(false);
        };
        loadData();
    }, []);

    const handleDeleteSkill = async (skillId: string, skillName: string) => {
        if (!confirm(`Are you sure you want to delete "${skillName}"? This action cannot be undone.`)) {
            return;
        }

        setDeleteLoading(skillId);
        try {
            const response = await fetch(`/api/marketplace/skills/${skillId}`, {
                method: "DELETE",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to delete skill");
            }

            alert("Skill deleted successfully!");
            await fetchSkillsData();
            await fetchSkillStats();
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to delete skill");
        } finally {
            setDeleteLoading(null);
        }
    };

    useEffect(() => {
        if (skills.length > 0) {
            fetchSkillStats();
        }
    }, [revenuePeriod, selectedYear, skills.length]);

    useEffect(() => {
        const setupRealtimeListener = () => {
            try {
                const eventSource = new EventSource("/api/marketplace/realtime/events?scope=skill_owner");
                eventSourceRef.current = eventSource;

                eventSource.addEventListener("update", (event) => {
                    const data = JSON.parse((event as MessageEvent).data);

                    setOfferStats((prev) => ({
                        ...prev,
                        pending: data.pendingOffers ?? prev.pending,
                        negotiated: data.negotiatedOffers ?? prev.negotiated,
                        ongoing: data.ongoingOffers ?? prev.ongoing,
                    }));
                });

                eventSource.addEventListener("error", (error) => {
                    console.error("Skill dashboard realtime listener error:", error);
                    eventSource.close();
                    eventSourceRef.current = null;
                });
            } catch (error) {
                console.error("Failed to setup skill dashboard realtime listener:", error);
            }
        };

        setupRealtimeListener();

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, []);

    if (loading) {
        return (
            <div className="flex-1 bg-zinc-50 dark:bg-black min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="flex-1 bg-zinc-50 dark:bg-black min-h-screen py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
                            Skills Dashboard
                        </h1>
                        <Link
                            href="/admindashboard/main-menu/marketplace/skills/main"
                            className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-lg font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
                        >
                            + Add Skill
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-700">
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-2">
                                    Total Skills
                                </p>
                                <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                                    {skills.length}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-700">
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-2">
                                    Total Offers
                                </p>
                                <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                                    {stats.totalOffers}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-700">
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-2">
                                    Total Revenue
                                </p>
                                <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                                    ₦{stats.totalRevenue.toLocaleString()}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-700">
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-2">
                                    Pending Offers
                                </p>
                                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                    {offerStats.pending}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="mb-8">
                    <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-700 overflow-x-auto">
                        {(["analytics", "offers", "skills"] as const).map(
                            (tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${activeTab === tab
                                            ? "border-b-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white"
                                            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            )
                        )}
                    </div>
                </div>

                {/* Analytics Tab */}
                {activeTab === "analytics" && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Top Skills Table */}
                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-zinc-200 dark:border-zinc-700 p-6">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
                                    Top Skills (By Offers)
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-zinc-200 dark:border-zinc-700">
                                                <th className="text-left py-4 px-4 font-semibold text-zinc-900 dark:text-white">
                                                    Rank
                                                </th>
                                                <th className="text-left py-4 px-4 font-semibold text-zinc-900 dark:text-white">
                                                    Skill Name
                                                </th>
                                                <th className="text-left py-4 px-4 font-semibold text-zinc-900 dark:text-white">
                                                    Offers
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats?.topSkills && stats.topSkills.length > 0 ? (
                                                stats.topSkills.map((skill, index) => (
                                                    <tr
                                                        key={index}
                                                        className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                                    >
                                                        <td className="py-4 px-4 text-zinc-900 dark:text-white font-semibold">
                                                            #{skill.index}
                                                        </td>
                                                        <td className="py-4 px-4 text-zinc-900 dark:text-white">
                                                            {skill.name}
                                                        </td>
                                                        <td className="py-4 px-4 text-zinc-900 dark:text-white">
                                                            {skill.offerCount}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={3}
                                                        className="py-8 px-4 text-center text-zinc-500 dark:text-zinc-400"
                                                    >
                                                        No skills yet
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Offers by Skill Table */}
                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-zinc-200 dark:border-zinc-700 p-6">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
                                    Offers by Skill
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-zinc-200 dark:border-zinc-700">
                                                <th className="text-left py-4 px-4 font-semibold text-zinc-900 dark:text-white">
                                                    Skill Name
                                                </th>
                                                <th className="text-left py-4 px-4 font-semibold text-zinc-900 dark:text-white">
                                                    Total Offers
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats?.offersData && stats.offersData.length > 0 ? (
                                                stats.offersData.map((skill, index) => (
                                                    <tr
                                                        key={index}
                                                        className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                                    >
                                                        <td className="py-4 px-4 text-zinc-900 dark:text-white">
                                                            {skill.skillName}
                                                        </td>
                                                        <td className="py-4 px-4 text-zinc-900 dark:text-white font-semibold">
                                                            {skill.totalOffers}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={2}
                                                        className="py-8 px-4 text-center text-zinc-500 dark:text-zinc-400"
                                                    >
                                                        No offer data
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Revenue Chart */}
                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-zinc-200 dark:border-zinc-700 p-6">
                                <RevenueChart
                                    monthlyRevenueData={
                                        (stats?.revenueData || []).map((item) => ({
                                            name: item.name,
                                            revenue: item.value,
                                        }))
                                    }
                                    annualRevenueData={
                                        (stats?.revenueData || []).map((item) => ({
                                            name: item.name,
                                            revenue: item.value,
                                        }))
                                    }
                                    period={revenuePeriod}
                                    onPeriodChange={(period) => setRevenuePeriod(period as "monthly" | "annual")}
                                    months={months}
                                    selectedMonth={revenueMonth}
                                    onMonthChange={setRevenueMonth}
                                />
                            </div>

                            {/* Productivity Chart */}
                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-zinc-200 dark:border-zinc-700 p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                        Productivity Trend
                                    </h2>
                                    {availableYears.length > 0 && (
                                        <select
                                            value={safeSelectedYear}
                                            onChange={(e) => {
                                                const nextYear = Number(e.target.value);
                                                if (!Number.isNaN(nextYear)) {
                                                    setSelectedYear(nextYear);
                                                }
                                            }}
                                            className="px-4 py-2 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                                        >
                                            {availableYears.map((year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                                <div className="h-96">
                                    <ProductivityChart
                                        data={stats?.monthlyProductivity || []}
                                        year={safeSelectedYear}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Offers Tab */}
                {activeTab === "offers" && (
                    <div className="space-y-6">
                        {/* Offer Status Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4">
                            {[
                                { label: "Pending", value: offerStats.pending, color: "bg-yellow-100 dark:bg-yellow-900" },
                                { label: "Negotiated", value: offerStats.negotiated, color: "bg-blue-100 dark:bg-blue-900" },
                                { label: "Ongoing", value: offerStats.ongoing, color: "bg-purple-100 dark:bg-purple-900" },
                                { label: "Completed", value: offerStats.completed, color: "bg-green-100 dark:bg-green-900" },
                                { label: "Rejected", value: offerStats.rejected, color: "bg-red-100 dark:bg-red-900" },
                                { label: "Cancelled", value: offerStats.cancelled, color: "bg-orange-100 dark:bg-orange-900" },
                                { label: "Disputed", value: offerStats.disputed, color: "bg-amber-100 dark:bg-amber-900" },
                                { label: "Ignored", value: offerStats.ignored, color: "bg-gray-100 dark:bg-gray-900" },
                            ].map((status) => (
                                <div
                                    key={status.label}
                                    className={`${status.color} rounded-lg p-4 text-center`}
                                >
                                    <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                                        {status.label}
                                    </p>
                                    <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                                        {status.value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <SkillOffersManager />
                    </div>
                )}

                {/* Skills Tab */}
                {activeTab === "skills" && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-zinc-200 dark:border-zinc-700 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    Your Services
                                </h2>
                                <Link
                                    href="/admindashboard/main-menu/marketplace/skills/main"
                                    className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
                                >
                                    + Add Skill
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {skills && skills.length > 0 ? (
                                    skills.map((skill) => (
                                        <Link
                                            key={skill.id}
                                            href={`/admindashboard/main-menu/marketplace/skills/${skill.id}`}
                                            className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all hover:shadow-md"
                                        >
                                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                                                {skill.name}
                                            </h3>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
                                                {skill.description}
                                            </p>

                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <p className="text-zinc-500 dark:text-zinc-400">
                                                        Offers
                                                    </p>
                                                    <p className="font-bold text-zinc-900 dark:text-white">
                                                        {skill._count.offers}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-zinc-500 dark:text-zinc-400">
                                                        Reviews
                                                    </p>
                                                    <p className="font-bold text-zinc-900 dark:text-white">
                                                        {skill._count.reviews}
                                                    </p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-zinc-500 dark:text-zinc-400">
                                                        Starting Price
                                                    </p>
                                                    <p className="font-bold text-green-600 dark:text-green-400">
                                                        ₦{skill.startingPrice.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-12">
                                        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                                            No skills yet. Start by adding your first skill.
                                        </p>
                                        <Link
                                            href="/admindashboard/main-menu/marketplace/skills/main"
                                            className="inline-block bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-lg font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
                                        >
                                            Add Your First Skill
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
}

