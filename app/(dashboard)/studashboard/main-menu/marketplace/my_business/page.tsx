"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export default function MyBusinessPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/marketplace/user", {
          method: "GET",
          credentials: "include",
        });

        if (response.status === 401) {
          router.push("/studashboard/main-menu/marketplace");
          return;
        }

        if (!response.ok) {
          setError("Failed to fetch user data");
          setLoading(false);
          return;
        }

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setError("An error occurred while fetching user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <LoadingSpinner size="md" />
          <p className="text-zinc-200 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">
        My Businesses
      </h1>
      {user && (
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Welcome, {user.firstName} {user.lastName}!
        </p>
      )}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 text-center text-zinc-600 dark:text-zinc-400">
        <p>No businesses created yet.</p>
      </div>
    </div>
  );
}
