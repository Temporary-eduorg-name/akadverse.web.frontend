"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  LayoutGrid,
  BookOpen,
  FileText,
  Bell,
  Home,
  ClipboardList,
  BarChart3,
  Lightbulb,
  Rocket,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

const Page = () => {
  const router = useRouter();
  const pathname = usePathname();

  // ── Animation state ──────────────────────────────────────────
  const CGPA_TARGET = 3.85;
  const CREDIT_TARGET = 78; // percent

  const [cgpaDisplay, setCgpaDisplay] = React.useState(0);
  const [creditProgress, setCreditProgress] = React.useState(0);
  const [animationDone, setAnimationDone] = React.useState(false);

  React.useEffect(() => {
    if (animationDone) return;
    const duration = 1800; // ms
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);

      setCgpaDisplay(parseFloat((eased * CGPA_TARGET).toFixed(2)));
      setCreditProgress(Math.round(eased * CREDIT_TARGET));

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        setAnimationDone(true);
      }
    };

    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animationDone]);

  // Credit bar colour transitions: red → orange → yellow → blue
  function getCreditBarColor(pct: number): string {
    if (pct < 20) return "#ef4444";
    if (pct < 45) return "#f97316";
    if (pct < 65) return "#eab308";
    return "#0066ff";
  }

  const creditBarColor = getCreditBarColor(creditProgress);

  // ── Donut animation ──────────────────────────────────────────
  const RADIUS = 50;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const PROGRESS_PERCENT = creditProgress / 100;

  const topNavIcons = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutGrid,
      path: "/studashboard/e-learning/learning-dashboard/learning-essentials",
    },
    {
      id: "course-control",
      label: "Course Control",
      icon: BookOpen,
      path: "/studashboard/e-learning/learning-dashboard/course-control",
    },
    {
      id: "records",
      label: "Records",
      icon: FileText,
      path: "/studashboard/e-learning/learning-dashboard/records/performance-overview",
    },
    {
      id: "ideas",
      label: "Ideas",
      icon: Lightbulb,      
      path: "",
    },
  ];

  /* ── Dummy Data ── */
  const recentGrades = [
    {
      name: "Calculus II",
      subtitle: "Midterm Exam",
      grade: "A-",
      iconBg: "bg-[#ffedd5]" /* Figma: orange tint */,
      iconColor: "text-orange-600",
      symbol: "Σ",
    },
    {
      name: "Data Structures",
      subtitle: "Project 01",
      grade: "A+",
      iconBg: "bg-[#dbeafe]" /* Figma: blue tint */,
      iconColor: "text-blue-600",
      symbol: "</>",
    },
    {
      name: "Genetics",
      subtitle: "Lab Report",
      grade: "B+",
      iconBg: "bg-[#f3e8ff]" /* Figma: purple tint */,
      iconColor: "text-purple-600",
      symbol: "Λ",
    },
  ];

  const myLearningCourses = [
    { title: "Data Structures & Algos", progress: 78, status: "ON TRACK" },
    { title: "Data Structures & Algos", progress: 78, status: "ON TRACK" },
    { title: "Data Structures & Algos", progress: 78, status: "ON TRACK" },
  ];

  const courses = [
    {
      name: "Introduction to Machine Learning",
      code: "CS304",
      instructor: "Dr. Sarah Williams",
      category: "Technology",
      categoryTextColor: "text-[#2563eb]" /* Figma blue */,
      categoryBgColor: "bg-[#eff6ff]",
      credits: "4.0",
      status: "Open",
      statusDot: "bg-[#10b981]" /* Figma green */,
      statusTextColor: "text-[#475569]",
      action: "Register",
    },
    {
      name: "Advanced Quantum Physics",
      code: "PH402",
      instructor: "Prof. Liam Chen",
      category: "Science",
      categoryTextColor: "text-[#9333ea]" /* Figma purple */,
      categoryBgColor: "bg-[#faf5ff]",
      credits: "3.0",
      status: "Registered",
      statusDot: "bg-[#cbd5e1]" /* Figma gray */,
      statusTextColor: "text-[#94a3b8]",
      action: "Details",
    },
    {
      name: "Entrepreneurship & Innovation",
      code: "BS101",
      instructor: "Martha Stewart",
      category: "Business",
      categoryTextColor: "text-[#ea580c]" /* Figma orange */,
      categoryBgColor: "bg-[#fff7ed]",
      credits: "2.0",
      status: "Limited Spots",
      statusDot: "bg-[#f59e0b]" /* Figma amber */,
      statusTextColor: "text-[#475569]",
      action: "Register",
    },
  ];

  const sidebarNav = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      path: "/studashboard/e-learning/learning-dashboard/learning-essentials",
    },
    {
      id: "courses",
      label: "Courses",
      icon: BookOpen,
      path: "/studashboard/e-learning/learning-dashboard/course-control",
    },
    {
      id: "records",
      label: "Records",
      icon: ClipboardList,
      path: "/studashboard/e-learning/learning-dashboard/records/performance-overview",
    },
    { id: "mylearning", label: "Mylearning", icon: BarChart3, path: "" },
    { id: "suggestions", label: "Suggestions", icon: Lightbulb, path: "" },
  ];
  return (
    <div className="flex min-h-screen font-sans">
      {/* ─── Sidebar — fixed, z-50, above navbar ─── */}
      {/* Figma: #1e40af, 288px wide, border-r rgba(30,64,175,0.2) */}
      <aside className="w-[288px] bg-[#1e40af] text-white flex flex-col fixed top-0 left-0 h-screen z-50 border-r border-[rgba(30,64,175,0.2)]">
        {/* Header — "Learning Essentials" + compass icon */}
        <div className="px-6 pt-6 pb-5 flex items-center gap-3">
          <div className="w-10 h-10 bg-[rgba(255,255,255,0.2)] rounded-xl flex items-center justify-center flex-shrink-0">
            <svg
              width="22"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon
                points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
                fill="white"
                stroke="white"
              />
            </svg>
          </div>
          <div>
            {/* Figma: 18px Bold white */}
            <p className="font-bold text-[18px] leading-[22.5px] text-white">
              Learning Essentials
            </p>
            {/* Figma: 12px Regular white/60% */}
            <p className="font-normal text-[12px] leading-4 text-[rgba(255,255,255,0.6)]">
              Vibrant Blue Edition
            </p>
          </div>
        </div>

        {/* Back to Workspace — user explicitly requested this */}
        <div className="px-6 pb-4">
          <button
            onClick={() => router.push("/studashboard/e-learning")}
            className="flex items-center gap-2 text-[rgba(255,255,255,0.5)] hover:text-white transition-colors text-[13px]"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
        </div>

        {/* Navigation — Figma: 8px gap, px-16, py-12 per link, rounded-[12px] */}
        <nav className="flex-1 px-4 space-y-2">
          {sidebarNav.map((item) => {
            const Icon = item.icon;
            const isActive = item.path
              ? pathname === item.path || pathname.startsWith(item.path + "/")
              : false;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.path) router.push(item.path);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[16px] ${
                  isActive
                    ? "bg-[rgba(255,255,255,0.45)] text-white font-medium"
                    : "text-[rgba(255,255,255,0.8)] hover:text-white hover:bg-[rgba(255,255,255,0.1)] font-normal"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ─── Main Content — offset by sidebar width ─── */}
      {/* Figma: page bg #f0f4f8 */}
      <div className="flex-1 flex flex-col ml-[288px] bg-[#f0f4f8] min-h-screen">
        {/* Top Toolbar / Header — Figma: white, border-b #e2e8f0, 60px height */}
        <header className="h-[60px] bg-white border-b border-[#e2e8f0] flex items-center relative sticky top-0 z-40 px-6">
          {/* Left: Top toolbar icons — absolutely centered */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-10">
            {topNavIcons.map((item, index) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.path ||
                (item.id === "course-control" &&
                  pathname.startsWith(item.path + "/"));
              return (
                <button
                  key={item.id}
                  onClick={() => router.push(item.path)}
                  aria-label={item.label}
                  className={`transition-colors ${
                    isActive
                      ? "text-[#1e40af] p-2 bg-[#eff6ff] rounded-lg"
                      : "text-[#9ca3af] hover:text-[#4b5563]"
                  }`}
                >
                  <Icon size={20} strokeWidth={2.2} />
                </button>
              );
            })}
          </div>

          {/* Right: bell + user info + avatar */}
          <div className="flex items-center gap-6 ml-auto">
            {/* Notification Bell with red dot — Figma: #ef4444 dot, white border */}
            <button className="relative text-gray-500 hover:text-gray-700 p-2">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ef4444] border-2 border-white rounded-full" />
            </button>

            {/* Vertical Divider — Figma: #e2e8f0, 32px tall */}
            <div className="w-px h-8 bg-[#e2e8f0]" />

            {/* User Info + Avatar */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                {/* Figma: 14px Bold #0f172a */}
                <p className="text-[14px] font-bold text-[#0f172a] leading-5">
                  Alex Rivers
                </p>
                {/* Figma: 12px Regular #64748b */}
                <p className="text-[12px] font-normal text-[#64748b] leading-4">
                  Student ID: 49201
                </p>
              </div>
              {/* Figma: 40px avatar, rgba(30,64,175,0.1) bg, rgba(30,64,175,0.2) border */}
              <div className="w-10 h-10 rounded-full bg-[rgba(30,64,175,0.1)] border-2 border-[rgba(30,64,175,0.2)] flex items-center justify-center overflow-hidden">
                <span className="text-[#1e40af] font-bold text-sm">AR</span>
              </div>
            </div>
          </div>
        </header>

        {/* ─── Page Body ─── */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          {/* Academic Overview Title + Download Report */}
          {/* Figma: title 30px Extra Bold #0f172a, tracking -0.75px */}
          <div className="mb-8">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-[30px] font-extrabold text-[#0f172a] leading-9 tracking-[-0.75px] mb-1">
                  Academic Overview
                </h1>
                {/* Figma: 16px Regular #64748b */}
                <p className="text-[16px] font-normal text-[#64748b] leading-6">
                  Welcome back, your performance this semester is excellent.
                </p>
              </div>
              {/* Figma: white bg, #e2e8f0 border, rounded-[12px], 14px Semi Bold #475569 */}
              <button className="px-[17px] py-[9px] bg-white border border-[#e2e8f0] rounded-xl text-[14px] font-semibold text-[#475569] hover:bg-gray-50 transition-colors whitespace-nowrap">
                Download Report
              </button>
            </div>
          </div>

          {/* ──── Two-Column Master Layout ──── */}
          <div className="flex gap-6">
            {/* ── Left Column ── */}
            <div className="flex-1 min-w-0">
              {/* Academic Records: CGPA card + Recent Grades side by side */}
              {/* Figma: 24px gap between the two cards */}
              <div className="flex gap-6 mb-6">
                {/* ── CGPA & Credit Progress Card ── */}
                {/* Figma: white, #e2e8f0 border, rounded-[24px], shadow */}
                <div className="flex-1 bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
                  <div className="flex gap-5 items-center">
                    {/* Donut Chart — left side */}
                    {/* Figma: 128px circle, stroke #06f (0066ff), gray track */}
                    <div className="flex-shrink-0">
                      <div className="relative w-[128px] h-[128px]">
                        <svg
                          className="w-full h-full -rotate-90"
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
                            strokeDasharray={`${PROGRESS_PERCENT * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                            strokeLinecap="round"
                            style={{
                              transition:
                                "stroke-dasharray 0.05s linear, stroke 0.3s ease",
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          {/* Figma: 24px Bold #0f172a */}
                          <span className="text-[24px] font-bold text-[#0f172a] leading-8">
                            {animationDone ? "3.85" : cgpaDisplay.toFixed(2)}
                          </span>
                          {/* Figma: 10px Bold #64748b uppercase */}
                          <span className="text-[10px] font-bold text-[#64748b] uppercase leading-[15px]">
                            CGPA
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side: Credit Progress label + bar + status boxes */}
                    <div className="flex-1 flex flex-col gap-2">
                      {/* Figma: 14px Bold #0f172a "Credit Progress" */}
                      <p className="text-[14px] font-bold text-[#0f172a] leading-5">
                        Credit Progress
                      </p>

                      {/* Figma: 12px height, #f1f5f9 track, #06f fill, rounded-full */}
                      <div className="w-full bg-[#f1f5f9] rounded-full h-3">
                        <div
                          className="h-3 rounded-full"
                          style={{
                            width: `${creditProgress}%`,
                            backgroundColor: creditBarColor,
                            transition:
                              "width 0.05s linear, background-color 0.3s ease",
                          }}
                        />
                      </div>

                      {/* Two status boxes below — Figma: 15px gap, 16px top padding */}
                      <div className="flex gap-[15px] pt-4">
                        {/* Status box — Figma: #f8fafc bg, #f1f5f9 border, rounded-[16px], 13px padding */}
                        <div className="flex-1 bg-[#f8fafc] border border-[#f1f5f9] rounded-2xl p-[13px]">
                          {/* Figma: 10px Bold #94a3b8 uppercase "STATUS" */}
                          <p className="text-[10px] font-bold text-[#94a3b8] uppercase leading-[15px] mb-1">
                            Status
                          </p>
                          <div className="flex items-center gap-1">
                            {/* Figma: green check icon + 14px Bold #10b981 "Distinction" */}
                            <span className="text-[#10b981] text-xs">✓</span>
                            <span className="text-[14px] font-bold text-[#10b981] leading-5">
                              Distinction
                            </span>
                          </div>
                        </div>

                        {/* Remaining box — same container styling */}
                        <div className="flex-1 bg-[#f8fafc] border border-[#f1f5f9] rounded-2xl p-[13px]">
                          {/* Figma: 10px Bold #94a3b8 uppercase */}
                          <p className="text-[10px] font-bold text-[#94a3b8] uppercase leading-[15px] mb-1">
                            Remaining
                          </p>
                          {/* Figma: 14px Bold #0f172a "26\nCredits" multi-line */}
                          <p className="text-[14px] font-bold text-[#0f172a] leading-5">
                            26
                          </p>
                          <p className="text-[14px] font-bold text-[#0f172a] leading-5">
                            Credits
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Recent Grades Card ── */}
                {/* Figma: white, #e2e8f0 border, rounded-[24px], shadow, 25px padding */}
                <div className="w-[193px] flex-shrink-0 bg-white rounded-3xl p-[25px] border border-[#e2e8f0] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex flex-col">
                  {/* Figma: 14px Bold #0f172a */}
                  <h3 className="text-[14px] font-bold text-[#0f172a] leading-5 mb-4">
                    Recent Grades
                  </h3>
                  <div className="space-y-4 flex-1">
                    {recentGrades.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        {/* Figma: 32px icon box, rounded-[8px] */}
                        <div
                          className={`w-8 h-8 ${item.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}
                        >
                          <span
                            className={`text-[10px] font-bold ${item.iconColor}`}
                          >
                            {item.symbol}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          {/* Figma: 12px Bold #0f172a */}
                          <p className="text-[12px] font-bold text-[#0f172a] leading-4">
                            {item.name}
                          </p>
                          {/* Figma: 10px Regular #64748b */}
                          <p className="text-[10px] font-normal text-[#64748b] leading-[15px]">
                            {item.subtitle}
                          </p>
                        </div>
                        {/* Figma: 14px Bold #0f172a */}
                        <span className="text-[14px] font-bold text-[#0f172a] leading-5">
                          {item.grade}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Figma: 10px Bold #94a3b8 uppercase, tracking 1px, centered */}
                  <button className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[1px] mt-4 py-2 text-center w-full hover:text-[#64748b] transition-colors">
                    View All Records
                  </button>
                </div>
              </div>

              {/* ── Course Control Section ── */}
              <div className="mb-6">
                {/* Header row — outside the table card */}
                {/* Figma: 20px Bold #0f172a title, controls on right */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[20px] font-bold text-[#0f172a] leading-7">
                    Course Control
                  </h3>
                  <div className="flex items-center gap-2">
                    {/* Figma: white bg, #e2e8f0 border, rounded-[8px], 12px Regular #0f172a */}
                    <button className="flex items-center gap-1.5 px-2 py-1 bg-white border border-[#e2e8f0] rounded-lg text-[12px] font-normal text-[#0f172a]">
                      All Departments
                      <ChevronDown size={14} />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <SlidersHorizontal size={16} />
                    </button>
                  </div>
                </div>

                {/* Table Card — Figma: white, #e2e8f0 border, rounded-[24px], shadow */}
                <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden">
                  <table className="w-full text-sm">
                    {/* Figma: #f8fafc header bg, 10px Bold #64748b uppercase, tracking 0.5px */}
                    <thead>
                      <tr className="bg-[#f8fafc]">
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-[0.5px]">
                          Course Name
                        </th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-[0.5px]">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-[0.5px]">
                          Credits
                        </th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-[0.5px]">
                          Status
                        </th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold text-[#64748b] uppercase tracking-[0.5px]">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course, idx) => (
                        <tr
                          key={idx}
                          className="border-t border-[#f1f5f9] hover:bg-gray-50/40 transition-colors"
                        >
                          {/* Course Name — Figma: 14px Bold #0f172a, code 10px Regular #94a3b8 */}
                          <td className="px-6 py-4">
                            <p className="text-[14px] font-bold text-[#0f172a] leading-5">
                              {course.name}
                            </p>
                            <p className="text-[10px] font-normal text-[#94a3b8] mt-0.5">
                              {course.code} • {course.instructor}
                            </p>
                          </td>

                          {/* Category Pill — Figma: colored bg pill, 10px Bold text, rounded-full */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold ${course.categoryTextColor} ${course.categoryBgColor}`}
                            >
                              {course.category}
                            </span>
                          </td>

                          {/* Credits — Figma: 14px Regular #0f172a */}
                          <td className="px-6 py-4 text-[14px] font-normal text-[#0f172a]">
                            {course.credits}
                          </td>

                          {/* Status — Figma: dot + 10px Bold text */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${course.statusDot}`}
                              />
                              <span
                                className={`text-[10px] font-bold ${course.statusTextColor}`}
                              >
                                {course.status}
                              </span>
                            </div>
                          </td>

                          {/* Action — Figma: Register = #06f blue, Details = outlined */}
                          <td className="px-6 py-4 text-right">
                            {course.action === "Register" ? (
                              <button className="px-4 py-1.5 bg-[#0066ff] text-white text-[12px] font-bold rounded-lg shadow-[0px_10px_15px_-3px_rgba(0,102,255,0.2),0px_4px_6px_-4px_rgba(0,102,255,0.2)] hover:bg-[#0052cc] transition-colors">
                                Register
                              </button>
                            ) : (
                              <button className="px-[17px] py-[7px] border border-[#e2e8f0] text-[12px] font-bold text-[#475569] rounded-lg hover:bg-gray-50 transition-colors">
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

            {/* ── Right Column — MyLearning ── */}
            <div className="w-[274px] flex-shrink-0 space-y-4">
              {/* MyLearning heading + View all link */}
              {/* Figma: rocket icon, ~18px Bold #0f172a, "View all" #1e40af 14px Bold */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Rocket size={20} className="text-[#0f172a]" />
                  <h3 className="text-[18px] font-bold text-[#0f172a] leading-7">
                    MyLearning
                  </h3>
                </div>
              </div>

              {/* Figma: #e4edff bg wrapper, rounded-[15px] */}
              <div className="bg-[#e4edff] rounded-[15px] p-4 space-y-[15px]">
                {myLearningCourses.map((course, idx) => (
                  /* Figma: white, #e2e8f0 border 0.833px, rounded-[13.333px], 95px height */
                  <div
                    key={idx}
                    className="bg-white rounded-[13px] p-[10px] border border-[#e2e8f0]"
                  >
                    {/* Top row: icon + ON TRACK badge */}
                    <div className="flex justify-between items-start mb-1">
                      {/* Figma: #eff6ff bg, rounded-[8.75px], 35x23 */}
                      <div className="w-[35px] h-[23px] bg-[#eff6ff] rounded-[9px] flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-[10px]">
                          {"{ }"}
                        </span>
                      </div>
                      {/* Figma: #dcfce7 bg, #16a34a text, ~7px Bold uppercase */}
                      <span className="text-[7px] font-bold text-[#16a34a] bg-[#dcfce7] px-1.5 py-0.5 rounded-sm uppercase">
                        {course.status}
                      </span>
                    </div>

                    {/* Figma: ~11px Bold #1e293b */}
                    <p className="text-[11px] font-bold text-[#1e293b] leading-[17px] mb-1">
                      {course.title}
                    </p>

                    {/* Progress row — Figma: ~9px Semi Bold #94a3b8 / #1e40af */}
                    <div className="flex items-center justify-between text-[9px] mb-1">
                      <span className="font-semibold text-[#94a3b8] uppercase tracking-tight">
                        Course Progress
                      </span>
                      <span className="font-semibold text-[#1e40af]">
                        {course.progress}%
                      </span>
                    </div>

                    {/* Figma: #f1f5f9 track ~4px, #1e40af fill */}
                    <div className="w-full bg-[#f1f5f9] rounded-full h-1">
                      <div
                        className="bg-[#1e40af] h-1 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* ── New Suggestions Card ── */}
              {/* Figma: #1e40af solid bg, rounded-[16px], shadow, 93px tall, 265px wide */}
              <div className="animate-float-card bg-[#1e40af] rounded-2xl p-5 text-white shadow-[0px_10px_15px_-3px_rgba(30,64,175,0.2),0px_4px_6px_-4px_rgba(30,64,175,0.2)] relative overflow-hidden">
                <div className="flex items-start gap-3">
                  {/* Figma: #c7daff bg box, rounded-[13.333px], 50x47, with bulb icon */}
                  <div className="w-[50px] h-[47px] bg-[#c7daff] rounded-[13px] flex items-center justify-center flex-shrink-0">
                    <Lightbulb size={18} className="text-[#1e40af]" />
                  </div>
                  <div>
                    {/* Figma: 14px Bold white */}
                    <h4 className="font-bold text-[14px] leading-5 text-white mb-1">
                      New Suggestions
                    </h4>
                    {/* Figma: ~7px Extra Light white */}
                    <p className="text-[7px] font-extralight text-white leading-[11px]">
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
};

export default Page;
