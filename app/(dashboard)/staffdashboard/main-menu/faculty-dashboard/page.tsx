'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap,
  BookOpen,
  Users,
  Calendar,
  UserCheck,
  Clock,
  MapPin,
  ArrowRight,
  AlertTriangle,
  Activity,
  Mail,
  Lightbulb,
  ChevronRight,
} from 'lucide-react';
import { fetchRecentEmailsWithCache, type RecentEmailMessage } from '@/app/lib/recentEmailsCache';

const EMAIL_ROUTE = '/staffdashboard/main-menu/essentials/email';
const EMAIL_CACHE_KEY = 'staffdashboard-main-recent-emails';

const Page = () => {
  const router = useRouter();
  const [emailMessages, setEmailMessages] = useState<RecentEmailMessage[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(true);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadRecentEmails = async () => {
      setLoadingEmails(true);
      setEmailError(null);

      const { messages, error } = await fetchRecentEmailsWithCache(EMAIL_CACHE_KEY);

      if (!isMounted) {
        return;
      }

      if (error) {
        setEmailMessages([]);
        setEmailError(error);
      } else {
        setEmailMessages(messages);
      }

      setLoadingEmails(false);
    };

    void loadRecentEmails();

    return () => {
      isMounted = false;
    };
  }, []);

  const openInbox = (messageId?: string) => {
    const params = new URLSearchParams({ folder: 'inbox' });

    if (messageId) {
      params.set('messageId', messageId);
    }

    router.push(`${EMAIL_ROUTE}?${params.toString()}`);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Faculty Dashboard</h1>
          <p className="text-slate-500 mt-2 font-medium">Your daily teaching overview and insights.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Courses', value: '3', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Students', value: '184', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Classes Today', value: '2', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Attendance Avg', value: '88%', icon: UserCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">

          {/* Today's Classes */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200/60">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Today&apos;s Classes</h2>
            </div>
            <div className="space-y-4">
              {[
                { code: 'CSC 211', title: 'Data Structures', time: '09:00 – 10:30', room: 'Engineering Hall 302' },
                { code: 'EEE 214', title: 'Circuit Analysis', time: '13:00 – 14:30', room: 'Room 204' },
              ].map((cls, i) => (
                <div key={i} className="p-5 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md mb-2 inline-block">{cls.code}</span>
                    <h3 className="text-lg font-bold text-slate-800">{cls.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {cls.time}</div>
                      <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {cls.room}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => router.push('/staffdashboard/main-menu/essentials/attendance')}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Record Attendance
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">
                      Course Materials
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">
                      Announcement
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Course Overview */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200/60">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Course Overview</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { code: 'CSC 211', title: 'Data Structures', students: 82, attendance: '91%', next: 'Tomorrow 09:00' },
                { code: 'EEE 214', title: 'Circuit Analysis', students: 64, attendance: '85%', next: 'Today 13:00' },
                { code: 'CSC 305', title: 'Algorithms', students: 38, attendance: '88%', next: 'Thursday 10:00' },
              ].map((course, i) => (
                <div key={i} className="p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md cursor-pointer transition-all bg-white group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{course.code}</span>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-4">{course.title}</h3>
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div>
                      <p className="text-slate-400 text-xs font-medium mb-0.5">Students</p>
                      <p className="font-semibold text-slate-700">{course.students}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs font-medium mb-0.5">Attendance</p>
                      <p className="font-semibold text-slate-700">{course.attendance}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400 text-xs font-medium mb-0.5">Next Lecture</p>
                      <p className="font-semibold text-slate-700">{course.next}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">

          {/* Recent Messages */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200/60">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Mail className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Recent Messages</h2>
              </div>
              <button
                onClick={() => openInbox()}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                View Full
              </button>
            </div>

            <div className="space-y-3">
              {loadingEmails ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-400">
                  Loading recent messages...
                </div>
              ) : emailError ? (
                <button
                  onClick={() => openInbox()}
                  className="w-full rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-5 text-left text-sm text-amber-700 transition hover:bg-amber-50"
                >
                  {emailError}. Open inbox to connect or review email access.
                </button>
              ) : emailMessages.length === 0 ? (
                <button
                  onClick={() => openInbox()}
                  className="w-full rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-left text-sm text-slate-500 transition hover:bg-white"
                >
                  No recent emails yet. Open inbox.
                </button>
              ) : (
                emailMessages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => openInbox(message.id)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                      message.isRead
                        ? 'border-slate-100 bg-slate-50 hover:bg-slate-100/70'
                        : 'border-blue-100 bg-blue-50/70 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`truncate text-sm font-semibold ${message.isRead ? 'text-slate-700' : 'text-blue-700'}`}>
                          {message.sender}
                        </p>
                        <p className={`mt-1 truncate text-xs font-medium ${message.isRead ? 'text-slate-500' : 'text-slate-700'}`}>
                          {message.subject}
                        </p>
                        <p className="mt-1 line-clamp-1 text-[11px] text-slate-400">{message.preview}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[11px] font-semibold text-blue-500">{message.time}</span>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Student Alerts */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200/60">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Student Alerts</h2>
            </div>
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Low Attendance</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-700">Daniel Adeyemi</span>
                    <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">68%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-700">Grace Okafor</span>
                    <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">71%</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Struggling Academically</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-700">John Mensah</span>
                    <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">GPA 1.9</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-700">Mary Bello</span>
                    <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">GPA 2.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity & Updates */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200/60">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Activity &amp; Updates</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="mt-0.5 w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-slate-700 leading-snug">12 new assignment submissions received for CSC 211.</p>
                  <p className="text-xs text-slate-400 mt-1">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="mt-0.5 w-2 h-2 rounded-full bg-indigo-500 shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-slate-700 leading-snug">3 students asked questions about Circuit Analysis lecture.</p>
                  <p className="text-xs text-slate-400 mt-1">3 hours ago</p>
                </div>
              </div>
              <div className="pt-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">Announcements</h3>
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 mb-2">
                  <p className="text-sm font-medium text-amber-800">Assignment 2 deadline extended to Sunday.</p>
                </div>
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3">
                  <p className="text-sm font-medium text-blue-800">Extra tutorial session scheduled for Friday.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Faculty Essentials Shortcuts */}
          <div className="bg-slate-900 rounded-[24px] p-6 shadow-md text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Zap className="w-32 h-32 -mt-8 -mr-8" />
            </div>
            <h2 className="text-lg font-bold mb-4 relative z-10">Faculty Essentials Shortcuts</h2>
            <div className="grid grid-cols-2 gap-3 relative z-10">
              {[
                { name: 'Schedule', icon: Calendar, path: '/staffdashboard/main-menu/essentials/schedule-manager' },
                { name: 'Attendance', icon: UserCheck, path: '/staffdashboard/main-menu/essentials/attendance' },
                { name: 'Email', icon: Mail, path: '/staffdashboard/main-menu/essentials/email' },
                { name: 'Suggestions', icon: Lightbulb, path: '/staffdashboard/main-menu/essentials/suggestions' },
              ].map((shortcut, i) => (
                <button
                  key={i}
                  onClick={() => router.push(shortcut.path)}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-slate-100"
                >
                  <shortcut.icon className="w-5 h-5 text-indigo-300" />
                  <span className="text-xs font-medium">{shortcut.name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Page;
