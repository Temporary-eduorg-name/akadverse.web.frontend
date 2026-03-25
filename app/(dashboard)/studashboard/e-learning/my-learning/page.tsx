"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Braces,
  Cloud,
  Database,
  Grid3X3,
  List,
  MonitorPlay,
  Network,
  Palette,
  Shield,
  Sparkles,
  Cpu,
} from "lucide-react";

type SortOption = "recent" | "progress-high" | "progress-low" | "az";
type ViewMode = "grid" | "list";

type LearningCourse = {
  id: string;
  code: string;
  slug: string;
  title: string;
  description: string;
  progress: number;
  completedModules: number;
  totalModules: number;
  lastActivity: string;
  activitySortValue: number;
  icon: React.ElementType;
  ringClass: string;
  accentTextClass: string;
  accentBgClass: string;
};

const COURSE_DATA: LearningCourse[] = [
  {
    id: "csc-301",
    code: "CSC 301",
    slug: "software-engineering",
    title: "Software Engineering",
    description:
      "Master CI/CD pipelines and enterprise system design principles for scale.",
    progress: 65,
    completedModules: 13,
    totalModules: 20,
    lastActivity: "2 hours ago",
    activitySortValue: 2,
    icon: MonitorPlay,
    ringClass: "ring-blue",
    accentTextClass: "text-blue-600",
    accentBgClass: "bg-blue-50",
  },
  {
    id: "csc-303",
    code: "CSC 303",
    slug: "cloud-infrastructure",
    title: "Cloud Infrastructure",
    description:
      "Scaling applications using AWS, Azure, and Google Cloud Platform.",
    progress: 65,
    completedModules: 14,
    totalModules: 16,
    lastActivity: "3 days ago",
    activitySortValue: 72,
    icon: Cloud,
    ringClass: "ring-indigo",
    accentTextClass: "text-indigo-600",
    accentBgClass: "bg-indigo-50",
  },
  {
    id: "csc-315",
    code: "CSC 315",
    slug: "cybersecurity-basics",
    title: "Cybersecurity Basics",
    description:
      "Fundamental concepts of network security, crypto, and ethical hacking.",
    progress: 100,
    completedModules: 3,
    totalModules: 12,
    lastActivity: "Yesterday",
    activitySortValue: 24,
    icon: Shield,
    ringClass: "ring-pink",
    accentTextClass: "text-pink-600",
    accentBgClass: "bg-pink-50",
  },
  {
    id: "csc-401",
    code: "CSC 401",
    slug: "full-stack-development",
    title: "Full Stack Development",
    description:
      "Build modern responsive apps with React, Node.js, and MongoDB.",
    progress: 75,
    completedModules: 8,
    totalModules: 20,
    lastActivity: "4 days ago",
    activitySortValue: 96,
    icon: Braces,
    ringClass: "ring-violet",
    accentTextClass: "text-violet-600",
    accentBgClass: "bg-violet-50",
  },
  {
    id: "csc-203",
    code: "CSC 203",
    slug: "computer-graphics",
    title: "Computer Graphics",
    description:
      "3D rendering pipelines, shaders, and geometry processing basics.",
    progress: 45,
    completedModules: 2,
    totalModules: 18,
    lastActivity: "5 days ago",
    activitySortValue: 120,
    icon: Palette,
    ringClass: "ring-amber",
    accentTextClass: "text-amber-600",
    accentBgClass: "bg-amber-50",
  },
  {
    id: "csc-304",
    code: "CSC 304",
    slug: "database-systems",
    title: "Database Systems",
    description:
      "Relational algebra, SQL optimization, and NoSQL architecture.",
    progress: 100,
    completedModules: 7,
    totalModules: 14,
    lastActivity: "Oct 24, 2024",
    activitySortValue: 999,
    icon: Database,
    ringClass: "ring-green",
    accentTextClass: "text-green-600",
    accentBgClass: "bg-green-50",
  },
  {
    id: "csc-302",
    code: "CSC 302",
    slug: "deep-learning-ai-ethics",
    title: "Artificial Intelligence",
    description:
      "Search algorithms, logic programming, and machine learning foundations.",
    progress: 67,
    completedModules: 12,
    totalModules: 15,
    lastActivity: "Yesterday",
    activitySortValue: 24,
    icon: Sparkles,
    ringClass: "ring-purple",
    accentTextClass: "text-purple-600",
    accentBgClass: "bg-purple-50",
  },
  {
    id: "csc-305",
    code: "CSC 305",
    slug: "computer-networks",
    title: "Computer Networks",
    description:
      "TCP/IP stack, routing protocols, and network performance analysis.",
    progress: 100,
    completedModules: 4,
    totalModules: 12,
    lastActivity: "Oct 20, 2024",
    activitySortValue: 1005,
    icon: Network,
    ringClass: "ring-orange",
    accentTextClass: "text-orange-600",
    accentBgClass: "bg-orange-50",
  },
  {
    id: "csc-306",
    code: "CSC 306",
    slug: "operating-systems",
    title: "Operating Systems",
    description:
      "Processes, scheduling, memory management, and concurrency control.",
    progress: 45,
    completedModules: 6,
    totalModules: 16,
    lastActivity: "Oct 15, 2024",
    activitySortValue: 1012,
    icon: Cpu,
    ringClass: "ring-deep-purple",
    accentTextClass: "text-fuchsia-700",
    accentBgClass: "bg-fuchsia-50",
  },
];

