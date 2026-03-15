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
    () => ({
      marginLeft: `${sidebarWidth}px`,
      width: `calc(100vw - ${sidebarWidth}px)`,
      maxWidth: `calc(100vw - ${sidebarWidth}px)`,
    } as React.CSSProperties),
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
    <div className="min-h-screen">
      <DashboardNavbar />
      <div className="relative flex min-h-[calc(100vh-80px)] bg-zinc-50 dark:bg-black">
        <DashboardSidebar onWidthChange={setSidebarWidth} />
        <main
          className="overflow-x-hidden transition-[margin,width] duration-300 ease-in-out"
          style={mainStyle}
        >
          <Navbar />
          <div className="w-full overflow-x-hidden">
            {children}
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
