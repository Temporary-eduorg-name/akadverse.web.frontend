'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import DashboardNavbar from '@/app/components/dashboard/student/DashboardNavbar';

const Page = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white font-sans">
      <DashboardNavbar />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 sm:mb-8"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Workspaces</span>
        </button>

        {/* Page Title */}
        <div className="mb-8 sm:mb-12">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">AI Studio</h1>
          <p className="text-gray-600">AI chat, research assistant, and study tools.</p>
        </div>

        {/* Coming Soon */}
        <div className="flex min-h-[320px] items-center justify-center sm:min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Coming Soon</h2>
            <p className="text-gray-600">AI Studio features are under development.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
