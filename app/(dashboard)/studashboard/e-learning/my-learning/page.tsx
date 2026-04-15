"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Grid3X3, List } from "lucide-react";
import DashboardNavbar from "@/app/components/dashboard/student/DashboardNavbar";
import DashboardSidebar from "@/app/components/dashboard/student/DashboardSidebar";
import { MY_LEARNING_COURSES, type LearningCourse } from "./courseData";

type SortOption = "recent" | "progress-high" | "progress-low" | "az";
type ViewMode = "grid" | "list";
const COURSE_DATA = MY_LEARNING_COURSES;

function sortCourses(courses: LearningCourse[], sortBy: SortOption) {
  const sorted = [...courses];

  switch (sortBy) {
    case "progress-high":
      sorted.sort((a, b) => b.progress - a.progress);
      break;
    case "progress-low":
      sorted.sort((a, b) => a.progress - b.progress);
      break;
    case "az":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "recent":
    default:
      sorted.sort((a, b) => a.activitySortValue - b.activitySortValue);
      break;
  }

  return sorted;
}

function normalizeCourseText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function matchesIncomingCourse(course: LearningCourse, query: string) {
  const normalizedQuery = normalizeCourseText(query);
  if (!normalizedQuery) return false;

  const candidates = [course.code, course.title, course.slug].map(
    normalizeCourseText,
  );

  return candidates.some(
    (candidate) =>
      candidate.includes(normalizedQuery) ||
      normalizedQuery.includes(candidate),
  );
}

function ProgressCircle({
  progress,
  color,
  size = 58,
  strokeWidth = 7,
}: {
  progress: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        className="-rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#dbe4ef"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">
        {progress}%
      </span>
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const incomingCourseQuery = searchParams.get("course")?.trim() ?? "";

  const courses = useMemo(() => {
    const sorted = sortCourses(COURSE_DATA, sortBy);
    if (!incomingCourseQuery) return sorted;

    const matchIndex = sorted.findIndex((course) =>
      matchesIncomingCourse(course, incomingCourseQuery),
    );

    if (matchIndex <= 0) return sorted;

    const next = [...sorted];
    const [matchedCourse] = next.splice(matchIndex, 1);
    next.unshift(matchedCourse);
    return next;
  }, [sortBy, incomingCourseQuery]);

  const highlightedCourseId = useMemo(() => {
    if (!incomingCourseQuery) return null;

    const matched = courses.find((course) =>
      matchesIncomingCourse(course, incomingCourseQuery),
    );
    return matched?.id ?? null;
  }, [courses, incomingCourseQuery]);

  const openCourse = (course: LearningCourse) => {
    router.push(
      `/studashboard/e-learning/my-learning/${course.slug}/course-overview`,
    );
  };

  return (
    <div className="h-screen overflow-hidden bg-[#F8F6F6] font-sans">
      <DashboardNavbar />

      <div className="flex min-h-0" style={{ height: "calc(100vh - 70px)" }}>
        <DashboardSidebar desktopSticky />

        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-8 mt-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-[#10182d]">
                  My Learning
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  Understanding all of your semester courses
                </p>
                {incomingCourseQuery && highlightedCourseId ? (
                  <p className="mt-2 inline-flex items-center rounded-full bg-[#eaf0ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#1f43b2]">
                    Course from Course Control prioritized:{" "}
                    {incomingCourseQuery}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-3 self-start rounded-2xl border border-[#dce5f1] bg-white p-2 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      viewMode === "grid"
                        ? "bg-white text-[#111827] shadow-sm"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    }`}
                  >
                    <Grid3X3 size={14} />
                    <span>Grid</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      viewMode === "list"
                        ? "bg-white text-[#111827] shadow-sm"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    }`}
                  >
                    <List size={14} />
                    <span>List</span>
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value as SortOption)
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-[0.06em] text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500"
                  aria-label="Sort my learning courses"
                >
                  <option value="recent">Sort by recent</option>
                  <option value="progress-high">Progress high to low</option>
                  <option value="progress-low">Progress low to high</option>
                  <option value="az">Course title A-Z</option>
                </select>
              </div>
            </div>

            {viewMode === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {courses.slice(0, 8).map((course) => {
                  const Icon = course.icon;

                  return (
                    <article
                      key={course.id}
                      typeof="button"
                      onClick={() => openCourse(course)}
                      className={`group flex h-full flex-col rounded-[24px] border bg-white p-5 shadow-[0_1px_0_rgba(16,24,40,0.02)] transition duration-300 hover:-translate-y-0.5 hover:border-[#ccd6ea] hover:shadow-[0_14px_30px_rgba(16,24,40,0.09)] ${
                        highlightedCourseId === course.id
                          ? "border-[#2b4fbf] ring-2 ring-[#2b4fbf]/20"
                          : "border-[#dfe4ee]"
                      }`}
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <ProgressCircle
                          progress={course.progress}
                          color={course.progressColor}
                          size={62}
                          strokeWidth={7}
                        />
                        <div
                          className={`rounded-full p-2.5 ${course.accentBgClass}`}
                        >
                          <Icon
                            className={`h-4 w-4 ${course.accentTextClass}`}
                          />
                        </div>
                      </div>

                      <p
                        className={`text-sm font-semibold ${course.accentTextClass}`}
                      >
                        {course.code}
                      </p>
                      <h2 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight text-[#111c32]">
                        {course.title}
                      </h2>
                      <p className="mt-2 min-h-14 text-sm leading-6 text-slate-600">
                        {course.description}
                      </p>

                      <div className="mt-auto pt-8">
                        <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${course.progress}%`,
                              backgroundColor: course.progressColor,
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8b94a6]">
                          <span>
                            {course.completedModules} of {course.totalModules}{" "}
                            modules
                          </span>
                          <button
                            type="button"
                            onClick={() => openCourse(course)}
                            className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.06em] ${course.accentTextClass} transition hover:translate-x-0.5`}
                          >
                            Continue <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => {
                  const Icon = course.icon;

                  return (
                    <article
                      key={course.id}
                      onClick={() => openCourse(course)}
                      className={`group flex flex-col gap-4 rounded-2xl border bg-white px-4 py-4 transition duration-300 hover:border-[#ccd6ea] hover:shadow-[0_12px_25px_rgba(16,24,40,0.08)] md:flex-row md:items-center ${
                        highlightedCourseId === course.id
                          ? "border-[#2b4fbf] ring-2 ring-[#2b4fbf]/20"
                          : "border-[#dfe4ee]"
                      }`}
                    >
                      <div className={`rounded-xl p-3 ${course.accentBgClass}`}>
                        <Icon className={`h-5 w-5 ${course.accentTextClass}`} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-semibold ${course.accentTextClass}`}
                        >
                          {course.code}
                        </p>
                        <h2 className="truncate text-xl font-bold leading-tight tracking-tight text-[#111c32]">
                          {course.title}
                        </h2>
                        <p className="text-sm text-slate-600">
                          Last activity: {course.lastActivity}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 self-end md:self-auto">
                        <div className="hidden min-w-[140px] md:block">
                          <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                            <span>Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${course.progress}%`,
                                backgroundColor: course.progressColor,
                              }}
                            />
                          </div>
                        </div>

                        <ProgressCircle
                          progress={course.progress}
                          color={course.progressColor}
                          size={56}
                          strokeWidth={7}
                        />

                        <button
                          type="button"
                          onClick={() => openCourse(course)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2b4fbf] text-white transition hover:-translate-y-0.5 hover:bg-[#1f43b2]"
                          aria-label={`Open ${course.title}`}
                        >
                          <ArrowRight className="h-5 w-5" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
