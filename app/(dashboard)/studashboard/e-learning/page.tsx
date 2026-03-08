'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Book, Search, BellDot, User, LogOut, ArrowLeft, GraduationCap, BookMarked, Video } from 'lucide-react';

const Page = () => {
  const router = useRouter();

  const learningItems = [
    {
      id: 1,
      title: 'Learning Dashboard',
      description: 'Overview of your current courses and academic progress.',
      icon: 'graduation',
      color: 'bg-blue-50',
      textColor: 'text-blue-500',
      path: '/studashboard/e-learning/learning-dashboard',
    },
    {
      id: 2,
      title: 'My Learning',
      description: 'Access student courses, modules, and assignments.',
      icon: 'book',
      color: 'bg-pink-50',
      textColor: 'text-pink-500',
      path: '/studashboard/e-learning/my-learning',
    },
    {
      id: 3,
      title: 'Learning Resources',
      description: 'Library of lecture materials, PDFs, and recorded videos.',
      icon: 'video',
      color: 'bg-cyan-50',
      textColor: 'text-cyan-500',
      path: '/studashboard/e-learning/learning-resources',
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Workspaces</span>
        </button>

        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">E-Learning Hub</h1>
          <p className="text-gray-600">Access courses, learning materials, and academic progress.</p>
        </div>

        {/* Learning Items Grid */}
        <div className="grid grid-cols-3 gap-8">
          {learningItems.map((item) => (
            <div
              key={item.id}
              className="p-8 border border-transparent rounded-[20px] shadow-[0_2px_8px_rgba(16,24,40,0.07)] hover:shadow-[0_6px_14px_rgba(16,24,40,0.10)] transition-all cursor-pointer"
              onClick={() => router.push(item.path)}
            >
              <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center mb-6 shadow-[0_2px_6px_rgba(16,24,40,0.04)]`}>
                {item.icon === 'graduation' && <GraduationCap size={28} className={item.textColor} />}
                {item.icon === 'book' && <BookMarked size={28} className={item.textColor} />}
                {item.icon === 'video' && <Video size={28} className={item.textColor} />}
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors">{item.title}</h3>
              <p className="text-base text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
