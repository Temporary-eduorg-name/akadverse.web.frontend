"use client";

import React from "react";
import DashboardNavbar from "@/app/components/dashboard/admin/DashboardNavbar";

const Page = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <DashboardNavbar />
      <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Studio</h1>
        <p className="text-gray-600">Admin workspace coming soon.</p>
      </div>
    </div>
  );
};

export default Page;
