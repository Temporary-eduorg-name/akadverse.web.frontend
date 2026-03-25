"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";

const STUDENT = {
  name: "Alex Rivers",
  matricNumber: "STU-2023-001",
  level: "300 Level",
  faculty: "Faculty of Physical Sciences",
  department: "Computer Science",
  studentId: "49201",
};

const SESSION = {
  year: "2024/2025",
  semester: "First Semester",
};

const REGISTERED_COURSES = [
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
    code: "CSC 307",
    title: "System Analysis & Design (Lab)",
    units: 3,
    tag: "CORE",
  },
];

const TOTAL_UNITS = REGISTERED_COURSES.reduce((sum, c) => sum + c.units, 0);

function getTagStyle(tag: string) {
  if (tag === "REQUIRED")
    return "border border-[#3b82f6] text-[#1d4ed8] bg-white";
  if (tag === "GENERAL") return "bg-[#dbeafe] text-[#1d4ed8]";
  if (tag === "ELECTIVE") return "bg-[#e0e7ff] text-[#4338ca]";
  if (tag === "PRACTICAL") return "bg-[#e0f2fe] text-[#0369a1]";
  return "bg-[#f1f5f9] text-[#475569]";
}

export default function CourseRegistrationPrintPage() {
  const router = useRouter();
  const [today, setToday] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const formatted = new Date()
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      .toUpperCase();
    setToday(formatted);
  }, []);

  return (
    <div
      className="min-h-screen bg-[#f1f5f9] flex flex-col items-center py-10 px-4"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Backmake this link back to course registration / Print controls */}
      <div className="w-full max-w-[740px] flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[14px] font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
          Back to Course Registration
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-[8px] bg-[#2563eb] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1d4ed8] transition-colors"
        >
          <Printer size={15} strokeWidth={2.5} />
          Print
        </button>
      </div>

      {/* Receipt card */}
      <div
        id="print-area"
        className="relative w-full max-w-[740px] overflow-hidden rounded-[16px] bg-white shadow-lg px-10 py-10 print:shadow-none print:rounded-none print:max-w-full print:px-8 print:py-8"
      >
        <div className="pointer-events-none absolute -left-[220px] top-1/2 -translate-y-1/2 -rotate-[35deg] select-none whitespace-nowrap text-[92px] font-black tracking-[0.16em] text-[#1d4ed8]/10">
          AKADVERSE OFFICIAL
        </div>

        {/* University header */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-[52px] items-center justify-center rounded-[12px] bg-[#1d4ed8]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3L2 8l10 5 10-5-10-5zM2 13l10 5 10-5M2 18l10 5 10-5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-[22px] font-extrabold text-[#1d4ed8] leading-none">
                EduPortal University
              </h1>
              <p className="text-[12px] font-medium text-[#64748b] mt-0.5">
                Office of the Registrar &bull; Academic Division
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block rounded-full bg-[#dbeafe] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#1d4ed8] mb-1">
              Registration Receipt
            </span>
            <p className="text-[15px] font-bold text-[#0f172a]">
              Course Registration Slip
            </p>
            <p className="text-[11px] text-[#64748b]">
              Session: {SESSION.year} | {SESSION.semester}
            </p>
          </div>
        </div>

        <hr className="my-6 border-[#e2e8f0]" />

        {/* Student info */}
        <div className="relative z-10 flex items-center gap-5 rounded-[12px] border border-[#e2e8f0] px-5 py-4 overflow-hidden">
          <div className="flex size-[80px] shrink-0 items-center justify-center rounded-[10px] bg-[#c7d2fe] text-[28px] font-black text-[#1d4ed8]">
            {STUDENT.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">
              Student Name
            </p>
            <p className="text-[22px] font-extrabold text-[#0f172a] leading-tight">
              {STUDENT.name}
            </p>
            <div className="mt-2 flex items-center gap-6">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#94a3b8]">
                  Matric Number
                </p>
                <p className="text-[13px] font-bold text-[#1d4ed8]">
                  {STUDENT.matricNumber}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#94a3b8]">
                  Level
                </p>
                <p className="text-[13px] font-bold text-[#0f172a]">
                  {STUDENT.level}
                </p>
              </div>
            </div>
          </div>
          <div className="border-l border-[#e2e8f0] pl-5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#94a3b8]">
              Faculty
            </p>
            <p className="text-[12px] font-semibold text-[#0f172a] mb-3">
              {STUDENT.faculty}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#94a3b8]">
              Department
            </p>
            <p className="text-[12px] font-semibold text-[#0f172a]">
              {STUDENT.department}
            </p>
          </div>
        </div>

        {/* Registered Courses */}
        <div className="relative z-10 mt-7">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex size-6 items-center justify-center rounded bg-[#dbeafe]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  stroke="#1d4ed8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="text-[17px] font-bold text-[#0f172a]">
              Registered Courses
            </h2>
          </div>
          <div className="overflow-hidden rounded-[10px] border border-[#e2e8f0]">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc] text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">
                <tr>
                  <th className="px-4 py-3">Course Code</th>
                  <th className="px-4 py-3">Course Title</th>
                  <th className="px-4 py-3">Units</th>
                  <th className="px-4 py-3 text-right">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9] text-[13px]">
                {REGISTERED_COURSES.map((course) => (
                  <tr key={course.code} className="bg-white">
                    <td className="px-4 py-3 font-bold text-[#1d4ed8]">
                      {course.code}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#334155]">
                      {course.title}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#334155]">
                      {course.units}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${getTagStyle(course.tag)}`}
                      >
                        {course.tag}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-[#f8fafc]">
                  <td
                    colSpan={2}
                    className="px-4 py-3 text-[13px] font-bold text-[#0f172a]"
                  >
                    Total Units Registered
                  </td>
                  <td className="px-4 py-3 text-[16px] font-extrabold text-[#1d4ed8]">
                    {TOTAL_UNITS}
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Signature section */}
        <div className="relative z-10 mt-10 flex items-end justify-between gap-6">
          <div className="flex-1 text-center">
            <div className="h-px w-full bg-[#cbd5e1] mb-2" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#94a3b8]">
              Level Advisor Approval
            </p>
          </div>
          <div className="flex-1 text-center">
            <div className="h-px w-full bg-[#cbd5e1] mb-2" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#94a3b8]">
              HOD Approval &amp; Stamp
            </p>
          </div>
        </div>

        <p className="relative z-10 mt-8 text-center text-[9px] font-semibold uppercase tracking-widest text-[#94a3b8]">
          Generated on: {today || "--"} &bull; EduPortal University Management
          System
        </p>

        <div className="relative z-10 mt-4 flex justify-center print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-full border border-[#e2e8f0] px-4 py-2 text-[11px] font-semibold text-[#64748b] hover:border-[#2563eb] hover:text-[#2563eb] transition-colors"
          >
            <Printer size={13} strokeWidth={2.5} />
            Print this page
          </button>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          #print-area {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
