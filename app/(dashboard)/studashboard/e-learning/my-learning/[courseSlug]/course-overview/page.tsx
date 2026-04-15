"use client";

import { BookOpen, Check, Target } from "lucide-react";
import { useParams } from "next/navigation";
import CourseLecturerAvatar from "@/app/components/dashboard/student/CourseLecturerAvatar";
import { useSharedCourseWorkspace } from "@/app/lib/useSharedCourseWorkspace";

export default function CourseOverviewPage() {
  const params = useParams<{ courseSlug: string }>();
  const courseSlug = params?.courseSlug ?? "";
  const { course, isSharedCourse } = useSharedCourseWorkspace(courseSlug);

  if (!isSharedCourse || !course) {
    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_340px]">
        <section className="rounded-3xl border border-[#dbe4ef] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <div className="mb-4 flex items-start gap-3">
            <BookOpen className="mt-1 h-6 w-6 text-blue-600" />
            <h2 className="text-[32px] font-black tracking-[-0.02em] text-gray-900">
              Course Description
            </h2>
          </div>
          <p className="mb-4 leading-relaxed text-gray-700">
            CS402: Advanced Software Engineering provides an in-depth exploration
            of contemporary software development paradigms. This course focuses on
            mastering high-level architectural patterns, building resilient and
            scalable distributed systems, and implementing advanced agile delivery
            pipelines.
          </p>
          <p className="leading-relaxed text-gray-700">
            Students will engage with complex real-world scenarios, learning to
            balance technical debt, performance optimization, and security
            considerations in a professional engineering environment. The
            curriculum emphasizes the transition from writing code to engineering
            scalable software solutions.
          </p>
        </section>

        <aside className="space-y-4 lg:row-span-2 lg:self-start">
          <div className="rounded-3xl border border-[#dbe4ef] bg-[#f8fbff] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
            <h3 className="mb-4 text-[20px] font-black tracking-[-0.02em] text-gray-900">
              Key Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-gray-600">
                  Credits
                </p>
                <p className="text-lg font-bold text-gray-900">6 Units</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-gray-600">
                  Level
                </p>
                <p className="text-lg font-bold text-gray-900">300 Level</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-gray-600">
                  Semester
                </p>
                <p className="text-lg font-bold text-gray-900">Alpha</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-gray-600">
                  Prerequisites
                </p>
                <p className="text-sm font-semibold text-blue-600">CS301</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#dbe4ef] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
            <h3 className="mb-4 text-[20px] font-black tracking-[-0.02em] text-gray-900">
              Lead Lecturer
            </h3>
            <div className="flex gap-3">
              <CourseLecturerAvatar name="Prof. Sarah Jenkins" size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900">
                  Prof. Sarah Jenkins
                </p>
                <p className="text-xs text-gray-600">
                  PhD, Software Engineering
                </p>
              </div>
            </div>
          </div>
        </aside>

        <section className="rounded-3xl border border-[#dbe4ef] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <div className="mb-4 flex items-start gap-3">
            <Target className="mt-1 h-6 w-6 text-blue-600" />
            <h2 className="text-[32px] font-black tracking-[-0.02em] text-gray-900">
              Course Objectives
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              "Design and implement microservices and serverless architectures.",
              "Evaluate software quality through advanced metrics and audits.",
              "Master CI/CD pipelines and automated testing frameworks.",
              "Apply Design Thinking and Agile methodologies to large-scale projects.",
            ].map((objective) => (
              <div
                key={objective}
                className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4"
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Check className="h-4 w-4" />
                </span>
                <p className="text-sm text-gray-700">{objective}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const leadLecturer = course.lecturers[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_340px]">
      <section className="rounded-3xl border border-[#dbe4ef] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
        <div className="mb-4 flex items-start gap-3">
          <BookOpen className="mt-1 h-6 w-6 text-blue-600" />
          <h2 className="text-[32px] font-black tracking-[-0.02em] text-gray-900">
            Course Description
          </h2>
        </div>
        {course.overview.description.map((paragraph) => (
          <p
            key={paragraph}
            className="mb-4 leading-relaxed text-gray-700 last:mb-0"
          >
            {paragraph}
          </p>
        ))}
      </section>

      <aside className="space-y-4 lg:row-span-2 lg:self-start">
        <div className="rounded-3xl border border-[#dbe4ef] bg-[#f8fbff] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <h3 className="mb-4 text-[20px] font-black tracking-[-0.02em] text-gray-900">
            Key Information
          </h3>
          <div className="space-y-4">
            {course.overview.keyDetails.map((detail) => (
              <div key={detail.label}>
                <p className="mb-1 text-xs font-semibold uppercase text-gray-600">
                  {detail.label}
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {detail.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {leadLecturer ? (
          <div className="rounded-3xl border border-[#dbe4ef] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
            <h3 className="mb-4 text-[20px] font-black tracking-[-0.02em] text-gray-900">
              Lead Lecturer
            </h3>
            <div className="flex gap-3">
              <CourseLecturerAvatar name={leadLecturer.name} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900">
                  {leadLecturer.name}
                </p>
                <p className="text-xs text-gray-600">
                  {leadLecturer.department}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </aside>

      <section className="rounded-3xl border border-[#dbe4ef] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
        <div className="mb-4 flex items-start gap-3">
          <Target className="mt-1 h-6 w-6 text-blue-600" />
          <h2 className="text-[32px] font-black tracking-[-0.02em] text-gray-900">
            Course Objectives
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {course.overview.objectives.map((objective) => (
            <div
              key={objective}
              className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4"
            >
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                <Check className="h-4 w-4" />
              </span>
              <p className="text-sm text-gray-700">{objective}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
