'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { Book, Zap, BookOpen, Bot, House, LogOut } from 'lucide-react';
import NotificationBell from '../shared/NotificationBell';

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
      activeColor: 'text-pink-500', // pink
    },
    {
      id: 'learning',
      icon: BookOpen,
      path: '/studashboard/e-learning',
      isActive: pathname.startsWith('/studashboard/e-learning'),
      label: 'E-Learning',
      activeColor: 'text-emerald-500', // green
    },
    {
      id: 'ai-studio',
      icon: Bot,
      path: '/studashboard/ai-studio',
      isActive: pathname.startsWith('/studashboard/ai-studio'),
      label: 'AI Studio',
      activeColor: 'text-indigo-500', // purple/indigo
    },
    {
      id: 'main-menu',
      icon: House,
      path: '/studashboard/main-menu/student-dashboard',
      isActive: isMainMenuActive,
      label: 'Main Menu',
      activeColor: 'text-purple-500', // purple
    },
  ];


  const { user } = useAuth();
  // Helper to capitalize first letter
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  const displayName = user ? `${capitalize(user.firstName)} ${capitalize(user.lastName)}` : '';
  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : '';

  // Notification state
  type Notification = {
    type: string;
    message: string;
    [key: string]: any;
  };
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!user) return;
    // Connect to SSE endpoint for notifications
    const es = new window.EventSource('/api/marketplace/realtime/events?scope=student');
    eventSourceRef.current = es;
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Example: { type: 'order', message: 'New order received', ... }
        setNotifications((prev) => [data, ...prev]);
        setUnread(true);
      } catch {}
    };
    es.onerror = () => {
      es.close();
    };
    return () => {
      es.close();
    };
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.notification-dropdown')) {
        setDropdownOpen(false);
        setUnread(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  return (
    <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="flex items-center justify-between px-3 py-3 sm:px-4 lg:hidden">
        <div
          className="flex min-w-0 items-center gap-2 cursor-pointer"
          onClick={() => router.push('/studashboard/main-menu/student-dashboard')}
        >
          <Book size={24} className="text-blue-600" />
          <span className="truncate text-base font-semibold text-blue-600">AkadVerse</span>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 text-sm">
              {initials || 'SP'}
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
          {centerTabs.map((tab) => (
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
          onClick={() => router.push('/studashboard/main-menu/student-dashboard')}
        >
          <Book size={28} className="text-blue-600" />
          <span className="text-lg font-semibold text-blue-600">AkadVerse</span>
        </div>

        <div className="flex items-center gap-8 justify-self-center">
          {centerTabs.map((tab) => (
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
              {initials || 'SP'}
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
