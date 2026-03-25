"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import gradCap from "@/src/icons/graduation-cap.svg";
import seal from "@/src/icons/seal.svg";
import engineer from "@/src/icons/engineer.svg";
import cybersec from "@/src/icons/cyber security.svg";
import datascience from "@/src/icons/data scientist.svg";
import {
  Bell,
  BookOpen,
  Download,
  FileText,
  LayoutGrid,
  Lightbulb,
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  X,
  Target,
  Link as LinkIcon,
  TrendingUp,
  CheckCircle2,
  Clock,
  PlayCircle,
  Shield,
  ArrowRight,
  ClipboardList,
  RotateCcw,
  ListChecks,
  FlaskConical,
} from "lucide-react";

// ═══════════════════ SHARED ═══════════════════

type ActiveTab = "program-overview" | "course-registration";

const topNavIcons = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutGrid,
    path: "/studashboard/e-learning/learning-dashboard/learning-essentials",
  },
  {
    id: "course-control",
    label: "Course Control",
    icon: BookOpen,
    path: "/studashboard/e-learning/learning-dashboard/course-control",
  },
  {
    id: "records",
    label: "Records",
    icon: FileText,
    path: "/studashboard/e-learning/learning-dashboard/records/performance-overview",
  },
  {
    id: "ideas",
    label: "Ideas",
    icon: Lightbulb,
    path: "/studashboard/e-learning/learning-dashboard/learning-essentials",
  },
];

// ═══════════════════ PROGRAM OVERVIEW DATA ═══════════════════

type CourseCategory = "all" | "core" | "elective" | "specialization";
type CourseType = "CORE" | "ELECTIVE" | "SPECIALIZATION";

const statCards = [
  { label: "Total credits", value: 120 },
  { label: "Year duration", value: 5 },
  { label: "Core credits", value: 72 },
  { label: "Electives", value: 36 },
];

const EXTENDED_COURSES = [
  {
    id: "cs302",
    title: "Database Management Systems",
    code: "CS302",
    credits: 4,
    status: "Completed",
    type: "CORE" as CourseType,
    level: "Level 300",
    units: "3 Units",
    description:
      "Foundation of computer science covering complexity, sorting, searching, and graph theory basics with practical implementations.",
    objectives: [
      "Design and implement complex relational schemas.",
      "Master SQL for data definition, manipulation, and control.",
      "Understand transactional integrity and concurrency control.",
    ],
    prerequisites: "CS101: Intro to Algorithms",
  },
  {
    id: "it204",
    title: "IT204: Cybersecurity Essentials",
    code: "IT204",
    credits: 3,
    status: "Available",
    type: "CORE" as CourseType,
    level: "Level 200",
    units: "3 Units",
    description:
      "Exploration of network security, cryptography, and risk management strategies in modern enterprise environments.",
    objectives: [
      "Analyze modern network vulnerabilities and threats.",
      "Implement encryption algorithms and secure communications.",
      "Develop incident response strategies and risk frameworks.",
    ],
    prerequisites: "CS102: Network Fundamentals",
  },
  {
    id: "se401",
    title: "SE401: Software Engineering II",
    code: "SE401",
    credits: 3,
    status: "Available",
    type: "ELECTIVE" as CourseType,
    level: "Level 400",
    units: "3 Units",
    description:
      "Advanced topics in software architecture, design patterns, testing strategies, and agile methodologies integration.",
    objectives: [
      "Evaluate large-scale microservice architectures.",
      "Implement continuous integration and deployment pipelines.",
      "Manage software projects across remote agile teams.",
    ],
    prerequisites: "SE301: Software Engineering I",
  },
  {
    id: "spc301",
    title: "SPC 301: AI/ML Fundamentals",
    code: "SPC301",
    credits: 3,
    status: "Available",
    type: "SPECIALIZATION" as CourseType,
    level: "Level 300",
    units: "3 Units",
    description:
      "Hands-on introduction to Artificial Intelligence and Machine Learning pipelines using Python and modern frameworks.",
    objectives: [
      "Implement supervised and unsupervised learning algorithms.",
      "Build and evaluate neural network models end-to-end.",
      "Apply ML pipelines to real-world classification and regression tasks.",
    ],
    prerequisites: "STA 201: Probability & Statistics",
  },
  {
    id: "spc401",
    title: "SPC 401: Deep Learning",
    code: "SPC401",
    credits: 3,
    status: "Available",
    type: "SPECIALIZATION" as CourseType,
    level: "Level 400",
    units: "3 Units",
    description:
      "Advanced study of deep neural architectures including CNNs, RNNs, Transformers, and deployment strategies.",
    objectives: [
      "Design and train convolutional and recurrent neural networks.",
      "Fine-tune pretrained transformer models for NLP tasks.",
      "Deploy deep learning models to cloud and edge environments.",
    ],
    prerequisites: "SPC 301: AI/ML Fundamentals",
  },
  {
    id: "elec301",
    title: "ELEC 301: Technical Writing",
    code: "ELEC301",
    credits: 2,
    status: "Available",
    type: "ELECTIVE" as CourseType,
    level: "Level 300",
    units: "2 Units",
    description:
      "Effective communication of technical concepts through reports, proposals, API documentation, and presentations.",
    objectives: [
      "Structure and write clear, concise technical reports.",
      "Create user documentation and developer API references.",
      "Present technical findings persuasively to non-technical audiences.",
    ],
    prerequisites: "ENG 101: English Composition",
  },
  {
    id: "elec401",
    title: "ELEC 401: Entrepreneurship",
    code: "ELEC401",
    credits: 3,
    status: "Available",
    type: "ELECTIVE" as CourseType,
    level: "Level 400",
    units: "3 Units",
    description:
      "Startup fundamentals, lean methodology, product-market fit, and funding strategies for technology entrepreneurs.",
    objectives: [
      "Evaluate startup ideas using Lean Canvas and business model frameworks.",
      "Build and pitch minimum viable products to early adopters.",
      "Understand venture capital, bootstrapping, and grant funding pathways.",
    ],
    prerequisites: "None",
  },
];

interface SemesterCourse {
  code: string;
  name: string;
  type: CourseType;
}

const CURRICULUM_DATA: Record<
  number,
  { semester1: SemesterCourse[]; semester2: SemesterCourse[] }
