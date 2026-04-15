'use client';

import React from 'react';
import StaffDashboardShell from '@/app/components/dashboard/staff/StaffDashboardShell';

const Page = () => {
  return (
    <StaffDashboardShell contentClassName="bg-white px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">AI Studio</h1>
        <p className="text-gray-600">Faculty workspace coming soon.</p>
      </div>
    </StaffDashboardShell>
  );
};

export default Page;