const sortCourses = (
  courses: LearningCourse[],
  sortBy: SortOption,
): LearningCourse[] => {
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
};

const ProgressRing = ({
  progress,
  ringClass,
}: {
  progress: number;
  ringClass: string;
}) => {
  return (
    <div
      className={`relative h-11 w-11 rounded-full progress-ring ${ringClass}`}
      style={{ ["--progress" as string]: `${progress}%` }}
      aria-label={`${progress}% complete`}
    >
      <div className="absolute inset-[4px] rounded-full bg-white" />
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">
        {progress}%
      </span>
    </div>
  );
};

const Page = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  // Replace with a real backend query (SWR/React Query/fetch) when API is connected.
  const courses = useMemo(() => sortCourses(COURSE_DATA, sortBy), [sortBy]);

  const openCourse = (course: LearningCourse) => {
    router.push(
      `/studashboard/e-learning/my-learning/${course.slug}/course-overview`,
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f5f9] px-4 py-6 md:px-7 md:py-9 text-slate-900">
      <div className="mx-auto max-w-[1360px]">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-[#10182d]">
              My Learning
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Understanding all of your semester courses
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white p-1 shadow-[0_3px_10px_rgba(16,24,45,0.06)]">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "grid"
                  ? "bg-[#edf0f8] text-[#111827]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "list"
                  ? "bg-[#edf0f8] text-[#111827]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              List
            </button>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="ml-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500"
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {courses.slice(0, 8).map((course) => {
              const Icon = course.icon;

              return (
                <article
                  key={course.id}
                  className="group rounded-2xl border border-[#dfe4ee] bg-white p-4 shadow-[0_1px_0_rgba(16,24,40,0.02)] transition duration-300 hover:-translate-y-0.5 hover:border-[#ccd6ea] hover:shadow-[0_14px_30px_rgba(16,24,40,0.09)]"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <ProgressRing
                      progress={course.progress}
                      ringClass={course.ringClass}
                    />
                    <div className={`rounded-full p-2 ${course.accentBgClass}`}>
                      <Icon className={`h-4 w-4 ${course.accentTextClass}`} />
                    </div>
                  </div>

                  <h2 className="text-[28px] leading-tight font-extrabold tracking-tight text-[#111c32]">
                    {course.title}
                  </h2>
                  <p className="mt-2 min-h-14 text-sm leading-6 text-slate-600">
                    {course.description}
                  </p>

                  <div className="mt-8 flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8b94a6]">
                    <span>
                      {course.completedModules} of {course.totalModules} modules
                    </span>
                    <button
                      type="button"
                      onClick={() => openCourse(course)}
                      className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.06em] ${course.accentTextClass} transition hover:translate-x-0.5`}
                    >
                      Continue <ArrowRight className="h-3.5 w-3.5" />
                    </button>
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
                  className="group flex items-center gap-4 rounded-2xl border border-[#dfe4ee] bg-white px-4 py-4 transition duration-300 hover:border-[#ccd6ea] hover:shadow-[0_12px_25px_rgba(16,24,40,0.08)]"
                >
                  <div className={`rounded-xl p-3 ${course.accentBgClass}`}>
                    <Icon className={`h-5 w-5 ${course.accentTextClass}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm ${course.accentTextClass}`}
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

                  <div className="flex items-center gap-3">
                    <ProgressRing
                      progress={course.progress}
                      ringClass={course.ringClass}
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

      <style jsx>{`
        .progress-ring {
          background: conic-gradient(
            var(--ring-color) var(--progress),
            #e9edf5 0
          );
        }

        .ring-blue {
          --ring-color: #3d63dd;
        }

        .ring-indigo {
          --ring-color: #2f5ccf;
        }

        .ring-pink {
          --ring-color: #ef476f;
        }

        .ring-violet {
          --ring-color: #7083ef;
        }

        .ring-amber {
          --ring-color: #e49a2f;
        }

        .ring-green {
          --ring-color: #1fb881;
        }

        .ring-purple {
          --ring-color: #7d56f1;
        }

        .ring-orange {
          --ring-color: #ea6b11;
        }

        .ring-deep-purple {
          --ring-color: #6c2bd9;
        }
      `}</style>
    </div>
  );
};

export default Page;
