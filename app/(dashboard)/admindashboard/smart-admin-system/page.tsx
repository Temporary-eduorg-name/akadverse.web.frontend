"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Book, Search, BellDot, User, LogOut, ArrowLeft } from "lucide-react";
import DashboardNavbar from "@/app/components/dashboard/admin/DashboardNavbar";

const Page = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white font-sans">
      <DashboardNavbar />

      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Book size={28} className="text-blue-600" />
            <span className="text-lg font-semibold text-blue-600">
              AkadVerse
            </span>
          </div>
          <div className="relative w-full md:mx-6 md:max-w-sm md:flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search resources..."
              className="w-full pl-12 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex w-full items-center justify-between gap-4 sm:gap-6 md:w-auto md:justify-normal">
            <button className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors">
              <BellDot size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="hidden text-sm font-medium text-gray-900 sm:inline">
                Admin Profile
              </span>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-blue-600" />
              </div>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => router.push("/login")}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 sm:mb-8"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="mb-8 sm:mb-12">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Smart Admin System
          </h1>
          <p className="text-gray-600">
            Institutional Intelligence, KPIs, and advanced analytics.
          </p>
        </div>

        <div className="flex min-h-[320px] items-center justify-center sm:min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Coming Soon
            </h2>
            <p className="text-gray-600">
              Smart admin features are under development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
