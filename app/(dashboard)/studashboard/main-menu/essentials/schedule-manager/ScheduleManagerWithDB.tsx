'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Eye,
  Sparkles,
  TrendingUp,
  XCircle,
} from 'lucide-react';

type ViewMode = 'my-schedule' | 'focus-mode' | 'daily-schedule';
type TasksTab = 'completed' | 'pending' | 'ignored';

type ScheduleItem = {
  id: string;
  title: string;
  category: string;
  details?: string;
  color: string;
  date: string;
  startTime: string;
  duration: number;
  scheduleId: string | null;
  scheduleName: string;
  focus: boolean;
  completed: boolean;
  ignored: boolean;
  ignoredAt?: string | null;
};

type CustomSchedule = {
  id: string;
  name: string;
  focus: boolean;
  color: string;
};

type SlotModalState = {
  date: string;
  hour: number;
  items: ScheduleItem[];
};

const DAYS_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const HOUR_ROWS = Array.from({ length: 24 }, (_, index) => index);
const COLOR_OPTIONS = ['#3498db', '#9b59b6', '#e74c3c', '#f39c12', '#27ae60', '#1abc9c'];
const TIMEFRAME_OPTIONS = [
  { label: '1 week', weeks: 1 },
  { label: '2 weeks', weeks: 2 },
  { label: '3 weeks', weeks: 3 },
  { label: '1 month', weeks: 4 },
  { label: '2 months', weeks: 8 },
  { label: '5 months', weeks: 20 },
  { label: '8 months', weeks: 32 },
  { label: '12 months', weeks: 52 },
];

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

const startOfWeek = (date: Date) => {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const addWeeks = (date: Date, weeks: number) => addDays(date, weeks * 7);

const getMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const addMinutes = (time: string, duration: number) => {
  const minutes = getMinutes(time) + duration;
  const hours = Math.floor(minutes / 60) % 24;
  const remainder = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
};

const toDateTime = (dateKey: string, time: string) => {
  const date = fromDateKey(dateKey);
  const [hours, minutes] = time.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const formatHourLabel = (hour: number) => {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const value = hour % 12 === 0 ? 12 : hour % 12;
  return `${value}${suffix}`;
};

const formatHumanDate = (dateKey: string) =>
  fromDateKey(dateKey).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const formatDayLabel = (dateKey: string) =>
  fromDateKey(dateKey).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '');
  const safe = normalized.length === 3
    ? normalized.split('').map((value) => `${value}${value}`).join('')
    : normalized;

  const parsed = Number.parseInt(safe, 16);
  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
};

const mixColor = (baseHex: string, targetHex: string, amount: number) => {
  const base = hexToRgb(baseHex);
  const target = hexToRgb(targetHex);
  const ratio = clamp(amount, 0, 1);

  const mix = (start: number, end: number) => Math.round(start + (end - start) * ratio);

  return `rgb(${mix(base.r, target.r)}, ${mix(base.g, target.g)}, ${mix(base.b, target.b)})`;
};

const getStackCardBackground = (color: string, index: number) => {
  const lightenRatio = clamp(0.72 - index * 0.17, 0.22, 0.72);
  return mixColor(color, '#ffffff', lightenRatio);
};

const initialTaskForm = {
  title: '',
  category: '',
  details: '',
  date: toDateKey(new Date()),
  startTime: '09:00',
  duration: 30,
  focus: false,
  color: '#3498db',
  scheduleId: '',
};

