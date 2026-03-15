'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Church,
  ClipboardCheck,
  Clock,
  Flame,
  Info,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import DashboardNavbar from '@/app/components/dashboard/student/DashboardNavbar';
import DashboardSidebar from '@/app/components/dashboard/student/DashboardSidebar';

type BaseAttendanceStatus = 'present' | 'absent';
type AttendanceStatus = BaseAttendanceStatus | 'suppressed';
type AffairsCategory = 'chapel' | 'rollcall' | 'youthalive';

type Course = {
  code: string;
  title: string;
  lecturer: string;
  department: string;
  units: number;
  semester: string;
  venue: string;
  schedule: string;
  description: string;
  totalClasses: number;
  requiredPercentage: number;
};

type AttendanceUpload = {
  id: string;
  courseCode: string;
  sessionDate: string;
  uploadedAt: string;
  status: BaseAttendanceStatus;
  uploadSource: string;
  topic: string;
};

type AffairsRecord = {
  id: string;
  date: string;
  uploadedAt: string;
  status: BaseAttendanceStatus;
  resolvedStatus?: 'present';
};

type EffectiveAttendanceUpload = AttendanceUpload & {
  effectiveStatus: AttendanceStatus;
  suppressedBy?: string | null;
};

type CourseSummary = {
  course: Course;
  records: EffectiveAttendanceUpload[];
  attended: number;
  missed: number;
  suppressed: number;
  percentage: number;
};

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fadeTransition = { duration: 0.45, ease: 'easeOut' };

const courses: Course[] = [
  {
    code: 'CSC 211',
    title: 'Data Structures',
    lecturer: 'Dr. A. O. Bakare',
    department: 'Computer Science',
    units: 3,
    semester: 'Second Semester',
    venue: 'LT-04',
    schedule: 'Mondays 9:00 AM - 11:00 AM',
    description: 'Covers linear and non-linear data structures, recursion, sorting, and search algorithms.',
    totalClasses: 8,
    requiredPercentage: 75,
  },
  {
    code: 'MTH 213',
    title: 'Engineering Mathematics',
    lecturer: 'Prof. I. F. Ajayi',
    department: 'Mathematics',
    units: 3,
    semester: 'Second Semester',
    venue: 'ETF Hall',
    schedule: 'Tuesdays 12:00 PM - 2:00 PM',
    description: 'Focuses on differential equations, vector calculus, and transforms for engineering applications.',
    totalClasses: 8,
    requiredPercentage: 75,
  },
  {
    code: 'GST 211',
    title: 'Nigerian Peoples and Culture',
    lecturer: 'Dr. M. T. Okon',
    department: 'General Studies',
    units: 2,
    semester: 'Second Semester',
    venue: 'College Auditorium',
    schedule: 'Wednesdays 8:00 AM - 10:00 AM',
    description: 'Explores Nigerian cultural diversity, traditions, civic values, and national integration.',
    totalClasses: 8,
    requiredPercentage: 75,
  },
  {
    code: 'EEE 212',
    title: 'Circuit Theory',
    lecturer: 'Engr. K. E. Oladipo',
    department: 'Electrical and Electronics Engineering',
    units: 3,
    semester: 'Second Semester',
    venue: 'EE Lab 2',
    schedule: 'Thursdays 10:00 AM - 12:00 PM',
    description: 'Introduces network theorems, transient response, AC analysis, and power calculations.',
    totalClasses: 8,
    requiredPercentage: 75,
  },
  {
    code: 'CSC 214',
    title: 'Computer Architecture',
    lecturer: 'Dr. R. O. Bello',
    department: 'Computer Science',
    units: 3,
    semester: 'Second Semester',
    venue: 'ICT Lab 1',
    schedule: 'Fridays 9:00 AM - 11:00 AM',
    description: 'Examines processor organization, instruction cycles, memory hierarchy, and I/O design.',
    totalClasses: 8,
    requiredPercentage: 75,
  },
  {
    code: 'CSC 216',
    title: 'Database Systems',
    lecturer: 'Dr. E. U. Nwosu',
    department: 'Computer Science',
    units: 3,
    semester: 'Second Semester',
    venue: 'DB Lab',
    schedule: 'Mondays 1:00 PM - 3:00 PM',
    description: 'Introduces data modelling, relational algebra, normalization, and SQL-based design.',
    totalClasses: 8,
    requiredPercentage: 75,
  },
  {
    code: 'CSC 218',
    title: 'Object Oriented Programming',
    lecturer: 'Mrs. T. A. Falade',
    department: 'Computer Science',
    units: 3,
    semester: 'Second Semester',
    venue: 'Software Studio',
    schedule: 'Tuesdays 2:00 PM - 4:00 PM',
    description: 'Builds practical OOP concepts including classes, inheritance, polymorphism, and interfaces.',
    totalClasses: 8,
    requiredPercentage: 75,
  },
  {
    code: 'MTH 217',
    title: 'Numerical Analysis',
    lecturer: 'Dr. Y. S. Olagoke',
    department: 'Mathematics',
    units: 2,
    semester: 'Second Semester',
    venue: 'MTH 204',
    schedule: 'Wednesdays 2:00 PM - 4:00 PM',
    description: 'Studies numerical approximation methods, interpolation, roots of equations, and errors.',
    totalClasses: 8,
    requiredPercentage: 75,
  },
  {
    code: 'EEE 216',
    title: 'Digital Logic Design',
    lecturer: 'Engr. S. O. Eze',
    department: 'Electrical and Electronics Engineering',
    units: 3,
    semester: 'Second Semester',
    venue: 'Logic Lab',
    schedule: 'Thursdays 1:00 PM - 3:00 PM',
    description: 'Covers Boolean algebra, combinational logic, sequential circuits, and digital design tools.',
    totalClasses: 8,
    requiredPercentage: 75,
  },
  {
    code: 'PHY 215',
    title: 'Electronics I',
    lecturer: 'Dr. F. A. Salami',
    department: 'Physics',
    units: 2,
    semester: 'Second Semester',
    venue: 'PHY Lab 3',
    schedule: 'Fridays 12:00 PM - 2:00 PM',
    description: 'Focuses on semiconductor devices, transistor biasing, amplifiers, and practical circuits.',
    totalClasses: 8,
    requiredPercentage: 75,
  },
  {
    code: 'STA 217',
    title: 'Probability Models',
    lecturer: 'Mr. J. D. Adeyemi',
    department: 'Statistics',
    units: 2,
    semester: 'Second Semester',
    venue: 'STA 101',
    schedule: 'Mondays 3:00 PM - 5:00 PM',
    description: 'Introduces random variables, common distributions, expectation, and stochastic reasoning.',
    totalClasses: 8,
    requiredPercentage: 75,
  },
  {
    code: 'CVE 219',
    title: 'Engineering Drawing',
    lecturer: 'Engr. L. T. Ogunleye',
    department: 'Civil Engineering',
    units: 2,
    semester: 'Second Semester',
    venue: 'Drawing Studio',
    schedule: 'Saturdays 9:00 AM - 11:00 AM',
    description: 'Develops orthographic projection, dimensioning, sectional views, and drawing interpretation skills.',
    totalClasses: 8,
    requiredPercentage: 75,
  },
];

