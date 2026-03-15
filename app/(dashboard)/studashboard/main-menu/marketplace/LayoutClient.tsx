"use client";

import React, { useMemo, useState } from "react";
import DashboardNavbar from "@/app/components/dashboard/student/DashboardNavbar";
import DashboardSidebar from "@/app/components/dashboard/student/DashboardSidebar";
import Navbar from "@/src/Navbar";
import { AuthProvider } from "@/context/AuthContext";

export default function LayoutClient({children}: { children: React.ReactNode;}) {
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const mainStyle = useMemo(
    () => ({ "--sidebar-width": `${sidebarWidth}px` } as React.CSSProperties),
    [sidebarWidth],
  );

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#f6f8fc] font-sans">
        <DashboardNavbar />
        <div className="relative" style={{ minHeight: "calc(100vh - 70px)" }}>
          <DashboardSidebar onWidthChange={setSidebarWidth} />
          <main
            style={mainStyle}
            className="ml-0 min-w-0 transition-[margin] duration-300 ease-out lg:ml-[var(--sidebar-width)]"
          >
            <Navbar />
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