const ScheduleManagerWithDB = () => {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [schedules, setSchedules] = useState<CustomSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('my-schedule');
  const [boardWeekStart, setBoardWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [dailyDate, setDailyDate] = useState<string>(toDateKey(new Date()));
  const [tasksTab, setTasksTab] = useState<TasksTab>('pending');
  const [timeframeWeeks, setTimeframeWeeks] = useState<number>(1);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showViewTasksModal, setShowViewTasksModal] = useState(false);
  const [showRemainingModal, setShowRemainingModal] = useState(false);
  const [slotModal, setSlotModal] = useState<SlotModalState | null>(null);

  const [taskForm, setTaskForm] = useState(initialTaskForm);
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    focus: false,
    color: '#9b59b6',
  });

  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const isSyncing = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [schedulesRes, tasksRes] = await Promise.all([
          fetch('/api/schedule-manager/schedules'),
          fetch('/api/schedule-manager/tasks'),
        ]);

        if (!schedulesRes.ok || !tasksRes.ok) {
          throw new Error('Failed to fetch schedules or tasks');
        }

        const schedulesData = await schedulesRes.json();
        const tasksData = await tasksRes.json();

        setSchedules(
          schedulesData.schedules.map((schedule: any) => ({
            id: schedule.id,
            name: schedule.name,
            focus: schedule.focus,
            color: schedule.color,
          })),
        );

        setItems(
          tasksData.tasks.map((task: any) => ({
            id: task.id,
            title: task.title,
            category: task.category,
            details: task.details,
            color: task.color,
            date: task.date,
            startTime: task.startTime,
            duration: task.duration,
            scheduleId: task.scheduleId,
            scheduleName: task.schedule?.name || 'No Schedule',
            focus: task.focus,
            completed: task.completed,
            ignored: Boolean(task.ignored),
            ignoredAt: task.ignoredAt,
          })),
        );
      } catch (error) {
        console.error('Failed to load schedules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const syncFromHeader = (event: React.UIEvent<HTMLDivElement>) => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    if (bodyScrollRef.current) {
      bodyScrollRef.current.scrollLeft = event.currentTarget.scrollLeft;
    }
    isSyncing.current = false;
  };

  const syncFromBody = (event: React.UIEvent<HTMLDivElement>) => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = event.currentTarget.scrollLeft;
    }
    isSyncing.current = false;
  };

  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(boardWeekStart, index)), [boardWeekStart]);
  const weekDateKeys = useMemo(() => weekDates.map((date) => toDateKey(date)), [weekDates]);

  const activeBoardItems = useMemo(() => items.filter((item) => !item.ignored), [items]);

  const filteredBoardItems = useMemo(() => {
    let data = activeBoardItems.filter((item) => weekDateKeys.includes(item.date));
    if (view === 'focus-mode') {
      data = data.filter((item) => item.focus);
    }
    return data;
  }, [activeBoardItems, weekDateKeys, view]);

  const itemsByDateAndHour = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();

    for (const item of filteredBoardItems) {
      const hour = Number(item.startTime.split(':')[0]);
      const key = `${item.date}-${hour}`;
      const bucket = map.get(key) ?? [];
      bucket.push(item);
      map.set(key, bucket);
    }

    for (const [, bucket] of map.entries()) {
      bucket.sort((left, right) => getMinutes(left.startTime) - getMinutes(right.startTime));
    }

    return map;
  }, [filteredBoardItems]);

  const weekStats = useMemo(() => {
    const thisWeek = activeBoardItems.filter((item) => weekDateKeys.includes(item.date));
    const completed = thisWeek.filter((item) => item.completed).length;
    const remaining = thisWeek.filter((item) => !item.completed).length;
    const occupiedHours = thisWeek.reduce((sum, item) => sum + item.duration / 60, 0);
    const freeHours = Math.max(0, 168 - occupiedHours);
    const productivity = thisWeek.length === 0 ? 0 : Math.round((completed / thisWeek.length) * 100);

    return {
      completed,
      remaining,
      freeHours: Math.round(freeHours),
      productivity,
      thisWeek,
    };
  }, [activeBoardItems, weekDateKeys]);

  const remainingThisWeek = useMemo(
    () =>
      weekStats.thisWeek
        .filter((item) => !item.completed)
        .sort((left, right) => toDateTime(left.date, left.startTime).getTime() - toDateTime(right.date, right.startTime).getTime()),
    [weekStats.thisWeek],
  );

  const viewTasksList = useMemo(() => {
    const now = new Date();

    if (tasksTab === 'ignored') {
      return items
        .filter((item) => item.ignored && !item.completed)
        .sort((left, right) => {
          const leftDate = left.ignoredAt ? new Date(left.ignoredAt).getTime() : toDateTime(left.date, left.startTime).getTime();
          const rightDate = right.ignoredAt ? new Date(right.ignoredAt).getTime() : toDateTime(right.date, right.startTime).getTime();
          return rightDate - leftDate;
        });
    }

    const end = addWeeks(now, timeframeWeeks);

    return items
      .filter((item) => !item.ignored)
      .filter((item) => {
        const when = toDateTime(item.date, item.startTime);
        return when >= now && when <= end;
      })
      .sort((left, right) => toDateTime(left.date, left.startTime).getTime() - toDateTime(right.date, right.startTime).getTime())
      .filter((item) => (tasksTab === 'completed' ? item.completed : !item.completed));
  }, [items, tasksTab, timeframeWeeks]);

  const dailyItems = useMemo(() => {
    let data = activeBoardItems.filter((item) => item.date === dailyDate);
    if (view === 'focus-mode') {
      data = data.filter((item) => item.focus);
    }
    return data.sort((left, right) => getMinutes(left.startTime) - getMinutes(right.startTime));
  }, [activeBoardItems, dailyDate, view]);

  const toggleComplete = async (taskId: string) => {
    const task = items.find((entry) => entry.id === taskId);
    if (!task) {
      return;
    }

    const nextCompleted = !task.completed;

    // Optimistic update so the UI reflects completion immediately.
    setItems((prev) => prev.map((item) => (
      item.id === taskId
        ? {
            ...item,
            completed: nextCompleted,
            ...(nextCompleted ? { ignored: false, ignoredAt: null } : {}),
          }
        : item
    )));

    setSlotModal((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) => (
          item.id === taskId
            ? {
                ...item,
                completed: nextCompleted,
                ...(nextCompleted ? { ignored: false, ignoredAt: null } : {}),
              }
            : item
        )),
      };
    });

    try {
      const response = await fetch(`/api/schedule-manager/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: nextCompleted }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updated = await response.json();

      setItems((prev) => prev.map((item) => (
        item.id === taskId
          ? {
              ...item,
              completed: updated.task.completed,
              ignored: updated.task.ignored,
              ignoredAt: updated.task.ignoredAt,
            }
          : item
      )));

      setSlotModal((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((item) => (
            item.id === taskId
              ? {
                  ...item,
                  completed: updated.task.completed,
                  ignored: updated.task.ignored,
                  ignoredAt: updated.task.ignoredAt,
                }
              : item
          )),
        };
      });
    } catch (error) {
      console.error('Error updating task:', error);

      // Roll back optimistic state when the request fails.
      setItems((prev) => prev.map((item) => (item.id === taskId ? task : item)));
      setSlotModal((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((item) => (item.id === taskId ? task : item)),
        };
      });
    }
  };

  const isTaskPast = (item: ScheduleItem) => {
    if (item.completed) {
      return false;
    }

    return toDateTime(item.date, addMinutes(item.startTime, item.duration)) < new Date();
  };

  const createTask = async () => {
    if (!taskForm.title.trim() || !taskForm.category.trim() || !taskForm.date || !taskForm.startTime || !taskForm.duration) {
      alert('Please fill in the required task fields');
      return;
    }

    try {
      const response = await fetch('/api/schedule-manager/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskForm,
          scheduleId: taskForm.scheduleId || null,
          duration: parseInt(taskForm.duration.toString(), 10),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await response.json();

      setItems((prev) => [
        ...prev,
        {
          id: newTask.task.id,
          title: newTask.task.title,
          category: newTask.task.category,
          details: newTask.task.details,
          color: newTask.task.color,
          date: newTask.task.date,
          startTime: newTask.task.startTime,
          duration: newTask.task.duration,
          scheduleId: newTask.task.scheduleId,
          scheduleName: newTask.task.schedule?.name || 'No Schedule',
          focus: newTask.task.focus,
          completed: newTask.task.completed,
          ignored: Boolean(newTask.task.ignored),
          ignoredAt: newTask.task.ignoredAt,
        },
      ]);

      setTaskForm(initialTaskForm);
      setShowTaskModal(false);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  const createSchedule = async () => {
    if (!scheduleForm.name.trim()) {
      alert('Please enter a schedule name');
      return;
    }

    try {
      const response = await fetch('/api/schedule-manager/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleForm),
      });

      if (!response.ok) {
        throw new Error('Failed to create schedule');
      }

      const created = await response.json();

      setSchedules((prev) => [
        ...prev,
        {
          id: created.schedule.id,
          name: created.schedule.name,
          focus: created.schedule.focus,
          color: created.schedule.color,
        },
      ]);

      setTaskForm((prev) => ({ ...prev, scheduleId: created.schedule.id, color: created.schedule.color }));
      setScheduleForm({ name: '', focus: false, color: '#9b59b6' });
      setShowScheduleModal(false);
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('Failed to create schedule');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white">
      <div className="px-5 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-6 gap-3">
          <h1 className="text-2xl font-bold text-gray-900">My Schedule Manager</h1>
          <button
            onClick={() => setShowViewTasksModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg"
          >
            <Eye size={16} />
            View Tasks
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div layout className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <Clock size={22} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Free Hours</p>
              <p className="text-2xl font-bold text-gray-900">{weekStats.freeHours}</p>
            </div>
          </motion.div>

          <motion.div layout className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              <CheckCircle2 size={22} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Tasks Completed This Week</p>
              <p className="text-2xl font-bold text-gray-900">{weekStats.completed}</p>
            </div>
          </motion.div>

          <motion.button
            layout
            onClick={() => setShowRemainingModal(true)}
            className="text-left bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm hover:border-orange-300 transition-colors"
          >
            <div className="p-2.5 bg-orange-50 rounded-xl">
              <ClipboardList size={22} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Tasks Remaining</p>
              <p className="text-2xl font-bold text-gray-900">{weekStats.remaining}</p>
            </div>
          </motion.button>

          <motion.div layout className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
            <div className="p-2.5 bg-purple-50 rounded-xl">
              <TrendingUp size={22} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Productivity Score</p>
              <p className="text-2xl font-bold text-gray-900">{weekStats.productivity}%</p>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            <Sparkles size={16} />
            Create Custom Schedule
          </button>

          <button
            onClick={() => setShowTaskModal(true)}
            className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl border border-gray-300 transition-colors flex items-center gap-2"
          >
            <ClipboardList size={16} />
            Create Task
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-4 flex-1">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
            <div className="flex flex-col items-center gap-4 px-4 pt-2 pb-4 border-b border-gray-100 text-center">
              <div className="inline-flex items-center gap-1 rounded-2xl bg-gray-100 p-1.5 mx-auto">
                <button
                  onClick={() => setView('my-schedule')}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                    view === 'my-schedule' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  My Schedule
                </button>
                <button
                  onClick={() => setView('focus-mode')}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                    view === 'focus-mode' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Focus Mode
                </button>
                <button
                  onClick={() => setView('daily-schedule')}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                    view === 'daily-schedule' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Daily Schedule
                </button>
              </div>

              {view === 'daily-schedule' ? (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm font-semibold text-gray-800">{formatDayLabel(dailyDate)}</p>
                  <input
                    type="date"
                    value={dailyDate}
                    onChange={(event) => setDailyDate(event.target.value)}
                    className="border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-700"
                  />
                </div>
              ) : (
                <p className="text-sm font-semibold text-gray-800">
                  {formatHumanDate(weekDateKeys[0])} - {formatHumanDate(weekDateKeys[6])}
                </p>
              )}
            </div>

            {view !== 'daily-schedule' && (
              <>
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <button
                    onClick={() => setBoardWeekStart((prev) => addWeeks(prev, -1))}
                    className="h-9 w-9 rounded-full border border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 flex items-center justify-center"
                    aria-label="Previous week"
                    title="Previous week"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <p className="text-sm font-semibold text-gray-800">Navigate Week</p>

                  <button
                    onClick={() => setBoardWeekStart((prev) => addWeeks(prev, 1))}
                    className="h-9 w-9 rounded-full border border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 flex items-center justify-center"
                    aria-label="Next week"
                    title="Next week"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div
                  ref={headerScrollRef}
                  onScroll={syncFromHeader}
                  className="overflow-x-auto px-4 pb-3"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <div className="grid grid-cols-[72px_repeat(7,minmax(120px,1fr))] gap-2 min-w-[980px]">
                    <div></div>
                    {weekDates.map((date, index) => {
                      const key = toDateKey(date);
                      const isToday = key === toDateKey(new Date());

                      return (
                        <div
                          key={key}
                          className={`text-center py-2 rounded-xl ${isToday ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700'}`}
                        >
                          <p className="text-[11px] font-semibold uppercase">{DAYS_SHORT[index]}</p>
                          <p className="text-lg font-bold">{date.getDate()}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {view === 'daily-schedule' ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5"
            >
              <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
                <div className="flex items-center gap-2 text-gray-700 mb-4">
                  <CalendarDays size={18} className="text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Daily Schedule Overview</h2>
                </div>

                <div className="space-y-3">
                  {dailyItems.length === 0 && <p className="text-sm text-gray-500">No tasks for this day.</p>}
                  {dailyItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      className="p-4 rounded-2xl border border-gray-200 bg-white"
                      style={{ borderLeft: `4px solid ${item.color}` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                            {item.focus && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">Focus</span>}
                            {item.scheduleName === 'No Schedule' && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">Unscheduled</span>}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {item.startTime} - {addMinutes(item.startTime, item.duration)} | {item.category} | {item.scheduleName}
                          </p>
                          {item.details && <p className="text-xs text-gray-700 font-medium mt-2 leading-5">{item.details}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          {!item.completed && isTaskPast(item) && <XCircle size={16} className="text-red-600" />}
                          <input type="checkbox" checked={item.completed} onChange={() => toggleComplete(item.id)} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div ref={bodyScrollRef} onScroll={syncFromBody} className="overflow-x-auto px-4 py-4">
              <div className="space-y-1 min-w-[980px]">
                {HOUR_ROWS.map((hour) => (
                  <div key={hour} className="grid grid-cols-[72px_repeat(7,minmax(120px,1fr))] gap-2">
                    <div className="min-h-[60px] rounded-lg border border-gray-100 bg-gray-50 px-2 py-2 text-[11px] font-semibold text-gray-500">
                      {formatHourLabel(hour)}
                    </div>

                    {weekDateKeys.map((dateKey) => {
                      const slotItems = itemsByDateAndHour.get(`${dateKey}-${hour}`) ?? [];

                      return (
                        <motion.div
                          key={`${dateKey}-${hour}`}
                          layout
                          className="min-h-[60px] rounded-lg border border-gray-100 bg-gray-50 p-1.5"
                        >
                          {slotItems.length === 1 && (
                            <button
                              onClick={() => setSlotModal({ date: dateKey, hour, items: slotItems })}
                              className="w-full text-left rounded-xl p-2.5 hover:shadow-sm transition-shadow border border-transparent"
                              style={{
                                backgroundColor: getStackCardBackground(slotItems[0].color, 0),
                                borderLeft: `3px solid ${slotItems[0].color}`,
                              }}
                            >
                              <p className="font-semibold text-gray-900 truncate text-[11px]">{slotItems[0].title}</p>
                              <p className="text-gray-700 text-[10px] font-semibold truncate">
                                {slotItems[0].scheduleName} | {slotItems[0].category}
                              </p>
                              <p className="text-gray-600 text-[10px]">{slotItems[0].startTime}</p>
                              {!slotItems[0].completed && isTaskPast(slotItems[0]) && (
                                <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1">
                                  <XCircle size={12} />
                                  Time passed
                                </p>
                              )}
                            </button>
                          )}

                          {slotItems.length > 1 && (
                            <button
                              onClick={() => setSlotModal({ date: dateKey, hour, items: slotItems })}
                              className="relative w-full h-[74px]"
                              aria-label={`Open ${slotItems.length} tasks`}
                            >
                              {slotItems.slice(0, 3).map((task, index) => (
                                <motion.div
                                  key={task.id}
                                  initial={{ y: 10, opacity: 0 }}
                                  animate={{ y: index * 8, opacity: 1 }}
                                  className="absolute left-0 right-0 rounded-xl px-2.5 py-2 text-left border"
                                  style={{
                                    top: 0,
                                    backgroundColor: getStackCardBackground(task.color, index),
                                    borderColor: mixColor(task.color, '#d1d5db', 0.55),
                                    borderLeft: `3px solid ${task.color}`,
                                    boxShadow: '0 8px 16px rgba(15, 23, 42, 0.08)',
                                    zIndex: 20 - index,
                                  }}
                                >
                                  <p className="font-semibold text-gray-900 truncate text-[10px]">{task.title}</p>
                                  <p className="text-gray-700 text-[9px] font-semibold truncate mt-0.5">{task.scheduleName}</p>
                                </motion.div>
                              ))}
                              {slotItems.length > 3 && (
                                <span className="absolute bottom-0 right-1 text-[10px] font-semibold text-gray-600 bg-white/90 px-1.5 py-0.5 rounded-full">
                                  +{slotItems.length - 3}
                                </span>
                              )}
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTaskModal(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Create Task</h2>
                <button onClick={() => setShowTaskModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                  &times;
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Schedule (optional)</label>
                  <select
                    value={taskForm.scheduleId}
                    onChange={(event) => {
                      const nextScheduleId = event.target.value;
                      const schedule = schedules.find((entry) => entry.id === nextScheduleId);

                      setTaskForm((prev) => ({
                        ...prev,
                        scheduleId: nextScheduleId,
                        color: schedule?.color ?? prev.color,
                      }));
                    }}
                    className="w-full border border-gray-400 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800"
                  >
                    <option value="">No schedule</option>
                    {schedules.map((schedule) => (
                      <option key={schedule.id} value={schedule.id}>
                        {schedule.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Task Title</label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(event) => setTaskForm((prev) => ({ ...prev, title: event.target.value }))}
                    className="w-full border border-gray-400 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800"
                    placeholder="Enter task title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Category</label>
                  <input
                    type="text"
                    value={taskForm.category}
                    onChange={(event) => setTaskForm((prev) => ({ ...prev, category: event.target.value }))}
                    className="w-full border border-gray-400 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800"
                    placeholder="Study, Assignment, Revision"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Details</label>
                  <textarea
                    rows={3}
                    value={taskForm.details}
                    onChange={(event) => setTaskForm((prev) => ({ ...prev, details: event.target.value }))}
                    className="w-full border border-gray-400 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800"
                    placeholder="Add task details"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Date</label>
                    <input
                      type="date"
                      value={taskForm.date}
                      onChange={(event) => setTaskForm((prev) => ({ ...prev, date: event.target.value }))}
                      className="w-full border border-gray-400 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Start Time</label>
                    <input
                      type="time"
                      value={taskForm.startTime}
                      onChange={(event) => setTaskForm((prev) => ({ ...prev, startTime: event.target.value }))}
                      className="w-full border border-gray-400 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Duration (minutes)</label>
                  <input
                    type="number"
                    value={taskForm.duration}
                    onChange={(event) => setTaskForm((prev) => ({ ...prev, duration: parseInt(event.target.value, 10) || 30 }))}
                    className="w-full border border-gray-400 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <input
                    type="checkbox"
                    checked={taskForm.focus}
                    onChange={(event) => setTaskForm((prev) => ({ ...prev, focus: event.target.checked }))}
                  />
                  Include in focus mode
                </label>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Task Color</label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setTaskForm((prev) => ({ ...prev, color }))}
                        className={`h-9 w-9 rounded-full border-2 ${taskForm.color === color ? 'border-gray-900' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select ${color} task color`}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={createTask}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    Create Task
                  </button>
                  <button
                    onClick={() => setShowTaskModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowScheduleModal(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Create Custom Schedule</h2>
                <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                  &times;
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Schedule Name</label>
                  <input
                    type="text"
                    value={scheduleForm.name}
                    onChange={(event) => setScheduleForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="w-full border border-gray-400 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800"
                    placeholder="e.g., Work, Personal, Exercise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setScheduleForm((prev) => ({ ...prev, color }))}
                        className={`w-10 h-10 rounded-lg border-2 ${scheduleForm.color === color ? 'border-gray-900' : 'border-gray-200'}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select ${color} schedule color`}
                      />
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <input
                    type="checkbox"
                    checked={scheduleForm.focus}
                    onChange={(event) => setScheduleForm((prev) => ({ ...prev, focus: event.target.checked }))}
                  />
                  Make this a focus schedule
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={createSchedule}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    Create Schedule
                  </button>
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showViewTasksModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowViewTasksModal(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-gray-900">All Tasks</h2>
                <button onClick={() => setShowViewTasksModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                  &times;
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setTasksTab('pending')}
                      className={`px-4 py-2 text-sm rounded-lg ${tasksTab === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => setTasksTab('completed')}
                      className={`px-4 py-2 text-sm rounded-lg ${tasksTab === 'completed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}
                    >
                      Completed
                    </button>
                    <button
                      onClick={() => setTasksTab('ignored')}
                      className={`px-4 py-2 text-sm rounded-lg ${tasksTab === 'ignored' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}
                    >
                      Ignored
                    </button>
                  </div>

                  {tasksTab !== 'ignored' && (
                    <select
                      value={timeframeWeeks}
                      onChange={(event) => setTimeframeWeeks(Number(event.target.value))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      {TIMEFRAME_OPTIONS.map((option) => (
                        <option key={option.label} value={option.weeks}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-3">
                  {viewTasksList.length === 0 ? (
                    <p className="text-sm text-gray-500">No tasks found for the selected filter.</p>
                  ) : (
                    viewTasksList.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        className="p-4 rounded-2xl border border-gray-200 bg-gray-50"
                        style={{ borderLeft: `4px solid ${task.color}` }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-gray-900">{task.title}</p>
                              {task.focus && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">Focus</span>}
                              {task.ignored && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">Ignored</span>}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {formatHumanDate(task.date)} | {task.startTime} - {addMinutes(task.startTime, task.duration)} | {task.category}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{task.scheduleName}</p>
                            {task.details && <p className="text-sm text-gray-700 mt-2 leading-6">{task.details}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            {!task.completed && !task.ignored && isTaskPast(task) && <XCircle size={16} className="text-red-600" />}
                            <input type="checkbox" checked={task.completed} onChange={() => toggleComplete(task.id)} />
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRemainingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRemainingModal(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-gray-900">Tasks Remaining This Week</h2>
                <button onClick={() => setShowRemainingModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                  &times;
                </button>
              </div>
              <div className="p-6 space-y-3">
                {remainingThisWeek.length === 0 ? (
                  <p className="text-center text-gray-500">All tasks completed!</p>
                ) : (
                  remainingThisWeek.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 rounded-2xl border border-gray-200 bg-gray-50"
                      style={{ borderLeft: `4px solid ${task.color}` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatHumanDate(task.date)} at {task.startTime} | {task.scheduleName}
                          </p>
                        </div>
                        <input type="checkbox" checked={task.completed} onChange={() => toggleComplete(task.id)} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {slotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSlotModal(null)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Tasks at {formatHourLabel(slotModal.hour)}</h2>
                  <p className="text-sm text-gray-500 mt-1">{formatHumanDate(slotModal.date)}</p>
                </div>
                <button onClick={() => setSlotModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl">
                  &times;
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(85vh-88px)] space-y-4">
                {slotModal.items.map((item, index) => {
                  const liveItem = items.find((entry) => entry.id === item.id) ?? item;

                  return (
                  <motion.div
                    key={liveItem.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
                    style={{ borderLeft: `4px solid ${liveItem.color}` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-gray-900">{liveItem.title}</p>
                          {liveItem.focus && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">Focus</span>}
                          {liveItem.scheduleName === 'No Schedule' && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">Unscheduled</span>}
                        </div>
                        <p className="text-sm text-gray-600">
                          {liveItem.startTime} - {addMinutes(liveItem.startTime, liveItem.duration)} | {liveItem.category}
                        </p>
                        <p className="text-sm text-gray-500">Schedule: {liveItem.scheduleName}</p>
                        {liveItem.details ? (
                          <p className="text-sm text-gray-700 leading-6">{liveItem.details}</p>
                        ) : (
                          <p className="text-sm text-gray-400">No extra details for this task.</p>
                        )}
                        {!liveItem.completed && isTaskPast(liveItem) && (
                          <div className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                            <XCircle size={12} />
                            Time passed
                          </div>
                        )}
                      </div>
                      <input type="checkbox" checked={liveItem.completed} onChange={() => toggleComplete(liveItem.id)} />
                    </div>
                  </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScheduleManagerWithDB;