const buildCourseAttendance = (
  courseCode: string,
  records: Array<[string, string, BaseAttendanceStatus, string]>,
): AttendanceUpload[] => records.map(([sessionDate, uploadedAt, status, topic], index) => ({
  id: `${courseCode.replace(/\s+/g, '-').toLowerCase()}-${index + 1}`,
  courseCode,
  sessionDate,
  uploadedAt,
  status,
  uploadSource: 'Faculty',
  topic,
}));

const attendance: AttendanceUpload[] = [
  ...buildCourseAttendance('CSC 211', [
    ['2026-02-02', '2026-02-02T14:15:00', 'present', 'Stacks and Queues'],
    ['2026-02-09', '2026-02-09T14:10:00', 'present', 'Linked Lists'],
    ['2026-02-16', '2026-02-16T14:05:00', 'present', 'Trees'],
    ['2026-02-23', '2026-02-23T14:20:00', 'present', 'Binary Search Trees'],
    ['2026-03-02', '2026-03-02T14:35:00', 'present', 'Hash Tables'],
    ['2026-03-09', '2026-03-09T14:30:00', 'present', 'Graph Traversal'],
    ['2026-03-16', '2026-03-16T14:12:00', 'present', 'Shortest Paths'],
    ['2026-03-23', '2026-03-23T14:18:00', 'absent', 'Revision Session'],
  ]),
  ...buildCourseAttendance('MTH 213', [
    ['2026-02-03', '2026-02-03T16:04:00', 'present', 'First Order Differential Equations'],
    ['2026-02-10', '2026-02-10T16:06:00', 'present', 'Higher Order Systems'],
    ['2026-02-17', '2026-02-17T16:02:00', 'absent', 'Laplace Transform'],
    ['2026-02-24', '2026-02-24T16:03:00', 'present', 'Vector Fields'],
    ['2026-03-03', '2026-03-03T16:05:00', 'present', 'Line Integrals'],
    ['2026-03-10', '2026-03-10T16:01:00', 'present', 'Surface Integrals'],
    ['2026-03-17', '2026-03-17T16:07:00', 'present', 'Fourier Methods'],
    ['2026-03-24', '2026-03-24T16:08:00', 'present', 'Boundary Value Problems'],
  ]),
  ...buildCourseAttendance('GST 211', [
    ['2026-02-04', '2026-02-04T11:10:00', 'present', 'Culture and Identity'],
    ['2026-02-11', '2026-02-11T11:14:00', 'present', 'National Symbols'],
    ['2026-02-18', '2026-02-18T11:08:00', 'present', 'Traditional Institutions'],
    ['2026-02-25', '2026-02-25T11:11:00', 'present', 'Languages in Nigeria'],
    ['2026-03-04', '2026-03-04T11:12:00', 'present', 'Festivals and Heritage'],
    ['2026-03-11', '2026-03-11T11:06:00', 'present', 'Citizenship'],
    ['2026-03-18', '2026-03-18T11:09:00', 'present', 'Unity and Diversity'],
    ['2026-03-25', '2026-03-25T11:05:00', 'present', 'Contemporary Nigerian Society'],
  ]),
  ...buildCourseAttendance('EEE 212', [
    ['2026-02-05', '2026-02-05T13:08:00', 'present', 'Kirchhoff Laws'],
    ['2026-02-12', '2026-02-12T13:02:00', 'absent', 'Mesh Analysis'],
    ['2026-02-19', '2026-02-19T13:06:00', 'present', 'Nodal Analysis'],
    ['2026-02-26', '2026-02-26T13:03:00', 'present', 'Thevenin Equivalent'],
    ['2026-03-05', '2026-03-05T13:04:00', 'present', 'Maximum Power Transfer'],
    ['2026-03-12', '2026-03-12T13:05:00', 'absent', 'Transient Response'],
    ['2026-03-19', '2026-03-19T13:09:00', 'present', 'AC Circuits'],
    ['2026-03-26', '2026-03-26T13:07:00', 'present', 'Resonance'],
  ]),
  ...buildCourseAttendance('CSC 214', [
    ['2026-02-06', '2026-02-06T12:20:00', 'present', 'CPU Organization'],
    ['2026-02-13', '2026-02-13T12:14:00', 'present', 'Instruction Sets'],
    ['2026-02-20', '2026-02-20T12:08:00', 'present', 'Pipeline Basics'],
    ['2026-02-27', '2026-02-27T12:10:00', 'present', 'Memory Hierarchy'],
    ['2026-03-06', '2026-03-06T12:12:00', 'present', 'Cache Mapping'],
    ['2026-03-13', '2026-03-13T12:11:00', 'present', 'Instruction Parallelism'],
    ['2026-03-20', '2026-03-20T12:09:00', 'absent', 'Bus Systems'],
    ['2026-03-27', '2026-03-27T12:13:00', 'present', 'Performance Tuning'],
  ]),
  ...buildCourseAttendance('CSC 216', [
    ['2026-02-02', '2026-02-02T17:04:00', 'present', 'ER Diagrams'],
    ['2026-02-09', '2026-02-09T17:02:00', 'present', 'Normalization'],
    ['2026-02-16', '2026-02-16T17:01:00', 'absent', 'Relational Algebra'],
    ['2026-02-23', '2026-02-23T17:09:00', 'present', 'SQL Basics'],
    ['2026-03-02', '2026-03-02T17:05:00', 'present', 'Joins'],
    ['2026-03-09', '2026-03-09T17:06:00', 'present', 'Aggregation'],
    ['2026-03-16', '2026-03-16T17:07:00', 'present', 'Indexing'],
    ['2026-03-23', '2026-03-23T17:08:00', 'present', 'Transactions'],
  ]),
  ...buildCourseAttendance('CSC 218', [
    ['2026-02-03', '2026-02-03T18:12:00', 'present', 'Classes and Objects'],
    ['2026-02-10', '2026-02-10T18:08:00', 'present', 'Constructors'],
    ['2026-02-17', '2026-02-17T18:05:00', 'present', 'Encapsulation'],
    ['2026-02-24', '2026-02-24T18:07:00', 'present', 'Inheritance'],
    ['2026-03-03', '2026-03-03T18:09:00', 'present', 'Polymorphism'],
    ['2026-03-10', '2026-03-10T18:04:00', 'absent', 'Abstraction'],
    ['2026-03-17', '2026-03-17T18:03:00', 'present', 'Interfaces'],
    ['2026-03-24', '2026-03-24T18:02:00', 'present', 'Design Patterns'],
  ]),
  ...buildCourseAttendance('MTH 217', [
    ['2026-02-04', '2026-02-04T16:42:00', 'present', 'Interpolation'],
    ['2026-02-11', '2026-02-11T16:38:00', 'absent', 'Finite Difference'],
    ['2026-02-18', '2026-02-18T16:36:00', 'present', 'Root Approximation'],
    ['2026-02-25', '2026-02-25T16:40:00', 'absent', 'Newton Raphson'],
    ['2026-03-04', '2026-03-04T16:35:00', 'present', 'Gauss Elimination'],
    ['2026-03-11', '2026-03-11T16:34:00', 'present', 'Iterative Methods'],
    ['2026-03-18', '2026-03-18T16:44:00', 'absent', 'Numerical Integration'],
    ['2026-03-25', '2026-03-25T16:45:00', 'present', 'Error Analysis'],
  ]),
  ...buildCourseAttendance('EEE 216', [
    ['2026-02-05', '2026-02-05T16:22:00', 'present', 'Boolean Algebra'],
    ['2026-02-12', '2026-02-12T16:24:00', 'present', 'Logic Gates'],
    ['2026-02-19', '2026-02-19T16:18:00', 'present', 'Karnaugh Maps'],
    ['2026-02-26', '2026-02-26T16:28:00', 'present', 'Adders and Subtractors'],
    ['2026-03-05', '2026-03-05T16:21:00', 'present', 'Flip Flops'],
    ['2026-03-12', '2026-03-12T16:26:00', 'present', 'Counters'],
    ['2026-03-19', '2026-03-19T16:19:00', 'present', 'Shift Registers'],
    ['2026-03-26', '2026-03-26T16:20:00', 'absent', 'State Machines'],
  ]),
  ...buildCourseAttendance('PHY 215', [
    ['2026-02-06', '2026-02-06T14:46:00', 'present', 'Diodes'],
    ['2026-02-13', '2026-02-13T14:42:00', 'present', 'Rectifiers'],
    ['2026-02-20', '2026-02-20T14:39:00', 'present', 'Transistors'],
    ['2026-02-27', '2026-02-27T14:41:00', 'absent', 'Bias Networks'],
    ['2026-03-06', '2026-03-06T14:40:00', 'present', 'Small Signal Models'],
    ['2026-03-13', '2026-03-13T14:47:00', 'present', 'Amplifier Classes'],
    ['2026-03-20', '2026-03-20T14:44:00', 'present', 'Frequency Response'],
    ['2026-03-27', '2026-03-27T14:45:00', 'present', 'Oscillators'],
  ]),
  ...buildCourseAttendance('STA 217', [
    ['2026-02-02', '2026-02-02T19:10:00', 'present', 'Random Variables'],
    ['2026-02-09', '2026-02-09T19:08:00', 'present', 'Discrete Distribution'],
    ['2026-02-16', '2026-02-16T19:12:00', 'present', 'Continuous Distribution'],
    ['2026-02-23', '2026-02-23T19:14:00', 'present', 'Expectation'],
    ['2026-03-02', '2026-03-02T19:09:00', 'absent', 'Variance'],
    ['2026-03-09', '2026-03-09T19:11:00', 'present', 'Binomial Model'],
    ['2026-03-16', '2026-03-16T19:13:00', 'present', 'Poisson Process'],
    ['2026-03-23', '2026-03-23T19:15:00', 'present', 'Normal Approximation'],
  ]),
  ...buildCourseAttendance('CVE 219', [
    ['2026-02-07', '2026-02-07T12:34:00', 'present', 'Orthographic Projection'],
    ['2026-02-14', '2026-02-14T12:32:00', 'present', 'Dimensioning'],
    ['2026-02-21', '2026-02-21T12:31:00', 'present', 'Sectional Views'],
    ['2026-02-28', '2026-02-28T12:33:00', 'present', 'Scale Drawing'],
    ['2026-03-07', '2026-03-07T12:30:00', 'present', 'Site Plan Basics'],
    ['2026-03-14', '2026-03-14T12:29:00', 'absent', 'Mechanical Symbols'],
    ['2026-03-21', '2026-03-21T12:28:00', 'present', 'Structural Sketching'],
    ['2026-03-28', '2026-03-28T12:27:00', 'present', 'Final Drafting'],
  ]),
];

