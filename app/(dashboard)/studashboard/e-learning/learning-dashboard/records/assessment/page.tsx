"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FileBarChart2 } from "lucide-react";
import AcademicRecordsTabs from "@/src/AcademicRecordsTabs";

type ScoreValue = number | "-";

type AssessmentRow = {
  code: string;
  title: string;
  test1: ScoreValue;
  test2: ScoreValue;
  midSem: ScoreValue;
};

type RegisteredCourse = {
  code: string;
  title: string;
  units: number;
  tag: string;
};

type RegisteredCourseSnapshot = {
  semesterLabel?: string;
  courses?: RegisteredCourse[];
};

const registeredCoursesStorageKey = "studentRegisteredCourses";

const FALLBACK_REGISTERED_COURSES: RegisteredCourse[] = [
  { code: "CSC 301", title: "Software Engineering", units: 3, tag: "CORE" },
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
    code: "MTH 311",
    title: "Numerical Analysis I",
    units: 4,
    tag: "ELECTIVE",
  },
  {
    code: "CSC 307",
    title: "System Analysis & Design (Lab)",
    units: 3,
    tag: "PRACTICAL",
  },
  {
    code: "CSC 303",
    title: "Database Management Systems",
    units: 3,
    tag: "CORE",
  },
];

const GENERAL_COURSE_ROWS: AssessmentRow[] = [
  {
    code: "EDS21",
    title: "Entrepreneurial Development Studies",
    test1: "-",
    test2: "-",
    midSem: 26,
  },
  {
    code: "TMC321",
    title: "Total Man Concept",
    test1: "-",
    test2: "-",
    midSem: 24,
  },
];

function buildRegularAssessmentRows(
  courses: RegisteredCourse[],
): AssessmentRow[] {
  return courses
    .filter(
      (course) => !["EDS21", "TMC321"].includes(course.code.toUpperCase()),
    )
    .map((course) => {
      const seed = course.code
        .replace(/\s+/g, "")
        .split("")
        .reduce((sum, char) => sum + char.charCodeAt(0), 0);

      return {
        code: course.code,
        title: course.title,
        test1: 10 + (seed % 6),
        test2: 10 + ((seed * 3) % 6),
        midSem: "-",
      };
    });
}

export default function RecordsAssessmentPage() {
  const [registeredCourses, setRegisteredCourses] = useState<
    RegisteredCourse[]
  >(FALLBACK_REGISTERED_COURSES);
  const [semesterLabel, setSemesterLabel] = useState("Semester 1");

  useEffect(() => {
    const stored = window.localStorage.getItem(registeredCoursesStorageKey);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as RegisteredCourseSnapshot;
      if (parsed.semesterLabel) {
        setSemesterLabel(parsed.semesterLabel);
      }
      if (Array.isArray(parsed.courses) && parsed.courses.length > 0) {
        setRegisteredCourses(parsed.courses);
      }
    } catch {
      // Ignore malformed storage values and keep fallback dataset.
    }
  }, []);

  const assessmentRows = useMemo(() => {
    const regularRows = buildRegularAssessmentRows(registeredCourses).slice(
      0,
      6,
    );
    return [...regularRows, ...GENERAL_COURSE_ROWS];
  }, [registeredCourses]);

  return (
    <div
      className="min-h-screen bg-[#f5f7fb] text-[#334155]"
      style={{ fontFamily: "var(--font-lexend), sans-serif" }}
    >
      <main className="mx-auto max-w-[1220px] px-4 py-4 md:px-8">
        <AcademicRecordsTabs activeTab="assessment" />

        <section className="mx-auto mt-14 max-w-[980px]">
          <article className="overflow-hidden rounded-2xl border border-[#dce3ee] bg-white shadow-sm">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dce3ee] px-5 py-5">
              <h1 className="inline-flex items-center gap-2 text-[33px] font-extrabold tracking-tight text-[#1f2937]">
                <FileBarChart2
                  size={20}
                  strokeWidth={2.5}
                  className="text-[#2f55c8]"
                />
                Course Assessment Details
              </h1>
              <p className="text-[12px] font-semibold text-[#64748b]">
                Displaying {assessmentRows.length} Courses • {semesterLabel}
              </p>
            </header>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left">
                <thead className="border-b border-[#dce3ee] bg-[#f8fafc] text-[11px] font-bold uppercase tracking-[0.12em] text-[#2f55c8]">
                  <tr>
                    <th className="px-5 py-4">Course Code</th>
                    <th className="px-5 py-4">Course Title</th>
                    <th className="px-5 py-4 text-center">
                      Test 1
                      <p className="text-[10px] font-semibold normal-case tracking-normal text-[#94a3b8]">
                        (15 marks)
                      </p>
                    </th>
                    <th className="px-5 py-4 text-center">
                      Test 2
                      <p className="text-[10px] font-semibold normal-case tracking-normal text-[#94a3b8]">
                        (15 marks)
                      </p>
                    </th>
                    <th className="bg-[#f1f5f9] px-5 py-4 text-center">
                      Mid-Sem
                      <p className="text-[10px] font-semibold normal-case tracking-normal text-[#94a3b8]">
                        (30 marks)
                      </p>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0] text-[15px] font-semibold text-[#475569]">
                  {assessmentRows.map((row) => (
                    <tr key={row.code}>
                      <td className="px-5 py-4 font-extrabold text-[#334155]">
                        {row.code}
                      </td>
                      <td className="px-5 py-4">{row.title}</td>
                      <td className="px-5 py-4 text-center">{row.test1}</td>
                      <td className="px-5 py-4 text-center">{row.test2}</td>
                      <td className="bg-[#f8fafc] px-5 py-4 text-center text-[#334155]">
                        {row.midSem}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="h-20 border-t border-[#e2e8f0] bg-[#f8fafc]" />
          </article>
        </section>
      </main>
    </div>
  );
}
