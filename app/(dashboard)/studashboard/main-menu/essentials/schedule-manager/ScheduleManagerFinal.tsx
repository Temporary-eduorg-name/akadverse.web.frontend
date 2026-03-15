'use client';

import React, { useMemo, useRef, useState } from 'react';
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
type TasksTab = 'completed' | 'pending';

type ScheduleItem = {
  id: number;
  title: string;
  category: string;
  details?: string;
  color: string;
  date: string;
  startTime: string;
  duration: number;
  scheduleId: string;
  scheduleName: string;
  focus: boolean;
  completed: boolean;
};

type CustomScheduleTaskInput = {
  id: number;
  title: string;
  category: string;
  details: string;
  date: string;
  startTime: string;
  duration: number;
};

type RecurrenceType = 'none' | 'daily' | 'weekly';

type CustomSchedule = {
  id: string;
  name: string;
  focus: boolean;
  color: string;
  tasks: CustomScheduleTaskInput[];
};

type SlotModalState = {
  date: string;
  hour: number;
  items: ScheduleItem[];
};

const DAYS_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const COLOR_OPTIONS = [
  { value: '#3498db', label: 'Ocean Blue' },
  { value: '#27ae60', label: 'Forest Green' },
  { value: '#e74c3c', label: 'Coral Red' },
  { value: '#f39c12', label: 'Sunset Orange' },
  { value: '#9b59b6', label: 'Royal Purple' },
  { value: '#1abc9c', label: 'Teal Mint' },
] as const;
const HOUR_ROWS = Array.from({ length: 24 }, (_, i) => i);

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
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const fromDateKey = (dateKey: string) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
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

