'use client';

import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  UploadCloud,
  Camera,
  FileText,
  Briefcase,
  Church,
  Flame,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

type AttendanceBase = 'present' | 'absent';
type CalendarStatus = AttendanceBase | 'upcoming' | 'none';
type AttendanceCategory = 'chapel' | 'fellowship' | 'work';

type AttendanceEntry = {
  dateKey: string;
  status: AttendanceBase;
};

type ClassCourse = {
  id: string;
  code: string;
  title: string;
  classSize: number;
  classesHeld: number;
  avgRate: number;
};

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const classesDatabase: ClassCourse[] = [
  { id: 'csc211', code: 'CSC 211', title: 'Data Structures', classSize: 82, classesHeld: 14, avgRate: 90 },
  { id: 'eee214', code: 'EEE 214', title: 'Circuit Analysis', classSize: 64, classesHeld: 13, avgRate: 87 },
  { id: 'csc305', code: 'CSC 305', title: 'Algorithms', classSize: 38, classesHeld: 12, avgRate: 91 },
  { id: 'mth219', code: 'MTH 219', title: 'Linear Algebra', classSize: 73, classesHeld: 11, avgRate: 84 },
  { id: 'phy202', code: 'PHY 202', title: 'Electromagnetism', classSize: 56, classesHeld: 10, avgRate: 88 },
  { id: 'gst201', code: 'GST 201', title: 'Communication in English', classSize: 129, classesHeld: 9, avgRate: 79 },
  { id: 'cve226', code: 'CVE 226', title: 'Engineering Drawing', classSize: 47, classesHeld: 8, avgRate: 86 },
];

const toDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Chapel: Tuesdays in March 2026 — only first 2 sessions recorded
const chapelArray: AttendanceEntry[] = [
  { dateKey: '2026-03-03', status: 'present' },
  { dateKey: '2026-03-10', status: 'absent' },
];

// Fellowship: Fridays in March 2026 — all 4 sessions recorded
const fellowshipArray: AttendanceEntry[] = [
  { dateKey: '2026-03-06', status: 'present' },
  { dateKey: '2026-03-13', status: 'present' },
  { dateKey: '2026-03-20', status: 'absent' },
  { dateKey: '2026-03-27', status: 'absent' },
];

// Work: First half of March 2026 weekdays (11 days), exactly one absent
const workArray: AttendanceEntry[] = [
  { dateKey: '2026-03-02', status: 'present' },
  { dateKey: '2026-03-03', status: 'present' },
  { dateKey: '2026-03-04', status: 'present' },
  { dateKey: '2026-03-05', status: 'present' },
  { dateKey: '2026-03-06', status: 'present' },
  { dateKey: '2026-03-09', status: 'present' },
  { dateKey: '2026-03-10', status: 'absent' },
  { dateKey: '2026-03-11', status: 'present' },
  { dateKey: '2026-03-12', status: 'present' },
  { dateKey: '2026-03-13', status: 'present' },
  { dateKey: '2026-03-16', status: 'present' },
];