> = {
  1: {
    semester1: [
      { code: "CSC 101", name: "Introduction to Programming", type: "CORE" },
      { code: "MTH 101", name: "Calculus I", type: "CORE" },
      { code: "ENG 101", name: "English Composition", type: "CORE" },
      { code: "PHY 101", name: "Physics I", type: "CORE" },
    ],
    semester2: [
      { code: "CSC 102", name: "Data Structures", type: "CORE" },
      { code: "MTH 102", name: "Discrete Mathematics", type: "CORE" },
      { code: "PHY 102", name: "Physics II", type: "CORE" },
      { code: "GEN 101", name: "General Education Elective", type: "ELECTIVE" },
    ],
  },
  2: {
    semester1: [
      { code: "CSC 201", name: "Algorithms", type: "CORE" },
      { code: "CSC 202", name: "Computer Architecture", type: "CORE" },
      { code: "MTH 201", name: "Calculus II", type: "CORE" },
      { code: "CSC 203L", name: "Programming Lab", type: "CORE" },
    ],
    semester2: [
      { code: "CSC 204", name: "Operating Systems", type: "CORE" },
      { code: "CSC 205", name: "Database Systems", type: "CORE" },
      { code: "STA 201", name: "Probability & Statistics", type: "CORE" },
      { code: "ELEC 201", name: "Technical Elective", type: "ELECTIVE" },
    ],
  },
  3: {
    semester1: [
      { code: "CSC 301", name: "Advanced Algorithms", type: "CORE" },
      { code: "CSC 302", name: "Software Engineering", type: "CORE" },
      { code: "CSC 303", name: "Computer Networks", type: "CORE" },
      { code: "SPC 301", name: "AI/ML Fundamentals", type: "SPECIALIZATION" },
    ],
    semester2: [
      { code: "CSC 304", name: "Web Development", type: "CORE" },
      { code: "CSC 305", name: "Mobile Development", type: "CORE" },
      {
        code: "SPC 302",
        name: "Data Science Specialization",
        type: "SPECIALIZATION",
      },
      { code: "ELEC 301", name: "Technical Writing", type: "ELECTIVE" },
    ],
  },
  4: {
    semester1: [
      { code: "CSC 401", name: "Algorithm Design & Analysis", type: "CORE" },
      { code: "CSC 402", name: "Data Structures", type: "CORE" },
      { code: "SPC 401", name: "Deep Learning", type: "SPECIALIZATION" },
      { code: "ELEC 401", name: "Entrepreneurship", type: "ELECTIVE" },
    ],
    semester2: [
      { code: "CSC 403", name: "Cybersecurity", type: "CORE" },
      { code: "CSC 404", name: "Professional Development", type: "CORE" },
      { code: "SIWES", name: "Industrial Training (SIWES)", type: "CORE" },
      { code: "ELEC 402", name: "Professional Elective", type: "ELECTIVE" },
    ],
  },
  5: {
    semester1: [
      { code: "CSC 501", name: "Advanced Research Methods", type: "CORE" },
      { code: "CSC 503", name: "Cloud Computing & DevOps", type: "CORE" },
      { code: "CSC 504", name: "Distributed Systems", type: "CORE" },
      {
        code: "SPC 501",
        name: "Deep Learning Specialization",
        type: "SPECIALIZATION",
      },
    ],
    semester2: [
      { code: "CSC 502", name: "Capstone Thesis", type: "CORE" },
      { code: "CSC 505", name: "Quantum Computing Intro", type: "ELECTIVE" },
      { code: "ENT 501", name: "Startup & Innovation", type: "ELECTIVE" },
    ],
  },
};

// ═══════════════════ COURSE REGISTRATION DATA ═══════════════════

type RegistrationWindow = {
  startDateTime: string;
  endDateTime: string;
  maxAllowedUnits?: number;
};

type RegistrationTag =
  | "CORE"
  | "REQUIRED"
  | "ELECTIVE"
  | "PRACTICAL"
  | "GENERAL";

type RegistrationCourse = {
  code: string;
  title: string;
  units: number;
  tag: RegistrationTag;
};

type RegistrationGroup = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
  tintClass: string;
  iconClass: string;
  courses: RegistrationCourse[];
};

type RegistrationStatus = "upcoming" | "open" | "closed";
type SelectionMap = Record<string, RegistrationCourse[]>;
type CollapseMap = Record<string, boolean>;

const DEFAULT_REGISTRATION_START = new Date("2026-03-01T08:45:19").getTime();
const DEFAULT_REGISTRATION_DEADLINE = new Date("2026-03-26T08:45:19").getTime();
const registrationStorageKey = "courseRegistrationWindow";
const DEFAULT_MAX_ALLOWED_UNITS = 24;

const REGISTRATION_GROUPS: RegistrationGroup[] = [
  {
    id: "current",
    title: "Current Semester Courses",
    subtitle: "Academic year 2024/2025 - First Semester",
    icon: ClipboardList,
    tintClass: "bg-[#eef6ff]",
    iconClass: "bg-[#dbeafe] text-[#1d4ed8]",
    courses: [
      {
        code: "CSC 301",
        title: "Software Engineering Principles",
        units: 3,
        tag: "CORE",
      },
      {
        code: "CSC 303",
        title: "Database Management Systems",
        units: 3,
        tag: "CORE",
      },
      {
        code: "CSC 305",
        title: "Operating Systems Concepts",
        units: 3,
        tag: "CORE",
      },
    ],
  },
  {
    id: "carryover",
    title: "Carryover Courses",
    subtitle: "Outstanding courses from previous sessions",
    icon: RotateCcw,
    tintClass: "bg-[#fef2f2]",
    iconClass: "bg-[#ffedd5] text-[#c2410c]",
    courses: [
      {
        code: "CSC 201",
        title: "Computer Programming I",
        units: 3,
        tag: "CORE",
      },
      { code: "MTH 211", title: "Linear Algebra", units: 3, tag: "REQUIRED" },
    ],
  },
  {
    id: "pending",
    title: "Pending & Electives",
    subtitle: "Available electives and required general studies",
    icon: ListChecks,
    tintClass: "bg-[#eefbf3]",
    iconClass: "bg-[#dcfce7] text-[#15803d]",
    courses: [
      {
        code: "CSC 311",
        title: "Human Computer Interaction",
        units: 2,
        tag: "ELECTIVE",
      },
      {
        code: "GST 311",
        title: "Entrepreneurship Studies",
        units: 2,
        tag: "GENERAL",
      },
      {
        code: "MTH 311",
        title: "Numerical Analysis I",
        units: 4,
        tag: "ELECTIVE",
      },
    ],
  },
  {
    id: "practical",
    title: "Practical Courses",
    subtitle: "Laboratory and workshop based courses",
    icon: FlaskConical,
    tintClass: "bg-[#f5f0ff]",
    iconClass: "bg-[#ede9fe] text-[#7e22ce]",
    courses: [
      {
        code: "CSC 307",
        title: "System Analysis & Design (Lab)",
        units: 3,
        tag: "CORE",
      },
      {
        code: "CSC 391",
        title: "Hardware Laboratory",
        units: 2,
        tag: "PRACTICAL",
      },
      {
        code: "CSC 392",
        title: "Software Laboratory",
        units: 2,
        tag: "PRACTICAL",
      },
    ],
  },
];

function getTagColor(tag: RegistrationTag) {
  if (tag === "CORE") return "bg-[#e2e8f0] text-[#64748b]";
  if (tag === "REQUIRED") return "bg-[#e2e8f0] text-[#475569]";
  if (tag === "GENERAL") return "bg-[#dbeafe] text-[#1d4ed8]";
  if (tag === "PRACTICAL") return "bg-[#e0f2fe] text-[#0369a1]";
  return "bg-[#e0e7ff] text-[#4338ca]";
}