const chapelService: AffairsRecord[] = [
  { id: 'chapel-2026-03-01', date: '2026-03-01', uploadedAt: '2026-03-01T20:10:00', status: 'present' },
  { id: 'chapel-2026-03-03', date: '2026-03-03', uploadedAt: '2026-03-03T20:20:00', status: 'present' },
  { id: 'chapel-2026-03-08', date: '2026-03-08', uploadedAt: '2026-03-08T20:25:00', status: 'absent' },
  { id: 'chapel-2026-03-10', date: '2026-03-10', uploadedAt: '2026-03-10T20:22:00', status: 'present' },
  { id: 'chapel-2026-03-15', date: '2026-03-15', uploadedAt: '2026-03-15T20:12:00', status: 'present' },
  { id: 'chapel-2026-03-17', date: '2026-03-17', uploadedAt: '2026-03-17T20:30:00', status: 'absent', resolvedStatus: 'present' },
  { id: 'chapel-2026-03-22', date: '2026-03-22', uploadedAt: '2026-03-22T20:14:00', status: 'present' },
];

const rollCall: AffairsRecord[] = [
  { id: 'rollcall-2026-03-01', date: '2026-03-01', uploadedAt: '2026-03-01T06:10:00', status: 'present' },
  { id: 'rollcall-2026-03-02', date: '2026-03-02', uploadedAt: '2026-03-02T06:09:00', status: 'present' },
  { id: 'rollcall-2026-03-03', date: '2026-03-03', uploadedAt: '2026-03-03T06:08:00', status: 'present' },
  { id: 'rollcall-2026-03-04', date: '2026-03-04', uploadedAt: '2026-03-04T06:12:00', status: 'present' },
  { id: 'rollcall-2026-03-05', date: '2026-03-05', uploadedAt: '2026-03-05T06:07:00', status: 'present' },
  { id: 'rollcall-2026-03-06', date: '2026-03-06', uploadedAt: '2026-03-06T06:05:00', status: 'present' },
  { id: 'rollcall-2026-03-07', date: '2026-03-07', uploadedAt: '2026-03-07T06:04:00', status: 'present' },
  { id: 'rollcall-2026-03-08', date: '2026-03-08', uploadedAt: '2026-03-08T06:11:00', status: 'present' },
  { id: 'rollcall-2026-03-09', date: '2026-03-09', uploadedAt: '2026-03-09T06:13:00', status: 'present' },
  { id: 'rollcall-2026-03-10', date: '2026-03-10', uploadedAt: '2026-03-10T06:06:00', status: 'present' },
  { id: 'rollcall-2026-03-11', date: '2026-03-11', uploadedAt: '2026-03-11T06:15:00', status: 'absent' },
  { id: 'rollcall-2026-03-12', date: '2026-03-12', uploadedAt: '2026-03-12T06:16:00', status: 'present' },
  { id: 'rollcall-2026-03-13', date: '2026-03-13', uploadedAt: '2026-03-13T06:18:00', status: 'present' },
  { id: 'rollcall-2026-03-14', date: '2026-03-14', uploadedAt: '2026-03-14T06:19:00', status: 'present' },
  { id: 'rollcall-2026-03-15', date: '2026-03-15', uploadedAt: '2026-03-15T06:03:00', status: 'present' },
  { id: 'rollcall-2026-03-16', date: '2026-03-16', uploadedAt: '2026-03-16T06:02:00', status: 'present' },
  { id: 'rollcall-2026-03-17', date: '2026-03-17', uploadedAt: '2026-03-17T06:20:00', status: 'present' },
  { id: 'rollcall-2026-03-18', date: '2026-03-18', uploadedAt: '2026-03-18T06:21:00', status: 'absent', resolvedStatus: 'present' },
  { id: 'rollcall-2026-03-19', date: '2026-03-19', uploadedAt: '2026-03-19T06:17:00', status: 'present' },
  { id: 'rollcall-2026-03-20', date: '2026-03-20', uploadedAt: '2026-03-20T06:14:00', status: 'present' },
  { id: 'rollcall-2026-03-21', date: '2026-03-21', uploadedAt: '2026-03-21T06:23:00', status: 'present' },
  { id: 'rollcall-2026-03-22', date: '2026-03-22', uploadedAt: '2026-03-22T06:22:00', status: 'present' },
  { id: 'rollcall-2026-03-23', date: '2026-03-23', uploadedAt: '2026-03-23T06:24:00', status: 'absent' },
  { id: 'rollcall-2026-03-24', date: '2026-03-24', uploadedAt: '2026-03-24T06:25:00', status: 'present' },
];