const toDateTime = (dateKey: string, time: string) => {
  const date = fromDateKey(dateKey);
  const [h, m] = time.split(':').map(Number);
  date.setHours(h, m, 0, 0);
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

const getMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const addMinutes = (time: string, duration: number) => {
  const mins = getMinutes(time) + duration;
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const getCurrentWeekSeedData = () => {
  const weekStart = startOfWeek(new Date());
  const monday = toDateKey(weekStart);
  const tuesday = toDateKey(addDays(weekStart, 1));
  const wednesday = toDateKey(addDays(weekStart, 2));
  const thursday = toDateKey(addDays(weekStart, 3));

  const initialItems: ScheduleItem[] = [
    {
      id: 1,
      title: 'Data Structures Review',
      category: 'Study',
      color: '#9b59b6',
      date: monday,
      startTime: '09:00',
      duration: 90,
      scheduleId: 'main',
      scheduleName: 'Main',
      focus: true,
      completed: false,
    },
    {
      id: 2,
      title: 'Math Problem Set',
      category: 'Assignment',
      color: '#3498db',
      date: monday,
      startTime: '09:00',
      duration: 60,
      scheduleId: 'main',
      scheduleName: 'Main',
      focus: true,
      completed: false,
    },
    {
      id: 3,
      title: 'Mentor Session',
      category: 'Advising',
      color: '#1abc9c',
      date: tuesday,
      startTime: '11:00',
      duration: 45,
      scheduleId: 'main',
      scheduleName: 'Main',
      focus: false,
      completed: false,
    },
    {
      id: 4,
      title: 'Weekly Reflection',
      category: 'Planning',
      color: '#f39c12',
      date: wednesday,
      startTime: '18:00',
      duration: 30,
      scheduleId: 'main',
      scheduleName: 'Main',
      focus: false,
      completed: true,
    },
    {
      id: 5,
      title: 'Prepare Lab Notes',
      category: 'Lab',
      color: '#e74c3c',
      date: thursday,
      startTime: '07:00',
      duration: 60,
      scheduleId: 'main',
      scheduleName: 'Main',
      focus: true,
      completed: false,
    },
  ];

  const customSchedules: CustomSchedule[] = [
    {
      id: 'main',
      name: 'Main',
      focus: true,
      color: '#3498db',
      tasks: [
        {
          id: 1001,
          title: 'Data Structures Review',
          category: 'Study',
          details:'',
          date: monday,
          startTime: '09:00',
          duration: 90,
        }
      ],
    },
  ];

  return { initialItems, customSchedules, weekStart };
};

const seed = getCurrentWeekSeedData();

const defaultTaskForm = (dateKey: string) => ({
  title: '',
  category: '',
  details: '',
  date: dateKey,
  startTime: '09:00',
  duration: 30,
  focus: false,
  color: '#3498db',
  recurrence: 'none' as RecurrenceType,
  interval: 1,
  repeatCount: 8,
});

const defaultScheduleTask = (dateKey: string): CustomScheduleTaskInput => ({
  id: Date.now(),
  title: '',
  category: '',
  details: '',
  date: dateKey,
  startTime: '09:00',
  duration: 30,
});

const ScheduleManagerFinal = () => {
  const [items, setItems] = useState<ScheduleItem[]>(seed.initialItems);
  const [view, setView] = useState<ViewMode>('my-schedule');
  const [customSchedules, setCustomSchedules] = useState<CustomSchedule[]>(seed.customSchedules);
  const [boardWeekStart, setBoardWeekStart] = useState<Date>(seed.weekStart);
  const [dailyDate, setDailyDate] = useState<string>(toDateKey(new Date()));

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showViewTasksModal, setShowViewTasksModal] = useState(false);
  const [showRemainingModal, setShowRemainingModal] = useState(false);
  const [showAllSchedulesModal, setShowAllSchedulesModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<CustomSchedule | null>(null);
  const [slotModal, setSlotModal] = useState<SlotModalState | null>(null);

  const [tasksTab, setTasksTab] = useState<TasksTab>('pending');
  const [timeframeWeeks, setTimeframeWeeks] = useState<number>(1);

  // scroll-sync refs for sticky day-header + hour-rows boards
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const isSyncing = useRef(false);
  const syncFromHeader = (e: React.UIEvent<HTMLDivElement>) => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    if (bodyScrollRef.current) bodyScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
    isSyncing.current = false;
  };
  const syncFromBody = (e: React.UIEvent<HTMLDivElement>) => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    if (headerScrollRef.current) headerScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
    isSyncing.current = false;
  };

  const [taskForm, setTaskForm] = useState(defaultTaskForm(toDateKey(seed.weekStart)));
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    focus: false,
    color: '#9b59b6',
    tasks: [defaultScheduleTask(toDateKey(seed.weekStart))],
  });

  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(boardWeekStart, i)), [boardWeekStart]);
  const weekDateKeys = useMemo(() => weekDates.map((d) => toDateKey(d)), [weekDates]);

  const filteredBoardItems = useMemo(() => {
    let data = items.filter((item) => weekDateKeys.includes(item.date));
    if (view === 'focus-mode') data = data.filter((item) => item.focus);
    return data;
  }, [items, weekDateKeys, view]);

  const itemsByDateAndHour = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();

    for (const item of filteredBoardItems) {
      const hour = Number(item.startTime.split(':')[0]);
      const key = `${item.date}-${hour}`;
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }

    for (const [, value] of map.entries()) {
      value.sort((a, b) => getMinutes(a.startTime) - getMinutes(b.startTime));
    }
    return map;
  }, [filteredBoardItems]);

  const weekStats = useMemo(() => {
    const thisWeek = items.filter((item) => weekDateKeys.includes(item.date));
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
  }, [items, weekDateKeys]);

  const remainingThisWeek = useMemo(
    () => weekStats.thisWeek.filter((item) => !item.completed).sort((a, b) => toDateTime(a.date, a.startTime).getTime() - toDateTime(b.date, b.startTime).getTime()),
    [weekStats.thisWeek],
  );

  const viewTasksList = useMemo(() => {
    const now = new Date();
    const end = addWeeks(now, timeframeWeeks);

    const base = items
      .filter((item) => {
        const when = toDateTime(item.date, item.startTime);
        return when >= now && when <= end;
      })
      .sort((a, b) => toDateTime(a.date, a.startTime).getTime() - toDateTime(b.date, b.startTime).getTime());

    return base.filter((item) => (tasksTab === 'completed' ? item.completed : !item.completed));
  }, [items, timeframeWeeks, tasksTab]);

  const dailyItems = useMemo(() => {
    let data = items.filter((item) => item.date === dailyDate);
    if (view === 'focus-mode') data = data.filter((item) => item.focus);
    return data.sort((a, b) => getMinutes(a.startTime) - getMinutes(b.startTime));
  }, [items, dailyDate, view]);

  const toggleComplete = (id: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)));
  };

  const isTaskPast = (item: ScheduleItem) => {
    if (item.completed) return false;
    return toDateTime(item.date, addMinutes(item.startTime, item.duration)) < new Date();
  };

  const resetTaskForm = () => {
    setTaskForm(defaultTaskForm(weekDateKeys[0] ?? toDateKey(new Date())));
  };

  const createTask = () => {
    if (!taskForm.title.trim() || !taskForm.category.trim() || !taskForm.date) return;

    const buildDateKey = (start: string, index: number) => {
      if (taskForm.recurrence === 'none') return start;
      const seedDate = fromDateKey(start);
      const next =
        taskForm.recurrence === 'daily'
          ? addDays(seedDate, taskForm.interval * index)
          : addDays(seedDate, taskForm.interval * 7 * index);
      return toDateKey(next);
    };

    const occurrences = taskForm.recurrence === 'none' ? 1 : Math.max(1, taskForm.repeatCount);
    const created: ScheduleItem[] = Array.from({ length: occurrences }, (_, index) => ({
      id: Date.now() + index,
      title: taskForm.title.trim(),
      category: taskForm.category.trim(),
      details: taskForm.details.trim(),
      color: taskForm.color,
      date: buildDateKey(taskForm.date, index),
      startTime: taskForm.startTime,
      duration: taskForm.duration,
      scheduleId: 'main',
      scheduleName: 'Main',
      focus: taskForm.focus,
      completed: false,
    }));

    setItems((prev) => [...prev, ...created]);
    resetTaskForm();
    setShowTaskModal(false);
  };

  const addCustomScheduleTaskRow = () => {
    setScheduleForm((prev) => ({
      ...prev,
      tasks: [...prev.tasks, defaultScheduleTask(weekDateKeys[0] ?? toDateKey(new Date()))],
    }));
  };

  const removeCustomScheduleTaskRow = (id: number) => {
    setScheduleForm((prev) => ({
      ...prev,
      tasks: prev.tasks.length === 1 ? prev.tasks : prev.tasks.filter((task) => task.id !== id),
    }));
  };

  const updateCustomScheduleTask = (id: number, patch: Partial<CustomScheduleTaskInput>) => {
    setScheduleForm((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => (task.id === id ? { ...task, ...patch } : task)),
    }));
  };

  const resetScheduleForm = () => {
    setScheduleForm({
      name: '',
      focus: false,
      color: '#9b59b6',
      tasks: [defaultScheduleTask(weekDateKeys[0] ?? toDateKey(new Date()))],
    });
  };

  const createCustomSchedule = () => {
    const name = scheduleForm.name.trim();
    if (!name) return;

    const validTasks = scheduleForm.tasks.filter((task) => task.title.trim() && task.category.trim() && task.date);
    if (validTasks.length === 0) return;

    const id = `schedule-${Date.now()}`;
    const schedule: CustomSchedule = {
      id,
      name,
      focus: scheduleForm.focus,
      color: scheduleForm.color,
      tasks: validTasks,
    };

    const createdItems: ScheduleItem[] = validTasks.map((task, index) => ({
      id: Date.now() + index,
      title: task.title.trim(),
      category: task.category.trim(),
      details: task.details.trim(),
      color: schedule.color,
      date: task.date,
      startTime: task.startTime,
      duration: task.duration,
      scheduleId: id,
      scheduleName: name,
      focus: schedule.focus,
      completed: false,
    }));

    setCustomSchedules((prev) => [...prev, schedule]);
    setItems((prev) => [...prev, ...createdItems]);
    setSelectedSchedule(schedule);
    setShowScheduleModal(false);
    resetScheduleForm();
  };

  return (
    <div className="flex flex-col bg-white">
      <div className="px-5 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-6">
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

      <div className="bg-gray-50 p-4">
        {view === 'daily-schedule' ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Daily Schedule</h2>
              <input
                type="date"
                value={dailyDate}
                onChange={(e) => setDailyDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <p className="text-sm text-gray-600 mb-4">{formatDayLabel(dailyDate)}</p>

            <div className="space-y-2">
              {dailyItems.length === 0 && <p className="text-sm text-gray-500">No tasks for this day.</p>}
              {dailyItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className="p-3 rounded-xl border bg-gray-50"
                  style={{ borderLeft: `4px solid ${item.color}` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-600">
                        {item.startTime} - {addMinutes(item.startTime, item.duration)} | {item.category} | {item.scheduleName}
                      </p>
                      {item.details && <p className="text-xs text-gray-700 font-medium mt-1">{item.details}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {!item.completed && isTaskPast(item) && <XCircle size={16} className="text-red-600" />}
                      <input type="checkbox" checked={item.completed} onChange={() => toggleComplete(item.id)} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            {/* sticky day-header section */}
            <div className="sticky top-[70px] z-20 bg-white rounded-t-2xl border-b border-gray-200">
              {/* view segment + centered week range */}
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1 justify-self-start">
                  <button
                    onClick={() => setView('my-schedule')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      view === 'my-schedule' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    My Schedule
                  </button>
                  <button
                    onClick={() => setView('focus-mode')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      view === 'focus-mode' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    Focus Mode
                  </button>
                </div>

                <p className="text-sm font-semibold text-gray-800 text-center">
                  {formatHumanDate(weekDateKeys[0])} - {formatHumanDate(weekDateKeys[6])}
                </p>

                <div className="justify-self-end">
                  <button
                    onClick={() => setView('daily-schedule')}
                    className="px-4 py-2 text-sm font-semibold rounded-lg border transition-colors bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    Daily Schedule
                  </button>
                </div>
              </div>

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

              {/* day headers — scrolls in sync with the body, but scrollbar hidden */}
              <div
                ref={headerScrollRef}
                onScroll={syncFromHeader}
                className="overflow-x-auto px-4 pb-3"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="grid grid-cols-[72px_repeat(7,minmax(120px,1fr))] gap-2 min-w-[980px]">
                  
                  {weekDates.map((date, idx) => {
                    const key = toDateKey(date);
                    const isToday = key === toDateKey(new Date());
                    return (
                      <div
                        key={key}
                        className={`text-center py-2 rounded-xl ${isToday ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700'}`}
                      >
                        <p className="text-[11px] font-semibold uppercase">{DAYS_SHORT[idx]}</p>
                        <p className="text-lg font-bold">{date.getDate()}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* scrollable hour rows */}
            <div
              ref={bodyScrollRef}
              onScroll={syncFromBody}
              className="overflow-x-auto px-4 py-4"
            >
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
                            className="w-full text-left rounded-md p-2 text-[11px] hover:shadow-sm transition-shadow"
                            style={{ backgroundColor: `${slotItems[0].color}20`, borderLeft: `3px solid ${slotItems[0].color}` }}
                          >
                            <p className="font-semibold text-gray-900 truncate">{slotItems[0].title}</p>
                            <p className="text-gray-700 text-[10px] font-semibold truncate">{slotItems[0].scheduleName} | {slotItems[0].category}</p>
                            <p className="text-gray-600 text-[10px]">{slotItems[0].startTime}</p>
                            {!slotItems[0].completed && isTaskPast(slotItems[0]) && (
                              <p className="text-[10px] text-red-600 mt-1 flex items-center gap-1">
                                <XCircle size={12} />
                                Time passed
                              </p>
                            )}
                          </button>
                        )}
                         dddddd
                        {slotItems.length > 1 && (
                          <button
                            onClick={() => setSlotModal({ date: dateKey, hour, items: slotItems })}
                            className="relative w-full h-[52px]"
                            aria-label={`Open ${slotItems.length} tasks`}
                          >
                            {slotItems.slice(0, 3).map((task, index) => (
                              <motion.div
                                key={task.id}
                                initial={{ y: 8, opacity: 0 }}
                                animate={{ y: index * 6, opacity: 1 }}
                                className="absolute left-0 right-0 rounded-md p-2 text-left text-[10px]"
                                style={{
                                  top: 0,
                                  backgroundColor: `${task.color}1f`,
                                  borderLeft: `3px solid ${task.color}`,
                                  zIndex: 10 - index,
                                }}
                              >
                                <p className="font-semibold text-gray-900 truncate">{task.title}</p>
                                <p className="text-gray-700 text-[9px] font-semibold truncate mt-0.5">{task.scheduleName}</p>
                              </motion.div>
                            ))}
                            {slotItems.length > 3 && (
                              <span className="absolute bottom-0 right-1 text-[10px] font-semibold text-gray-600">+{slotItems.length - 3}</span>
                            )}
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
            </div>{/* end bodyScrollRef */}
          </div>
        )}
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
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Create Task</h2>
                <button onClick={() => setShowTaskModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Task Title</label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-400 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800"
                    placeholder="Enter task title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Category</label>
                  <input
                    type="text"
                    value={taskForm.category}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-400 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800"
                    placeholder="Study, Assignment, Revision"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Task Details</label>
                  <textarea
                    rows={3}
                    value={taskForm.details}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, details: e.target.value }))}
                    className="w-full border border-gray-400 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800"
                    placeholder="Add notes or task breakdown"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Date</label>
                    <input
                      type="date"
                      value={taskForm.date}
                      onChange={(e) => setTaskForm((prev) => ({ ...prev, date: e.target.value }))}
                      className="w-full border border-gray-400 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Start Time</label>
                    <input
                      type="time"
                      value={taskForm.startTime}
                      onChange={(e) => setTaskForm((prev) => ({ ...prev, startTime: e.target.value }))}
                      className="w-full border border-gray-400 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Duration (minutes)</label>
                    <input
                      type="number"
                      value={taskForm.duration}
                      onChange={(e) => setTaskForm((prev) => ({ ...prev, duration: Number(e.target.value) || 30 }))}
                      className="w-full border border-gray-400 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mt-7">
                    <input
                      type="checkbox"
                      checked={taskForm.focus}
                      onChange={(e) => setTaskForm((prev) => ({ ...prev, focus: e.target.checked }))}
                    />
                    Include in focus mode
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Repeat</label>
                    <select
                      value={taskForm.recurrence}
                      onChange={(e) => setTaskForm((prev) => ({ ...prev, recurrence: e.target.value as RecurrenceType }))}
                      className="w-full border border-gray-400 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800"
                    >
                      <option value="none">Does not repeat</option>
                      <option value="daily">Every N days</option>
                      <option value="weekly">Every N weeks (same weekday)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Interval</label>
                    <input
                      type="number"
                      min={1}
                      value={taskForm.interval}
                      onChange={(e) => setTaskForm((prev) => ({ ...prev, interval: Math.max(1, Number(e.target.value) || 1) }))}
                      className="w-full border border-gray-400 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Occurrences</label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={taskForm.repeatCount}
                      onChange={(e) => setTaskForm((prev) => ({ ...prev, repeatCount: Math.max(1, Number(e.target.value) || 1) }))}
                      className="w-full border border-gray-400 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800"
                      disabled={taskForm.recurrence === 'none'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Color</label>
                  <div className="flex gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setTaskForm((prev) => ({ ...prev, color: color.value }))}
                        className="w-10 h-10 rounded-full border-4 transition-transform hover:scale-110"
                        style={{ backgroundColor: color.value, borderColor: taskForm.color === color.value ? '#1f2937' : 'transparent' }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
                <button onClick={createTask} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors shadow-sm">
                  Create Task
                </button>
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
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Create Custom Schedule</h2>
                <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Schedule Name</label>
                    <input
                      type="text"
                      value={scheduleForm.name}
                      onChange={(e) => setScheduleForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-400 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800"
                      placeholder="Workout Plan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Schedule Color</label>
                    <select
                      value={scheduleForm.color}
                      onChange={(e) => setScheduleForm((prev) => ({ ...prev, color: e.target.value }))}
                      className="w-full border border-gray-400 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800"
                    >
                      {COLOR_OPTIONS.map((color) => (
                        <option key={color.value} value={color.value}>● {color.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <input
                    type="checkbox"
                    checked={scheduleForm.focus}
                    onChange={(e) => setScheduleForm((prev) => ({ ...prev, focus: e.target.checked }))}
                  />
                  Include this custom schedule in focus mode
                </label>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">Tasks inside this schedule</p>
                    <button
                      onClick={addCustomScheduleTaskRow}
                      className="text-sm font-semibold text-gray-800 px-3 py-1.5 rounded-lg border border-gray-400 hover:bg-gray-50"
                    >
                      + Add Task Row
                    </button>
                  </div>

                  {scheduleForm.tasks.map((task) => (
                    <motion.div key={task.id} layout className="rounded-xl border border-gray-300 bg-gray-50 p-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={task.title}
                          placeholder="Sub-task name (e.g. Push-ups)"
                          onChange={(e) => updateCustomScheduleTask(task.id, { title: e.target.value })}
                          className="border border-gray-400 bg-white rounded-lg px-3 py-2 text-sm font-medium text-gray-800"
                        />
                        <input
                          type="text"
                          value={task.category}
                          placeholder="Type (Strength/Cardio/etc)"
                          onChange={(e) => updateCustomScheduleTask(task.id, { category: e.target.value })}
                          className="border border-gray-400 bg-white rounded-lg px-3 py-2 text-sm font-medium text-gray-800"
                        />
                        <input
                          type="date"
                          value={task.date}
                          onChange={(e) => updateCustomScheduleTask(task.id, { date: e.target.value })}
                          className="border border-gray-400 bg-white rounded-lg px-3 py-2 text-sm font-medium text-gray-800"
                        />
                        <input
                          type="time"
                          value={task.startTime}
                          onChange={(e) => updateCustomScheduleTask(task.id, { startTime: e.target.value })}
                          className="border border-gray-400 bg-white rounded-lg px-3 py-2 text-sm font-medium text-gray-800"
                        />
                        <input
                          type="number"
                          value={task.duration}
                          onChange={(e) => updateCustomScheduleTask(task.id, { duration: Number(e.target.value) || 30 })}
                          className="border border-gray-400 bg-white rounded-lg px-3 py-2 text-sm font-medium text-gray-800"
                          placeholder="Duration (mins)"
                        />
                        <textarea
                          rows={2}
                          value={task.details}
                          placeholder="Details (sets, reps, notes, etc)"
                          onChange={(e) => updateCustomScheduleTask(task.id, { details: e.target.value })}
                          className="border border-gray-400 bg-white rounded-lg px-3 py-2 text-sm font-medium text-gray-800 lg:col-span-2"
                        />
                        <button
                          onClick={() => removeCustomScheduleTaskRow(task.id)}
                          className="rounded-lg border border-red-300 text-red-700 font-semibold hover:bg-red-50 px-3 py-2 text-sm"
                        >
                          Remove Row
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={createCustomSchedule}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition-colors shadow-sm"
                >
                  Create Custom Schedule
                </button>
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
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">All Tasks</h2>
                <button onClick={() => setShowViewTasksModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setTasksTab('pending')}
                      className={`px-4 py-2 text-sm rounded-lg ${tasksTab === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}
                    >
                      Not Yet Completed
                    </button>
                    <button
                      onClick={() => setTasksTab('completed')}
                      className={`px-4 py-2 text-sm rounded-lg ${tasksTab === 'completed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}
                    >
                      Completed
                    </button>
                  </div>

                  <select
                    value={timeframeWeeks}
                    onChange={(e) => setTimeframeWeeks(Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    {TIMEFRAME_OPTIONS.map((option) => (
                      <option key={option.label} value={option.weeks}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  {viewTasksList.length === 0 && <p className="text-sm text-gray-500">No tasks found for the selected filter.</p>}
                  {viewTasksList.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      className="p-3 rounded-xl border bg-gray-50"
                      style={{ borderLeft: `4px solid ${item.color}` }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-600">
                            {formatHumanDate(item.date)} | {item.startTime} - {addMinutes(item.startTime, item.duration)} | {item.category}
                          </p>
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
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Tasks Remaining This Week</h2>
                <button onClick={() => setShowRemainingModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>
              <div className="p-6 space-y-2">
                {remainingThisWeek.length === 0 && <p className="text-sm text-gray-500">All week tasks are completed.</p>}
                {remainingThisWeek.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl border bg-gray-50" style={{ borderLeft: `4px solid ${item.color}` }}>
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-600">
                      {formatHumanDate(item.date)} | {item.startTime} | {item.scheduleName}
                    </p>
                  </div>
                ))}
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
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">
                  Tasks at {formatHourLabel(slotModal.hour)} - {formatHumanDate(slotModal.date)}
                </h2>
                <button onClick={() => setSlotModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>
              <div className="p-6 space-y-2">
                {slotModal.items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    className="p-3 rounded-xl border bg-gray-50"
                    style={{ borderLeft: `4px solid ${item.color}` }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-600">
                          {item.startTime} - {addMinutes(item.startTime, item.duration)} | {item.category} | {item.scheduleName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!item.completed && isTaskPast(item) && <XCircle size={16} className="text-red-600" />}
                        <input type="checkbox" checked={item.completed} onChange={() => toggleComplete(item.id)} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAllSchedulesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAllSchedulesModal(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Custom Schedules</h2>
                <button onClick={() => setShowAllSchedulesModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                {customSchedules.map((schedule) => (
                  <button
                    key={schedule.id}
                    onClick={() => {
                      setSelectedSchedule(schedule);
                      setShowAllSchedulesModal(false);
                    }}
                    className="text-left p-4 rounded-xl border border-gray-200 bg-gray-50 hover:border-blue-300 transition-colors"
                  >
                    <p className="font-semibold text-gray-900">{schedule.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{schedule.tasks.length} tasks inside</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedSchedule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedSchedule(null)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">{selectedSchedule.name}</h2>
                <button onClick={() => setSelectedSchedule(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>

              <div className="p-6 space-y-2">
                {selectedSchedule.tasks.map((task) => (
                  <div key={task.id} className="p-3 rounded-xl border bg-gray-50" style={{ borderLeft: `4px solid ${selectedSchedule.color}` }}>
                    <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-600">
                      {formatHumanDate(task.date)} | {task.startTime} - {addMinutes(task.startTime, task.duration)} | {task.category}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScheduleManagerFinal;
