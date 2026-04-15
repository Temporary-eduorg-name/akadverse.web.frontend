"use client";

import React, { useEffect, useMemo, useState } from "react";
import DashboardNavbar from "@/app/components/dashboard/student/DashboardNavbar";
import DashboardSidebar from "@/app/components/dashboard/student/DashboardSidebar";
import Navbar from "@/src/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { MarketplaceActivityProvider } from "@/src/context/MarketplaceActivityContext";

export default function LayoutClient({ children }: { children: React.ReactNode; }) {
  const pathname = usePathname()
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const mainStyle = useMemo(
    () => ({ "--sidebar-width": `${sidebarWidth}px` } as React.CSSProperties),
    [sidebarWidth],
  );
  useEffect(() => {
    console.log("Route changed under marketplace layout:", pathname);
  }, [pathname]);

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
              <MarketplaceActivityProvider>
                <div className="shrink-0">
                  <Navbar />
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
              </MarketplaceActivityProvider>
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