const youthAlive: AffairsRecord[] = [
  { id: 'youth-2026-03-16', date: '2026-03-16', uploadedAt: '2026-03-16T19:05:00', status: 'present' },
  { id: 'youth-2026-03-17', date: '2026-03-17', uploadedAt: '2026-03-17T19:06:00', status: 'present' },
  { id: 'youth-2026-03-18', date: '2026-03-18', uploadedAt: '2026-03-18T19:03:00', status: 'absent' },
];

const parseDateKey = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatMonthDay = (value: string) => parseDateKey(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
const formatFullDate = (value: string) => parseDateKey(value).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
const formatMonthLabel = (date: Date) => `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

const getWeekStartKey = (value: string) => {
  const date = parseDateKey(value);
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return toDateKey(start);
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getAffairEffectiveStatus = (record: AffairsRecord): BaseAttendanceStatus => record.resolvedStatus ?? record.status;

const suppressedWeeks = new Map<string, string>();
for (const record of [...chapelService, ...rollCall]) {
  if (record.status === 'absent' && record.resolvedStatus !== 'present') {
    suppressedWeeks.set(getWeekStartKey(record.date), record.date);
  }
}

const effectiveAttendance: EffectiveAttendanceUpload[] = attendance.map((record) => {
  const weekKey = getWeekStartKey(record.sessionDate);
  const suppressedBy = suppressedWeeks.get(weekKey);

  return {
    ...record,
    effectiveStatus: suppressedBy ? 'suppressed' : record.status,
    suppressedBy: suppressedBy ?? null,
  };
});

const countStatus = (records: EffectiveAttendanceUpload[], status: AttendanceStatus) => records.filter((record) => record.effectiveStatus === status).length;

const courseSummaries: CourseSummary[] = courses.map((course) => {
  const records = effectiveAttendance
    .filter((record) => record.courseCode === course.code)
    .sort((left, right) => parseDateKey(left.sessionDate).getTime() - parseDateKey(right.sessionDate).getTime());

  const attended = countStatus(records, 'present');
  const missed = countStatus(records, 'absent');
  const suppressed = countStatus(records, 'suppressed');
  const percentage = Math.round((attended / course.totalClasses) * 100);

  return {
    course,
    records,
    attended,
    missed,
    suppressed,
    percentage,
  };
});

const statusPresentation = {
  present: { label: 'Present', chip: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  absent: { label: 'Absent', chip: 'bg-rose-100 text-rose-700', icon: XCircle },
  suppressed: { label: 'Suppressed', chip: 'bg-amber-100 text-amber-700', icon: Clock },
};

function CountUp({ end, duration = 1 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = 0;
    let frame = 0;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(end * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    setCount(0);
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [end, duration]);

  return <>{count}</>;
}

function CourseDetailsModal({
  summary,
  onClose,
}: {
  summary: CourseSummary | null;
  onClose: () => void;
}) {
  if (!summary) return null;

  const presentDates = summary.records.filter((record) => record.effectiveStatus === 'present');
  const absentDates = summary.records.filter((record) => record.effectiveStatus === 'absent');
  const suppressedDates = summary.records.filter((record) => record.effectiveStatus === 'suppressed');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-5xl max-h-[88vh] overflow-hidden rounded-[28px] border border-white/50 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.25)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur">
            <div>
              <p className="text-sm font-semibold text-blue-600">{summary.course.code}</p>
              <h2 className="text-2xl font-bold text-slate-900">{summary.course.title}</h2>
              <p className="text-sm text-slate-500 mt-1">{summary.course.lecturer} · {summary.course.schedule} · {summary.course.venue}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-3xl leading-none">&times;</button>
          </div>

          <div className="overflow-y-auto max-h-[calc(88vh-92px)] p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500 mb-1">Attendance</p>
                <p className={`text-3xl font-bold ${summary.percentage >= summary.course.requiredPercentage ? 'text-emerald-600' : 'text-rose-600'}`}>{summary.percentage}%</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500 mb-1">Held</p>
                <p className="text-3xl font-bold text-slate-900">{summary.course.totalClasses}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500 mb-1">Attended</p>
                <p className="text-3xl font-bold text-emerald-600">{summary.attended}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500 mb-1">Missed / Suppressed</p>
                <p className="text-3xl font-bold text-slate-900">{summary.missed} / {summary.suppressed}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_1fr] gap-6">
              <div className="rounded-[24px] border border-slate-200 p-5 bg-white">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Course Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl bg-slate-50 p-4"><span className="block text-slate-400 font-semibold mb-1">Department</span><span className="font-bold text-slate-800">{summary.course.department}</span></div>
                  <div className="rounded-xl bg-slate-50 p-4"><span className="block text-slate-400 font-semibold mb-1">Semester</span><span className="font-bold text-slate-800">{summary.course.semester}</span></div>
                  <div className="rounded-xl bg-slate-50 p-4"><span className="block text-slate-400 font-semibold mb-1">Units</span><span className="font-bold text-slate-800">{summary.course.units} Units</span></div>
                  <div className="rounded-xl bg-slate-50 p-4"><span className="block text-slate-400 font-semibold mb-1">Required Attendance</span><span className="font-bold text-slate-800">{summary.course.requiredPercentage}%</span></div>
                </div>
                <div className="mt-4 rounded-2xl bg-blue-50/70 border border-blue-100 p-4">
                  <p className="text-sm font-semibold text-blue-700 mb-1">Description</p>
                  <p className="text-sm leading-6 text-slate-700">{summary.course.description}</p>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-bold text-emerald-800 mb-2">Present Dates</p>
                    <div className="space-y-1.5 text-sm text-emerald-700">
                      {presentDates.length === 0 ? <p>None</p> : presentDates.map((record) => <p key={record.id}>{formatMonthDay(record.sessionDate)}</p>)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <p className="text-sm font-bold text-rose-800 mb-2">Absent Dates</p>
                    <div className="space-y-1.5 text-sm text-rose-700">
                      {absentDates.length === 0 ? <p>None</p> : absentDates.map((record) => <p key={record.id}>{formatMonthDay(record.sessionDate)}</p>)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-bold text-amber-800 mb-2">Suppressed Dates</p>
                    <div className="space-y-1.5 text-sm text-amber-700">
                      {suppressedDates.length === 0 ? <p>None</p> : suppressedDates.map((record) => <p key={record.id}>{formatMonthDay(record.sessionDate)}</p>)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 p-5 bg-white">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Attendance Uploads</h3>
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {summary.records.map((record) => {
                    const statusMeta = statusPresentation[record.effectiveStatus];
                    const StatusIcon = statusMeta.icon;

                    return (
                      <div key={record.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-900">{record.topic}</p>
                            <p className="text-sm text-slate-600 mt-1">Class Date: {formatFullDate(record.sessionDate)}</p>
                            <p className="text-xs text-slate-500 mt-1">Uploaded {new Date(record.uploadedAt).toLocaleString()} by {record.uploadSource}</p>
                            {record.effectiveStatus === 'suppressed' && record.suppressedBy && (
                              <p className="text-xs text-amber-700 mt-2 font-semibold">Suppressed because chapel/roll call was absent in the week of {formatMonthDay(record.suppressedBy)}</p>
                            )}
                          </div>
                          <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 ${statusMeta.chip}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold uppercase tracking-wider">{statusMeta.label}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function StudentAffairsAttendance() {
  const [selectedCategory, setSelectedCategory] = useState<AffairsCategory>('chapel');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1));

  const recordsByCategory = useMemo(
    () => ({ chapel: chapelService, rollcall: rollCall, youthalive: youthAlive }),
    [],
  );

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const blanks = Array.from({ length: firstDay }, (_, index) => index);
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  const selectedRecords = recordsByCategory[selectedCategory];

  const filteredRecords = useMemo(
    () => selectedRecords.filter((record) => {
      const date = parseDateKey(record.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }),
    [currentMonth, currentYear, selectedRecords],
  );

  const recordMap = useMemo(() => {
    const map = new Map<string, AffairsRecord>();
    for (const record of filteredRecords) {
      map.set(record.date, record);
    }
    return map;
  }, [filteredRecords]);

  const isExpectedDate = (date: Date) => {
    if (selectedCategory === 'chapel') {
      const weekday = date.getDay();
      return weekday === 0 || weekday === 2;
    }

    if (selectedCategory === 'rollcall') {
      return true;
    }

    if (selectedCategory === 'youthalive') {
      return currentYear === 2026 && currentMonth === 2 && date.getDate() >= 16 && date.getDate() <= 20;
    }

    return false;
  };

  const getStatus = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const iso = toDateKey(date);
    const record = recordMap.get(iso);

    if (record) {
      return getAffairEffectiveStatus(record) === 'present' ? 'attended' : 'missed';
    }

    if (isExpectedDate(date)) {
      return 'upcoming';
    }

    return 'none';
  };

  const categoryDetails = {
    chapel: { name: 'Chapel Service', desc: 'Track your weekly chapel attendance', icon: Church, activeBg: 'bg-indigo-600', activeText: 'text-white', bg: 'bg-indigo-50', color: 'text-indigo-600' },
    rollcall: { name: 'Roll Call', desc: 'Track your daily roll call attendance', icon: ClipboardCheck, activeBg: 'bg-emerald-600', activeText: 'text-white', bg: 'bg-emerald-50', color: 'text-emerald-600' },
    youthalive: { name: 'Youth Alive', desc: 'Track your Youth Alive attendance', icon: Flame, activeBg: 'bg-amber-600', activeText: 'text-white', bg: 'bg-amber-50', color: 'text-amber-600' },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.entries(categoryDetails) as Array<[AffairsCategory, typeof categoryDetails.chapel]>).map(([key, details]) => (
          <motion.div
            key={key}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedCategory(key)}
            className={`p-5 rounded-2xl cursor-pointer transition-all border ${selectedCategory === key ? `${details.activeBg} ${details.activeText} border-transparent shadow-md` : 'bg-white text-slate-800 border-slate-200/60 hover:border-slate-300'}`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${selectedCategory === key ? 'bg-white/20' : `${details.bg} ${details.color}`}`}>
              <details.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-1">{details.name}</h3>
            <p className={`text-sm ${selectedCategory === key ? 'text-white/80' : 'text-slate-500'}`}>{details.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-[24px] p-6 sm:p-8 border border-white/40 shadow-sm relative z-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-xl font-bold text-slate-800">{categoryDetails[selectedCategory].name} Calendar</h2>
          <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-full border border-slate-100">
            <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))} className="p-1.5 hover:bg-white hover:shadow-sm rounded-full transition-all text-slate-600"><ChevronLeft className="w-5 h-5" /></button>
            <span className="font-bold text-slate-800 min-w-[140px] text-center">{formatMonthLabel(currentDate)}</span>
            <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))} className="p-1.5 hover:bg-white hover:shadow-sm rounded-full transition-all text-slate-600"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 mb-8 px-2">
          <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div><span className="text-sm font-semibold text-slate-600">Attended</span></div>
          <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-sm shadow-rose-200"></div><span className="text-sm font-semibold text-slate-600">Missed</span></div>
          <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-full bg-slate-100 border border-slate-200"></div><span className="text-sm font-semibold text-slate-600">No Event</span></div>
          <div className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-full bg-[#B9BEC3] shadow-sm shadow-[#B9BEC3]/40"></div><span className="text-sm font-semibold text-slate-600">Upcoming</span></div>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase py-2 tracking-wider">{day}</div>
          ))}

          {blanks.map((blank) => <div key={`blank-${blank}`} className="aspect-square p-1 sm:p-2" />)}

          {days.map((day) => {
            const status = getStatus(day);
            const date = new Date(currentYear, currentMonth, day);
            const iso = toDateKey(date);
            const record = recordMap.get(iso);

            let bgClass = 'bg-slate-50/50 border border-slate-100/50';
            let textClass = 'text-slate-400';
            let statusText = 'No Event Scheduled';

            if (status === 'attended') {
              bgClass = 'bg-emerald-500 hover:bg-emerald-600 shadow-sm shadow-emerald-200';
              textClass = 'text-white';
              statusText = 'Attended';
            } else if (status === 'missed') {
              bgClass = 'bg-rose-500 hover:bg-rose-600 shadow-sm shadow-rose-200';
              textClass = 'text-white';
              statusText = 'Missed';
            } else if (status === 'upcoming') {
              bgClass = 'bg-[#B9BEC3] hover:brightness-95 shadow-sm shadow-[#B9BEC3]/40 transition-all';
              textClass = 'text-white';
              statusText = 'Upcoming';
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
                    <span className={`font-bold ${status === 'attended' ? 'text-emerald-400' : status === 'missed' ? 'text-rose-400' : status === 'upcoming' ? 'text-slate-300' : 'text-slate-500'}`}>{statusText}</span>
                  </div>
                  {record && <p className="text-[11px] text-slate-400 mt-2">Uploaded {new Date(record.uploadedAt).toLocaleString()}</p>}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AttendanceContent({ isSidebarExpanded }: { isSidebarExpanded: boolean }) {
  const [activeTab, setActiveTab] = useState<'class' | 'affairs'>('class');
  const [selectedCourseCode, setSelectedCourseCode] = useState<string | null>(null);
  const [overviewIndex, setOverviewIndex] = useState(0);
  const [warningIndex, setWarningIndex] = useState(0);

  const summaries = useMemo(() => courseSummaries, []);
  const warningCourses = useMemo(() => summaries.filter((summary) => summary.percentage < summary.course.requiredPercentage), [summaries]);
  const rotatingSummary = summaries[overviewIndex % summaries.length];
  const rotatingWarning = warningCourses.length ? warningCourses[warningIndex % warningCourses.length] : null;

  useEffect(() => {
    const interval = window.setInterval(() => {
      setOverviewIndex((prev) => (prev + 1) % summaries.length);
    }, 4000);
    return () => window.clearInterval(interval);
  }, [summaries.length]);

  useEffect(() => {
    if (warningCourses.length <= 1) return undefined;
    const interval = window.setInterval(() => {
      setWarningIndex((prev) => (prev + 1) % warningCourses.length);
    }, 4200);
    return () => window.clearInterval(interval);
  }, [warningCourses.length]);

  const monthlyAbsences = useMemo(
    () => effectiveAttendance.filter((record) => record.effectiveStatus === 'absent' && record.sessionDate.startsWith('2026-03')).length,
    [],
  );

  const topCourse = useMemo(
    () => [...summaries].sort((left, right) => right.percentage - left.percentage)[0],
    [summaries],
  );

  const weakestCourse = useMemo(
    () => [...summaries].sort((left, right) => left.percentage - right.percentage)[0],
    [summaries],
  );

  const insights = useMemo(
    () => [
      `You have ${monthlyAbsences} unsuppressed absences recorded in March.`,
      `Your highest attendance is in ${topCourse.course.title} (${topCourse.percentage}%).`,
      `Attend the next 2 classes in ${weakestCourse.course.title} to keep improving your standing.`,
    ],
    [monthlyAbsences, topCourse, weakestCourse],
  );

  const recentActivity = useMemo(
    () => [...effectiveAttendance]
      .sort((left, right) => new Date(right.uploadedAt).getTime() - new Date(left.uploadedAt).getTime())
      .slice(0, 5),
    [],
  );

  const selectedSummary = useMemo(
    () => summaries.find((summary) => summary.course.code === selectedCourseCode) ?? null,
    [selectedCourseCode, summaries],
  );

  const pageVariants: any = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut', staggerChildren: 0.1 },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <>
      <motion.div variants={pageVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto space-y-6 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Attendance Portal</h1>
          <p className="text-slate-500 font-medium">Monitor your academic and student affairs attendance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setActiveTab('class')}
            className={`p-6 rounded-[24px] cursor-pointer border transition-all ${activeTab === 'class' ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' : 'bg-white/80 backdrop-blur-xl text-slate-800 border-white/60 hover:border-blue-300 shadow-sm'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${activeTab === 'class' ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Class Attendance</h3>
                <p className={`text-sm mt-1 font-medium ${activeTab === 'class' ? 'text-blue-100' : 'text-slate-500'}`}>Track course requirements</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setActiveTab('affairs')}
            className={`p-6 rounded-[24px] cursor-pointer border transition-all ${activeTab === 'affairs' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' : 'bg-white/80 backdrop-blur-xl text-slate-800 border-white/60 hover:border-indigo-300 shadow-sm'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${activeTab === 'affairs' ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
                <Church className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Student Affairs</h3>
                <p className={`text-sm mt-1 font-medium ${activeTab === 'affairs' ? 'text-indigo-100' : 'text-slate-500'}`}>Chapel & Roll Call tracking</p>
              </div>
            </div>
          </motion.div>
        </div>

        {activeTab === 'affairs' ? (
          <StudentAffairsAttendance />
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AnimatePresence mode="wait">
              {rotatingWarning && (
                <motion.div
                  key={rotatingWarning.course.code}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.35 }}
                  className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm overflow-hidden"
                >
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-red-800 font-bold text-sm">Critical Attendance Warning</h4>
                    <p className="text-red-700 text-sm mt-1 font-medium">Your attendance in <strong>{rotatingWarning.course.code} – {rotatingWarning.course.title}</strong> is currently {rotatingWarning.percentage}%, below the required {rotatingWarning.course.requiredPercentage}% threshold. Attend upcoming classes to avoid examination ineligibility.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-[24px] p-6 border border-white/40 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Calendar className="w-24 h-24 text-blue-600" />
                  </div>

                  <h2 className="text-lg font-bold text-slate-800 mb-6">Overview</h2>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={rotatingSummary.course.code}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.35 }}
                    >
                      <p className="text-sm font-bold text-blue-600 mb-3">{rotatingSummary.course.code}</p>
                      <p className="text-lg font-bold text-slate-800 mb-5">{rotatingSummary.course.title}</p>

                      <div className="flex items-end gap-2 mb-8">
                        <span className={`text-6xl font-bold tracking-tight ${rotatingSummary.percentage >= rotatingSummary.course.requiredPercentage ? 'text-blue-600' : 'text-rose-600'}`}>
                          <CountUp key={rotatingSummary.course.code} end={rotatingSummary.percentage} duration={0.8} />%
                        </span>
                        <span className="text-sm font-medium text-slate-500 mb-2">Attendance</span>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                          <span className="text-slate-600 font-semibold">Classes Attended</span>
                          <span className="font-bold text-slate-900 text-lg">{rotatingSummary.attended}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                          <span className="text-slate-600 font-semibold">Classes Missed</span>
                          <span className="font-bold text-slate-900 text-lg">{rotatingSummary.missed}</span>
                        </div>
                      </div>

                      {rotatingSummary.percentage >= rotatingSummary.course.requiredPercentage ? (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-emerald-800">Good Standing</p>
                            <p className="text-xs text-emerald-700 font-medium mt-1">You are above the {rotatingSummary.course.requiredPercentage}% requirement for {rotatingSummary.course.title}. Keep maintaining this consistency.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-rose-800">Poor Standing</p>
                            <p className="text-xs text-rose-700 font-medium mt-1">Your attendance in {rotatingSummary.course.title} is below the {rotatingSummary.course.requiredPercentage}% requirement. Prioritize upcoming classes to recover.</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-[24px] p-6 border border-white/40 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Smart Insights
                  </h2>
                  <div className="space-y-3">
                    {insights.map((insight) => (
                      <div key={insight} className="flex gap-3 items-start p-3 bg-blue-50/50 rounded-xl">
                        <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <p className="text-sm font-medium text-slate-700">{insight}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-[24px] p-6 border border-white/40 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-800 mb-6">Course Attendance</h2>

                  <div className="overflow-y-auto max-h-[430px] pr-1">
                    <table className="w-full text-left border-collapse table-fixed">
                      <thead>
                        <tr className="border-b border-slate-200 text-sm font-bold text-slate-400 uppercase tracking-wider">
                          <th className="pb-3 pl-2 pr-2 w-[34%]">Course</th>
                          <th className="pb-3 text-center w-[12%]">Held</th>
                          <th className="pb-3 text-center w-[12%]">Attended</th>
                          <th className="pb-3 text-center w-[12%]">Missed</th>
                          <th className="pb-3 pr-2 w-[30%] text-right">Attendance %</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {summaries.map((summary, idx) => (
                          <motion.tr
                            key={summary.course.code}
                            whileHover={{ y: -2, backgroundColor: 'rgba(248, 250, 252, 0.8)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                            onClick={() => setSelectedCourseCode(summary.course.code)}
                            className="border-b border-slate-100 last:border-0 transition-all rounded-xl relative group cursor-pointer"
                          >
                            <td className="py-3 pl-2 pr-2 rounded-l-xl">
                              <p className="font-bold text-slate-800">{summary.course.code}</p>
                              {!isSidebarExpanded && (
                                <p className="text-xs font-medium text-slate-500 truncate max-w-[200px]">{summary.course.title}</p>
                              )}
                            </td>
                            <td className="py-3 text-center font-bold text-slate-600">{summary.course.totalClasses}</td>
                            <td className="py-3 text-center font-bold text-emerald-600">{summary.attended}</td>
                            <td className="py-3 text-center font-bold text-rose-500">{summary.missed}</td>
                            <td className="py-3 pr-2 rounded-r-xl">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-full max-w-[100px] h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${summary.percentage}%` }}
                                    transition={{ duration: 0.8, delay: 0.2 + idx * 0.05, ease: 'easeOut' }}
                                    className={`h-full rounded-full ${summary.percentage >= summary.course.requiredPercentage ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                  />
                                </div>
                                <span className={`font-bold w-12 text-right ${summary.percentage >= summary.course.requiredPercentage ? 'text-slate-700' : 'text-rose-600'}`}>
                                  {summary.percentage}%
                                </span>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-[24px] p-6 border border-white/40 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-800 mb-6">Recent Activity</h2>

                  <div className="space-y-3">
                    {recentActivity.map((activity, idx) => {
                      const course = courses.find((entry) => entry.code === activity.courseCode);
                      const statusMeta = statusPresentation[activity.effectiveStatus];
                      const StatusIcon = statusMeta.icon;

                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + idx * 0.08, duration: 0.3 }}
                          className="flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center flex-col shrink-0">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(activity.uploadedAt).toLocaleDateString(undefined, { month: 'short' })}</span>
                              <span className="text-sm font-bold text-slate-800">{new Date(activity.uploadedAt).getDate()}</span>
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{activity.courseCode} {course?.title}</p>
                              <p className="text-xs font-medium text-slate-500 mt-0.5">Uploaded by {activity.uploadSource}</p>
                            </div>
                          </div>
                          <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 ${statusMeta.chip}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold uppercase tracking-wider">{statusMeta.label}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <CourseDetailsModal summary={selectedSummary} onClose={() => setSelectedCourseCode(null)} />
    </>
  );
}

const Page = () => {
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const isSidebarExpanded = sidebarWidth > 100;
  const mainStyle = useMemo(
    () => ({ '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties),
    [sidebarWidth],
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans">
      <DashboardNavbar />
      <div className="relative" style={{ minHeight: 'calc(100vh - 70px)' }}>
        <DashboardSidebar onWidthChange={setSidebarWidth} />
        <main
          style={mainStyle}
          className="ml-0 lg:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-out p-4 lg:p-6 min-w-0"
        >
          <AttendanceContent isSidebarExpanded={isSidebarExpanded} />
        </main>
      </div>
    </div>
  );
};

export default Page;
