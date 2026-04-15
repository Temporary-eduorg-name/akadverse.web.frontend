"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Lightbulb,
  Rocket,
  SlidersHorizontal,
} from "lucide-react";
import ELearningTopNav from "@/app/components/dashboard/student/ELearningTopNav";
import { MY_LEARNING_COURSES } from "../../my-learning/courseData";

const CGPA_TARGET = 3.85;
const CREDIT_TARGET = 78;
const RADIUS = 50;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const recentGrades = [
  {
    name: "Calculus II",
    subtitle: "Midterm Exam",
    grade: "A-",
    iconBg: "bg-[#ffedd5]",
    iconColor: "text-orange-600",
    symbol: "S",
  },
  {
    name: "Data Structures",
    subtitle: "Project 01",
    grade: "A+",
    iconBg: "bg-[#dbeafe]",
    iconColor: "text-blue-600",
    symbol: "</>",
  },
  {
    name: "Genetics",
    subtitle: "Lab Report",
    grade: "B+",
    iconBg: "bg-[#f3e8ff]",
    iconColor: "text-purple-600",
    symbol: "L",
  },
];

const courses = [
  {
    name: "Introduction to Machine Learning",
    code: "CS304",
    instructor: "Dr. Sarah Williams",
    category: "Technology",
    categoryTextColor: "text-[#2563eb]",
    categoryBgColor: "bg-[#eff6ff]",
    credits: "4.0",
    status: "Open",
    statusDot: "bg-[#10b981]",
    statusTextColor: "text-[#475569]",
    action: "Register",
  },
  {
    name: "Advanced Quantum Physics",
    code: "PH402",
    instructor: "Prof. Liam Chen",
    category: "Science",
    categoryTextColor: "text-[#9333ea]",
    categoryBgColor: "bg-[#faf5ff]",
    credits: "3.0",
    status: "Registered",
    statusDot: "bg-[#cbd5e1]",
    statusTextColor: "text-[#94a3b8]",
    action: "Details",
  },
  {
    name: "Entrepreneurship & Innovation",
    code: "BS101",
    instructor: "Martha Stewart",
    category: "Business",
    categoryTextColor: "text-[#ea580c]",
    categoryBgColor: "bg-[#fff7ed]",
    credits: "2.0",
    status: "Limited Spots",
    statusDot: "bg-[#f59e0b]",
    statusTextColor: "text-[#475569]",
    action: "Register",
  },
];

function getCreditBarColor(pct: number) {
  if (pct < 20) return "#ef4444";
  if (pct < 45) return "#f97316";
  if (pct < 65) return "#eab308";
  return "#0066ff";
}

