"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  Filter,
  Search,
  ShieldCheck,
  TriangleAlert,
  Upload,
  X,
} from "lucide-react";
import StaffDashboardShell from "@/app/components/dashboard/staff/StaffDashboardShell";

type RegistrationWindow = {
  startDateTime: string;
  endDateTime: string;
  maxAllowedUnits?: number;
};

type RegistrationStatus = "upcoming" | "open" | "closed";
type StudentStatus = "Pending Review" | "Approved" | "Action Required";
type AdvisorDecisionStatus = "pending" | "approved" | "rejected";

type StudentRecord = {
  id: string;
  name: string;
  studentId: string;
  registrationDate: string;
  creditUnits: string;
  status: StudentStatus;
};

type LevelAdvisorDecision = {
  studentId: string;
  studentName: string;
  decision: AdvisorDecisionStatus;
  note: string;
  updatedAt: string;
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
const advisorDecisionStorageKey = "levelAdvisorRegistrationDecisions";
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
    code: "CSC 323",
    title: "Compiler Construction",
    units: 2,
    verification: "REVIEW",
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

function mapStatusToDecision(status: StudentStatus): AdvisorDecisionStatus {
  if (status === "Approved") return "approved";
  if (status === "Action Required") return "rejected";
  return "pending";
}

function mapDecisionToStatus(decision: AdvisorDecisionStatus): StudentStatus {
  if (decision === "approved") return "Approved";
  if (decision === "rejected") return "Action Required";
  return "Pending Review";
}

function getStudentCourses(studentId: string) {
  if (studentId === "cs-2023-305") {
    return auditedCourses.filter((course) => course.code !== "CSC 323");
  }

  if (studentId === "cs-2023-312") {
    return auditedCourses.map((course) =>
      course.code === "CSC 323"
        ? { ...course, verification: "REVIEW" as const }
        : course,
    );
  }

  return auditedCourses;
}

export default function FacultyCourseControlPage() {
  const [countdown, setCountdown] = useState(ZERO_COUNTDOWN);
  const [registrationStatus, setRegistrationStatus] =
    useState<RegistrationStatus>("open");
  const [registrationWindow, setRegistrationWindow] = useState({
    startDateTime: DEFAULT_REGISTRATION_START,
    endDateTime: DEFAULT_REGISTRATION_DEADLINE,
  });
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(
    studentRows[0]?.id ?? null,
  );
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>(
    Object.fromEntries(studentRows.map((student) => [student.id, ""])),
  );
  const [advisorDecisions, setAdvisorDecisions] = useState<
    Record<string, LevelAdvisorDecision>
  >(() =>
    Object.fromEntries(
      studentRows.map((student) => [
        student.id,
        {
          studentId: student.studentId,
          studentName: student.name,
          decision: mapStatusToDecision(student.status),
          note: "",
          updatedAt: new Date().toISOString(),
        },
      ]),
    ),
  );

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

  useEffect(() => {
    const stored = window.localStorage.getItem(advisorDecisionStorageKey);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as LevelAdvisorDecision[];
      const nextNotes = { ...reviewNotes };

      setAdvisorDecisions((prev) => {
        const next = { ...prev };

        parsed.forEach((item) => {
          const matchedStudent = studentRows.find(
            (student) =>
              student.studentId.toLowerCase() ===
                item.studentId.toLowerCase() ||
              student.name.toLowerCase() === item.studentName.toLowerCase(),
          );
          if (!matchedStudent) return;

          next[matchedStudent.id] = {
            studentId: matchedStudent.studentId,
            studentName: matchedStudent.name,
            decision: item.decision,
            note: item.note,
            updatedAt: item.updatedAt,
          };
          nextNotes[matchedStudent.id] = item.note;
        });

        return next;
      });

      setReviewNotes(nextNotes);
    } catch {
      // Ignore malformed decision payloads.
    }
  }, []);

  useEffect(() => {
    const payload = Object.values(advisorDecisions);
    window.localStorage.setItem(
      advisorDecisionStorageKey,
      JSON.stringify(payload),
    );
  }, [advisorDecisions]);

  const studentRowsWithStatus = useMemo(
    () =>
      studentRows.map((student) => ({
        ...student,
        status: mapDecisionToStatus(
          advisorDecisions[student.id]?.decision ??
            mapStatusToDecision(student.status),
        ),
      })),
    [advisorDecisions],
  );

  const summaryStats = useMemo(() => {
    const totalPending = studentRowsWithStatus.filter(
      (student) => student.status === "Pending Review",
    ).length;
    const totalApproved = studentRowsWithStatus.filter(
      (student) => student.status === "Approved",
    ).length;
    const totalRejected = studentRowsWithStatus.filter(
      (student) => student.status === "Action Required",
    ).length;
    const totalStudents = studentRowsWithStatus.length;
    const registrationRate =
      totalStudents > 0 ? Math.round((totalApproved / totalStudents) * 100) : 0;

    return [
      {
        label: "Total Pending",
        value: String(totalPending).padStart(2, "0"),
        valueClass: "text-[#f59e0b]",
      },
      {
        label: "Total Approved",
        value: String(totalApproved).padStart(2, "0"),
        valueClass: "text-[#16a34a]",
      },
      {
        label: "Total Rejected",
        value: String(totalRejected).padStart(2, "0"),
        valueClass: "text-[#dc2626]",
      },
      {
        label: "Registration Rate",
        value: `${registrationRate}%`,
        valueClass: "text-[#0f172a]",
      },
    ];
  }, [studentRowsWithStatus]);

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
    : "bg-white/10";
  const timerTextClass = shouldShowWarningBanner
    ? "text-[#fee2e2]"
    : "text-[#bfdbfe]";
  const statusPillClass = shouldShowWarningBanner
    ? "text-[#fee2e2]"
    : "text-[#bfdbfe]";
  const statusDotClass = shouldShowWarningBanner
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
      ? "Monitoring active enrollment for the Computer Science 300-Level cohort. Review each student submission before the registration window closes."
      : registrationStatus === "upcoming"
        ? "Course registration has not opened yet. Countdown reflects the official opening time configured by admin and faculty."
        : "The registration period has ended. Contact the registry for late-registration guidance.";

  const toggleStudentDetails = (studentId: string) => {
    setExpandedStudentId((current) => (current === studentId ? null : studentId));
  };

  const handleApproveStudent = (student: StudentRecord) => {
    setAdvisorDecisions((prev) => ({
      ...prev,
      [student.id]: {
        studentId: student.studentId,
        studentName: student.name,
        decision: "approved",
        note: "",
        updatedAt: new Date().toISOString(),
      },
    }));

    setReviewNotes((prev) => ({
      ...prev,
      [student.id]: "",
    }));
  };

  const handleRejectStudent = (student: StudentRecord) => {
    const note = reviewNotes[student.id]?.trim();
    if (!note) return;

    setAdvisorDecisions((prev) => ({
      ...prev,
      [student.id]: {
        studentId: student.studentId,
        studentName: student.name,
        decision: "rejected",
        note,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  return (
    <StaffDashboardShell contentClassName="bg-[#f8f9fc] px-4 py-6 lg:px-7">
      <div className="mx-auto max-w-[1008px]">
        <section
          className={`rounded-2xl px-8 py-9 text-center text-white shadow-xl shadow-blue-900/20 ${bannerWrapperClass}`}
        >
          <p
            className={`inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-[11px] font-extrabold uppercase tracking-[0.25em] ${statusPillClass}`}
          >
            <span className={`size-2 rounded-full ${statusDotClass}`} />
            {statusLabel}
          </p>
          <h1 className="mt-4 text-[40px] font-extrabold tracking-tight sm:text-[48px]">
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
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-lg text-[35px] font-extrabold backdrop-blur-sm ${timerTileClass}`}
                >
                  {String(item.value).padStart(2, "0")}
                </div>
                <p
                  className={`mt-2 text-[10px] font-bold tracking-[0.2em] ${timerTextClass}`}
                >
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          <p
            className={`mx-auto mt-6 max-w-[700px] text-[13px] font-medium leading-relaxed ${statusPillClass}`}
          >
            {bannerBody}
          </p>
        </section>

        <section className="mt-6 grid grid-cols-2 overflow-hidden rounded-xl border border-[#dbe4ef] bg-white shadow-sm md:grid-cols-4">
          {summaryStats.map((stat, index) => (
            <article
              key={stat.label}
              className={`px-4 py-3 ${index < summaryStats.length - 1 ? "border-r border-[#e2e8f0]" : ""}`}
            >
              <p className="text-[11px] font-semibold text-[#64748b]">
                {stat.label}
              </p>
              <p className={`mt-1 text-[34px] font-extrabold ${stat.valueClass}`}>
                {stat.value}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-[#e2e8f0] px-4 py-4">
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
                {studentRowsWithStatus.map((student) => {
                  const isExpanded = expandedStudentId === student.id;
                  const studentCourses = getStudentCourses(student.id);

                  return (
                    <React.Fragment key={student.id}>
                      <tr className={isExpanded ? "bg-[#eef4ff]" : "bg-white"}>
                        <td className="px-4 py-3">
                          <p className="text-[13px] font-extrabold text-[#1f2937]">
                            {student.name}
                          </p>
                          <p className="text-[10px] font-medium text-[#64748b]">
                            ID: {student.studentId}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-[12px] font-semibold text-[#334155]">
                          {student.registrationDate}
                        </td>
                        <td className="px-4 py-3 text-[12px] font-semibold text-[#334155]">
                          {student.creditUnits}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusBadge(student.status)}`}
                          >
                            {student.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => toggleStudentDetails(student.id)}
                            className="font-bold text-[#1d4ed8]"
                          >
                            {isExpanded ? "Hide Details" : "View Details"}
                          </button>
                        </td>
                      </tr>

                      {isExpanded ? (
                        <tr className="bg-[#f8fbff]">
                          <td colSpan={5} className="px-4 py-4">
                            <div className="overflow-x-auto rounded-2xl border border-[#d8e3f0] bg-white shadow-sm">
                              <table className="w-full min-w-[820px]">
                                <thead className="text-left text-[10px] font-extrabold uppercase tracking-wider text-[#94a3b8]">
                                  <tr>
                                    <th className="px-3 py-3">Course Code</th>
                                    <th className="px-3 py-3">Course Title</th>
                                    <th className="px-3 py-3">Units</th>
                                    <th className="px-3 py-3 text-right">
                                      Verification
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e2e8f0] text-[12px] font-semibold text-[#334155]">
                                  {studentCourses.map((course) => (
                                    <tr key={`${student.id}-${course.code}`}>
                                      <td className="px-3 py-3 font-extrabold text-[#1d4ed8]">
                                        {course.code}
                                      </td>
                                      <td className="px-3 py-3">
                                        {course.title}
                                      </td>
                                      <td className="px-3 py-3">
                                        {course.units.toFixed(1)}
                                      </td>
                                      <td className="px-3 py-3 text-right">
                                        <span
                                          className={`rounded-full px-2 py-1 text-[9px] font-extrabold ${
                                            course.verification === "VALID"
                                              ? "bg-[#dcfce7] text-[#16a34a]"
                                              : "bg-[#fff7ed] text-[#d97706]"
                                          }`}
                                        >
                                          {course.verification}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>

                              <div className="border-t border-[#e2e8f0] px-4 py-4">
                                <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
                                  <textarea
                                    value={reviewNotes[student.id] ?? ""}
                                    onChange={(event) =>
                                      setReviewNotes((prev) => ({
                                        ...prev,
                                        [student.id]: event.target.value,
                                      }))
                                    }
                                    placeholder="Enter reason for rejection or special approval instructions..."
                                    className="h-14 flex-1 resize-none rounded-md border border-[#d1d9e6] bg-white px-3 py-3 text-[12px] font-medium text-[#334155] outline-none"
                                  />

                                  <button
                                    type="button"
                                    onClick={() => handleRejectStudent(student)}
                                    disabled={!reviewNotes[student.id]?.trim()}
                                    className="inline-flex items-center justify-center gap-2 rounded-md border border-[#fecaca] bg-[#fff1f2] px-5 py-2.5 text-[12px] font-extrabold text-[#dc2626] disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <X size={14} strokeWidth={2.6} />
                                    Reject
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleApproveStudent(student)}
                                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1d4ed8] px-5 py-2.5 text-[12px] font-extrabold text-white shadow-sm shadow-blue-200"
                                  >
                                    <Check size={14} strokeWidth={2.6} />
                                    Approve
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-[#bfd0ea] bg-[#eff6ff] px-4 py-4">
          <p className="inline-flex items-center gap-2 text-[13px] font-extrabold text-[#1d4ed8]">
            <TriangleAlert size={14} strokeWidth={2.5} />
            Advisor Note
          </p>
          <p className="mt-2 text-[12px] font-medium leading-relaxed text-[#475569]">
            Please ensure students have met all prerequisite requirements for
            CS305 before approving their registration. Several students have
            missing credits from CS202.
          </p>
        </section>
      </div>
    </StaffDashboardShell>
  );
}
