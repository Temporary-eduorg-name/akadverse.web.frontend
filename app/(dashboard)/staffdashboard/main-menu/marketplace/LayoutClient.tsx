"use client";

import React, { useMemo, useState } from "react";
import DashboardNavbar from "@/app/components/dashboard/staff/DashboardNavbar";
import DashboardSidebar from "@/app/components/dashboard/staff/DashboardSidebar";
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
      <div className="h-screen overflow-hidden bg-[#f6f8fc] font-sans">
        <DashboardNavbar />
        <div className="relative flex min-h-0" style={{ height: "calc(100vh - 70px)" }}>
          <DashboardSidebar onWidthChange={setSidebarWidth} />
          <main
            style={mainStyle}
            className="ml-0 min-w-0 flex-1 transition-[margin] duration-300 ease-out lg:ml-[var(--sidebar-width)]"
          >
            <div className="flex h-full min-h-0 flex-col overflow-hidden">
              <div className="shrink-0">
                <Navbar />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