export default function LearningEssentialsPage() {
  const router = useRouter();
  const [animationRatio, setAnimationRatio] = React.useState(0);
  const [myLearningCourses, setMyLearningCourses] = React.useState(() =>
    MY_LEARNING_COURSES.slice(0, 3).map((course) => ({
      title: course.title,
      progress: course.progress,
      slug: course.slug,
      status:
        course.progress >= 85
          ? "AHEAD"
          : course.progress >= 60
            ? "ACTIVE"
            : "ON TRACK",
    })),
  );

  React.useEffect(() => {
    const shuffled = [...MY_LEARNING_COURSES].sort(() => Math.random() - 0.5);
    setMyLearningCourses(
      shuffled.slice(0, 3).map((course) => ({
        title: course.title,
        progress: course.progress,
        slug: course.slug,
        status:
          course.progress >= 85
            ? "AHEAD"
            : course.progress >= 60
              ? "ACTIVE"
              : "ON TRACK",
      })),
    );
  }, []);

  React.useEffect(() => {
    const start = performance.now();
    const duration = 2600;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      setAnimationRatio(progress < 1 ? eased : 1);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const cgpaDisplay = animationRatio * CGPA_TARGET;
  const creditProgress = animationRatio * CREDIT_TARGET;
  const creditBarColor = getCreditBarColor(creditProgress);
  const creditStrokeOffset =
    CIRCUMFERENCE - (creditProgress / 100) * CIRCUMFERENCE;

  return (
    <div className="min-h-screen bg-[#f0f4f8] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mt-6">
          <div className="mb-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="mb-1 text-[30px] font-extrabold leading-9 tracking-[-0.75px] text-[#0f172a]">
                  Learning Dashboard
                </h1>
                <p className="text-[16px] leading-6 text-[#64748b]">
                  Welcome back, your performance this semester is excellent.
                </p>
              </div>
              <button className="whitespace-nowrap rounded-xl border border-[#e2e8f0] bg-white px-[17px] py-[9px] text-[14px] font-semibold text-[#475569] transition-colors hover:bg-gray-50">
                Download Report
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6 xl:flex-row">
            <div className="min-w-0 flex-1">
              <div className="mb-6 flex flex-col gap-6 2xl:flex-row">
                <div className="flex-1 rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                    <div className="shrink-0">
                      <div className="relative h-[128px] w-[128px]">
                        <svg
                          className="h-full w-full -rotate-90"
                          viewBox="0 0 128 128"
                        >
                          <circle
                            cx="64"
                            cy="64"
                            r={RADIUS}
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="10"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r={RADIUS}
                            fill="none"
                            stroke={creditBarColor}
                            strokeWidth="10"
                            strokeDasharray={CIRCUMFERENCE}
                            strokeDashoffset={creditStrokeOffset}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-[24px] font-bold leading-8 text-[#0f172a]">
                            {cgpaDisplay.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-bold uppercase leading-[15px] text-[#64748b]">
                            CGPA
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-2">
                      <p className="text-[14px] font-bold leading-5 text-[#0f172a]">
                        Credit Progress
                      </p>

                      <div className="h-3 w-full rounded-full bg-[#f1f5f9]">
                        <div
                          className="h-3 rounded-full"
                          style={{
                            width: `${creditProgress}%`,
                            backgroundColor: creditBarColor,
                            transition:
                              "width 120ms linear, background-color 180ms ease",
                          }}
                        />
                      </div>

                      <div className="flex gap-[15px] pt-4">
                        <div className="flex-1 rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] p-[13px]">
                          <p className="mb-1 text-[10px] font-bold uppercase leading-[15px] text-[#94a3b8]">
                            Status
                          </p>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-[#10b981]">✓</span>
                            <span className="text-[14px] font-bold leading-5 text-[#10b981]">
                              Distinction
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] p-[13px]">
                          <p className="mb-1 text-[10px] font-bold uppercase leading-[15px] text-[#94a3b8]">
                            Remaining
                          </p>
                          <p className="text-[14px] font-bold leading-5 text-[#0f172a]">
                            26
                          </p>
                          <p className="text-[14px] font-bold leading-5 text-[#0f172a]">
                            Credits
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-col rounded-3xl border border-[#e2e8f0] bg-white p-[25px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] 2xl:w-[193px]">
                  <h3 className="mb-4 text-[14px] font-bold leading-5 text-[#0f172a]">
                    Recent Grades
                  </h3>
                  <div className="flex-1 space-y-4">
                    {recentGrades.map((item) => (
                      <div
                        key={`${item.name}-${item.subtitle}`}
                        className="flex items-center gap-3"
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.iconBg}`}
                        >
                          <span
                            className={`text-[10px] font-bold ${item.iconColor}`}
                          >
                            {item.symbol}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-bold leading-4 text-[#0f172a]">
                            {item.name}
                          </p>
                          <p className="text-[10px] leading-[15px] text-[#64748b]">
                            {item.subtitle}
                          </p>
                        </div>
                        <span className="text-[14px] font-bold leading-5 text-[#0f172a]">
                          {item.grade}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 w-full py-2 text-center text-[10px] font-bold uppercase tracking-[1px] text-[#94a3b8] transition-colors hover:text-[#64748b]">
                    View All Records
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-[20px] font-bold leading-7 text-[#0f172a]">
                    Course Control
                  </h3>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-2 py-1 text-[12px] text-[#0f172a]">
                      All Departments
                      <ChevronDown size={14} />
                    </button>
                    <button className="p-1 text-gray-400 transition-colors hover:text-gray-600">
                      <SlidersHorizontal size={16} />
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#f8fafc]">
                        <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.5px] text-[#64748b]">
                          Course Name
                        </th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.5px] text-[#64748b]">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.5px] text-[#64748b]">
                          Credits
                        </th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.5px] text-[#64748b]">
                          Status
                        </th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.5px] text-[#64748b]">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course) => (
                        <tr
                          key={course.code}
                          className="border-t border-[#f1f5f9] transition-colors hover:bg-gray-50/40"
                        >
                          <td className="px-6 py-4">
                            <p className="text-[14px] font-bold leading-5 text-[#0f172a]">
                              {course.name}
                            </p>
                            <p className="mt-0.5 text-[10px] text-[#94a3b8]">
                              {course.code} • {course.instructor}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block rounded-full px-2 py-1 text-[10px] font-bold ${course.categoryTextColor} ${course.categoryBgColor}`}
                            >
                              {course.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[14px] text-[#0f172a]">
                            {course.credits}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2 w-2 rounded-full ${course.statusDot}`}
                              />
                              <span
                                className={`text-[10px] font-bold ${course.statusTextColor}`}
                              >
                                {course.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {course.action === "Register" ? (
                              <button className="rounded-lg bg-[#0066ff] px-4 py-1.5 text-[12px] font-bold text-white shadow-[0px_10px_15px_-3px_rgba(0,102,255,0.2),0px_4px_6px_-4px_rgba(0,102,255,0.2)] transition-colors hover:bg-[#0052cc]">
                                Register
                              </button>
                            ) : (
                              <button className="rounded-lg border border-[#e2e8f0] px-[17px] py-[7px] text-[12px] font-bold text-[#475569] transition-colors hover:bg-gray-50">
                                Details
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="w-full shrink-0 space-y-4 xl:w-[274px]">
              <div className="flex items-center gap-2">
                <Rocket size={20} className="text-[#0f172a]" />
                <h3 className="text-[18px] font-bold leading-7 text-[#0f172a]">
                  MyLearning
                </h3>
              </div>

              <div className="space-y-[15px] rounded-[15px] bg-[#e4edff] p-4">
                {myLearningCourses.map((course) => (
                  <button
                    key={`${course.title}-${course.status}`}
                    type="button"
                    onClick={() =>
                      router.push(
                        `/studashboard/e-learning/my-learning/${course.slug}/course-overview`,
                      )
                    }
                    className="w-full rounded-[13px] border border-[#e2e8f0] bg-white p-[10px] text-left transition hover:border-[#93c5fd] hover:shadow-sm"
                  >
                    <div className="mb-1 flex items-start justify-between">
                      <div className="flex h-[23px] w-[35px] items-center justify-center rounded-[9px] bg-[#eff6ff]">
                        <span className="text-[10px] font-bold text-blue-600">
                          {"{ }"}
                        </span>
                      </div>
                      <span className="rounded-sm bg-[#dcfce7] px-1.5 py-0.5 text-[7px] font-bold uppercase text-[#16a34a]">
                        {course.status}
                      </span>
                    </div>

                    <p className="mb-1 text-[11px] font-bold leading-[17px] text-[#1e293b]">
                      {course.title}
                    </p>

                    <div className="mb-1 flex items-center justify-between text-[9px]">
                      <span className="font-semibold uppercase tracking-tight text-[#94a3b8]">
                        Course Progress
                      </span>
                      <span className="font-semibold text-[#1e40af]">
                        {course.progress}%
                      </span>
                    </div>

                    <div className="h-1 w-full rounded-full bg-[#f1f5f9]">
                      <div
                        className="h-1 rounded-full bg-[#1e40af]"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </button>
                ))}
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-[#1e40af] p-5 text-white shadow-[0px_10px_15px_-3px_rgba(30,64,175,0.2),0px_4px_6px_-4px_rgba(30,64,175,0.2)] animate-float-card">
                <div className="flex items-start gap-3">
                  <div className="flex h-[47px] w-[50px] shrink-0 items-center justify-center rounded-[13px] bg-[#c7daff]">
                    <Lightbulb size={18} className="text-[#1e40af]" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-[14px] font-bold leading-5 text-white">
                      New Suggestions
                    </h4>
                    <p className="text-[7px] font-extralight leading-[11px] text-white">
                      Explore personalized course
                      <br />
                      recommendations tailored to your
                      <br />
                      career goals and interests.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
