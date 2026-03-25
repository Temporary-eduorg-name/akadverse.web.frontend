"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  ChevronDown,
  Filter,
  Search,
  ShieldCheck,
  TriangleAlert,
  Upload,
  X,
} from "lucide-react";

type RegistrationWindow = {
  startDateTime: string;
  endDateTime: string;
  maxAllowedUnits?: number;
};

type RegistrationStatus = "upcoming" | "open" | "closed";

type StudentStatus = "Pending Review" | "Approved" | "Action Required";

type StudentRecord = {
  id: string;
  name: string;
  studentId: string;
  registrationDate: string;
  creditUnits: string;
  status: StudentStatus;
};

type AuditCourse = {
  code: string;
  title: string;
  units: number;
  verification: "VALID" | "REVIEW";
};

const DEFAULT_REGISTRATION_START = new Date("2026-03-01T08:45:19").getTime();
const DEFAULT_REGISTRATION_DEADLINE = new Date("2026-03-26T08:45:19").getTime();
const registrationStorageKey = "courseRegistrationWindow";

const ZERO_COUNTDOWN = { days: 0, hours: 0, minutes: 0, seconds: 0 };

const studentRows: StudentRecord[] = [
  {
    id: "cs-2023-301",
    name: "Alex Johnson",
    studentId: "CS-2023-301",
    registrationDate: "Oct 12, 2023",
    creditUnits: "18 Units",
    status: "Pending Review",
  },
  {
    id: "cs-2023-305",
    name: "Sarah Williams",
    studentId: "CS-2023-305",
    registrationDate: "Oct 11, 2023",
    creditUnits: "15 Units",
    status: "Approved",
  },
  {
    id: "cs-2023-312",
    name: "Michael Chen",
    studentId: "CS-2023-312",
    registrationDate: "Oct 11, 2023",
    creditUnits: "17 Units",
    status: "Action Required",
  },
  {
    id: "cs-2023-309",
    name: "Emily Davis",
    studentId: "CS-2023-309",
    registrationDate: "Oct 10, 2023",
    creditUnits: "16 Units",
    status: "Pending Review",
  },
];

const auditedCourses: AuditCourse[] = [
  {
    code: "CSC 301",
    title: "Software Engineering",
    units: 3,
    verification: "VALID",
  },
  {
    code: "CSC 305",
    title: "Operating Systems",
    units: 3,
    verification: "VALID",
  },
  {
    code: "CSC 311",
    title: "Data Communications",
    units: 3,
    verification: "VALID",
  },
  {
    code: "CSC 315",
    title: "Database Management Systems",
    units: 3,
    verification: "VALID",
  },
  {
    code: "CSC 321",
    title: "Artificial Intelligence",
    units: 2,
    verification: "VALID",
  },
  {
    code: "CSC 311",
    title: "Data Communications",
    units: 3,
    verification: "VALID",
  },
  {
    code: "CSC 321",
    title: "Artificial Intelligence",
    units: 2,
    verification: "VALID",
  },
  {
    code: "CSC 311",
    title: "Data Communications",
    units: 3,
    verification: "VALID",
  },
];

