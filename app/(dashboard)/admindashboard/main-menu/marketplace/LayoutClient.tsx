"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNavbar from '@/app/components/dashboard/admin/DashboardNavbar';
import DashboardSidebar from '@/app/components/dashboard/admin/DashboardSidebar';
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navbar from "@/src/Navbar";

function MarketplaceShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const mainStyle = useMemo(
    () => ({ "--sidebar-width": `${sidebarWidth}px` } as React.CSSProperties),
    [sidebarWidth],
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black" />
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      <DashboardNavbar />
      <div className="relative flex min-h-0 bg-zinc-50 dark:bg-black" style={{ height: "calc(100vh - 70px)" }}>
        <DashboardSidebar onWidthChange={setSidebarWidth} />
        <main
          className="ml-0 min-w-0 flex-1 transition-[margin] duration-300 ease-in-out lg:ml-[var(--sidebar-width)]"
          style={mainStyle}
        >
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <div className="shrink-0">
              <Navbar />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
              <div className="w-full overflow-x-hidden">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MarketplaceShell>{children}</MarketplaceShell>
    </AuthProvider>
  );
}