function getTimeLeft(targetTime: number, fromTime: number) {
  const remaining = Math.max(targetTime - fromTime, 0);
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((remaining / (1000 * 60)) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);
  return { days, hours, minutes, seconds };
}

const ZERO_COUNTDOWN = { days: 0, hours: 0, minutes: 0, seconds: 0 };

function buildDefaultSelectionMap(): SelectionMap {
  return Object.fromEntries(
    REGISTRATION_GROUPS.map((group) => [group.id, []]),
  ) as SelectionMap;
}

function buildDefaultCollapseMap(): CollapseMap {
  return Object.fromEntries(
    REGISTRATION_GROUPS.map((group) => [group.id, false]),
  ) as CollapseMap;
}

function getTotalUnitsFromSelection(selection: SelectionMap) {
  return Object.values(selection)
    .flat()
    .reduce((sum, course) => sum + course.units, 0);
}

// ═══════════════════ MAIN PAGE ═══════════════════

export default function CourseControlPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<ActiveTab>("program-overview");

  // — Program Overview state —
  const [activeCourseId, setActiveCourseId] = useState<string | null>("cs302");
  const [activeFilter, setActiveFilter] = useState<CourseCategory>("all");
  const [activeYear, setActiveYear] = useState<number>(4);

  const activeCourse = EXTENDED_COURSES.find((c) => c.id === activeCourseId);
  const filteredCourses =
    activeFilter === "all"
      ? EXTENDED_COURSES
      : EXTENDED_COURSES.filter((c) => c.type.toLowerCase() === activeFilter);
  const yearData = CURRICULUM_DATA[activeYear];
  const alphaCourses =
    activeFilter === "all"
      ? yearData.semester1
      : yearData.semester1.filter((c) => c.type.toLowerCase() === activeFilter);
  const omegaCourses =
    activeFilter === "all"
      ? yearData.semester2
      : yearData.semester2.filter((c) => c.type.toLowerCase() === activeFilter);

  // — Course Registration state —
  const [countdown, setCountdown] = useState(ZERO_COUNTDOWN);
  const [registrationStatus, setRegistrationStatus] =
    useState<RegistrationStatus>("open");
  const [registrationWindow, setRegistrationWindow] = useState({
    startDateTime: DEFAULT_REGISTRATION_START,
    endDateTime: DEFAULT_REGISTRATION_DEADLINE,
    maxAllowedUnits: DEFAULT_MAX_ALLOWED_UNITS,
  });
  const [selectedCoursesByGroup, setSelectedCoursesByGroup] =
    useState<SelectionMap>(buildDefaultSelectionMap);
  const [collapsedGroups, setCollapsedGroups] = useState<CollapseMap>(
    buildDefaultCollapseMap,
  );
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null);
  const [hasSubmittedRegistration, setHasSubmittedRegistration] =
    useState(false);

  useEffect(() => {
    const storedWindow = window.localStorage.getItem(registrationStorageKey);
    if (!storedWindow) return;
    try {
      const parsedWindow = JSON.parse(storedWindow) as RegistrationWindow;
      const startTime = new Date(parsedWindow.startDateTime).getTime();
      const endTime = new Date(parsedWindow.endDateTime).getTime();
      const parsedMaxUnits = Number(parsedWindow.maxAllowedUnits);
      setRegistrationWindow({
        startDateTime:
          Number.isFinite(startTime) && startTime > 0
            ? startTime
            : DEFAULT_REGISTRATION_START,
        endDateTime:
          Number.isFinite(endTime) && endTime > 0
            ? endTime
            : DEFAULT_REGISTRATION_DEADLINE,
        maxAllowedUnits:
          Number.isFinite(parsedMaxUnits) && parsedMaxUnits > 0
            ? Math.floor(parsedMaxUnits)
            : DEFAULT_MAX_ALLOWED_UNITS,
      });
    } catch {
      // Ignore malformed storage values
    }
  }, []);

  useEffect(() => {
    const computeRegistrationState = () => {
      const now = Date.now();
      const start = registrationWindow.startDateTime;
      const end = registrationWindow.endDateTime;
      if (now < start) {
        setRegistrationStatus("upcoming");
        setCountdown(getTimeLeft(start, now));
        return;
      }
      if (now <= end) {
        setRegistrationStatus("open");
        setCountdown(getTimeLeft(end, now));
        return;
      }
      setRegistrationStatus("closed");
      setCountdown(ZERO_COUNTDOWN);
    };
    computeRegistrationState();
    const interval = window.setInterval(computeRegistrationState, 1000);
    return () => window.clearInterval(interval);
  }, [registrationWindow]);

  const allSelectedCourses = useMemo(
    () =>
      REGISTRATION_GROUPS.flatMap((group) =>
        (selectedCoursesByGroup[group.id] ?? []).map((course) => ({
          ...course,
          groupId: group.id,
          groupTitle: group.title,
        })),
      ),
    [selectedCoursesByGroup],
  );

  const totalUnits = useMemo(
    () => getTotalUnitsFromSelection(selectedCoursesByGroup),
    [selectedCoursesByGroup],
  );

  const maxAllowedUnits = registrationWindow.maxAllowedUnits;
  const progress = Math.min((totalUnits / maxAllowedUnits) * 100, 100);

  const countdownTotalSeconds =
    countdown.days * 24 * 60 * 60 +
    countdown.hours * 60 * 60 +
    countdown.minutes * 60 +
    countdown.seconds;

  const shouldShowWarningBanner =
    !hasSubmittedRegistration &&
    (registrationStatus === "closed" ||
      (registrationStatus === "open" && countdown.days <= 3));

  const bannerWrapperClass = shouldShowWarningBanner
    ? "bg-gradient-to-r from-[#ef4444] to-[#b91c1c]"
    : "bg-gradient-to-r from-[#4f46e5] to-[#1e40af]";
  const timerTileClass = shouldShowWarningBanner
    ? "bg-[#f97316]/60"
    : "bg-[#4f6ce9]/70";
  const timerTextClass = shouldShowWarningBanner
    ? "text-[#fee2e2]"
    : "text-[#c7d2fe]";
  const statusPillClass = shouldShowWarningBanner
    ? "text-[#fee2e2]"
    : "text-[#dbeafe]";
  const statusDotClass = shouldShowWarningBanner
    ? "bg-[#facc15]"
    : "bg-[#22c55e]";
  const statusLabel =
    registrationStatus === "open"
      ? hasSubmittedRegistration
        ? "System Status: Registration Submitted"
        : "System Status: Registration Active"
      : registrationStatus === "upcoming"
        ? "System Status: Registration Not Open"
        : "System Status: Registration Closed";
  const bannerHeading =
    registrationStatus === "upcoming"
      ? "Registration Opens In:"
      : registrationStatus === "closed"
        ? "Registration Period Closed"
        : "Registration Period Closing In:";
  const bannerBody =
    registrationStatus === "open"
      ? "Monitoring active enrollment for the Computer Science 300-Level cohort. Verification window ends simultaneously with the registration period."
      : registrationStatus === "upcoming"
        ? "Course registration has not opened yet. Countdown reflects the official opening time configured by admin/staff."
        : "The registration period has ended. Contact your advisor or department office for late registration guidance.";
  const hasReachedUnitLimit = totalUnits >= maxAllowedUnits;

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const addCourse = (groupId: string, course: RegistrationCourse) => {
    if (hasSubmittedRegistration || registrationStatus !== "open") return;
    setSelectionNotice(null);
    setSelectedCoursesByGroup((prev) => {
      const currentGroup = prev[groupId] ?? [];
      if (currentGroup.some((item) => item.code === course.code)) return prev;
      const projectedTotal = getTotalUnitsFromSelection(prev) + course.units;
      if (projectedTotal > maxAllowedUnits) {
        setSelectionNotice(
          `Maximum allowed units is ${maxAllowedUnits}. Remove a course to add ${course.code}.`,
        );
        return prev;
      }
      return { ...prev, [groupId]: [...currentGroup, course] };
    });
  };

  const removeCourse = (groupId: string, courseCode: string) => {
    if (hasSubmittedRegistration || registrationStatus !== "open") return;
    setSelectionNotice(null);
    setSelectedCoursesByGroup((prev) => ({
      ...prev,
      [groupId]: (prev[groupId] ?? []).filter((c) => c.code !== courseCode),
    }));
  };

  const submitRegistration = () => {
    if (registrationStatus !== "open" || totalUnits === 0) return;
    setHasSubmittedRegistration(true);
    setSelectionNotice(
      "Registration submitted successfully. Awaiting advisor review.",
    );
  };

  const resetRegistration = () => {
    setHasSubmittedRegistration(false);
    setSelectionNotice(
      "Registration unlocked. You can edit your selected courses.",
    );
  };

  return (
    <div
      className="min-h-screen bg-[#f8fafc]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 flex h-[57px] items-center border-b border-[#e2e8f0] bg-white px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.back()}
            className="rounded-md border border-[#e2e8f0] bg-white p-2 text-[#64748b] transition-colors hover:bg-[#f8fafc] hover:text-[#334155]"
          >
            <ChevronLeft size={17} strokeWidth={2.5} />
          </button>

          <div className="w-[316px] rounded-full border border-[#e2e8f0] bg-white px-4 py-2 transition-colors hover:border-[#cbd5e1] focus-within:border-[#93c5fd] focus-within:ring-2 focus-within:ring-[#dbeafe]">
            <label className="flex items-center gap-2 text-[#94a3b8]">
              <Search size={18} strokeWidth={2} />
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full bg-transparent text-[13px] font-medium text-[#334155] outline-none placeholder:text-[#94a3b8]"
              />
            </label>
          </div>
        </div>

        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-10">
          {topNavIcons.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.id === "course-control"
                ? pathname.startsWith(
                    "/studashboard/e-learning/learning-dashboard/course-control",
                  )
                : pathname === item.path;
            return (
              <button
                key={item.id}
                aria-label={item.label}
                onClick={() => router.push(item.path)}
                className={`transition-colors ${
                  isActive
                    ? "text-[#2563eb]"
                    : "text-[#94a3b8] hover:text-[#64748b]"
                }`}
              >
                <Icon size={20} strokeWidth={2.5} />
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-4">
          <button className="relative rounded-md p-2 text-[#94a3b8] hover:text-[#64748b]">
            <Bell size={18} strokeWidth={2} />
            <span className="absolute right-2 top-2 size-[7px] rounded-full bg-[#ef4444]" />
          </button>
          <div className="h-8 w-px bg-[#e2e8f0]" />
          <div className="text-right">
            <p className="text-[13px] font-bold text-[#0f172a]">Alex Rivers</p>
            <p className="text-[11px] text-[#64748b]">Student ID: 49201</p>
          </div>
          <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#fce0df] text-[13px] font-bold text-[#b03028] shadow-sm">
            AR
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-10 py-8">
        {/* Page Title */}
        <h1
          className="text-[36px] font-bold tracking-tight text-[#0f172a]"
          style={{ lineHeight: 1.1 }}
        >
          Course Control
        </h1>
        <p className="mt-[2px] text-[14px] font-medium text-[#64748b]">
          Bachelor of Science in Computer Science
        </p>

        {/* ── Tabs ── */}
        <div className="mt-8 flex gap-8 border-b border-[#e2e8f0]">
          <button
            onClick={() => setActiveTab("program-overview")}
            className={`relative pb-[12px] text-[13px] font-bold transition-colors ${
              activeTab === "program-overview"
                ? "text-[#0f172a]"
                : "text-[#64748b] hover:text-[#0f172a]"
            }`}
          >
            Program Overview
            {activeTab === "program-overview" && (
              <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-t-full bg-[#0f172a]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("course-registration")}
            className={`relative pb-[12px] text-[13px] font-bold transition-colors ${
              activeTab === "course-registration"
                ? "text-[#1d4ed8]"
                : "text-[#64748b] hover:text-[#0f172a]"
            }`}
          >
            Course Registration
            {activeTab === "course-registration" && (
              <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-t-full bg-[#1d4ed8]" />
            )}
          </button>
        </div>

        {/* ════════════════════════════════════════════
            PROGRAM OVERVIEW CONTENT
        ════════════════════════════════════════════ */}
        {activeTab === "program-overview" && (
          <>
            {/* University Card */}
            <section className="mt-8 rounded-[24px] border border-[#e2e8f0] bg-white p-7 shadow-sm">
              <div className="flex flex-row items-start justify-between gap-4">
                <div>
                  <h2 className="flex items-center gap-3 text-[22px] font-bold text-[#0f172a]">
                    <div className="flex items-center justify-center overflow-hidden rounded-full p-1 border border-[#e2e8f0] bg-[#f8fafc] size-[42px]">
                      <Image
                        width={32}
                        height={32}
                        src="/CU_LOGO.svg"
                        alt="Covenant University logo"
                        className="object-contain"
                      />
                    </div>
                    Covenant University
                  </h2>
                  <p className="mt-4 text-[18px] font-bold text-[#0f172a]">
                    BSc Computer Science
                  </p>
                  <p className="mt-1 text-[13px] font-medium text-[#64748b]">
                    Industry-aligned computing program focused on software
                    systems, AI, and engineering.
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-3 text-[10px] font-bold tracking-wide">
                  <span className="rounded-full bg-[#2563eb] px-4 py-1.5 text-white shadow-sm">
                    ABET Accredited
                  </span>
                  <span className="rounded-full border border-[#e2e8f0] bg-white px-4 py-1.5 text-[#475569] shadow-sm">
                    TOP ranked
                  </span>
                  <span className="rounded-full border border-[#e2e8f0] bg-white px-4 py-1.5 text-[#475569] shadow-sm">
                    International
                  </span>
                </div>
              </div>
            </section>

            {/* Stats Bar */}
            <section className="mt-6 flex gap-4">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className="flex-1 rounded-[16px] bg-[#365bce] py-8 text-center text-white shadow-sm transition-transform hover:scale-[1.02]"
                >
                  <p className="text-[44px] font-extrabold leading-none tracking-tight">
                    {card.value}
                  </p>
                  <p className="mt-3 flex items-center justify-center gap-1 text-[12px] font-medium opacity-90">
                    {card.label}{" "}
                    <ChevronDown size={14} className="opacity-75" />
                  </p>
                </div>
              ))}
            </section>

            {/* Requirements */}
            <div className="mt-6 grid grid-cols-2 gap-5">
              <section className="rounded-[20px] border border-[#e2e8f0]/80 bg-[#f8fafc] p-6">
                <h3 className="flex items-center gap-2 text-[18px] font-bold text-[#0f172a]">
                  Graduation Structure
                  <Image
                    src={gradCap}
                    width={24}
                    height={24}
                    alt="Graduation Cap"
                  />
                </h3>
                <div className="mt-4 space-y-3 text-[13px] font-semibold text-[#475569]">
                  {[
                    "Total Credits: 120",
                    "Capstone Project: 6 units",
                    "SIWES Internship: 6 units",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="size-1.5 rounded-full bg-[#94a3b8]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
              <section className="rounded-[20px] border border-[#e2e8f0]/80 bg-[#f8fafc] p-6">
                <h3 className="flex items-center gap-2 text-[18px] font-bold text-[#0f172a]">
                  Academic Requirements
                  <Image src={seal} width={24} height={24} alt="Green seal" />
                </h3>
                <div className="mt-4 space-y-3 text-[13px] font-semibold text-[#475569]">
                  {[
                    "Minimum CGPA: 2.0",
                    "Major GPA: 2.5",
                    "Residency: 30 credits at institution",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="size-1.5 rounded-full bg-[#94a3b8]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Curriculum Explorer */}
            <section className="mt-14">
              <h3 className="text-[22px] font-bold tracking-tight text-[#0f172a]">
                Curriculum Explorer
              </h3>
              <div className="mt-5 flex gap-2">
                {(
                  [
                    "all",
                    "core",
                    "elective",
                    "specialization",
                  ] as CourseCategory[]
                ).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`rounded-md px-4 py-1.5 text-[12px] font-bold transition-all ${
                      activeFilter === f
                        ? "bg-[#2563eb] text-white shadow-sm"
                        : "bg-[#e2e8f0]/60 text-[#64748b] hover:bg-[#e2e8f0]"
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex items-start gap-4 pr-[24px]">
                {/* Course List */}
                <div className="flex flex-col gap-4 relative w-[558px] shrink-0">
                  {filteredCourses.map((course) => {
                    const isActive = activeCourseId === course.id;
                    return (
                      <button
                        key={course.id}
                        onClick={() =>
                          setActiveCourseId(isActive ? null : course.id)
                        }
                        className={`relative overflow-hidden text-left rounded-[16px] border bg-white p-5 transition-all duration-300 ${
                          isActive
                            ? "w-[654px] border-[2px] border-[#3b82f6] shadow-sm z-10"
                            : "w-[558px] border-[#e2e8f0] shadow-sm hover:border-[#cbd5e1] hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-start gap-4 select-none">
                          <div
                            className={`flex size-10 shrink-0 items-center justify-center rounded-[10px] ${isActive ? "bg-[#eff6ff] text-[#3b82f6]" : "bg-[#f8fafc] text-[#64748b]"}`}
                          >
                            {isActive ? (
                              <div className="flex -space-x-1">
                                <ChevronLeft size={16} strokeWidth={3} />
                                <ChevronRight size={16} strokeWidth={3} />
                              </div>
                            ) : (
                              <Shield size={18} strokeWidth={2} />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <h4 className="text-[15px] font-bold text-[#0f172a]">
                                {course.title}
                              </h4>
                              <div
                                className={`flex items-center justify-center p-1 rounded-full transition-colors ${isActive ? "bg-[#eff6ff] text-[#3b82f6]" : "bg-[#f8fafc] text-[#94a3b8]"}`}
                              >
                                <ArrowRight size={14} strokeWidth={3} />
                              </div>
                            </div>
                            <div className="mt-1 flex items-center gap-4 text-[11px] font-bold">
                              <span className="text-[#64748b]">
                                {course.credits} Credits
                              </span>
                              <span
                                className={`flex items-center gap-1 ${course.status === "Completed" ? "text-[#10b981]" : "text-[#3b82f6]"}`}
                              >
                                {course.status === "Completed" ? (
                                  <CheckCircle2 size={13} strokeWidth={2.5} />
                                ) : (
                                  <Clock size={13} strokeWidth={2.5} />
                                )}
                                {course.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="mt-4 text-[13px] font-medium leading-relaxed text-[#64748b] pr-[30px]">
                          {course.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Details Pane */}
                {activeCourse ? (
                  <div className="w-[380px] ml-[200px] shrink-0 rounded-[20px] border border-[#e2e8f0] bg-white p-6 shadow-xl shadow-slate-200/40 sticky top-[80px]">
                    <div className="mb-6 flex flex-row items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#94a3b8]">
                        Course Details
                      </span>
                      <button
                        onClick={() => setActiveCourseId(null)}
                        className="flex size-7 items-center justify-center rounded-full bg-[#f8fafc] text-[#94a3b8] hover:bg-[#e2e8f0] hover:text-[#475569]"
                      >
                        <X size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                    <h3 className="pr-4 text-[19px] font-bold leading-snug text-[#0f172a]">
                      {activeCourse.code}: {activeCourse.title}
                    </h3>
                    <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold tracking-wide">
                      <span
                        className={`rounded px-2.5 py-1 text-white shadow-sm ${activeCourse.type === "CORE" ? "bg-[#2563eb]" : "bg-[#10b981]"}`}
                      >
                        {activeCourse.type}
                      </span>
                      <span className="rounded bg-[#f1f5f9] px-2.5 py-1 text-[#475569]">
                        {activeCourse.level}
                      </span>
                      <span className="rounded bg-[#f1f5f9] px-2.5 py-1 text-[#475569]">
                        {activeCourse.units}
                      </span>
                    </div>
                    <div className="mt-7 space-y-6">
                      <div>
                        <h4 className="flex items-center gap-2 text-[13px] font-bold text-[#0f172a]">
                          <div className="flex size-5 items-center justify-center rounded bg-[#eff6ff] text-[#2563eb]">
                            <Target size={12} strokeWidth={2.5} />
                          </div>
                          Learning Objectives
                        </h4>
                        <ul className="mt-3 list-disc space-y-2 pl-[32px] text-[12px] font-medium text-[#64748b] marker:text-[#cbd5e1]">
                          {activeCourse.objectives.map((obj, i) => (
                            <li key={i} className="pl-1">
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="flex items-center gap-2 text-[13px] font-bold text-[#0f172a]">
                          <div className="flex size-5 items-center justify-center rounded bg-[#eff6ff] text-[#2563eb]">
                            <LinkIcon size={12} strokeWidth={2.5} />
                          </div>
                          Prerequisites
                        </h4>
                        <div className="ml-[28px] mt-3 inline-block rounded-md border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1.5 text-[11px] font-bold text-[#475569]">
                          {activeCourse.prerequisites}
                        </div>
                      </div>
                      <div>
                        <h4 className="flex items-center gap-2 text-[13px] font-bold text-[#0f172a]">
                          <div className="flex size-5 items-center justify-center rounded bg-[#eff6ff] text-[#2563eb]">
                            <TrendingUp size={12} strokeWidth={2.5} />
                          </div>
                          Career Paths
                        </h4>
                      </div>
                    </div>
                    <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] py-3 text-[13px] font-bold text-white shadow-sm shadow-blue-200 hover:bg-[#1d4ed8]">
                      Continue Learning{" "}
                      <ArrowRight size={15} strokeWidth={2.5} />
                    </button>
                  </div>
                ) : null}
              </div>
            </section>

            {/* Years */}
            <div className="mt-10 flex gap-3">
              {[1, 2, 3, 4, 5].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setActiveYear(yr)}
                  className={`rounded-md px-5 py-2 text-[12px] font-bold transition-all ${
                    activeYear === yr
                      ? "bg-[#2563eb] text-white shadow-sm"
                      : "bg-[#e2e8f0]/60 text-[#64748b] hover:bg-[#e2e8f0]"
                  }`}
                >
                  Year {yr}
                </button>
              ))}
            </div>

            {/* Semesters */}
            <section className="mt-6 grid grid-cols-2 gap-5">
              {(
                [
                  { label: "Alpha Semester", courses: alphaCourses },
                  { label: "Omega Semester", courses: omegaCourses },
                ] as const
              ).map(({ label, courses }) => (
                <div
                  key={label}
                  className="rounded-[20px] border border-[#e2e8f0] bg-[#f8fafc]/50 p-6 shadow-sm"
                >
                  <h3 className="text-[20px] font-bold tracking-tight text-[#0f172a]">
                    {label}
                  </h3>
                  <div className="mt-5 flex flex-col gap-3">
                    {courses.length === 0 ? (
                      <p className="text-[13px] font-medium text-[#94a3b8] py-4 text-center">
                        No courses match this filter.
                      </p>
                    ) : (
                      courses.map((course, idx) => (
                        <div
                          key={course.code}
                          className={`relative overflow-hidden rounded-[14px] p-5 pr-8 ${idx % 2 === 0 ? "bg-[#d7e8ff]" : "bg-[#c0d8ff]"}`}
                        >
                          <div className="absolute inset-y-0 right-[-8px] w-5 shrink-0 skew-x-[-12deg] bg-[#3b82f6]/40" />
                          <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#3b82f6]">
                            {course.code}
                          </p>
                          <h4 className="mt-1 text-[15px] font-bold text-[#0f172a]">
                            {course.name}
                          </h4>
                          <div
                            className={`mt-3 inline-block px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest shadow-sm ${
                              course.type === "CORE"
                                ? "rounded bg-[#2563eb] text-white"
                                : course.type === "ELECTIVE"
                                  ? "rounded-md border-2 border-[#10b981] bg-white text-[#10b981]"
                                  : "rounded bg-[#8b5cf6] text-white"
                            }`}
                          >
                            {course.type}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </section>

            {/* Career Path Mapping */}
            <section className="mt-14">
              <h3 className="text-[22px] font-bold tracking-tight text-[#0f172a]">
                Career Path Mapping
              </h3>
              <p className="mt-1 text-[13px] font-medium text-[#64748b]">
                You are currently tracking 2 specialized paths.
              </p>
              <div className="mt-6 flex flex-wrap gap-6 lg:flex-nowrap">
                {[
                  {
                    title: "Full-Stack Engineer",
                    courses: "CSC 304, CSC 303, COS 102",
                    chance: 68,
                    iconWrapper: "bg-[#fffbeb]",
                    icon: (
                      <Image
                        src={engineer}
                        width={32}
                        height={32}
                        alt="Engineer"
                      />
                    ),
                    activeCourses: [
                      {
                        name: "Advanced React Patterns",
                        duration: "8/12 units",
                      },
                      {
                        name: "System Design Fundamentals",
                        duration: "2/15 units",
                      },
                    ],
                  },
                  {
                    title: "Data Scientist",
                    courses: "CSC 304, CSC 300, COS 102",
                    chance: 32,
                    iconWrapper: "bg-[#f8fafc]",
                    icon: (
                      <Image
                        src={datascience}
                        width={32}
                        height={32}
                        alt="Data Scientist"
                      />
                    ),
                    activeCourses: [
                      {
                        name: "Probability & Statistics for ML",
                        duration: "14/20 units",
                      },
                      {
                        name: "Neural Networks with Python",
                        duration: "1/15 units",
                      },
                    ],
                  },
                  {
                    title: "Cybersecurity Analyst",
                    courses: "AI, ML, and Statistical Modeling",
                    chance: 50,
                    iconWrapper: "bg-[#eff6ff]",
                    icon: (
                      <Image
                        src={cybersec}
                        width={32}
                        height={32}
                        alt="Cyber Security"
                      />
                    ),
                    activeCourses: [
                      {
                        name: "Probability & Statistics for ML",
                        duration: "14/20 units",
                      },
                      {
                        name: "Neural Networks with Python",
                        duration: "1/15 units",
                      },
                    ],
                  },
                ].map((path) => (
                  <div
                    key={path.title}
                    className="flex-1 rounded-[20px] border border-[#e2e8f0] bg-white p-6 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex size-[30px] shrink-0 items-center justify-center rounded-xl border border-slate-100 shadow-sm ${path.iconWrapper}`}
                        >
                          {path.icon}
                        </div>
                        <div>
                          <h4 className="text-[15px] font-bold text-[#0f172a]">
                            {path.title}
                          </h4>
                          <p className="mt-0.5 text-[10px] font-bold text-[#64748b]">
                            {path.courses}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-[22px] font-extrabold leading-none text-[#2563eb]">
                          {path.chance}%
                        </span>
                        <p className="mt-1.5 text-[8px] font-extrabold uppercase tracking-widest text-[#94a3b8]">
                          Chance
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 h-[6px] w-full overflow-hidden rounded-full bg-[#f1f5f9]">
                      <div
                        className="h-full rounded-full bg-[#2563eb]"
                        style={{ width: `${path.chance}%` }}
                      />
                    </div>
                    <div className="mt-6">
                      <p className="mb-4 text-[9px] font-extrabold uppercase tracking-widest text-[#94a3b8]">
                        Active Courses
                      </p>
                      <div className="space-y-3.5">
                        {path.activeCourses.map((course) => (
                          <div
                            key={course.name}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              <PlayCircle
                                size={15}
                                strokeWidth={2.5}
                                className="text-[#2563eb]"
                              />
                              <span className="text-[11px] font-bold text-[#475569]">
                                {course.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-[#94a3b8]">
                              {course.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Resources */}
            <section className="mb-10 mt-14">
              <h3 className="flex items-center gap-2 text-[22px] font-bold tracking-tight text-[#0f172a]">
                Resources <span className="text-[20px]">🏛️</span>
              </h3>
              <div className="mt-5 flex flex-col gap-3">
                {[
                  "Course Syllabus (PDF)",
                  "Student Handbook (PDF)",
                  "Academic Calendar (PDF)",
                ].map((resource) => (
                  <button
                    key={resource}
                    className="flex w-full items-center justify-between rounded-[16px] border border-[#e2e8f0] bg-white px-6 py-4 text-left shadow-sm hover:border-[#cbd5e1] hover:bg-[#f8fafc]"
                  >
                    <span className="text-[14px] font-bold text-[#334155]">
                      {resource}
                    </span>
                    <Download
                      size={18}
                      strokeWidth={2.5}
                      className="text-[#64748b]"
                    />
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ════════════════════════════════════════════
            COURSE REGISTRATION CONTENT
        ════════════════════════════════════════════ */}
        {activeTab === "course-registration" && (
          <section className="mx-auto mt-8 max-w-[980px]">
            {/* Banner */}
            <div
              className={`relative overflow-hidden rounded-[14px] px-6 py-8 text-white shadow-md md:px-10 md:py-10 ${bannerWrapperClass}`}
            >
              <div className="relative z-10 text-center">
                <p
                  className={`inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${statusPillClass}`}
                >
                  <span className={`size-2 rounded-full ${statusDotClass}`} />
                  {statusLabel}
                </p>
                <h2 className="mt-3 text-[30px] font-extrabold leading-tight md:text-[46px]">
                  {bannerHeading}
                </h2>
                <div className="mt-5 flex items-center justify-center gap-3 md:gap-5">
                  {[
                    {
                      label: "Days",
                      value:
                        registrationStatus === "closed" &&
                        countdownTotalSeconds === 0
                          ? 0
                          : countdown.days,
                    },
                    {
                      label: "Hours",
                      value:
                        registrationStatus === "closed" &&
                        countdownTotalSeconds === 0
                          ? 0
                          : countdown.hours,
                    },
                    {
                      label: "Mins",
                      value:
                        registrationStatus === "closed" &&
                        countdownTotalSeconds === 0
                          ? 0
                          : countdown.minutes,
                    },
                    {
                      label: "Secs",
                      value:
                        registrationStatus === "closed" &&
                        countdownTotalSeconds === 0
                          ? 0
                          : countdown.seconds,
                    },
                  ].map((part) => (
                    <div key={part.label} className="text-center">
                      <div
                        className={`flex size-16 items-center justify-center rounded-[12px] text-[34px] font-extrabold leading-none md:size-[74px] ${timerTileClass}`}
                      >
                        {String(part.value).padStart(2, "0")}
                      </div>
                      <p
                        className={`mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] ${timerTextClass}`}
                      >
                        {part.label}
                      </p>
                    </div>
                  ))}
                </div>
                <p
                  className={`mx-auto mt-5 max-w-[620px] text-[13px] font-medium leading-relaxed ${statusPillClass}`}
                >
                  {bannerBody}
                </p>
              </div>
              <div className="pointer-events-none absolute -right-16 -top-16 size-[220px] rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-14 left-24 size-[200px] rounded-full bg-indigo-400/25 blur-2xl" />
            </div>

            {registrationStatus === "open" ? (
              <>
                <div className="mt-6 space-y-3">
                  {REGISTRATION_GROUPS.map((group) => {
                    const Icon = group.icon;
                    const isCollapsed = collapsedGroups[group.id];
                    const selectedCourses =
                      selectedCoursesByGroup[group.id] ?? [];
                    return (
                      <article
                        key={group.id}
                        className="overflow-hidden rounded-[12px] border border-[#d9e2ec] bg-white"
                      >
                        <button
                          type="button"
                          onClick={() => toggleGroupCollapse(group.id)}
                          aria-expanded={!isCollapsed}
                          className={`flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[#f8fafc] ${group.tintClass}`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 flex size-6 items-center justify-center rounded-md ${group.iconClass}`}
                            >
                              <Icon size={14} strokeWidth={2.5} />
                            </div>
                            <div>
                              <h3 className="text-[16px] font-bold text-[#0f172a]">
                                {group.title}
                              </h3>
                              <p className="text-[11px] font-medium text-[#64748b]">
                                {group.subtitle}
                              </p>
                            </div>
                          </div>
                          <span className="rounded-md p-1 text-[#94a3b8]">
                            {isCollapsed ? (
                              <ChevronDown size={16} strokeWidth={2.5} />
                            ) : (
                              <ChevronUp size={16} strokeWidth={2.5} />
                            )}
                          </span>
                        </button>
                        {!isCollapsed && (
                          <div className="space-y-4 border-t border-[#e8eef5] px-4 py-4">
                            <div>
                              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748b]">
                                Available Courses - click to add
                              </p>
                              <div className="grid gap-2 md:grid-cols-2">
                                {group.courses.map((course) => {
                                  const isSelected = selectedCourses.some(
                                    (item) => item.code === course.code,
                                  );
                                  const wouldExceedLimit =
                                    !isSelected &&
                                    totalUnits + course.units > maxAllowedUnits;
                                  return (
                                    <button
                                      key={course.code}
                                      type="button"
                                      disabled={
                                        hasSubmittedRegistration ||
                                        wouldExceedLimit ||
                                        isSelected
                                      }
                                      onClick={() =>
                                        addCourse(group.id, course)
                                      }
                                      className={`flex items-center justify-between rounded-[10px] border px-3 py-2 text-left transition-all ${
                                        isSelected
                                          ? "cursor-not-allowed border-[#bbf7d0] bg-[#f0fdf4]"
                                          : wouldExceedLimit
                                            ? "cursor-not-allowed border-[#fecaca] bg-[#fef2f2]"
                                            : "border-[#d9e2ec] bg-white hover:border-[#1d4ed8] hover:bg-[#eff6ff]"
                                      }`}
                                    >
                                      <span>
                                        <p className="text-[13px] font-bold text-[#1d4ed8]">
                                          {course.code}
                                        </p>
                                        <p className="text-[12px] font-medium text-[#334155]">
                                          {course.title}
                                        </p>
                                      </span>
                                      <div className="text-right">
                                        <p className="text-[11px] font-semibold text-[#64748b]">
                                          {course.units} Units
                                        </p>
                                        <span
                                          className={`mt-1 inline-flex rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${getTagColor(course.tag)}`}
                                        >
                                          {isSelected
                                            ? "Added"
                                            : wouldExceedLimit
                                              ? "Limit"
                                              : course.tag}
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="rounded-[10px] border border-[#d9e2ec] bg-[#f8fafc] p-3">
                              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748b]">
                                Added {group.title}
                              </p>
                              {selectedCourses.length === 0 ? (
                                <p className="text-[12px] italic text-[#94a3b8]">
                                  No courses added yet.
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {selectedCourses.map((course) => (
                                    <div
                                      key={course.code}
                                      className="flex items-center justify-between rounded-md border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2"
                                    >
                                      <div>
                                        <p className="text-[12px] font-bold text-[#166534]">
                                          {course.code}
                                        </p>
                                        <p className="text-[12px] font-medium text-[#334155]">
                                          {course.title}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="text-[11px] font-semibold text-[#166534]">
                                          {course.units} Units
                                        </span>
                                        <button
                                          type="button"
                                          disabled={hasSubmittedRegistration}
                                          onClick={() =>
                                            removeCourse(group.id, course.code)
                                          }
                                          className="rounded bg-[#dc2626] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>

                {/* Units Summary */}
                <section className="mt-7 rounded-[12px] bg-white px-4 py-5 shadow-sm">
                  <div className="flex items-center justify-between text-[13px] font-medium text-[#64748b]">
                    <p>Max Allowed</p>
                    <p>{maxAllowedUnits} Units</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[24px] font-bold text-[#0f172a]">
                      Total Units
                    </p>
                    <p
                      className={`text-[32px] font-extrabold ${hasReachedUnitLimit ? "text-[#dc2626]" : "text-[#1d4ed8]"}`}
                    >
                      {totalUnits} Units
                    </p>
                  </div>
                  <div className="mt-4 h-[6px] w-full overflow-hidden rounded-full bg-[#e2e8f0]">
                    <div
                      className={`h-full rounded-full ${
                        hasReachedUnitLimit
                          ? "bg-[#dc2626]"
                          : totalUnits >= maxAllowedUnits - 3
                            ? "bg-[#f59e0b]"
                            : "bg-[#1d4ed8]"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-center text-[11px] font-medium text-[#64748b]">
                    Maximum allowed is set by admin/staff and updates
                    dynamically.
                  </p>
                </section>

                {/* Registration Summary */}
                <section className="mt-7 rounded-[12px] bg-white px-4 py-5 shadow-sm">
                  <h3 className="text-[30px] font-semibold text-[#1d4ed8] md:text-[36px]">
                    Registration Summary
                  </h3>
                  <div className="mt-4 overflow-hidden rounded-[12px] border border-[#d9e2ec]">
                    <div className="flex items-center justify-between border-b border-[#d9e2ec] bg-[#f8fafc] px-4 py-3">
                      <p className="text-[14px] font-bold text-[#0f172a]">
                        Proposed Course List (First Semester)
                      </p>
                      <span className="rounded-full bg-[#e2e8f0] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#1d4ed8]">
                        {totalUnits} Total Units
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[720px] text-left">
                        <thead className="bg-[#f8fafc] text-[11px] font-bold uppercase tracking-[0.1em] text-[#64748b]">
                          <tr>
                            <th className="px-4 py-3">Code</th>
                            <th className="px-4 py-3">Course Title</th>
                            <th className="px-4 py-3">Units</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Verification</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e8eef5] text-[13px]">
                          {allSelectedCourses.length === 0 ? (
                            <tr>
                              <td
                                colSpan={5}
                                className="px-4 py-6 text-center text-[13px] font-medium text-[#94a3b8]"
                              >
                                No courses selected yet. Select courses from any
                                category above.
                              </td>
                            </tr>
                          ) : (
                            allSelectedCourses.map((course) => (
                              <tr
                                key={`${course.groupId}-${course.code}`}
                                className="bg-white"
                              >
                                <td className="px-4 py-3 font-bold text-[#1d4ed8]">
                                  {course.code}
                                </td>
                                <td className="px-4 py-3 font-medium text-[#1e293b]">
                                  {course.title}
                                </td>
                                <td className="px-4 py-3 font-semibold text-[#334155]">
                                  {course.units}
                                </td>
                                <td className="px-4 py-3 font-medium text-[#334155]">
                                  {course.groupTitle}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#059669]">
                                    <CheckCircle2 size={12} strokeWidth={2.5} />{" "}
                                    Pending
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                          {allSelectedCourses.length > 0 && (
                            <tr className="bg-[#eff6ff]">
                              <td
                                colSpan={2}
                                className="px-4 py-3 text-left text-[13px] font-bold text-[#0f172a]"
                              >
                                Total Units
                              </td>
                              <td className="px-4 py-3 text-[14px] font-extrabold text-[#1d4ed8]">
                                {totalUnits}
                              </td>
                              <td colSpan={2} className="px-4 py-3" />
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {selectionNotice && (
                    <p
                      className={`mt-4 rounded-md px-3 py-2 text-[12px] font-semibold ${
                        selectionNotice.includes("Maximum")
                          ? "bg-[#fef2f2] text-[#b91c1c]"
                          : "bg-[#f0fdf4] text-[#166534]"
                      }`}
                    >
                      {selectionNotice}
                    </p>
                  )}

                  {hasSubmittedRegistration ? (
                    <div className="mt-8 rounded-[12px] bg-white px-4 py-5 shadow-sm">
                      <h3 className="text-[22px] font-bold text-[#0f172a] mb-4">
                        Alpha Semester Course Verification
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <button
                          className="w-full rounded-[8px] bg-[#2563eb] py-4 text-[18px] font-semibold text-white hover:bg-[#1d4ed8]"
                          onClick={() =>
                            router.push(
                              "/studashboard/e-learning/learning-dashboard/course-control/print",
                            )
                          }
                        >
                          Print Registration
                        </button>
                        <button
                          className="w-full rounded-[8px] bg-[#a855f7] py-4 text-[18px] font-semibold text-white hover:bg-[#7c3aed]"
                          onClick={resetRegistration}
                        >
                          Edit Registration
                        </button>
                        <button
                          className="w-full rounded-[8px] bg-[#dc2626] py-4 text-[18px] font-semibold text-white hover:bg-[#b91c1c]"
                          onClick={() => {
                            setHasSubmittedRegistration(false);
                            setSelectedCoursesByGroup(
                              buildDefaultSelectionMap(),
                            );
                            setSelectionNotice(null);
                          }}
                        >
                          Reset Registration
                        </button>
                        <button className="w-full rounded-[8px] bg-[#2563eb] py-4 text-[18px] font-semibold text-white hover:bg-[#1d4ed8]">
                          Verify Registration
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={totalUnits === 0}
                      onClick={submitRegistration}
                      className="mt-8 w-full rounded-[8px] bg-[#2fb64f] py-4 text-[30px] font-semibold text-white hover:bg-[#279643] disabled:cursor-not-allowed disabled:opacity-60 md:text-[34px]"
                    >
                      Submit for Approval
                    </button>
                  )}
                </section>
              </>
            ) : (
              <section className="mt-7 rounded-[12px] border border-[#fecaca] bg-[#fff7f7] px-5 py-6 shadow-sm">
                <h3 className="text-[24px] font-bold text-[#991b1b]">
                  Semester Course Registration is currently unavailable
                </h3>
                <p className="mt-2 text-[14px] font-medium text-[#7f1d1d]">
                  This section appears automatically once the official
                  registration window closes.
                </p>
              </section>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