function getTimeLeft(targetTime: number, fromTime: number) {
  const remaining = Math.max(targetTime - fromTime, 0);
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((remaining / (1000 * 60)) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  return { days, hours, minutes, seconds };
}

function statusBadge(status: StudentStatus) {
  if (status === "Approved") {
    return "bg-[#dcfce7] text-[#15803d]";
  }

  if (status === "Action Required") {
    return "bg-[#fee2e2] text-[#dc2626]";
  }

  return "bg-[#fef3c7] text-[#d97706]";
}

export default function FacultyDashboardPage() {
  const [countdown, setCountdown] = useState(ZERO_COUNTDOWN);
  const [registrationStatus, setRegistrationStatus] =
    useState<RegistrationStatus>("open");
  const [registrationWindow, setRegistrationWindow] = useState({
    startDateTime: DEFAULT_REGISTRATION_START,
    endDateTime: DEFAULT_REGISTRATION_DEADLINE,
  });
  const [isAuditExpanded, setIsAuditExpanded] = useState(true);
  const [selectedStudentId] = useState("cs-2023-301");
  const [reviewNote, setReviewNote] = useState("");

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

  const summaryStats = useMemo(() => {
    return [
      { label: "Total Pending", value: "24", valueClass: "text-[#f59e0b]" },
      { label: "Approved Today", value: "12", valueClass: "text-[#16a34a]" },
      { label: "Action Required", value: "08", valueClass: "text-[#dc2626]" },
      {
        label: "Registration Rate",
        value: "84%",
        valueClass: "text-[#0f172a]",
      },
    ];
  }, []);

  const selectedStudent = studentRows.find(
    (row) => row.id === selectedStudentId,
  );

  const countdownTotalSeconds =
    countdown.days * 24 * 60 * 60 +
    countdown.hours * 60 * 60 +
    countdown.minutes * 60 +
    countdown.seconds;

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
      className="min-h-screen bg-[#f1f5f9] text-[#334155]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <header className="border-b border-[#e2e8f0] bg-white">
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-[#1e40af] text-[10px] font-extrabold uppercase text-white">
              CS
            </div>
            <p className="text-[22px] font-extrabold text-[#111827]">
              Computer Science Program
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              aria-label="Notifications"
              className="rounded-md p-2 text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-[#334155]"
            >
              <Bell size={17} strokeWidth={2.4} />
            </button>
            <div className="flex size-8 items-center justify-center rounded-full bg-[#e2e8f0] text-[11px] font-extrabold text-[#475569]">
              JD
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-[#e2e8f0] bg-[#f8fafc]">
        <div className="mx-auto flex h-12 w-full max-w-[1280px] items-end justify-center px-6">
          <button className="relative pb-2 text-[13px] font-bold text-[#1d4ed8]">
            Course Registration
            <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#1d4ed8]" />
          </button>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1240px] px-6 py-10">
        <section className="mx-auto max-w-[980px] rounded-2xl bg-gradient-to-r from-[#4f46e5] to-[#1e40af] px-8 py-9 text-center text-white shadow-xl shadow-blue-900/20">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#bfdbfe]">
            <span
              className={`size-2 rounded-full ${
                registrationStatus === "closed"
                  ? "bg-[#facc15]"
                  : "bg-[#22c55e]"
              }`}
            />
            {statusLabel}
          </p>
          <h1 className="mt-4 text-[48px] font-extrabold tracking-tight">
            {bannerHeading}
          </h1>

          <div className="mt-6 flex items-center justify-center gap-5">
            {[
              {
                label: "DAYS",
                value:
                  registrationStatus === "closed" && countdownTotalSeconds === 0
                    ? 0
                    : countdown.days,
              },
              {
                label: "HOURS",
                value:
                  registrationStatus === "closed" && countdownTotalSeconds === 0
                    ? 0
                    : countdown.hours,
              },
              {
                label: "MINS",
                value:
                  registrationStatus === "closed" && countdownTotalSeconds === 0
                    ? 0
                    : countdown.minutes,
              },
              {
                label: "SECS",
                value:
                  registrationStatus === "closed" && countdownTotalSeconds === 0
                    ? 0
                    : countdown.seconds,
              },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/10 text-[35px] font-extrabold backdrop-blur-sm">
                  {String(item.value).padStart(2, "0")}
                </div>
                <p className="mt-2 text-[10px] font-bold tracking-[0.2em] text-[#bfdbfe]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-6 max-w-[700px] text-[13px] font-medium leading-relaxed text-[#dbeafe]">
            {bannerBody}
          </p>
        </section>

        <section className="mx-auto mt-6 grid max-w-[1008px] grid-cols-2 overflow-hidden rounded-xl border border-[#dbe4ef] bg-white shadow-sm md:grid-cols-4">
          {summaryStats.map((stat, index) => (
            <article
              key={stat.label}
              className={`px-4 py-3 ${index < summaryStats.length - 1 ? "border-r border-[#e2e8f0]" : ""}`}
            >
              <p className="text-[11px] font-semibold text-[#64748b]">
                {stat.label}
              </p>
              <p
                className={`mt-1 text-[34px] font-extrabold ${stat.valueClass}`}
              >
                {stat.value}
              </p>
            </article>
          ))}
        </section>

        <section className="mx-auto mt-8 max-w-[1008px] rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e8f0] px-4 py-4">
            <label className="relative block w-full md:w-[340px]">
              <Search
                size={15}
                strokeWidth={2.5}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />
              <input
                className="w-full rounded-md border border-[#e2e8f0] bg-[#f8fafc] py-2 pl-10 pr-3 text-[12px] font-medium text-[#334155] outline-none"
                placeholder="Search by name or student ID..."
              />
            </label>

            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1 rounded-md border border-[#dbe4ef] px-3 py-2 text-[12px] font-semibold text-[#334155]">
                <Filter size={13} strokeWidth={2.4} />
                Filter
              </button>
              <button className="inline-flex items-center gap-1 rounded-md border border-[#dbe4ef] px-3 py-2 text-[12px] font-semibold text-[#334155]">
                <Upload size={13} strokeWidth={2.4} />
                Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px]">
              <thead className="bg-[#f8fafc] text-left text-[10px] font-extrabold uppercase tracking-wider text-[#64748b]">
                <tr>
                  <th className="px-4 py-3">Student Name & ID</th>
                  <th className="px-4 py-3">Registration Date</th>
                  <th className="px-4 py-3">Credit Units</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] bg-white">
                {selectedStudent ? (
                  <tr className="bg-[#dbe4ff]">
                    <td className="px-4 py-3">
                      <p className="text-[13px] font-extrabold text-[#1f2937]">
                        {selectedStudent.name}
                      </p>
                      <p className="text-[10px] font-medium text-[#64748b]">
                        ID: {selectedStudent.studentId}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[12px] font-semibold text-[#334155]">
                      {selectedStudent.registrationDate}
                    </td>
                    <td className="px-4 py-3 text-[12px] font-semibold text-[#334155]">
                      {selectedStudent.creditUnits}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusBadge(selectedStudent.status)}`}
                      >
                        {selectedStudent.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-[12px] font-bold text-[#1d4ed8]">
                      View Details
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#e2e8f0] bg-white">
            <button
              onClick={() => setIsAuditExpanded((prev) => !prev)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-7 items-center justify-center rounded-md bg-[#e2e8f0] text-[#1d4ed8]">
                  <ShieldCheck size={14} strokeWidth={2.4} />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748b]">
                    Enrollment Audit
                  </p>
                  <p className="text-[22px] font-extrabold text-[#1f2937]">
                    Semester Course List (300-Level)
                  </p>
                </div>
              </div>
              <ChevronDown
                size={16}
                strokeWidth={2.7}
                className={`text-[#94a3b8] transition-transform ${isAuditExpanded ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {isAuditExpanded ? (
            <div className="border-t border-[#e2e8f0] px-4 pb-4">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px]">
                  <thead className="text-left text-[10px] font-extrabold uppercase tracking-wider text-[#94a3b8]">
                    <tr>
                      <th className="px-3 py-3">Course Code</th>
                      <th className="px-3 py-3">Course Title</th>
                      <th className="px-3 py-3">Units</th>
                      <th className="px-3 py-3 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-[12px] font-semibold text-[#334155]">
                    {auditedCourses.map((course, index) => (
                      <tr key={`${course.code}-${index}`}>
                        <td className="px-3 py-3 font-extrabold text-[#1d4ed8]">
                          {course.code}
                        </td>
                        <td className="px-3 py-3">{course.title}</td>
                        <td className="px-3 py-3">{course.units.toFixed(1)}</td>
                        <td className="px-3 py-3 text-right">
                          <span className="rounded-full bg-[#dcfce7] px-2 py-1 text-[9px] font-extrabold text-[#16a34a]">
                            {course.verification}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-md bg-[#f8fafc] px-3 py-3 text-[12px] font-semibold">
                <p className="text-[#64748b]">
                  TOTAL AUDITED UNITS:{" "}
                  <span className="font-extrabold text-[#1d4ed8]">19</span>
                </p>
                <button className="font-bold text-[#1d4ed8]">
                  View Student Transcript
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="mx-auto mt-4 flex max-w-[1008px] flex-col items-stretch gap-3 md:flex-row md:items-center">
          <textarea
            value={reviewNote}
            onChange={(event) => setReviewNote(event.target.value)}
            placeholder="Enter reason for rejection or special approval instructions..."
            className="h-14 flex-1 resize-none rounded-md border border-[#d1d9e6] bg-white px-3 py-3 text-[12px] font-medium text-[#334155] outline-none"
          />

          <button className="inline-flex items-center justify-center gap-2 rounded-md border border-[#fecaca] bg-[#fff1f2] px-5 py-2.5 text-[12px] font-extrabold text-[#dc2626]">
            <X size={14} strokeWidth={2.6} />
            Reject Registration
          </button>

          <button className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1d4ed8] px-5 py-2.5 text-[12px] font-extrabold text-white shadow-sm shadow-blue-200">
            <Check size={14} strokeWidth={2.6} />
            Approve
          </button>
        </section>

        <section className="mx-auto mt-4 max-w-[980px] overflow-hidden rounded-md bg-[#f8fafc]">
          {studentRows.slice(1).map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[2fr_2fr_1.5fr_1.6fr_1fr] items-center border-b border-[#e2e8f0] px-4 py-3 text-[12px]"
            >
              <div>
                <p className="font-extrabold text-[#1f2937]">{row.name}</p>
                <p className="text-[10px] font-medium text-[#94a3b8]">
                  ID: {row.studentId}
                </p>
              </div>
              <p className="font-semibold text-[#334155]">
                {row.registrationDate}
              </p>
              <p className="font-semibold text-[#334155]">{row.creditUnits}</p>
              <p>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusBadge(row.status)}`}
                >
                  {row.status}
                </span>
              </p>
              <button className="text-left font-bold text-[#94a3b8]">
                View Details
              </button>
            </div>
          ))}
        </section>

        <section className="mx-auto mt-6 flex max-w-[1008px] flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dbe4ef] bg-white px-4 py-3 text-[12px]">
          <p className="font-medium text-[#64748b]">
            Showing 1 to 4 of 24 entries
          </p>
          <div className="inline-flex items-center gap-1">
            <button className="rounded border border-[#e2e8f0] px-3 py-1.5 text-[#334155]">
              Previous
            </button>
            <button className="rounded bg-[#1d4ed8] px-3 py-1.5 font-bold text-white">
              1
            </button>
            <button className="rounded border border-[#e2e8f0] px-3 py-1.5 text-[#334155]">
              2
            </button>
            <button className="rounded border border-[#e2e8f0] px-3 py-1.5 text-[#334155]">
              3
            </button>
            <button className="rounded border border-[#e2e8f0] px-3 py-1.5 text-[#334155]">
              Next
            </button>
          </div>
        </section>

        <section className="mx-auto mt-4 max-w-[1008px] rounded-xl border border-[#bfd0ea] bg-[#eff6ff] px-4 py-4">
          <p className="inline-flex items-center gap-2 text-[13px] font-extrabold text-[#1d4ed8]">
            <TriangleAlert size={14} strokeWidth={2.5} />
            Advisor Note
          </p>
          <p className="mt-2 text-[12px] font-medium leading-relaxed text-[#475569]">
            Please ensure students have met all prerequisite requirements for
            CS305 (AI) before approving their registration. Several students
            have missing credits from CS202.
          </p>
        </section>
      </main>
    </div>
  );
}
