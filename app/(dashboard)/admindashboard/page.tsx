'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Book, Search, BellDot, User, LogOut, Home, ShoppingCart, Zap } from 'lucide-react';

const Page = () => {
  const router = useRouter();

  const workspaces = [
    {
      id: 1,
      title: 'Admin Dashboard',
      description: 'Overview of students, faculty, and campus KPIs.',
      icon: Home,
      colors: 'bg-blue-500',
      path: '/admindashboard/admin-dashboard',
    },
    {
      id: 2,
      title: 'Marketplace',
      description: 'Business Market & Skills Market activity overview.',
      icon: ShoppingCart,
      colors: 'bg-orange-500',
      path: '/studashboard/main-menu/marketplace',
    },
    {
      id: 3,
      title: 'Smart Admin System',
      description: 'Institutional Intelligence, KPIs, and advanced analytics.',
      icon: Zap,
      colors: 'bg-purple-500',
      path: '/admindashboard/smart-admin-system',
      badge: 'Coming Soon',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Book size={28} className="text-blue-600" />
            <span className="text-lg font-semibold text-blue-600">AkadVerse</span>
          </div>
          <div className="flex-1 max-w-sm mx-6 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              className="w-full pl-12 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors" aria-label="Notifications">
              <BellDot size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">Admin Profile</span>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-blue-600" />
              </div>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Logout"
              onClick={() => router.push('/login')}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Gray Container Card */}
        <div className="bg-gray-100 rounded-[24px] p-8">
          {/* Page Title */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">System Administration</h1>
            <p className="text-gray-600">Overview of institutional management and system status.</p>
          </div>

          {/* Workspaces Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className={`p-8 bg-white border border-gray-200 rounded-[20px] shadow-[0_2px_8px_rgba(16,24,40,0.07)] hover:shadow-[0_6px_14px_rgba(16,24,40,0.10)] transition-all cursor-pointer min-h-[260px] relative ${workspace.badge ? 'text-center' : ''}`}
                onClick={() => workspace.badge ? null : router.push(workspace.path)}
              >
                <div className={`mb-6 ${workspace.badge ? 'flex justify-center' : ''}`}>
                  <workspace.icon size={40} className="text-gray-400" />
                </div>
                <h3 className={`text-2xl font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors flex items-center gap-2 ${workspace.badge ? 'justify-center' : ''}`}>
                  {workspace.title}
                  {workspace.badge && (
                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {workspace.badge}
                    </span>
                  )}
                </h3>
                <p className="text-base text-gray-600 leading-relaxed">{workspace.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
