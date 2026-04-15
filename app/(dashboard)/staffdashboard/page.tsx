"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, House, Bot, BookOpen } from "lucide-react";
import DashboardNavbar from "@/app/components/dashboard/staff/DashboardNavbar";

interface DashboardUser {
  firstName: string;
}

const getTimeOfDayGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
};

const Page = () => {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDayGreeting());

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/marketplace/user", {
          credentials: "include",
        });
        if (!response.ok) return;

        const data = await response.json();
        if (data?.user?.firstName) {
          setUser({ firstName: data.user.firstName });
        }
      } catch {
        // Greeting falls back when session data is unavailable.
      }
    };

    void fetchUser();
    setTimeOfDay(getTimeOfDayGreeting());
  }, []);

  const displayName = user?.firstName || "Faculty";

  const workspaces = [
    {
      id: 1,
      title: "Productivity Layer",
      description:
        "Faculty tools for writing lecture notes, planning teaching work, and managing documents.",
      icon: Zap,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      path: "/staffdashboard/productivity-layer",
    },
    {
      id: 2,
      title: "Main Menu",
      description:
        "Open faculty dashboard, faculty essentials, marketplace, email, attendance, and schedule tools.",
      icon: House,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      path: "/staffdashboard/main-menu/faculty-dashboard",
    },
    {
      id: 3,
      title: "E-Learning",
      description:
        "Go to faculty course overview, course control, academic records, and faculty resources.",
      icon: BookOpen,
      color: "text-green-500",
      bgColor: "bg-green-50",
      path: "/staffdashboard/e-learning",
    },
    {
      id: 4,
      title: "AI Studio",
      description:
        "Faculty AI workspace for teaching support, prompt-based drafting, and course material preparation.",
      icon: Bot,
      color: "text-pink-500",
      bgColor: "bg-pink-50",
      path: "/staffdashboard/ai-studio",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      <DashboardNavbar />

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 sm:pb-12 sm:pt-12">
        <div className="mb-12">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Good {timeOfDay}, {displayName}
          </h1>
          <p className="text-gray-500">Select a workspace to continue.</p>
        </div>

        <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
          {workspaces.map((workspace) => {
            const Icon = workspace.icon;
            return (
              <div
                key={workspace.id}
                onClick={() => router.push(workspace.path)}
                className="group relative min-h-[240px] cursor-pointer overflow-hidden rounded-[20px] border border-transparent p-6 shadow-[0_2px_8px_rgba(16,24,40,0.07)] transition-all hover:border-transparent hover:shadow-[0_6px_14px_rgba(16,24,40,0.10)] sm:min-h-[260px] sm:p-8"
              >
                <div className="pointer-events-none absolute right-4 top-3 opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100">
                  <Icon size={120} className="text-gray-200" />
                </div>
                <div
                  className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl ${workspace.bgColor} shadow-[0_2px_6px_rgba(16,24,40,0.04)]`}
                >
                  <Icon size={31} className={workspace.color} />
                </div>
                <h3 className="mb-3 text-2xl font-semibold text-gray-900 transition group-hover:text-blue-600">
                  {workspace.title}
                </h3>
                <p className="text-md leading-relaxed text-gray-500">
                  {workspace.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Page;
