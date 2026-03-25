"use client";

import { use } from "react";
import { notFound, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type CourseMeta = {
  title: string;
  code: string;
  summary: string;
  department: string;
  credits: number;
};

const COURSE_META: Record<string, CourseMeta> = {
  "software-engineering": {
    title: "Advanced Software Engineering",
    code: "CS402",
    summary:
      "Master CI/CD pipelines and enterprise system design principles for scale.",
    department: "COMPUTER SCIENCE DEPARTMENT",
    credits: 6,
  },
  "cloud-infrastructure": {
    title: "Cloud Infrastructure & DevOps",
    code: "CS503",
    summary:
      "Scaling applications using AWS, Azure, and Google Cloud Platform.",
    department: "COMPUTER SCIENCE DEPARTMENT",
    credits: 4,
  },
  "cybersecurity-basics": {
    title: "Cybersecurity Fundamentals",
    code: "CS315",
    summary:
      "Fundamental concepts of network security, crypto, and ethical hacking.",
    department: "COMPUTER SCIENCE DEPARTMENT",
    credits: 5,
  },
  "full-stack-development": {
    title: "Full Stack Web Development",
    code: "CS401",
    summary: "Build modern responsive apps with React, Node.js, and MongoDB.",
    department: "COMPUTER SCIENCE DEPARTMENT",
    credits: 6,
  },
  "computer-graphics": {
    title: "Computer Graphics & Visualization",
    code: "CS203",
    summary: "3D rendering pipelines, shaders, and geometry processing basics.",
    department: "COMPUTER SCIENCE DEPARTMENT",
    credits: 5,
  },
  "database-systems": {
    title: "Advanced Database Systems",
    code: "CS304",
    summary: "Relational algebra, SQL optimization, and NoSQL architecture.",
    department: "COMPUTER SCIENCE DEPARTMENT",
    credits: 4,
  },
  "deep-learning-ai-ethics": {
    title: "Deep Learning & AI Ethics",
    code: "CS302",
    summary:
      "Search algorithms, logic programming, and machine learning foundations.",
    department: "COMPUTER SCIENCE DEPARTMENT",
    credits: 5,
  },
  "computer-networks": {
    title: "Computer Networks & Protocols",
    code: "CS305",
    summary:
      "TCP/IP stack, routing protocols, and network performance analysis.",
    department: "COMPUTER SCIENCE DEPARTMENT",
    credits: 4,
  },
  "operating-systems": {
    title: "Operating Systems Design",
    code: "CS306",
    summary:
      "Processes, scheduling, memory management, and concurrency control.",
    department: "COMPUTER SCIENCE DEPARTMENT",
    credits: 5,
  },
};

const TABS = [
  { label: "Course Overview", href: "course-overview", id: "course-overview" },
  {
    label: "Lecturer Overview",
    href: "lecturer-overview",
    id: "lecturer-overview",
  },
  {
    label: "Learning Outcome",
    href: "learning-outcomes",
    id: "learning-outcomes",
  },
  { label: "Syllabus", href: "syllabus", id: "syllabus" },
  { label: "Weekly Focus", href: "weekly-focus", id: "weekly-focus" },
];

export default function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = use(params);
  const course = COURSE_META[courseSlug];
  const pathname = usePathname();
  const router = useRouter();

  if (!course) {
    notFound();
  }

  const currentTab =
    TABS.find((tab) => pathname.includes(tab.id))?.id || "course-overview";

  return (
    <main className="min-h-screen bg-white pb-12">
      {/* Header Section */}
      <div className="border-b border-gray-200">
        <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex gap-2 text-sm text-gray-600">
            <Link
              href="/studashboard/e-learning/my-learning"
              className="hover:text-blue-600"
            >
              My Learning
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{course.code}</span>
          </div>

          {/* Title Section */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.09em] text-blue-600 mb-2">
                {course.department}
              </p>
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                {course.title}
              </h1>
              <p className="text-sm text-gray-600">
                Course Code: {course.code}
              </p>
            </div>
            <div className="shrink-0">
              <span className="inline-block rounded-full bg-blue-600 px-4 py-2 text-white text-sm font-semibold">
                {course.credits} Credit Units
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-[1280px] px-4 md:px-8">
          <div className="flex gap-8 overflow-x-auto">
            {TABS.map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    router.push(
                      `/studashboard/e-learning/my-learning/${courseSlug}/${tab.href}`,
                    )
                  }
                  className={`relative px-1 py-4 text-sm font-semibold transition-colors whitespace-nowrap ${
                    isActive
                      ? "text-blue-600"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-8">{children}</div>
    </main>
  );
}
