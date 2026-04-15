'use client';

import React, { useMemo, useState } from 'react';
import DashboardNavbar from '@/app/components/dashboard/student/DashboardNavbar';
import DashboardSidebar from '@/app/components/dashboard/student/DashboardSidebar';
import ScheduleManagerWithDB from './ScheduleManagerWithDB';

const Page = () => {
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const mainStyle = useMemo(
    () => ({ '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties),
    [sidebarWidth],
  );

  return (
    <div className="min-h-screen bg-[#f3f6fb] font-sans">
      <DashboardNavbar />
      <div className="relative" style={{ minHeight: 'calc(100vh - 70px)' }}>
        <DashboardSidebar onWidthChange={setSidebarWidth} />
        <main
          style={mainStyle}
          className="min-w-0 transition-[margin] duration-300 ease-out ml-0 lg:ml-[var(--sidebar-width)] p-3 lg:p-4 pb-10"
        >
          <div className="rounded-2xl border border-[#dfe7f2] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
            <ScheduleManagerWithDB />
          </div>
        </main>
      </div>
    </div>
  );
};
 
export default Page;
