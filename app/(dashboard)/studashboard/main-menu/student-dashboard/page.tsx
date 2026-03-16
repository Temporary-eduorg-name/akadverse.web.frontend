'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Clock,
  Calendar,
  FileText,
  ClipboardList,
  GraduationCap,
  Grid2x2,
  Circle,
  ChevronRight,
  X,
} from 'lucide-react';
import DashboardNavbar from '@/app/components/dashboard/student/DashboardNavbar';
import DashboardSidebar from '@/app/components/dashboard/student/DashboardSidebar';
import { fetchRecentEmailsWithCache, type RecentEmailMessage } from '@/app/lib/recentEmailsCache';

interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  category: string;
  scheduleName: string;
  details: string;
}

type EmailMessage = RecentEmailMessage;

interface ReminderItem {
  id: string;
  title: string;
  subtitle: string;
  due: string;
  priority: 'high' | 'medium' | 'low';
  time: string;
  type: string;
}

interface ShortcutItem {
  id: number;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  path: string;
}

interface TaskResponseItem {
  id: string;
  title: string;
  category: string;
  details?: string | null;
  date: string;
  startTime: string;
  duration: number;
  schedule?: {
    name?: string | null;
  } | null;
}

const EMAIL_ROUTE = '/studashboard/main-menu/essentials/email';
const SCHEDULE_ROUTE = '/studashboard/main-menu/essentials/schedule-manager';
const PRODUCTIVITY_ROUTE = '/studashboard/productivity-layer';
const EMAIL_CACHE_KEY = 'studashboard-main-recent-emails';

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fromDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const toDateTime = (dateKey: string, time: string) => {
  const date = fromDateKey(dateKey);
  const [hours, minutes] = time.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const addMinutes = (time: string, duration: number) => {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + duration;
  const nextHours = Math.floor(totalMinutes / 60) % 24;
  const nextMinutes = totalMinutes % 60;
  return `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`;
};

const formatClockTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const value = new Date();
  value.setHours(hours, minutes, 0, 0);
  return value.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const formatScheduleTime = (task: TaskResponseItem) =>
  `${formatClockTime(task.startTime)} - ${formatClockTime(addMinutes(task.startTime, task.duration))}`;

const formatReminderDue = (task: TaskResponseItem) => {
  const taskDate = fromDateKey(task.date);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const tomorrow = new Date(startOfToday);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (taskDate.getTime() === startOfToday.getTime()) {
    return `Today at ${formatClockTime(task.startTime)}`;
  }

  if (taskDate.getTime() === tomorrow.getTime()) {
    return `Tomorrow at ${formatClockTime(task.startTime)}`;
  }

  return `${taskDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${formatClockTime(task.startTime)}`;
};

const formatReminderTime = (task: TaskResponseItem) =>
  `${task.date === toDateKey(new Date()) ? 'Today' : fromDateKey(task.date).toLocaleDateString([], { weekday: 'short' })} • ${formatClockTime(task.startTime)}`;

const getReminderPriority = (task: TaskResponseItem): ReminderItem['priority'] => {
  const hoursUntilStart = (toDateTime(task.date, task.startTime).getTime() - Date.now()) / (1000 * 60 * 60);

  if (hoursUntilStart <= 24) {
    return 'high';
  }

  if (hoursUntilStart <= 72) {
    return 'medium';
  }

  return 'low';
};

const getTaskSubtitle = (task: TaskResponseItem) => {
  const parts = [task.category];

  if (task.schedule?.name) {
    parts.push(task.schedule.name);
  }

  return parts.join(' • ');
};

const parseErrorMessage = async (response: Response, fallback: string) => {
  try {
    const data = await response.json();
    return typeof data?.error === 'string' ? data.error : fallback;
  } catch {
    return fallback;
  }
};

const Page = () => {
  const router = useRouter();
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([]);
  const [emailMessages, setEmailMessages] = useState<EmailMessage[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [loadingEmails, setLoadingEmails] = useState(true);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [reminderError, setReminderError] = useState<string | null>(null);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const mainStyle = useMemo(
    () => ({ '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties),
    [sidebarWidth],
  );

  const shortcuts: ShortcutItem[] = [
    { id: 1, label: 'Docs', icon: FileText, path: PRODUCTIVITY_ROUTE },
    { id: 2, label: 'Forms', icon: ClipboardList, path: PRODUCTIVITY_ROUTE },
    { id: 3, label: 'Learn.', icon: GraduationCap, path: '/studashboard/e-learning' },
    { id: 4, label: 'Essent.', icon: Grid2x2, path: '/studashboard/main-menu/essentials/suggestions' },
  ];

  const reminderPreview = reminders.slice(0, 3);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      const todayKey = toDateKey(new Date());

      setLoadingSchedule(true);
      setLoadingEmails(true);
      setLoadingReminders(true);
      setScheduleError(null);
      setEmailError(null);
      setReminderError(null);

      const [scheduleResult, emailResult, reminderResult] = await Promise.allSettled([
        fetch(`/api/schedule-manager/tasks?date=${todayKey}&completed=false&ignored=false`, {
          credentials: 'include',
        }),
        fetchRecentEmailsWithCache(EMAIL_CACHE_KEY),
        fetch('/api/schedule-manager/tasks?completed=false&ignored=false', {
          credentials: 'include',
        }),
      ]);

      if (!isMounted) {
        return;
      }

      if (scheduleResult.status === 'fulfilled') {
        if (scheduleResult.value.ok) {
          const data = await scheduleResult.value.json();
          const tasks: TaskResponseItem[] = Array.isArray(data?.tasks) ? data.tasks : [];
          setScheduleData(
            tasks.slice(0, 3).map((task) => ({
              id: task.id,
              title: task.title,
              time: formatScheduleTime(task),
              category: task.category,
              scheduleName: task.schedule?.name || 'Unscheduled',
              details: task.details?.trim() || 'No extra notes',
            })),
          );
        } else {
          setScheduleData([]);
          setScheduleError(await parseErrorMessage(scheduleResult.value, 'Unable to load today\'s schedule.'));
        }
      } else {
        setScheduleData([]);
        setScheduleError('Unable to load today\'s schedule.');
      }
      setLoadingSchedule(false);

      if (emailResult.status === 'fulfilled') {
        const { messages, error } = emailResult.value;
        if (error) {
          setEmailMessages([]);
          setEmailError(error);
        } else {
          setEmailMessages(messages);
        }
      } else {
        setEmailMessages([]);
        setEmailError('Unable to load recent messages.');
      }
      setLoadingEmails(false);

      if (reminderResult.status === 'fulfilled') {
        if (reminderResult.value.ok) {
          const data = await reminderResult.value.json();
          const tasks: TaskResponseItem[] = Array.isArray(data?.tasks) ? data.tasks : [];
          const nextReminders = tasks
            .sort((left, right) => toDateTime(left.date, left.startTime).getTime() - toDateTime(right.date, right.startTime).getTime())
            .map((task) => ({
              id: task.id,
              title: task.title,
              subtitle: getTaskSubtitle(task),
              due: formatReminderDue(task),
              priority: getReminderPriority(task),
              time: formatReminderTime(task),
              type: task.category,
            }));

          setReminders(nextReminders);
        } else {
          setReminders([]);
          setReminderError(await parseErrorMessage(reminderResult.value, 'Unable to load reminders.'));
        }
      } else {
        setReminders([]);
        setReminderError('Unable to load reminders.');
      }
      setLoadingReminders(false);
    };

    void loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!showRemindersModal) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowRemindersModal(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showRemindersModal]);

  const openInbox = (messageId?: string) => {
    const params = new URLSearchParams({ folder: 'inbox' });

    if (messageId) {
      params.set('messageId', messageId);
    }

    router.push(`${EMAIL_ROUTE}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans">
      <DashboardNavbar />

      <div className="relative" style={{ minHeight: 'calc(100vh - 70px)' }}>
        <DashboardSidebar onWidthChange={setSidebarWidth} />

        <div
          style={mainStyle}
          className="ml-0 lg:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-out p-6 lg:p-7 min-w-0"
        >
          <div className="w-full">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h1 className="text-[clamp(1.9rem,2.8vw,2.7rem)] leading-[1.08] font-bold text-gray-800 mb-2">Student Dashboard</h1>
                <p className="text-[clamp(1rem,1.25vw,1.15rem)] font-medium text-gray-400">Here's a quick glance at your academic day.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-[#f3f9f2] text-[#5d9464] border border-[#dcefd8]">
                  <Circle size={7} className="fill-[#59c26b] text-[#59c26b]" />
                  Fall Semester 2026
                </div>
                <div className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">Week 7</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="xl:col-span-2 space-y-6">
                <div className="border border-gray-200 bg-white rounded-[14px] p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-[17px] font-semibold text-gray-700">Today's Schedule</h2>
                    <button
                      onClick={() => router.push(SCHEDULE_ROUTE)}
                      className="text-blue-600 text-[11px] font-semibold"
                    >
                      View Full
                    </button>
                  </div>

                  <div className="space-y-3">
                    {loadingSchedule ? (
                      <div className="rounded-[10px] border border-dashed border-gray-200 bg-[#fbfcff] px-4 py-6 text-sm text-gray-400">
                        Loading today's schedule...
                      </div>
                    ) : scheduleError ? (
                      <div className="rounded-[10px] border border-red-100 bg-red-50/70 px-4 py-6 text-sm text-red-500">
                        {scheduleError}
                      </div>
                    ) : scheduleData.length === 0 ? (
                      <div className="rounded-[10px] border border-dashed border-gray-200 bg-[#fbfcff] px-4 py-6 text-sm text-gray-500">
                        No upcoming schedule items for today.
                      </div>
                    ) : (
                      scheduleData.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => router.push(SCHEDULE_ROUTE)}
                          className="flex w-full gap-3 p-3 bg-[#f8f9fc] rounded-[10px] border border-gray-100 text-left transition hover:border-blue-200 hover:bg-[#f5f9ff]"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-blue-100">
                              <Calendar size={14} className="text-blue-500" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="text-[14px] font-semibold text-gray-700 truncate">{item.title}</h3>
                              <ChevronRight size={14} className="mt-0.5 flex-shrink-0 text-gray-300" />
                            </div>
                            <div className="mt-1 flex flex-wrap gap-4 text-[11px] font-medium text-gray-400">
                              <div className="flex items-center gap-1">
                                <Clock size={11} />
                                {item.time}
                              </div>
                              <div>{item.category}</div>
                              <div>{item.scheduleName}</div>
                            </div>
                            <p className="mt-1 line-clamp-1 text-[11px] font-medium text-gray-400">{item.details}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 bg-white rounded-[14px] p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-[17px] font-semibold text-gray-700">Recent Messages</h2>
                    <button
                      onClick={() => openInbox()}
                      className="text-blue-600 text-[11px] font-semibold"
                    >
                      View Full
                    </button>
                  </div>

                  <div className="space-y-2">
                    {loadingEmails ? (
                      <div className="rounded-[10px] border border-dashed border-gray-200 bg-[#fbfcff] px-4 py-6 text-sm text-gray-400">
                        Loading recent messages...
                      </div>
                    ) : emailError ? (
                      <button
                        onClick={() => openInbox()}
                        className="w-full rounded-[10px] border border-amber-100 bg-amber-50/80 px-4 py-6 text-left text-sm text-amber-700 transition hover:bg-amber-50"
                      >
                        {emailError}. Open inbox to connect or review email access.
                      </button>
                    ) : emailMessages.length === 0 ? (
                      <button
                        onClick={() => openInbox()}
                        className="w-full rounded-[10px] border border-dashed border-gray-200 bg-[#fbfcff] px-4 py-6 text-left text-sm text-gray-500 transition hover:bg-white"
                      >
                        No recent emails yet. Open inbox.
                      </button>
                    ) : (
                      emailMessages.map((message) => (
                        <button
                          key={message.id}
                          onClick={() => openInbox(message.id)}
                          className={`w-full p-3 rounded-[10px] cursor-pointer border text-left transition ${
                            !message.isRead ? 'bg-blue-50/70 border-blue-100' : 'bg-[#f8f9fc] border-gray-100'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2 gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <Mail size={13} className="text-gray-400" />
                              <h4 className={`truncate text-[13px] font-semibold ${!message.isRead ? 'text-blue-600' : 'text-gray-700'}`}>
                                {message.sender}
                              </h4>
                            </div>
                            <span className="text-[11px] font-medium text-blue-500 whitespace-nowrap">{message.time}</span>
                          </div>
                          <p className={`truncate text-[12px] ${!message.isRead ? 'text-gray-700 font-medium' : 'text-gray-500 font-medium'}`}>
                            {message.subject}
                          </p>
                          <p className="text-[11px] font-medium text-gray-400 mt-1 line-clamp-1">{message.preview}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="xl:col-span-1 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowRemindersModal(true)}
                  className="w-full border border-gray-200 bg-white rounded-[14px] p-4 text-left shadow-[0_2px_10px_rgba(15,23,42,0.03)] transition hover:border-blue-200 hover:bg-[#fcfdff]"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-[17px] font-semibold text-gray-700">Reminders</h2>
                    <span className="text-[11px] font-semibold text-blue-600">View all</span>
                  </div>
                  <div className="space-y-2">
                    {loadingReminders ? (
                      <div className="rounded-[10px] border border-dashed border-gray-200 bg-[#fbfcff] px-4 py-6 text-sm text-gray-400">
                        Loading reminders...
                      </div>
                    ) : reminderError ? (
                      <div className="rounded-[10px] border border-red-100 bg-red-50/70 px-4 py-6 text-sm text-red-500">
                        {reminderError}
                      </div>
                    ) : reminderPreview.length === 0 ? (
                      <div className="rounded-[10px] border border-dashed border-gray-200 bg-[#fbfcff] px-4 py-6 text-sm text-gray-500">
                        No active reminders right now.
                      </div>
                    ) : (
                      reminderPreview.map((reminder) => (
                        <div key={reminder.id} className="p-2 rounded-[10px] bg-[#f8f9fc] border border-gray-100">
                          <div className="flex items-start gap-2">
                            <div className="pt-1">
                              <div className="w-[13px] h-[13px] rounded-[3px] border border-gray-300 bg-white"></div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] font-semibold text-gray-700 truncate">{reminder.title}</p>
                              <p className="text-[11px] font-medium text-gray-400 truncate">{reminder.subtitle}</p>
                              <p className="text-[11px] font-medium text-gray-400 truncate">{reminder.due}</p>
                              <span
                                className={`inline-block mt-1 px-1.5 py-[2px] rounded text-[9px] font-semibold tracking-wide ${
                                  reminder.priority === 'high'
                                    ? 'text-[#ff3b30] bg-[#fff1f1]'
                                    : reminder.priority === 'medium'
                                      ? 'text-[#ff9f0a] bg-[#fff7e8]'
                                      : 'text-[#2f80ff] bg-[#eef4ff]'
                                }`}
                              >
                                {reminder.priority === 'high'
                                  ? 'HIGH PRIORITY'
                                  : reminder.priority === 'medium'
                                    ? 'MEDIUM PRIORITY'
                                    : 'LOW PRIORITY'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </button>

                <div className="border border-gray-200 bg-white rounded-[14px] p-4">
                  <h2 className="text-[13px] font-semibold text-gray-400 mb-3 tracking-wide">QUICK SHORTCUTS</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {shortcuts.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => router.push(item.path)}
                        className="p-3 rounded-[10px] border border-gray-100 bg-[#fafbff] hover:bg-gray-50 transition flex flex-col items-center gap-1"
                      >
                        <item.icon size={12} className="text-blue-500" />
                        <span className="text-[11px] text-gray-500 font-semibold">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[14px] p-5 bg-[#101e3f] text-white shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-[11px] font-medium text-white/70">Current GPA</p>
                      <div className="flex items-center gap-1">
                        <span className="text-3xl font-semibold leading-none">3.84</span>
                        <span className="text-[13px] font-semibold text-emerald-300">+0.12</span>
                      </div>
                    </div>
                    <div className="flex items-end gap-1 h-8 pt-1">
                      <div className="w-1 rounded bg-white/20 h-3"></div>
                      <div className="w-1 rounded bg-white/20 h-5"></div>
                      <div className="w-1 rounded bg-white/20 h-7"></div>
                    </div>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5 mb-2">
                    <div className="bg-emerald-300 h-1.5 rounded-full" style={{ width: '84%' }}></div>
                  </div>
                  <div className="flex justify-between text-[11px] font-medium text-white/70">
                    <span>Credits Completed</span>
                    <span className="text-white">84 / 120</span>
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] font-medium text-white/60">
                    <span>Active Courses</span>
                    <span>4 Courses</span>
                  </div>
                </div>
              </div>
            </div>

            {showRemindersModal && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/35 px-4 py-6"
                onClick={() => setShowRemindersModal(false)}
              >
                <div
                  className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-[22px] border border-[#dfe7f2] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">All Reminders</h2>
                      <p className="mt-1 text-sm text-gray-500">Pending tasks pulled from your schedule manager.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRemindersModal(false)}
                      className="rounded-full border border-gray-200 p-2 text-gray-400 transition hover:text-gray-600"
                      aria-label="Close reminders"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="max-h-[calc(80vh-96px)] overflow-y-auto px-6 py-5">
                    {loadingReminders ? (
                      <div className="text-sm text-gray-400">Loading reminders...</div>
                    ) : reminderError ? (
                      <div className="rounded-[12px] border border-red-100 bg-red-50/70 px-4 py-5 text-sm text-red-500">
                        {reminderError}
                      </div>
                    ) : reminders.length === 0 ? (
                      <div className="rounded-[12px] border border-dashed border-gray-200 bg-[#fbfcff] px-4 py-5 text-sm text-gray-500">
                        No reminders available.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {reminders.map((reminder) => (
                          <div key={reminder.id} className="rounded-[16px] border border-gray-100 bg-[#fafcff] px-4 py-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-800">{reminder.title}</p>
                                <p className="mt-1 text-xs font-medium text-gray-500">{reminder.subtitle}</p>
                                <p className="mt-2 text-xs text-gray-400">{reminder.due}</p>
                              </div>
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide ${
                                  reminder.priority === 'high'
                                    ? 'bg-[#fff1f1] text-[#ff3b30]'
                                    : reminder.priority === 'medium'
                                      ? 'bg-[#fff7e8] text-[#ff9f0a]'
                                      : 'bg-[#eef4ff] text-[#2f80ff]'
                                }`}
                              >
                                {reminder.priority}
                              </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-4 text-[11px] font-medium text-gray-400">
                              <span>{reminder.time}</span>
                              <span className="truncate">{reminder.type}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
