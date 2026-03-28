'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Book, Zap, BookOpen, Bot, House, LogOut } from 'lucide-react';
import NotificationBell from '../shared/NotificationBell';
import { useAuth } from '@/src/context/AuthContext';

const MAIN_MENU_PATHS = [
  '/admindashboard/main-menu/admin-dashboard',
  '/admindashboard/main-menu/marketplace',
  '/admindashboard/main-menu/essentials',
  '/admindashboard/main-menu',
];

const DashboardNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isMainMenuActive = MAIN_MENU_PATHS.some((basePath) => pathname.startsWith(basePath));

  const centerTabs = [
    {
      id: 'productivity',
      icon: Zap,
      path: '/admindashboard/productivity-layer',
      isActive: pathname.startsWith('/admindashboard/productivity-layer'),
      label: 'Productivity Layer',
      activeColor: 'text-emerald-500', // green
    },
    {
      id: 'learning',
      icon: BookOpen,
      path: '/admindashboard/e-learning',
      isActive: pathname.startsWith('/admindashboard/e-learning'),
      label: 'E-Learning',
      activeColor: 'text-emerald-500', // green
    },
    {
      id: 'ai-studio',
      icon: Bot,
      path: '/admindashboard/ai-studio',
      isActive: pathname.startsWith('/admindashboard/ai-studio'),
      label: 'AI Studio',
      activeColor: 'text-indigo-500', // purple/indigo
    },
    {
      id: 'main-menu',
      icon: House,
      path: '/admindashboard/main-menu/admin-dashboard',
      isActive: isMainMenuActive,
      label: 'Main Menu',
      activeColor: 'text-blue-500', // blue
    },
  ];

  const { user } = useAuth ? useAuth() : { user: null };
  const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
  const displayName = user ? `${capitalize(user.firstName)} ${capitalize(user.lastName)}` : 'Admin Profile';
  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'AP';
  // Add Admin tab for super-admins
  const ShieldCheck = require('lucide-react').ShieldCheck;
  const adminTabs = [
    ...centerTabs,
    ...(user?.role === 'super-admin' ? [{
      id: 'admin',
      icon: ShieldCheck,
      path: '/admindashboard/admin',
      isActive: pathname.startsWith('/admindashboard/admin'),
      label: 'Admin',
      activeColor: 'text-sky-600',
    }] : []),
  ];
  return (
    <div className="border-b border-gray-200 bg-white fixed top-0 left-0 w-full z-50 shadow-md">
      <div className="flex items-center justify-between px-3 py-3 sm:px-4 lg:hidden">
        <div
          className="flex min-w-0 items-center gap-2 cursor-pointer"
          onClick={() => router.push('/admindashboard')}
        >
          <Book size={24} className="text-blue-600" />
          <span className="truncate text-base font-semibold text-blue-600">AkadVerse</span>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 text-sm">
              {initials}
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

      <div className="border-t border-gray-100 lg:hidden">
        <div className="flex flex-wrap items-center justify-center gap-5 px-3 py-2 sm:px-4">
          {adminTabs.map((tab) => (
            <button
              key={`mobile-${tab.id}`}
              className={`relative shrink-0 p-2 transition-colors ${tab.isActive ? tab.activeColor : 'text-gray-500 hover:text-gray-700'}`}
              aria-label={tab.label}
              title={tab.label}
              onClick={() => router.push(tab.path)}
            >
              <tab.icon size={20} />
            </button>
          ))}
        </div>
      </div>

      <div className="hidden px-6 py-4 lg:grid lg:grid-cols-3 lg:items-center">
        <div
          className="flex items-center gap-3 justify-self-start cursor-pointer"
          onClick={() => router.push('/admindashboard')}
        >
          <Book size={28} className="text-blue-600" />
          <span className="text-lg font-semibold text-blue-600">AkadVerse</span>
        </div>

        <div className="flex items-center gap-8 justify-self-center">
          {adminTabs.map((tab) => (
            <button
              key={tab.id}
              className={`relative p-2 transition-colors ${tab.isActive ? tab.activeColor : 'text-gray-500 hover:text-gray-700'}`}
              aria-label={tab.label}
              title={tab.label}
              onClick={() => router.push(tab.path)}
            >
              <tab.icon size={20} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 justify-self-end">
          <NotificationBell />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">{displayName}</span>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 text-sm">
              {initials}
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
