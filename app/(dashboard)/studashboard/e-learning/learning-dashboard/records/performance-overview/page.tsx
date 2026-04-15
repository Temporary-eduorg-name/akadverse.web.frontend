"use client";

import React from "react";
import {
  ArrowDownToLine,
  ChevronDown,
  ClipboardCheck,
  FileText,
  FileUp,
  Sigma,
  TrendingUp,
} from "lucide-react";
import AcademicRecordsTabs from "@/src/AcademicRecordsTabs";

type AssessmentItem = {
  id: string;
  title: string;
  subtitle: string;
  grade: string;
  score: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
  iconTint: string;
  iconBg: string;
};

const trendBars = [
  { blue: 42, green: 38 },
  { blue: 60, green: 38 },
  { blue: 18, green: 74 },
  { blue: 55, green: 20 },
  { blue: 40, green: 36 },
  { blue: 59, green: 45 },
  { blue: 70, green: 37 },
];

const assessments: AssessmentItem[] = [
  {
    id: "data-structures",
    title: "Data Structures",
    subtitle: "Midterm Exam",
    grade: "A",
    score: "94/100",
    icon: FileText,
    iconTint: "text-[#2563eb]",
    iconBg: "bg-[#dbeafe]",
  },
  {
    id: "discrete",
    title: "Discrete Mathematics",
    subtitle: "Assignment 4",
    grade: "A-",
    score: "91/100",
    icon: Sigma,
    iconTint: "text-[#9333ea]",
    iconBg: "bg-[#f3e8ff]",
  },
  {
    id: "ethics",
    title: "Ethics in Tech",
    subtitle: "Final Paper",
    grade: "B+",
    score: "88/100",
    icon: ClipboardCheck,
    iconTint: "text-[#d97706]",
    iconBg: "bg-[#fef3c7]",
  },
  {
    id: "cloud",
    title: "Cloud Computing",
    subtitle: "Project Alpha",
    grade: "A+",
    score: "98/100",
    icon: FileUp,
    iconTint: "text-[#4f46e5]",
    iconBg: "bg-[#e0e7ff]",
  },
];

export default function RecordsPerformanceOverviewPage() {
  return (
    <div
      className="min-h-screen bg-[#f5f7fb] text-[#334155]"
      style={{ fontFamily: "var(--font-lexend), sans-serif" }}
    >
      <main className="mx-auto max-w-[1220px] px-4 py-4 md:px-8">
        <AcademicRecordsTabs activeTab="performance" />

        <section className="mt-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-[29px] font-extrabold tracking-tight text-[#0f172a]">
                Performance Overview
              </h1>
              <p className="mt-1 text-[13px] font-medium text-[#64748b]">
                Welcome back, Alex. Your academic standing is currently
                <span className="ml-1.5 font-semibold text-[#2f55c8]">
                  Exemplary.
                </span>
              </p>
            </div>

            <button className="inline-flex items-center gap-2 rounded-lg border border-[#d7deea] bg-white px-4 py-2.5 text-[13px] font-bold text-[#1f2937] transition hover:bg-[#f8fafc]">
              <ArrowDownToLine size={14} strokeWidth={2.4} />
              Export Report
            </button>
          </div>

          <div className="mt-7 grid gap-4 md:max-w-[640px] md:grid-cols-2">
            <article className="rounded-2xl border border-[#dce3ee] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-bold text-[#64748b]">
                  Current GPA
                </p>
                <div className="flex size-8 items-center justify-center rounded-lg bg-[#dcfce7] text-[#16a34a]">
                  <TrendingUp size={12} strokeWidth={2.8} />
                </div>
              </div>
              <div className="mt-4 flex items-end gap-2">
                <p className="text-[29px] font-extrabold leading-none text-[#111827]">
                  3.85
                </p>
                <span className="rounded bg-[#dcfce7] px-2 py-1 text-[9px] font-bold text-[#16a34a]">
                  +0.05
                </span>
              </div>
              <div className="mt-5 h-[6px] rounded-full bg-[#ecfeff]">
                <div className="h-full w-[95%] rounded-full bg-[#10b981]" />
              </div>
            </article>

            <article className="rounded-2xl border border-[#dce3ee] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-bold text-[#64748b]">
                  Cumulative GPA (CGPA)
                </p>
                <div className="flex size-8 items-center justify-center rounded-lg bg-[#dbeafe] text-[#2563eb]">
                  <TrendingUp size={12} strokeWidth={2.8} />
                </div>
              </div>
              <div className="mt-4 flex items-end gap-2">
                <p className="text-[29px] font-extrabold leading-none text-[#111827]">
                  3.72
                </p>
                <span className="rounded bg-[#dcfce7] px-2 py-1 text-[9px] font-bold text-[#16a34a]">
                  +0.02
                </span>
              </div>
              <div className="mt-5 h-[6px] rounded-full bg-[#dbeafe]">
                <div className="h-full w-[90%] rounded-full bg-[#3b82f6]" />
              </div>
            </article>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <article className="rounded-2xl border border-[#dce3ee] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-[19px] font-extrabold tracking-tight text-[#111827]">
                  GPA Trend Analysis
                </h2>
                <button className="inline-flex items-center gap-2 rounded-lg border border-[#dce3ee] bg-[#f8fafc] px-3 py-2 text-[13px] font-semibold text-[#334155]">
                  All Semesters
                  <ChevronDown size={14} strokeWidth={2.3} />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div>
                  <h3 className="text-[26px] font-extrabold tracking-tight text-[#1e2a5a]">
                    Academic Performance Analysis
                  </h3>
                  <p className="mt-1 text-[13px] font-medium text-[#94a3b8]">
                    Result overview of the past 6 semesters
                  </p>
                </div>
                <button className="rounded-lg bg-[#fb923c] px-4 py-2 text-[12px] font-bold text-white">
                  Check Now
                </button>
              </div>

              <div className="mt-6 rounded-xl border border-[#e2e8f0] bg-[#ffffff] px-5 pb-4 pt-4">
                <div className="grid h-[220px] grid-rows-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border-t border-[#cfd8e3]" />
                  ))}
                </div>

                <div className="-mt-[220px] grid h-[220px] grid-cols-7 items-end gap-8 px-6 pb-0">
                  {trendBars.map((bar, index) => (
                    <div
                      key={`trend-${index}`}
                      className="flex items-end justify-center gap-1.5"
                    >
                      <div
                        className="w-3 rounded-t bg-[#1d8ded]"
                        style={{ height: `${bar.blue}%` }}
                      />
                      <div
                        className="w-3 rounded-t bg-[#19c37d]"
                        style={{ height: `${bar.green}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <aside className="rounded-2xl border border-[#dce3ee] bg-white p-6 shadow-sm">
              <h2 className="text-[17px] font-extrabold tracking-tight text-[#111827]">
                Recent Assessments
              </h2>

              <div className="mt-6 space-y-4">
                {assessments.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-xl border border-[#f1f5f9] p-3"
                    >
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${item.iconBg} ${item.iconTint}`}
                      >
                        <Icon size={16} strokeWidth={2.3} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-[#111827] truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] font-medium text-[#94a3b8]">
                          {item.subtitle}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[15px] font-extrabold text-[#111827]">
                          {item.grade}
                        </p>
                        <p className="text-[10px] font-medium text-[#94a3b8]">
                          {item.score}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button className="mt-6 w-full rounded-xl border border-[#dce3ee] py-2.5 text-[12px] font-bold text-[#64748b] transition hover:bg-[#f8fafc]">
                View All Assessments
              </button>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
