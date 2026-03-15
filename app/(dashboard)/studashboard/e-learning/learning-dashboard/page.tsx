'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/app/components/dashboard/student/DashboardNavbar';

const Page = () => {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'courses', label: 'Courses' },
    { id: 'records', label: 'Records' },
    { id: 'mylearning', label: 'Mylearning' },
    { id: 'suggestions', label: 'Suggestions' },
  ];

  const courses = [
    { name: 'Calculus II', category: 'Mathematics', credits: 3, status: 'In Progress' },
    { name: 'Data Structures', category: 'Computer Science', credits: 4, status: 'Completed' },
    { name: 'Genetics', category: 'Life Sciences', credits: 3, status: 'In Progress' },
  ];

  const recentGrades = [
    { title: 'Calculus II', grade: 'A-', color: '#4f46e5' },
    { title: 'Data Structures', grade: 'A+', color: '#0891b2' },
    { title: 'Genetics', grade: 'B+', color: '#059669' },
  ];

  const myLearningCourses = [
    { title: 'Intro to Linear Algebra', progress: 72, color: '#4f46e5' },
    { title: 'Organic Chemistry I', progress: 45, color: '#0891b2' },
    { title: 'World History: Modern Era', progress: 89, color: '#059669' },
  ];

  const cgpaCircumference = 2 * Math.PI * 38;

  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans flex flex-col">
      <DashboardNavbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Blue Sidebar */}
        <aside className="w-[288px] bg-[#1e40af] flex-shrink-0 flex flex-col py-6 px-5 min-h-[calc(100vh-64px)]">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-base">Learning Essentials</span>
          </div>

          {/* Back to workspace */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-8 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to workspace
          </button>

          {/* Nav items */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeNav === item.id
                    ? 'bg-white/20 text-white'
                    : 'text-white/65 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Heading */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Academic Overview</h1>
            <button className="px-4 py-2 text-sm font-medium text-white bg-[#1e40af] rounded-lg hover:bg-blue-800 transition-colors">
              Download Report
            </button>
          </div>

          <div className="flex gap-6">
            {/* Left Column */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
              {/* CGPA Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-base font-semibold text-gray-800 mb-4">CGPA</h2>
                <div className="flex items-center gap-6">
                  {/* Donut Chart */}
                  <div className="relative w-28 h-28 flex-shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#1e40af"
                        strokeWidth="12"
                        strokeDasharray={`${0.77 * cgpaCircumference} ${cgpaCircumference}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-gray-900">3.85</span>
                      <span className="text-xs text-gray-500">/ 4.0</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Credit Progress</span>
                        <span>78%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#1e40af] rounded-full" style={{ width: '78%' }} />
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="text-sm font-semibold text-emerald-600">Distinction</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Remaining</p>
                        <p className="text-sm font-semibold text-gray-800">26 Credits</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Grades */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Recent Grades</h2>
                <div className="flex flex-col gap-3">
                  {recentGrades.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: item.color + '20' }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke={item.color} strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700">{item.title}</span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: item.color }}>{item.grade}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Control */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-800">Course Control</h2>
                  <select className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Departments</option>
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs font-medium text-gray-500 pb-3 pr-4">Course Name</th>
                        <th className="text-left text-xs font-medium text-gray-500 pb-3 pr-4">Category</th>
                        <th className="text-left text-xs font-medium text-gray-500 pb-3 pr-4">Credits</th>
                        <th className="text-left text-xs font-medium text-gray-500 pb-3 pr-4">Status</th>
                        <th className="text-left text-xs font-medium text-gray-500 pb-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course, idx) => (
                        <tr key={idx} className="border-b border-gray-50 last:border-0">
                          <td className="py-3 font-medium text-gray-800 pr-4">{course.name}</td>
                          <td className="py-3 text-gray-500 pr-4">{course.category}</td>
                          <td className="py-3 text-gray-500 pr-4">{course.credits}</td>
                          <td className="py-3 pr-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                course.status === 'Completed'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : 'bg-teal-50 text-teal-600'
                              }`}
                            >
                              {course.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <button className="text-xs text-[#1e40af] hover:underline font-medium">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="w-[274px] flex-shrink-0 flex flex-col gap-4">
              <h2 className="text-base font-semibold text-gray-800">MyLearning</h2>
              <div className="bg-[#e4edff] rounded-2xl p-4 flex flex-col gap-3">
                {myLearningCourses.map((course, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm font-medium text-gray-800 mb-2">{course.title}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${course.progress}%`, backgroundColor: course.color }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">{course.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* New Suggestions Card */}
              <div className="bg-[#1e40af] rounded-2xl p-5 text-white">
                <h3 className="text-sm font-semibold mb-1">New Suggestions</h3>
                <p className="text-xs text-white/70 mb-4">
                  Personalized courses and resources based on your performance.
                </p>
                <button className="w-full py-2 bg-white text-[#1e40af] text-xs font-semibold rounded-lg hover:bg-blue-50 transition-colors">
                  Explore Now
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Page;
