"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";

interface AdminStats {
  totalUsers: number;
  totalSkillOwners: number;
  totalBusinesses: number;
  totalProducts: number;
  totalDisputes: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats", {
          credentials: "include",
        });

        if (response.status === 403) {
          setError("Admin access required. Please login with an admin account.");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch admin stats");
        }

        const data = await response.json();
        setStats(data.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">Overview of marketplace statistics.</p>
          </div>
          <Link
            href="/admin/disputes"
            className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200"
          >
            Manage Disputes
          </Link>
        </div>

        {error ? (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg">
            {error}
            <div className="mt-3">
              <Link href="/login" className="underline">
                Go to Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-5">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Users</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">{stats?.totalUsers ?? 0}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-5">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Skill Owners</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">{stats?.totalSkillOwners ?? 0}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-5">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Businesses</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">{stats?.totalBusinesses ?? 0}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-5">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Products</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">{stats?.totalProducts ?? 0}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-5">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Disputes</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">{stats?.totalDisputes ?? 0}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
