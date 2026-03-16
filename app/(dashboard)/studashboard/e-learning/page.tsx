'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, GraduationCap, BookMarked, Video } from 'lucide-react';
import DashboardNavbar from '@/app/components/dashboard/student/DashboardNavbar';

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
          <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">E-Learning Hub</h1>
          <p className="text-gray-600">Access courses, learning materials, and academic progress.</p>
        </div>

        {/* Learning Items Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          {learningItems.map((item) => (
            <div
              key={item.id}
              className="cursor-pointer rounded-[20px] border border-transparent p-6 shadow-[0_2px_8px_rgba(16,24,40,0.07)] transition-all hover:shadow-[0_6px_14px_rgba(16,24,40,0.10)] sm:p-8"
              onClick={() => router.push(item.path)}
            >
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${item.color} shadow-[0_2px_6px_rgba(16,24,40,0.04)] sm:mb-6 sm:h-14 sm:w-14`}>
                {item.icon === 'graduation' && <GraduationCap size={28} className={item.textColor} />}
                {item.icon === 'book' && <BookMarked size={28} className={item.textColor} />}
                {item.icon === 'video' && <Video size={28} className={item.textColor} />}
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900 transition-colors hover:text-blue-600 sm:text-2xl">{item.title}</h3>
              <p className="text-base text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
