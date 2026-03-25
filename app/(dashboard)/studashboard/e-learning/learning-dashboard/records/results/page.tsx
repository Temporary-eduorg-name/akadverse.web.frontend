"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, History, Lock, Star } from "lucide-react";
import AcademicRecordsTabs from "@/src/AcademicRecordsTabs";

type SemesterName = "Alpha" | "Omega";

type CourseRow = {
  code: string;
  name: string;
  units: number;
  grade: string;
  status: "PASSED" | "FAILED";
};

type TermRow = {
  id: string;
  level: number;
  semester: SemesterName;
  session: string;
  resultState: "Future Session" | "Current" | "Completed";
  units?: number;
  gpa?: number;
  courses?: CourseRow[];
};

const studentProgress = {
  currentLevel: 300,
  currentSemester: "Omega" as SemesterName,
};

const termRows: TermRow[] = [
  {
    id: "500-omega",
    level: 500,
    semester: "Omega",
    session: "",
    resultState: "Future Session",
  },
  {
    id: "500-alpha",
    level: 500,
    semester: "Alpha",
    session: "",
    resultState: "Future Session",
  },
  {
    id: "400-omega",
    level: 400,
    semester: "Omega",
    session: "",
    resultState: "Future Session",
  },
  {
    id: "400-alpha",
    level: 400,
    semester: "Alpha",
    session: "",
    resultState: "Future Session",
  },
  {
    id: "300-omega",
    level: 300,
    semester: "Omega",
    session: "Academic Session 2023/2024",
    resultState: "Current",
    units: 21,
    gpa: 3.85,
    courses: [
      {
        code: "CSC 311",
        name: "Advanced Data Structures",
        units: 4,
        grade: "A",
        status: "PASSED",
      },
      {
        code: "CSC 312",
        name: "Software Engineering Principles",
        units: 3,
        grade: "A",
        status: "PASSED",
      },
      {
        code: "MAT 315",
        name: "Numerical Analysis II",
        units: 3,
        grade: "B",
        status: "PASSED",
      },
      {
        code: "CSC 314",
        name: "Database Systems Design",
        units: 4,
        grade: "A",
        status: "PASSED",
      },
      {
        code: "GNS 301",
        name: "Entrepreneurship & Innovation",
        units: 2,
        grade: "C",
        status: "PASSED",
      },
    ],
  },
  {
    id: "300-alpha",
    level: 300,
    semester: "Alpha",
    session: "Academic Session 2023/2024",
    resultState: "Completed",
    units: 18,
    gpa: 3.8,
  },
  {
    id: "200-omega",
    level: 200,
    semester: "Omega",
    session: "Academic Session 2022/2023",
    resultState: "Completed",
    units: 22,
    gpa: 3.68,
  },
  {
    id: "200-alpha",
    level: 200,
    semester: "Alpha",
    session: "Academic Session 2022/2023",
    resultState: "Completed",
    units: 20,
    gpa: 3.75,
  },
  {
    id: "100-omega",
    level: 100,
    semester: "Omega",
    session: "Academic Session 2021/2022",
    resultState: "Completed",
    units: 24,
    gpa: 3.62,
  },
  {
    id: "100-alpha",
    level: 100,
    semester: "Alpha",
    session: "Academic Session 2021/2022",
    resultState: "Completed",
    units: 22,
    gpa: 3.58,
  },
];

const semesterOrder: Record<SemesterName, number> = { Alpha: 1, Omega: 2 };

function isFutureTerm(term: TermRow) {
  if (term.level > studentProgress.currentLevel) return true;
  if (term.level < studentProgress.currentLevel) return false;
  return (
    semesterOrder[term.semester] >
    semesterOrder[studentProgress.currentSemester]
  );
}

function gradeColor(grade: string) {
  if (grade === "A") return "text-[#16a34a]";
  if (grade === "B") return "text-[#1d4ed8]";
  if (grade === "C") return "text-[#ea580c]";
  return "text-[#475569]";
}

