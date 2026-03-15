'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Book, Zap, BookOpen, Bot, House, BellDot, User, LogOut } from 'lucide-react';

const MAIN_MENU_PATHS = [
  '/studashboard/main-menu/student-dashboard',
  '/studashboard/main-menu/marketplace',
  '/studashboard/main-menu/essentials',
  '/studashboard/main-menu',
];

const DashboardNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isMainMenuActive = MAIN_MENU_PATHS.some((basePath) => pathname.startsWith(basePath));

  const centerTabs = [
    {
      id: 'productivity',
      icon: Zap,
      path: '/studashboard/productivity-layer',
      isActive: pathname.startsWith('/studashboard/productivity-layer'),
      label: 'Productivity Layer',
    },
    {
      id: 'learning',
      icon: BookOpen,
      path: '/studashboard/e-learning',
      isActive: pathname.startsWith('/studashboard/e-learning'),
      label: 'E-Learning',
    },
    {
      id: 'ai-studio',
      icon: Bot,
      path: '/studashboard/ai-studio',
      isActive: pathname.startsWith('/studashboard/ai-studio'),
      label: 'AI Studio',
    },
    {
      id: 'main-menu',
      icon: House,
      path: '/studashboard/main-menu/student-dashboard',
      isActive: isMainMenuActive,
      label: 'Main Menu',
    },
  ];

  return (
    <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="px-6 py-4 grid grid-cols-3 items-center">
        <div
          className="flex items-center gap-3 justify-self-start cursor-pointer"
          onClick={() => router.push('/studashboard/main-menu/student-dashboard')}
        >
          <Book size={28} className="text-blue-600" />
          <span className="text-lg font-semibold text-blue-600">AkadVerse</span>
        </div>

        <div className="flex items-center gap-8 justify-self-center">
          {centerTabs.map((tab) => (
            <button
              key={tab.id}
              className={`relative p-2 transition-colors ${tab.isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              aria-label={tab.label}
              title={tab.label}
              onClick={() => router.push(tab.path)}
            >
              <tab.icon size={20} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 justify-self-end">
          <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors" aria-label="Notifications" title="Notifications">
            <BellDot size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Student Profile</span>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={16} className="text-blue-600" />
            </div>
          </div>
          <button
            className="text-gray-500 hover:text-gray-700 transition-colors p-2"
            aria-label="Logout"
            title="Logout"
            onClick={() => router.push('/login')}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardNavbar;
