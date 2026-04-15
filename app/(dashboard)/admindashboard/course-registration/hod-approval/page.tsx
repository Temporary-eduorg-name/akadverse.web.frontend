"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Bell, ChevronDown, ChevronUp, Check, X } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type CourseType = "Compulsory" | "Elective" | "General" | "Practical";
type AdvisorDecision = "pending" | "approved" | "rejected";

type Course = {
  code: string;
  title: string;
  units: number;
  type: CourseType;
};

type StudentRecord = {
  id: string;
  name: string;
  cgpa: number;
  creditUnits: number;
  maxUnits: number;
  courses: Course[];
  advisorDecision?: AdvisorDecision;
  advisorNote?: string;
  /** undefined = pending, true = approved, false = rejected */
  hodDecision?: boolean;
  hodNote: string;
};

type LevelAdvisorDecision = {
  studentId: string;
  studentName: string;
  decision: AdvisorDecision;
  note: string;
  updatedAt: string;
};

type LevelAdvisor = {
  id: string;
  name: string;
  title: string;
  avatarUrl?: string; // placeholder – will come from API
  initials: string;
  avatarBg: string;
  avatarText: string;
  students: StudentRecord[];
};

type RegistrationWindow = {
  startDateTime: string;
  endDateTime: string;
  maxAllowedUnits?: number;
};

type RegistrationStatus = "upcoming" | "open" | "closed";

// ─── Dummy Data (replace with API) ───────────────────────────────────────────

