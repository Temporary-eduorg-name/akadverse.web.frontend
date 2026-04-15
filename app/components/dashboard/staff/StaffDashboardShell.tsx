"use client";

import React, { useMemo, useState } from "react";
import DashboardNavbar from "@/app/components/dashboard/staff/DashboardNavbar";
import DashboardSidebar from "@/app/components/dashboard/staff/DashboardSidebar";

type StaffDashboardShellProps = {
  children: React.ReactNode;
  contentClassName?: string;
  pageClassName?: string;
};

export default function StaffDashboardShell({
  children,
  contentClassName = "",
  pageClassName = "bg-[#f8f9fc] font-sans",
}: StaffDashboardShellProps) {
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const mainStyle = useMemo(
    () => ({ "--sidebar-width": `${sidebarWidth}px` } as React.CSSProperties),
    [sidebarWidth],
  );

  return (
    <div className={`h-screen overflow-hidden ${pageClassName}`}>
      <DashboardNavbar />
      <div
        className="relative flex min-h-0"
        style={{ height: "calc(100vh - 70px)" }}
      >
        <DashboardSidebar onWidthChange={setSidebarWidth} />
        <main
          style={mainStyle}
          className={`ml-0 min-w-0 flex-1 overflow-y-auto transition-[margin] duration-300 ease-out lg:ml-[var(--sidebar-width)] ${contentClassName}`.trim()}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
