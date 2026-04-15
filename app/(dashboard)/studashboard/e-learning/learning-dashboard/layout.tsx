"use client";

import React from "react";
import DashboardNavbar from "@/app/components/dashboard/student/DashboardNavbar";
import DashboardSidebar from "@/app/components/dashboard/student/DashboardSidebar";

export default function LearningDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden bg-[#f8f9fc] font-sans">
      <DashboardNavbar />

      <div
        className="relative flex min-h-0"
        style={{ height: "calc(100vh - 70px)" }}
      >
        <DashboardSidebar desktopSticky />

        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