const DUMMY_ADVISORS: LevelAdvisor[] = [
  {
    id: "advisor-1",
    name: "Dr. Sarah Jenkins",
    title: "300 Level Advisor • Computer Science",
    initials: "SJ",
    avatarBg: "bg-[#dbeafe]",
    avatarText: "text-[#1d4ed8]",
    students: [
      {
        id: "stu-1",
        name: "Alex Johnson",
        cgpa: 3.82,
        creditUnits: 18,
        maxUnits: 24,
        advisorNote: "Student has cleared all prerequisites for MAT 311.",
        hodNote: "",
        courses: [
          {
            code: "CSC 301",
            title: "Data Structures and Algorithms",
            units: 3,
            type: "Compulsory",
          },
          {
            code: "CSC 305",
            title: "Operating Systems I",
            units: 3,
            type: "Compulsory",
          },
          {
            code: "MAT 311",
            title: "Linear Algebra II",
            units: 2,
            type: "Elective",
          },
          {
            code: "CSC 313",
            title: "Software Engineering",
            units: 3,
            type: "Compulsory",
          },
          {
            code: "CSC 315",
            title: "Database Management Systems",
            units: 3,
            type: "Compulsory",
          },
          {
            code: "CSC 317",
            title: "Computer Communications & Networks",
            units: 3,
            type: "Compulsory",
          },
          {
            code: "GST 311",
            title: "Entrepreneurship Studies",
            units: 1,
            type: "General",
          },
        ],
      },
      {
        id: "stu-2",
        name: "Maria Okonkwo",
        cgpa: 3.45,
        creditUnits: 21,
        maxUnits: 24,
        advisorNote: "",
        hodNote: "",
        courses: [
          {
            code: "CSC 301",
            title: "Data Structures and Algorithms",
            units: 3,
            type: "Compulsory",
          },
          {
            code: "CSC 303",
            title: "Computer Organisation",
            units: 3,
            type: "Compulsory",
          },
          {
            code: "CSC 305",
            title: "Operating Systems I",
            units: 3,
            type: "Compulsory",
          },
          {
            code: "CSC 313",
            title: "Software Engineering",
            units: 3,
            type: "Compulsory",
          },
          {
            code: "CSC 315",
            title: "Database Management Systems",
            units: 3,
            type: "Compulsory",
          },
          {
            code: "GST 311",
            title: "Entrepreneurship Studies",
            units: 3,
            type: "General",
          },
          {
            code: "MTH 311",
            title: "Numerical Analysis I",
            units: 3,
            type: "Elective",
          },
        ],
      },
    ],
  },
  {
    id: "advisor-2",
    name: "Prof. Michael Chen",
    title: "400 Level Advisor • Computer Science",
    initials: "MC",
    avatarBg: "bg-[#dcfce7]",
    avatarText: "text-[#15803d]",
    students: [
      {
        id: "stu-3",
        name: "Elena Rodriguez",
        cgpa: 2.45,
        creditUnits: 21,
        maxUnits: 24,
        hodNote: "",
        courses: [
          {
            code: "CSC 401",
            title: "Artificial Intelligence",
            units: 3,
            type: "Compulsory",
          },
          {
            code: "CSC 403",
            title: "Computer Networks II",
            units: 3,
            type: "Compulsory",
          },
          {
            code: "CSC 411",
            title: "Compiler Construction",
            units: 3,
            type: "Elective",
          },
          {
            code: "CSC 415",
            title: "Information Security",
            units: 3,
            type: "Compulsory",
          },
          {
            code: "GST 401",
            title: "Peace Studies & Conflict Resolution",
            units: 2,
            type: "General",
          },
          {
            code: "CSC 417",
            title: "Mobile App Development",
            units: 4,
            type: "Elective",
          },
          {
            code: "MTH 405",
            title: "Operations Research",
            units: 3,
            type: "Elective",
          },
        ],
      },
    ],
  },
  {
    id: "advisor-3",
    name: "Prof. Samuel Chi",
    title: "100 Level Advisor • Computer Science",
    initials: "SC",
    avatarBg: "bg-[#ede9fe]",
    avatarText: "text-[#7e22ce]",
    students: [
      {
        id: "stu-4",
        name: "Tariú Khan",
        cgpa: 4.2,
        creditUnits: 24,
        maxUnits: 24,
        hodNote: "",
        courses: [
          {
            code: "CSC 101",
            title: "Introduction to Computing",
            units: 3,
            type: "Compulsory",
          },
          {
            code: "CSC 103",
            title: "Computer Programming I",
            units: 3,
            type: "Compulsory",
          },
          {
            code: "MTH 101",
            title: "Elementary Mathematics I",
            units: 4,
            type: "Compulsory",
          },
          {
            code: "PHY 101",
            title: "General Physics I",
            units: 3,
            type: "Compulsory",
          },
          {
            code: "CHM 101",
            title: "General Chemistry I",
            units: 3,
            type: "Compulsory",
          },
          {
            code: "GST 101",
            title: "Use of English I",
            units: 2,
            type: "General",
          },
          {
            code: "GST 103",
            title: "Nigerian Peoples and Culture",
            units: 2,
            type: "General",
          },
          {
            code: "CSC 197",
            title: "Computer Lab I",
            units: 4,
            type: "Practical",
          },
        ],
      },
    ],
  },
];

const ITEMS_PER_PAGE = 4;
const DEFAULT_REGISTRATION_START = new Date("2026-03-01T08:45:19").getTime();
const DEFAULT_REGISTRATION_DEADLINE = new Date("2026-03-26T08:45:19").getTime();
const registrationStorageKey = "courseRegistrationWindow";
const advisorDecisionStorageKey = "levelAdvisorRegistrationDecisions";
const hodDecisionStorageKey = "hodRegistrationDecisions";
const ZERO_COUNTDOWN = { days: 0, hours: 0, minutes: 0, seconds: 0 };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTypeStyle(type: CourseType) {
  if (type === "Elective") return "text-[#7c3aed]";
  if (type === "General") return "text-[#0369a1]";
  if (type === "Practical") return "text-[#b45309]";
  return "text-[#1e293b]";
}

