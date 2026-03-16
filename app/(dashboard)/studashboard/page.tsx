'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, House, Bot, BookOpen } from 'lucide-react';
import DashboardNavbar from '@/app/components/dashboard/student/DashboardNavbar';

interface DashboardUser {
  firstName: string;
}

const getTimeOfDayGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

const Page = () => {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDayGreeting());

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/marketplace/user', { credentials: 'include' });
        if (!response.ok) return;

        const data = await response.json();
        if (data?.user?.firstName) {
          setUser({ firstName: data.user.firstName });
        }
      } catch {
        // Greeting gracefully falls back when user data is unavailable.
      }
    };

    fetchUser();
    setTimeOfDay(getTimeOfDayGreeting());
  }, []);

  const displayName = user?.firstName || 'Student';

  const workspaces = [
    {
      id: 1,
      title: 'Productivity Layer',
      description: 'Tools to create, organize, and manage academic work. This workspace includes tools such as Docs and Drive.',
      icon: Zap,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      path: '/studashboard/productivity-layer',
    },
    {
      id: 2,
      title: 'Main Menu',
      description: 'Access campus tools, the student dashboard, marketplace, and student essentials.',
      icon: House,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      path: '/studashboard/main-menu/student-dashboard',
    },
    {
      id: 3,
      title: 'E-Learning',
      description: 'Access courses, learning materials, and track academic progress. Includes learning dashboard, my learning, and learning resources.',
      icon: BookOpen,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      path: '/studashboard/e-learning',
    },
    {
      id: 4,
      title: 'AI Studio',
      description: 'Your AI-powered academic assistant for research, writing, and study support. This is the main AI workspace where students interact with AI tools such as chat, research assistance, note summarization, and study planning.',
      icon: Bot,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
      path: '/studashboard/ai-studio',
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      <DashboardNavbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-24 sm:pb-12">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Good {timeOfDay}, {displayName}</h1>
          <p className="text-gray-500">Select a workspace to continue.</p>
        </div>

        {/* Workspace Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {workspaces.map((workspace) => {
            const Icon = workspace.icon;
            return (
              <div
                key={workspace.id}
                onClick={() => router.push(workspace.path)}
                className="relative overflow-hidden p-6 sm:p-8 min-h-[240px] sm:min-h-[260px] border border-transparent rounded-[20px] shadow-[0_2px_8px_rgba(16,24,40,0.07)] hover:border-transparent hover:shadow-[0_6px_14px_rgba(16,24,40,0.10)] transition-all cursor-pointer group"
              >
                <div className="pointer-events-none absolute top-3 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-2">
                  <Icon size={120} className="text-gray-200" />
                </div>
                <div className={`w-14 h-14 ${workspace.bgColor} rounded-xl flex items-center justify-center mb-6 shadow-[0_2px_6px_rgba(16,24,40,0.04)]`}>
                  <Icon size={31} className={workspace.color} />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition">
                  {workspace.title}
                </h3>
                <p className="text-md text-gray-500 leading-relaxed">{workspace.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Page;
