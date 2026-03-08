'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Menu, Book, Bot, Search, BellDot, User, LogOut, BookOpen } from 'lucide-react';

const Page = () => {
  const router = useRouter();
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
      icon: Menu,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      path: '/studashboard/main-menu',
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
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">Student Profile</span>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-blue-600" />
              </div>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Back to login"
              onClick={() => router.push('/login')}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Good morning, Student</h1>
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
                className="p-8 min-h-[260px] border border-transparent rounded-[20px] shadow-[0_2px_8px_rgba(16,24,40,0.07)] hover:border-transparent hover:shadow-[0_6px_14px_rgba(16,24,40,0.10)] transition-all cursor-pointer group"
              >
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