function getTimeLeft(targetTime: number, fromTime: number) {
  const remaining = Math.max(targetTime - fromTime, 0);
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((remaining / (1000 * 60)) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  return { days, hours, minutes, seconds };
}

function StudentCourseRow({
  student,
  onApprove,
  onReject,
  onNoteChange,
}: {
  student: StudentRecord;
  onApprove: () => void;
  onReject: () => void;
  onNoteChange: (note: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const canReviewStudent =
    student.advisorDecision === "approved" && student.hodDecision === undefined;
  const reviewBlockedMessage =
    !student.advisorDecision || student.advisorDecision === "pending"
      ? "HOD review unlocks after the level adviser approves this registration."
      : student.advisorDecision === "rejected"
        ? "This registration was rejected by the level adviser and must be resubmitted before HOD review."
        : null;

  return (
    <div className="border-t border-[#f1f5f9]">
      {/* Student summary row */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-[#f8fafc] transition-colors"
      >
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e2e8f0] text-[12px] font-bold text-[#475569]`}
        >
          {student.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </div>

        <p className="flex-1 text-[14px] font-semibold text-[#0f172a]">
          {student.name}
        </p>

        {student.advisorDecision === "approved" && (
          <span className="mr-2 inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#166534]">
            <Check size={10} strokeWidth={3} /> Advisor Approved
          </span>
        )}
        {student.advisorDecision === "rejected" && (
          <span className="mr-2 inline-flex items-center gap-1 rounded-full bg-[#fee2e2] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#991b1b]">
            <X size={10} strokeWidth={3} /> Advisor Rejected
          </span>
        )}

        <div className="flex items-center gap-6 mr-2">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#94a3b8]">
              CGPA
            </p>
            <p className="text-[14px] font-bold text-[#0f172a]">
              {student.cgpa.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#94a3b8]">
              Credit Units
            </p>
            <p className="text-[14px] font-bold text-[#0f172a]">
              {student.creditUnits} / {student.maxUnits}
            </p>
          </div>
        </div>

        {student.hodDecision === true && (
          <span className="mr-2 inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#166534]">
            <Check size={10} strokeWidth={3} /> Approved
          </span>
        )}
        {student.hodDecision === false && (
          <span className="mr-2 inline-flex items-center gap-1 rounded-full bg-[#fee2e2] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#991b1b]">
            <X size={10} strokeWidth={3} /> Rejected
          </span>
        )}

        {expanded ? (
          <ChevronUp
            size={16}
            strokeWidth={2.5}
            className="text-[#94a3b8] shrink-0"
          />
        ) : (
          <ChevronDown
            size={16}
            strokeWidth={2.5}
            className="text-[#94a3b8] shrink-0"
          />
        )}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-[#f1f5f9] px-5 pb-5 pt-4 bg-[#fafbfc]">
          {/* Course table */}
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">
                <th className="pb-2 pr-4">Course Code</th>
                <th className="pb-2 pr-4">Course Title</th>
                <th className="pb-2 pr-4">Units</th>
                <th className="pb-2">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[13px]">
              {student.courses.map((course) => (
                <tr key={course.code}>
                  <td className="py-2 pr-4 font-bold text-[#1d4ed8]">
                    {course.code}
                  </td>
                  <td className="py-2 pr-4 font-medium text-[#334155]">
                    {course.title}
                  </td>
                  <td className="py-2 pr-4 font-semibold text-[#475569]">
                    {course.units}
                  </td>
                  <td
                    className={`py-2 text-[13px] font-medium ${getTypeStyle(course.type)}`}
                  >
                    {course.type}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Decision section */}
          <div className="mt-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#64748b]">
              Decision Notes / Feedback
            </p>
            <div className="flex items-start gap-3">
              <textarea
                className="flex-1 resize-none rounded-[8px] border border-[#e2e8f0] bg-white px-3 py-2 text-[13px] text-[#334155] placeholder-[#94a3b8] focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
                rows={2}
                placeholder="Enter reason for rejection or special approval instructions..."
                value={student.hodNote}
                onChange={(e) => onNoteChange(e.target.value)}
                disabled={!canReviewStudent}
              />
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onReject}
                  disabled={!canReviewStudent || !student.hodNote.trim()}
                  className="flex items-center gap-1.5 rounded-[8px] border border-[#fca5a5] bg-white px-4 py-2 text-[13px] font-semibold text-[#dc2626] transition-colors hover:bg-[#fee2e2] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={14} strokeWidth={2.5} />
                  Reject Registration
                </button>
                <button
                  type="button"
                  onClick={onApprove}
                  disabled={!canReviewStudent}
                  className="flex items-center gap-1.5 rounded-[8px] bg-[#1d4ed8] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#1e40af] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check size={14} strokeWidth={2.5} />
                  Approve
                </button>
              </div>
            </div>

            {reviewBlockedMessage && student.hodDecision === undefined && (
              <p className="mt-2 text-[11px] font-medium text-[#92400e]">
                {reviewBlockedMessage}
              </p>
            )}

            {student.advisorNote && (
              <p className="mt-2 text-[11px] italic text-[#64748b]">
                <span className="font-semibold not-italic text-[#475569]">
                  Advisor Note:
                </span>{" "}
                &ldquo;{student.advisorNote}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HodApprovalPage() {
  const [advisors, setAdvisors] = useState<LevelAdvisor[]>(DUMMY_ADVISORS);
  const [expandedAdvisors, setExpandedAdvisors] = useState<
    Record<string, boolean>
  >({
    "advisor-1": true,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [countdown, setCountdown] = useState(ZERO_COUNTDOWN);
  const [registrationStatus, setRegistrationStatus] =
    useState<RegistrationStatus>("open");
  const [registrationWindow, setRegistrationWindow] = useState({
    startDateTime: DEFAULT_REGISTRATION_START,
    endDateTime: DEFAULT_REGISTRATION_DEADLINE,
  });

  useEffect(() => {
    const storedWindow = window.localStorage.getItem(registrationStorageKey);

    if (!storedWindow) {
      return;
    }

    try {
      const parsed = JSON.parse(storedWindow) as RegistrationWindow;
      const parsedStart = new Date(parsed.startDateTime).getTime();
      const parsedEnd = new Date(parsed.endDateTime).getTime();

      if (Number.isFinite(parsedStart) && Number.isFinite(parsedEnd)) {
        setRegistrationWindow({
          startDateTime: parsedStart,
          endDateTime: parsedEnd,
        });
      }
    } catch {
      // Ignore malformed values and continue with fallback defaults.
    }
  }, []);

  useEffect(() => {
    const syncAdvisorDecisions = () => {
      const storedAdvisorDecisions = window.localStorage.getItem(
        advisorDecisionStorageKey,
      );
      if (!storedAdvisorDecisions) return;

      try {
        const parsed = JSON.parse(
          storedAdvisorDecisions,
        ) as LevelAdvisorDecision[];
        setAdvisors((prev) =>
          prev.map((advisor) => ({
            ...advisor,
            students: advisor.students.map((student) => {
              const matched = parsed.find(
                (item) =>
                  item.studentName.toLowerCase() === student.name.toLowerCase(),
              );
              if (!matched) return student;

              return {
                ...student,
                advisorDecision: matched.decision,
                advisorNote: matched.note || "",
              };
            }),
          })),
        );
      } catch {
        // Ignore malformed adviser decision payloads.
      }
    };

    syncAdvisorDecisions();
    const interval = window.setInterval(syncAdvisorDecisions, 3000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();

      if (now < registrationWindow.startDateTime) {
        setRegistrationStatus("upcoming");
        setCountdown(getTimeLeft(registrationWindow.startDateTime, now));
        return;
      }

      if (now >= registrationWindow.endDateTime) {
        setRegistrationStatus("closed");
        setCountdown(ZERO_COUNTDOWN);
        return;
      }

      setRegistrationStatus("open");
      setCountdown(getTimeLeft(registrationWindow.endDateTime, now));
    };

    updateTimer();
    const timer = window.setInterval(updateTimer, 1000);

    return () => window.clearInterval(timer);
  }, [registrationWindow]);

  // Flatten all students for pagination
  const allStudents = useMemo(
    () =>
      advisors.flatMap((a) =>
        a.students.map((s) => ({ ...s, advisorId: a.id })),
      ),
    [advisors],
  );
  const totalStudents = allStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalStudents / ITEMS_PER_PAGE));

  const paginatedStudentIds = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return new Set(
      allStudents.slice(start, start + ITEMS_PER_PAGE).map((s) => s.id),
    );
  }, [allStudents, currentPage]);

  const toggleAdvisor = (advisorId: string) =>
    setExpandedAdvisors((prev) => ({ ...prev, [advisorId]: !prev[advisorId] }));

  const updateStudent = (
    advisorId: string,
    studentId: string,
    patch: Partial<StudentRecord>,
  ) => {
    setAdvisors((prev) =>
      prev.map((advisor) =>
        advisor.id !== advisorId
          ? advisor
          : {
              ...advisor,
              students: advisor.students.map((s) =>
                s.id !== studentId ? s : { ...s, ...patch },
              ),
            },
      ),
    );
  };

  useEffect(() => {
    const payload = advisors
      .flatMap((advisor) => advisor.students)
      .filter((student) => student.hodDecision !== undefined)
      .map((student) => ({
        studentName: student.name,
        decision: student.hodDecision ? "approved" : "rejected",
        note: student.hodNote,
      }));

    window.localStorage.setItem(hodDecisionStorageKey, JSON.stringify(payload));
  }, [advisors]);

  const pendingCount = (advisor: LevelAdvisor) =>
    advisor.students.filter(
      (student) =>
        student.advisorDecision === "approved" &&
        student.hodDecision === undefined,
    ).length;

  // Visible students per advisor on this page
  const visibleStudentIds = (advisor: LevelAdvisor) =>
    advisor.students.filter((s) => paginatedStudentIds.has(s.id));

  const startEntry = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endEntry = Math.min(currentPage * ITEMS_PER_PAGE, totalStudents);
  const countdownTotalSeconds =
    countdown.days * 24 * 60 * 60 +
    countdown.hours * 60 * 60 +
    countdown.minutes * 60 +
    countdown.seconds;
  const shouldShowWarningBanner =
    registrationStatus === "closed" ||
    (registrationStatus === "open" && countdown.days <= 3);
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
    : registrationStatus === "closed"
      ? "bg-[#facc15]"
      : "bg-[#22c55e]";
  const statusLabel =
    registrationStatus === "open"
      ? "SYSTEM STATUS: REGISTRATION ACTIVE"
      : registrationStatus === "upcoming"
        ? "SYSTEM STATUS: REGISTRATION NOT OPEN"
        : "SYSTEM STATUS: REGISTRATION CLOSED";
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
        : "The registration period has ended. Contact the registry for late-registration guidance.";

  return (
    <div
      className="min-h-screen bg-[#f8fafc]"
      style={{ fontFamily: "var(--font-lexend), sans-serif" }}
    >
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 flex h-[57px] items-center justify-between border-b border-[#e2e8f0] bg-white px-6 shadow-sm">
        {/* Logo + title */}
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-[8px] bg-[#1d4ed8] text-[13px] font-extrabold text-white">
            CS
          </div>
          <span className="text-[16px] font-bold text-[#0f172a]">
            Computer Science Program
          </span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <button className="relative rounded-md p-2 text-[#94a3b8] hover:text-[#64748b]">
            <Bell size={18} strokeWidth={2} />
            <span className="absolute right-2 top-2 size-[7px] rounded-full bg-[#ef4444]" />
          </button>
          <div className="flex size-9 items-center justify-center rounded-full bg-[#1d4ed8] text-[13px] font-bold text-white">
            JD
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[860px] px-6 py-8">
        {/* ── Tabs ── */}
        <div className="flex gap-8 border-b border-[#e2e8f0]">
          <button className="pb-[12px] text-[13px] font-semibold text-[#64748b] hover:text-[#0f172a]">
            Program Overview
          </button>
          <button className="relative pb-[12px] text-[13px] font-bold text-[#1d4ed8]">
            Course Registration
            <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-t-full bg-[#1d4ed8]" />
          </button>
        </div>

        {/* ── Countdown banner (synced with student registration timer) ── */}
        <div
          className={`mt-8 overflow-hidden rounded-[14px] px-8 py-9 text-white shadow-md ${bannerWrapperClass}`}
        >
          <div className="text-center">
            <p
              className={`inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${statusPillClass}`}
            >
              <span className={`size-2 rounded-full ${statusDotClass}`} />
              {statusLabel}
            </p>
            <h2 className="mt-3 text-[32px] font-extrabold leading-tight md:text-[42px]">
              {bannerHeading}
            </h2>
            <div className="mt-5 flex items-center justify-center gap-4">
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
                    className={`flex size-[68px] items-center justify-center rounded-[12px] text-[32px] font-extrabold leading-none ${timerTileClass}`}
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
              className={`mx-auto mt-5 max-w-[580px] text-[13px] font-medium leading-relaxed ${statusPillClass}`}
            >
              {bannerBody}
            </p>
          </div>
        </div>

        {/* ── Advisor accordion list ── */}
        <div className="mt-8 space-y-4">
          {advisors.map((advisor) => {
            const isOpen = !!expandedAdvisors[advisor.id];
            const visibleStudents = visibleStudentIds(advisor);
            const pending = pendingCount(advisor);

            return (
              <div
                key={advisor.id}
                className="overflow-hidden rounded-[12px] border border-[#e2e8f0] bg-white shadow-sm"
              >
                {/* Advisor header row */}
                <button
                  type="button"
                  onClick={() => toggleAdvisor(advisor.id)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-[#f8fafc] transition-colors"
                >
                  {/* Avatar */}
                  <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-full text-[14px] font-bold ${advisor.avatarBg} ${advisor.avatarText}`}
                  >
                    {advisor.initials}
                  </div>

                  <div className="flex-1">
                    <p className="text-[15px] font-bold text-[#0f172a]">
                      {advisor.name}
                    </p>
                    <p className="text-[11px] font-medium text-[#64748b]">
                      {advisor.title}
                    </p>
                  </div>

                  {pending > 0 && (
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                      {pending} Pending{pending !== 1 ? "s" : ""}
                    </span>
                  )}

                  {isOpen ? (
                    <ChevronUp
                      size={16}
                      strokeWidth={2.5}
                      className="text-[#94a3b8] shrink-0"
                    />
                  ) : (
                    <ChevronDown
                      size={16}
                      strokeWidth={2.5}
                      className="text-[#94a3b8] shrink-0"
                    />
                  )}
                </button>

                {/* Student list */}
                {isOpen && (
                  <div>
                    {visibleStudents.length === 0 ? (
                      <p className="px-5 py-4 text-[13px] italic text-[#94a3b8]">
                        No students on this page.
                      </p>
                    ) : (
                      visibleStudents.map((student) => (
                        <StudentCourseRow
                          key={student.id}
                            student={student}
                            onApprove={() =>
                              updateStudent(advisor.id, student.id, {
                                hodDecision: true,
                                hodNote: "",
                              })
                            }
                          onReject={() =>
                            updateStudent(advisor.id, student.id, {
                              hodDecision: false,
                            })
                          }
                          onNoteChange={(note) =>
                            updateStudent(advisor.id, student.id, {
                              hodNote: note,
                            })
                          }
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Pagination ── */}
        <div className="mt-6 flex items-center justify-between rounded-[10px] border border-[#e2e8f0] bg-white px-5 py-3 text-[13px] shadow-sm">
          <p className="font-medium text-[#64748b]">
            Showing {totalStudents === 0 ? 0 : startEntry} to {endEntry} of{" "}
            {totalStudents} entries
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-[6px] px-3 py-1.5 font-medium text-[#64748b] hover:bg-[#f1f5f9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded-[6px] px-3 py-1.5 font-semibold transition-colors ${
                  currentPage === page
                    ? "bg-[#1d4ed8] text-white"
                    : "text-[#64748b] hover:bg-[#f1f5f9]"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-[6px] px-3 py-1.5 font-medium text-[#64748b] hover:bg-[#f1f5f9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