function FacultyMyAttendance() {
  const [selectedCategory, setSelectedCategory] = useState<AttendanceCategory>('chapel');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1));

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const statusMap = useMemo(() => {
    const map = new Map<string, AttendanceBase>();
    const yearMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const source = selectedCategory === 'chapel' ? chapelArray : selectedCategory === 'fellowship' ? fellowshipArray : workArray;
    source
      .filter((entry) => entry.dateKey.startsWith(yearMonthPrefix))
      .forEach((entry) => map.set(entry.dateKey, entry.status));
    return map;
  }, [selectedCategory, currentYear, currentMonth]);

  const getStatus = (day: number): CalendarStatus => {
    const date = new Date(currentYear, currentMonth, day);
    const dateKey = toDateKey(date);
    const explicit = statusMap.get(dateKey);
    if (explicit) return explicit;

    const dayOfWeek = date.getDay();
    const isFuture = date > today;

    if (selectedCategory === 'chapel' && dayOfWeek === 2) {
      return isFuture ? 'upcoming' : 'none';
    }

    if (selectedCategory === 'fellowship' && dayOfWeek === 5) {
      return isFuture ? 'upcoming' : 'none';
    }

    if (selectedCategory === 'work' && dayOfWeek >= 1 && dayOfWeek <= 5) {
      return isFuture ? 'upcoming' : 'none';
    }

    return 'none';
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));

  const categoryDetails = {
    chapel: { name: 'Chapel Service', desc: 'Track your weekly chapel attendance' },
    fellowship: { name: 'Fellowship', desc: 'Track your Friday fellowship attendance' },
    work: { name: 'Work Attendance', desc: 'Track your daily work presence' },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'chapel', title: 'Chapel Service', desc: 'Track your weekly chapel attendance', icon: Church, color: 'text-indigo-600', bg: 'bg-indigo-50', activeBg: 'bg-indigo-600', activeText: 'text-white' },
          { id: 'fellowship', title: 'Fellowship', desc: 'Track your Friday fellowship attendance', icon: Flame, color: 'text-amber-600', bg: 'bg-amber-50', activeBg: 'bg-amber-600', activeText: 'text-white' },
          { id: 'work', title: 'Work Attendance', desc: 'Track your daily work presence', icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50', activeBg: 'bg-emerald-600', activeText: 'text-white' },
        ].map((cat) => (
          <motion.div
            key={cat.id}
            whileHover={{ y: -6, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setSelectedCategory(cat.id as AttendanceCategory)}
            className={`p-6 rounded-[20px] cursor-pointer transition-all border ${selectedCategory === cat.id ? `${cat.activeBg} ${cat.activeText} border-transparent shadow-lg` : 'bg-white text-slate-800 border-slate-200/60 hover:border-slate-300 shadow-sm'}`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${selectedCategory === cat.id ? 'bg-white/20' : `${cat.bg} ${cat.color}`}`}>
              <cat.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-1">{cat.title}</h3>
            <p className={`text-sm ${selectedCategory === cat.id ? 'text-white/80' : 'text-slate-500'}`}>{cat.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-200/60 shadow-sm relative z-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-xl font-bold text-slate-800">{categoryDetails[selectedCategory].name} Calendar</h2>
          <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-full border border-slate-100">
            <button onClick={prevMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-full transition-all text-slate-600"><ChevronLeft className="w-5 h-5" /></button>
            <span className="font-bold text-slate-800 min-w-[140px] text-center">{monthNames[currentMonth]} {currentYear}</span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-full transition-all text-slate-600"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 mb-8 px-2">
          <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" /><span className="text-sm font-semibold text-slate-600">Present / Attended</span></div>
          <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-sm shadow-rose-200" /><span className="text-sm font-semibold text-slate-600">Absent / Missed</span></div>
          <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-full bg-slate-100 border border-slate-200" /><span className="text-sm font-semibold text-slate-600">No Event</span></div>
          <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-full bg-[#B9BEC3] shadow-sm shadow-[#B9BEC3]/40" /><span className="text-sm font-semibold text-slate-600">Upcoming</span></div>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase py-2 tracking-wider">{day}</div>
          ))}

          {blanks.map((b) => (
            <div key={`blank-${b}`} className="aspect-square p-1 sm:p-2" />
          ))}

          {days.map((day) => {
            const status = getStatus(day);
            let bgClass = '';
            let textClass = '';
            let statusText = '';

            switch (status) {
              case 'present':
                bgClass = 'bg-emerald-500 hover:bg-emerald-600 shadow-sm shadow-emerald-200';
                textClass = 'text-white';
                statusText = selectedCategory === 'work' ? 'Present' : 'Attended';
                break;
              case 'absent':
                bgClass = 'bg-rose-500 hover:bg-rose-600 shadow-sm shadow-rose-200';
                textClass = 'text-white';
                statusText = selectedCategory === 'work' ? 'Absent' : 'Missed';
                break;
              case 'upcoming':
                bgClass = 'bg-[#B9BEC3] hover:brightness-95 shadow-sm shadow-[#B9BEC3]/40 transition-all';
                textClass = 'text-white';
                statusText = 'Upcoming';
                break;
              case 'none':
              default:
                bgClass = 'bg-slate-50/50 border border-slate-100/50 text-slate-400';
                textClass = 'text-slate-400';
                statusText = selectedCategory === 'work' ? 'Weekend / No Event' : 'No Event Scheduled';
                break;
            }

            return (
              <div key={day} className="aspect-square relative group">
                <div className={`w-full h-full rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-200 cursor-default ${bgClass} ${textClass}`}>
                  {day}
                </div>

                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-200 pointer-events-none z-50 w-max bg-slate-900 text-white text-xs p-3.5 rounded-xl shadow-xl">
                  <p className="font-bold mb-1.5 text-slate-200 text-sm">{monthNames[currentMonth]} {day}, {currentYear}</p>
                  <p className="font-semibold text-slate-400">{categoryDetails[selectedCategory].name}</p>
                  <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-slate-700">
                    <span className="text-slate-400">Status:</span>
                    <span className={`font-bold ${status === 'present' ? 'text-emerald-400' : status === 'absent' ? 'text-rose-400' : status === 'upcoming' ? 'text-slate-300' : 'text-slate-500'}`}>
                      {statusText}
                    </span>
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<'my-attendance' | 'upload'>('my-attendance');
  const [selectedCourseId, setSelectedCourseId] = useState(classesDatabase[0].id);
  const [documentDrafts, setDocumentDrafts] = useState<File[]>([]);
  const [photoDrafts, setPhotoDrafts] = useState<File[]>([]);
  const [savedDocumentFiles, setSavedDocumentFiles] = useState<File[]>([]);
  const [savedPhotoFiles, setSavedPhotoFiles] = useState<File[]>([]);
  const [uploadNotice, setUploadNotice] = useState('');

  const documentInputRef = useRef<HTMLInputElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const selectedCourse = useMemo(
    () => classesDatabase.find((course) => course.id === selectedCourseId) ?? classesDatabase[0],
    [selectedCourseId],
  );

  const handleDocumentSelect = (fileList: FileList | null) => {
    if (!fileList) return;
    const incoming = Array.from(fileList);
    const allowedExtensions = ['.xlsx', '.xls', '.csv', '.pdf'];
    const filtered = incoming.filter((file) => {
      const lower = file.name.toLowerCase();
      return allowedExtensions.some((ext) => lower.endsWith(ext));
    });
    setDocumentDrafts(filtered);
    setUploadNotice(filtered.length === incoming.length ? '' : 'Only Excel, CSV, and PDF files were kept.');
  };

  const handlePhotoSelect = (fileList: FileList | null) => {
    if (!fileList) return;
    const incoming = Array.from(fileList).filter((file) => file.type.startsWith('image/'));
    setPhotoDrafts(incoming);
    setUploadNotice(incoming.length > 0 ? '' : 'Please capture or choose an image file.');
  };

  const saveDocumentFiles = () => {
    if (documentDrafts.length === 0) {
      setUploadNotice('No attendance document selected yet.');
      return;
    }
    setSavedDocumentFiles((prev) => [...prev, ...documentDrafts]);
    setDocumentDrafts([]);
    setUploadNotice('Attendance document saved successfully.');
    if (documentInputRef.current) {
      documentInputRef.current.value = '';
    }
  };

  const saveCapturedPhotos = () => {
    if (photoDrafts.length === 0) {
      setUploadNotice('No captured photo selected yet.');
      return;
    }
    setSavedPhotoFiles((prev) => [...prev, ...photoDrafts]);
    setPhotoDrafts([]);
    setUploadNotice('Captured photo saved successfully.');
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Attendance Hub</h1>
        <p className="text-slate-500 mt-2 font-medium">Manage your personal attendance obligations and upload class records.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setActiveTab('my-attendance')}
          className={`p-6 rounded-[24px] cursor-pointer border transition-all ${activeTab === 'my-attendance' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' : 'bg-white text-slate-800 border-slate-200/60 hover:border-indigo-300 shadow-sm'}`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${activeTab === 'my-attendance' ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
              <Briefcase className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-xl">My Attendance</h3>
              <p className={`text-sm mt-1 font-medium ${activeTab === 'my-attendance' ? 'text-indigo-100' : 'text-slate-500'}`}>Track your work and affairs obligations</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setActiveTab('upload')}
          className={`p-6 rounded-[24px] cursor-pointer border transition-all ${activeTab === 'upload' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200' : 'bg-white text-slate-800 border-slate-200/60 hover:border-emerald-300 shadow-sm'}`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${activeTab === 'upload' ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}>
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-xl">Upload Attendance</h3>
              <p className={`text-sm mt-1 font-medium ${activeTab === 'upload' ? 'text-emerald-100' : 'text-slate-500'}`}>Submit student class attendance</p>
            </div>
          </div>
        </motion.div>
      </div>

      {activeTab === 'my-attendance' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <FacultyMyAttendance />
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Select Class Session</label>
              <select
                value={selectedCourse.id}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-lg rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-full md:w-96"
              >
                {classesDatabase.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.title}
                  </option>
                ))}
              </select>
              <p className="text-sm text-slate-500 font-medium mt-2 flex items-center gap-1.5">
                <Users className="w-4 h-4" /> Class Size: {selectedCourse.classSize} students
              </p>
            </div>

            <div className="flex gap-3">
              <div className="bg-slate-50 text-slate-700 px-5 py-3 rounded-2xl border border-slate-200 flex flex-col items-center justify-center min-w-[120px]">
                <span className="text-2xl font-bold">{selectedCourse.classesHeld}</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Classes Held</span>
              </div>
              <div className="bg-slate-50 text-slate-700 px-5 py-3 rounded-2xl border border-slate-200 flex flex-col items-center justify-center min-w-[120px]">
                <span className="text-2xl font-bold">{selectedCourse.avgRate}%</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Rate</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-800">Pending Uploads</h4>
              <p className="text-sm text-amber-700 mt-1 font-medium">Upload and save class attendance files or captured attendance sheet photos.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
              className="bg-white rounded-3xl p-8 border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all text-left flex flex-col gap-4 h-auto"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Photo Capture</h3>
                <p className="text-sm text-slate-500 font-medium">Capture attendance sheet photos and save them separately.</p>
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handlePhotoSelect(e.target.files)}
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
                >
                  Capture / Choose Photo
                </button>
                <button
                  type="button"
                  onClick={saveCapturedPhotos}
                  className="px-4 py-2 rounded-lg border border-emerald-300 text-emerald-700 text-sm font-semibold hover:bg-emerald-50"
                >
                  Save Photo File
                </button>
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <p>Draft photos: {photoDrafts.length}</p>
                <p>Saved photos: {savedPhotoFiles.length}</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
              className="bg-white rounded-3xl p-8 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-left flex flex-col gap-4 h-auto"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Upload File</h3>
                <p className="text-sm text-slate-500 font-medium">Upload Excel, CSV, or PDF attendance records and save them in state.</p>
              </div>
              <input
                ref={documentInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.pdf,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={(e) => handleDocumentSelect(e.target.files)}
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => documentInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                >
                  Choose File
                </button>
                <button
                  type="button"
                  onClick={saveDocumentFiles}
                  className="px-4 py-2 rounded-lg border border-blue-300 text-blue-700 text-sm font-semibold hover:bg-blue-50"
                >
                  Save Document File
                </button>
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <p>Draft documents: {documentDrafts.length}</p>
                <p>Saved documents: {savedDocumentFiles.length}</p>
              </div>
            </motion.div>
          </div>

          {uploadNotice && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center gap-2 text-sm text-slate-700">
              <Clock className="w-4 h-4" />
              <span>{uploadNotice}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm">
              <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Saved Document Files</h4>
              {savedDocumentFiles.length === 0 ? (
                <p className="text-sm text-slate-500">No document files saved yet.</p>
              ) : (
                <div className="space-y-2">
                  {savedDocumentFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <span className="truncate pr-4">{file.name}</span>
                      <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle2 className="w-4 h-4" /> Saved</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm">
              <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Saved Photo Files</h4>
              {savedPhotoFiles.length === 0 ? (
                <p className="text-sm text-slate-500">No photos saved yet.</p>
              ) : (
                <div className="space-y-2">
                  {savedPhotoFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <span className="truncate pr-4">{file.name}</span>
                      <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle2 className="w-4 h-4" /> Saved</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {(documentDrafts.length > 0 || photoDrafts.length > 0) && (
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-center gap-2 text-sm text-blue-800">
              <XCircle className="w-4 h-4" />
              <span>You still have unsaved draft file(s). Click the corresponding Save button to store them.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
