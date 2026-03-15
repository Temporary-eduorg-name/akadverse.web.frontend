'use client';

import React from 'react';
import ScheduleManagerWithDB from '@/app/(dashboard)/studashboard/main-menu/essentials/schedule-manager/ScheduleManagerWithDB';

const Page = () => {
  return (
    <div className="rounded-2xl border border-[#dfe7f2] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
      <ScheduleManagerWithDB />
    </div>
  );
};

export default Page;