function GaugeMeter({
  value,
  label,
  bgColor,
}: {
  value: number;
  label: string;
  bgColor: string;
}) {
  const clampedValue = Math.min(Math.max(value, 0), 5);

  function getDialColor(val: number) {
    if (val < 1.5) return "#dc2626";
    if (val < 2.4) return "#f97316";
    if (val < 3.5) return "#f59e0b";
    if (val < 4.5) return "#0891b2";
    if (val < 5.0) return "#059669";
    return "#10b981";
  }

  const majorTicks: {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }[] = [];
  const minorTicks: {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }[] = [];
  const tickLabels: { id: string; x: number; y: number; text: string }[] = [];

  for (let i = 0; i <= 5; i++) {
    const angle = 180 + (i / 5) * 180;
    const radians = (angle * Math.PI) / 180;
    const x1 = 160 + Math.cos(radians) * 100;
    const y1 = 160 + Math.sin(radians) * 100;
    const x2 = 160 + Math.cos(radians) * 85;
    const y2 = 160 + Math.sin(radians) * 85;
    majorTicks.push({ id: `major-${i}`, x1, y1, x2, y2 });
    const labelX = 160 + Math.cos(radians) * 70;
    const labelY = 160 + Math.sin(radians) * 70;
    tickLabels.push({ id: `label-${i}`, x: labelX, y: labelY, text: `${i}.0` });
  }

  for (let i = 0; i < 5; i++) {
    for (let j = 1; j < 5; j++) {
      const majorAngle = 180 + (i / 5) * 180;
      const minorAngle = majorAngle + (j * 36) / 5;
      const radians = (minorAngle * Math.PI) / 180;
      const x1 = 160 + Math.cos(radians) * 100;
      const y1 = 160 + Math.sin(radians) * 100;
      const x2 = 160 + Math.cos(radians) * 92;
      const y2 = 160 + Math.sin(radians) * 92;
      minorTicks.push({ id: `minor-${i}-${j}`, x1, y1, x2, y2 });
    }
  }

  const containerId = label.replace(/\s+/g, "");
  const targetOffset = 314.16 - (clampedValue / 5.0) * 314.16;
  const targetAngle = -90 + (clampedValue / 5.0) * 180;

  const [displayValue, setDisplayValue] = useState(0);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    let startValue = 0;
    const duration = 2500;
    const steps = 60;
    const increment = clampedValue / steps;
    const stepDuration = duration / steps;
    let step = 0;
    const interval = setInterval(() => {
      startValue += increment;
      step++;
      if (step >= steps) {
        startValue = clampedValue;
        clearInterval(interval);
      }
      setDisplayValue(startValue);
    }, stepDuration);
    return () => clearInterval(interval);
  }, [clampedValue]);

  const needleRef = React.useRef<SVGGElement>(null);

  React.useEffect(() => {
    if (!isMounted || !needleRef.current) return;
    needleRef.current.style.transform = `rotate(${targetAngle}deg)`;
  }, [targetAngle, isMounted]);

  return (
    <article
      className="relative flex flex-col items-center justify-center p-8 rounded-xl transition-all duration-300 hover:-translate-y-1"
      style={{
        background:
          bgColor === "bg-[#dbeafe]"
            ? "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)"
            : "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
        boxShadow:
          bgColor === "bg-[#dbeafe]"
            ? "0 4px 12px rgba(59, 130, 246, 0.15)"
            : "0 4px 12px rgba(251, 191, 36, 0.15)",
      }}
    >
      <div className="relative w-full max-w-[320px] aspect-[320/260] mx-auto flex flex-col">
        <svg viewBox="0 0 320 220" className="w-full h-auto drop-shadow-sm">
          <defs>
            <linearGradient
              id={`grad-${containerId}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop
                offset="0%"
                style={{ stopColor: "#dc2626", stopOpacity: 1 }}
              />
              <stop
                offset="20%"
                style={{ stopColor: "#f97316", stopOpacity: 1 }}
              />
              <stop
                offset="40%"
                style={{ stopColor: "#f59e0b", stopOpacity: 1 }}
              />
              <stop
                offset="60%"
                style={{ stopColor: "#0891b2", stopOpacity: 1 }}
              />
              <stop
                offset="80%"
                style={{ stopColor: "#059669", stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "#10b981", stopOpacity: 1 }}
              />
            </linearGradient>
            <radialGradient id={`bg-${containerId}`} cx="50%" cy="50%">
              <stop
                offset="0%"
                style={{ stopColor: "#f8fafc", stopOpacity: 1 }}
              />
              <stop
                offset="70%"
                style={{ stopColor: "#e2e8f0", stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "#cbd5e1", stopOpacity: 1 }}
              />
            </radialGradient>
            <filter id={`shadow-${containerId}`}>
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.3" />
            </filter>
            <filter id={`inner-shadow-${containerId}`}>
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="0" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.5" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle
            cx="160"
            cy="160"
            r="115"
            fill="#334155"
            style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.2))" }}
          />
          <circle
            cx="160"
            cy="160"
            r="105"
            fill={`url(#bg-${containerId})`}
            filter={`url(#inner-shadow-${containerId})`}
          />

          {/* Glow effect under arc */}
          {isMounted ? (
            <motion.path
              d="M 60 160 A 100 100 0 1 1 260 160"
              fill="none"
              stroke={`url(#grad-${containerId})`}
              strokeWidth="20"
              strokeLinecap="round"
              style={{ filter: "blur(8px)" }}
              opacity="0.3"
              strokeDasharray="314.16"
              initial={{ strokeDashoffset: 314.16 }}
              animate={{ strokeDashoffset: targetOffset }}
              transition={{ duration: 2.5, ease: [0.34, 1.56, 0.64, 1] }}
            />
          ) : (
            <path
              d="M 60 160 A 100 100 0 1 1 260 160"
              fill="none"
              stroke={`url(#grad-${containerId})`}
              strokeWidth="20"
              strokeLinecap="round"
              style={{ filter: "blur(8px)" }}
              opacity="0.3"
              strokeDasharray="314.16"
              strokeDashoffset="314.16"
            />
          )}

          {/* Background arc track */}
          <path
            d="M 60 160 A 100 100 0 1 1 260 160"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* Animated colored arc */}
          {isMounted ? (
            <motion.path
              d="M 60 160 A 100 100 0 1 1 260 160"
              fill="none"
              stroke={`url(#grad-${containerId})`}
              strokeWidth="18"
              strokeLinecap="round"
              strokeDasharray="314.16"
              initial={{ strokeDashoffset: 314.16 }}
              animate={{ strokeDashoffset: targetOffset }}
              transition={{ duration: 2.5, ease: [0.34, 1.56, 0.64, 1] }}
              style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" }}
            />
          ) : (
            <path
              d="M 60 160 A 100 100 0 1 1 260 160"
              fill="none"
              stroke={`url(#grad-${containerId})`}
              strokeWidth="18"
              strokeLinecap="round"
              strokeDasharray="314.16"
              strokeDashoffset="314.16"
              style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" }}
            />
          )}

          {majorTicks.map((t) => (
            <line
              key={t.id}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke="#475569"
              strokeWidth="3"
            />
          ))}
          {minorTicks.map((t) => (
            <line
              key={t.id}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
          ))}
          {tickLabels.map((t) => (
            <text
              key={t.id}
              x={t.x}
              y={t.y}
              fill="#1e293b"
              fontSize="16px"
              fontWeight="700"
              fontFamily="Segoe UI, Tahoma, Geneva, Verdana, sans-serif"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.1)" }}
            >
              {t.text}
            </text>
          ))}

          <circle
            cx="160"
            cy="160"
            r="12"
            fill="#1e293b"
            filter={`url(#shadow-${containerId})`}
          />
          <circle cx="160" cy="160" r="8" fill="#475569" />

          {/* Needle - base pinned at (160,160), tip sweeps the arc */}
          <g
            ref={needleRef}
            style={{
              transformOrigin: "160px 160px",
              transform: "rotate(-90deg)",
              transition: "transform 2.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))",
            }}
          >
            <polygon
              points="160,160 154,155 154,85 160,75 166,85 166,155"
              fill="#dc2626"
              filter={`url(#shadow-${containerId})`}
            />
          </g>

          <circle cx="160" cy="160" r="6" fill="#991b1b" />
        </svg>

        <div className="text-center" style={{ marginTop: "14px" }}>
          <div
            className="text-5xl font-bold"
            style={{ color: getDialColor(displayValue) }}
          >
            {displayValue.toFixed(2)}
          </div>
          <div
            className="text-[13px] font-semibold"
            style={{ color: "#475569", marginTop: "4px" }}
          >
            {label}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function RecordsResultsPage() {
  const initialExpanded = termRows.reduce<Record<string, boolean>>(
    (acc, term) => {
      acc[term.id] = term.id === "300-omega";
      return acc;
    },
    {},
  );
  const [expandedRows, setExpandedRows] =
    useState<Record<string, boolean>>(initialExpanded);

  const defaultSelectedTerm =
    Object.keys(initialExpanded).find((k) => initialExpanded[k]) || "300-omega";
  const [selectedTermId, setSelectedTermId] =
    useState<string>(defaultSelectedTerm);

  const toggleRow = (term: TermRow) => {
    if (isFutureTerm(term)) return;
    setExpandedRows((prev) => ({ ...prev, [term.id]: !prev[term.id] }));
    setSelectedTermId(term.id);
  };

  const handleExpandAll = () => {
    const hasCollapsed = termRows.some(
      (term) => !isFutureTerm(term) && !expandedRows[term.id],
    );
    setExpandedRows((prev) => {
      const next = { ...prev };
      termRows.forEach((term) => {
        if (!isFutureTerm(term)) next[term.id] = hasCollapsed;
      });
      return next;
    });
  };

  const stats = useMemo(() => {
    const selectedTermIndex = termRows.findIndex(
      (t) => t.id === selectedTermId,
    );
    if (selectedTermIndex === -1) return { termGpa: 0, cgpa: 0 };
    const selectedTerm = termRows[selectedTermIndex];
    const termsUpToSelected = termRows
      .slice(selectedTermIndex)
      .filter(
        (t) =>
          t.resultState !== "Future Session" &&
          t.gpa !== undefined &&
          t.units !== undefined,
      );
    let totalPoints = 0;
    let totalUnits = 0;
    termsUpToSelected.forEach((t) => {
      totalPoints += (t.gpa || 0) * (t.units || 0);
      totalUnits += t.units || 0;
    });
    const cgpa = totalUnits > 0 ? totalPoints / totalUnits : 0;
    return { termGpa: selectedTerm.gpa || 0, cgpa };
  }, [selectedTermId]);

  return (
    <div
      className="min-h-screen bg-[#f5f7fb] text-[#334155]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <main className="mx-auto max-w-[1220px] px-4 py-4 md:px-8">
        <AcademicRecordsTabs activeTab="records" />

        <section className="mx-auto mt-7 max-w-[920px]">
          <div className="grid gap-4 md:grid-cols-2">
            <GaugeMeter
              value={stats.termGpa}
              label="Grade Point Average"
              bgColor="bg-[#dbeafe]"
            />
            <GaugeMeter
              value={stats.cgpa}
              label="Cumulative GPA"
              bgColor="bg-[#fef3c7]"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button className="rounded-md bg-[#10b981] px-5 py-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-[#059669] transition">
              View Previous Results
            </button>
            <button className="rounded-md bg-[#8b5cf6] px-5 py-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-[#7c3aed] transition">
              Print Unofficial Transcript
            </button>
          </div>

          <div className="mt-10 flex items-center justify-between">
            <h2 className="text-[36px] font-extrabold tracking-tight text-[#111827]">
              Semester Results
            </h2>
            <button
              onClick={handleExpandAll}
              className="rounded-md border border-[#d1d5db] bg-white px-4 py-1.5 text-[12px] font-semibold text-[#334155]"
            >
              Expand All
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {termRows.map((term) => {
              const isFuture = isFutureTerm(term);
              const isCurrent =
                term.level === studentProgress.currentLevel &&
                term.semester === studentProgress.currentSemester;
              const isExpanded = expandedRows[term.id];

              return (
                <article
                  key={term.id}
                  className={`overflow-hidden rounded-xl border bg-white ${
                    isCurrent
                      ? "border-[#1d4ed8] shadow-[0_0_0_1px_#1d4ed8]"
                      : "border-[#e5e7eb]"
                  }`}
                >
                  <button
                    onClick={() => toggleRow(term)}
                    className="flex w-full items-center justify-between px-4 py-4 text-left"
                    disabled={isFuture}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-8 items-center justify-center rounded-md ${
                          isCurrent
                            ? "bg-[#1d4ed8] text-white"
                            : "bg-[#f1f5f9] text-[#94a3b8]"
                        }`}
                      >
                        {isFuture ? (
                          <Lock size={14} strokeWidth={2.5} />
                        ) : isCurrent ? (
                          <Star size={14} strokeWidth={2.5} />
                        ) : (
                          <History size={14} strokeWidth={2.5} />
                        )}
                      </div>
                      <div>
                        <p className="text-[14px] font-extrabold text-[#1f2937]">
                          {term.level} Level - {term.semester} Semester
                        </p>
                        <p className="text-[12px] font-medium text-[#94a3b8]">
                          {term.resultState === "Future Session"
                            ? "Future Session • Not Started"
                            : `${term.session} • ${term.resultState}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                      {term.units ? (
                        <div className="text-right">
                          <p className="text-[9px] font-extrabold uppercase tracking-wider text-[#64748b]">
                            Units
                          </p>
                          <p className="text-[18px] font-extrabold text-[#1f2937]">
                            {term.units}
                          </p>
                        </div>
                      ) : null}
                      {term.gpa ? (
                        <div className="text-right">
                          <p className="text-[9px] font-extrabold uppercase tracking-wider text-[#64748b]">
                            GPA
                          </p>
                          <p className="text-[18px] font-extrabold text-[#1d4ed8]">
                            {term.gpa.toFixed(2)}
                          </p>
                        </div>
                      ) : null}
                      {isExpanded ? (
                        <ChevronUp
                          size={16}
                          strokeWidth={2.7}
                          className="text-[#1d4ed8]"
                        />
                      ) : (
                        <ChevronDown
                          size={16}
                          strokeWidth={2.7}
                          className="text-[#94a3b8]"
                        />
                      )}
                    </div>
                  </button>

                  {isExpanded && !isFuture ? (
                    <div className="border-t border-[#eef2f7]">
                      {term.courses && term.courses.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[740px]">
                            <thead className="bg-[#f8fafc]">
                              <tr className="text-left text-[10px] font-extrabold uppercase tracking-widest text-[#64748b]">
                                <th className="px-4 py-3">Course Code</th>
                                <th className="px-4 py-3">Course Name</th>
                                <th className="px-4 py-3 text-center">Units</th>
                                <th className="px-4 py-3 text-center">Grade</th>
                                <th className="px-4 py-3 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {term.courses.map((course) => (
                                <tr
                                  key={course.code}
                                  className="border-t border-[#eef2f7] text-[13px] font-semibold text-[#1f2937]"
                                >
                                  <td className="px-4 py-3 font-extrabold text-[#1d4ed8]">
                                    {course.code}
                                  </td>
                                  <td className="px-4 py-3">{course.name}</td>
                                  <td className="px-4 py-3 text-center">
                                    {course.units}
                                  </td>
                                  <td
                                    className={`px-4 py-3 text-center font-extrabold ${gradeColor(course.grade)}`}
                                  >
                                    {course.grade}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <span className="rounded-full bg-[#d1fae5] px-3 py-1 text-[10px] font-extrabold tracking-wide text-[#047857]">
                                      {course.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="px-4 py-4 text-[13px] font-medium text-[#94a3b8]">
                          No published result rows for this semester yet.
                        </p>
                      )}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
