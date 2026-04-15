"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { SharedCourseWorkspace } from "@/app/lib/sharedCourseWorkspace";

const FACULTY_COURSE_TABS = [
  { id: "course-overview", label: "Course Overview", href: "course-overview" },
  { id: "student-overview", label: "Student Overview", href: "student-overview" },
  { id: "learning-outcome", label: "Learning Outcome", href: "learning-outcome" },
  { id: "syllabus", label: "Syllabus", href: "syllabus" },
  { id: "weekly-focus", label: "Weekly Focus", href: "weekly-focus" },
] as const;

type FacultyCourseWorkspaceShellProps = {
  children: ReactNode;
  courseSlug: string;
  course: SharedCourseWorkspace;
};

export default function FacultyCourseWorkspaceShell({
  children,
  courseSlug,
  course,
}: FacultyCourseWorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const currentTab =
    FACULTY_COURSE_TABS.find((tab) => pathname.includes(tab.id))?.id ??
    "course-overview";

  return (
    <div className="min-h-full bg-[#F8F6F6] text-slate-900">
      <div className="border-b border-gray-200 bg-[#F8F6F6]">
        <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-8">
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
            <Link
              href="/staffdashboard/e-learning/my-learning"
              className="transition hover:text-[#2753d7]"
            >
              My Learning
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium text-gray-900">{course.code}</span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.09em] text-blue-600">
                {course.department}
              </p>
              <h3 className="text-4xl font-black text-gray-900 mb-2">
                {course.title}
              </h3>
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

      <div className="border-b border-gray-200 bg-[#F8F6F6]">
        <div className="mx-auto max-w-[1280px] overflow-x-auto px-4 md:px-8">
          <div className="flex gap-8">
            {FACULTY_COURSE_TABS.map((tab) => {
              const isActive = tab.id === currentTab;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    router.push(
                      `/staffdashboard/e-learning/my-learning/${courseSlug}/${tab.href}`,
                    )
                  }
                  className={`relative whitespace-nowrap px-1 py-4 text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-blue-600"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                  {isActive ? (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-8">
        {children}
      </div>
    </div>
  );
}
