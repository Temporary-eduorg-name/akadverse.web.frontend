"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
import { getSharedCourseStats } from "@/app/lib/sharedCourseWorkspace";
import { useSharedCourseWorkspace } from "@/app/lib/useSharedCourseWorkspace";

const PAGE_SIZE = 10;

export default function FacultyStudentOverviewPage() {
  const params = useParams<{ courseSlug: string }>();
  const { course, isSharedCourse } = useSharedCourseWorkspace(
    params?.courseSlug ?? "",
  );
  const [selectedProgram, setSelectedProgram] = useState("All Programs");
  const [page, setPage] = useState(1);

  const programs = useMemo(() => {
    if (!course) {
      return ["All Programs"];
    }

    return [
      "All Programs",
      ...Array.from(new Set(course.students.map((student) => student.program))),
    ];
  }, [course]);

  const filteredStudents = useMemo(() => {
    if (!course) {
      return [];
    }

    return selectedProgram === "All Programs"
      ? course.students
      : course.students.filter((student) => student.program === selectedProgram);
  }, [course, selectedProgram]);

  if (!isSharedCourse || !course) {
    return null;
  }

  const stats = getSharedCourseStats(course);
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedStudents = filteredStudents.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <div className="space-y-8">
      <section className="rounded-[30px] border border-white/70 bg-white p-6 shadow-[0_28px_55px_rgba(16,24,40,0.08)] sm:p-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#2d56d6]">
              Total Students
            </p>
            <p className="mt-4 text-2xl font-black tracking-[-0.04em] text-[#171f33]">
              {stats.totalStudents}
            </p>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#2d56d6]">
              Total Programs
            </p>
            <p className="mt-4 text-2xl font-black tracking-[-0.04em] text-[#2d56d6]">
              {stats.totalPrograms}
            </p>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#2d56d6]">
              Total Carryovers
            </p>
            <p className="mt-4 text-2xl font-black tracking-[-0.04em] text-[#e53461]">
              {stats.totalCarryovers}
            </p>
          </div>

          <div className="lg:justify-self-end">
            <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              Sort by Program
            </label>
            <div className="relative mt-3">
              <select
                value={selectedProgram}
                onChange={(event) => {
                  setSelectedProgram(event.target.value);
                  setPage(1);
                }}
                className="appearance-none rounded-full border border-[#dae4f2] bg-white px-4 py-2 pr-10 text-sm font-medium text-slate-600 outline-none transition focus:border-[#2d56d6]"
              >
                {programs.map((program) => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[34px] border border-white/70 bg-white shadow-[0_28px_60px_rgba(16,24,40,0.08)]">
        <div className="flex flex-col border-b border-[#edf2f8] px-6 py-6 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-[#171f33]">
            Student Roster
          </h2>
          <div className="flex items-center gap-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
            <span>Section: {course.section}</span>
            <span className="hidden h-5 w-px bg-[#d8e0ed] sm:block" />
            <span>{selectedProgram}</span>
          </div>
        </div>

        <div className="hidden grid-cols-[1.5fr_1fr_0.9fr] bg-[#f8fbff] px-10 py-5 text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500 lg:grid">
          <span>Student Identity</span>
          <span>Enrollment Id</span>
          <span>Date Joined</span>
        </div>

        <div>
          {pagedStudents.map((student) => (
            <div
              key={student.id}
              className="grid gap-4 border-t border-[#eef3f8] px-6 py-5 first:border-t-0 lg:grid-cols-[1.5fr_1fr_0.9fr] lg:px-10 lg:py-8"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold ${student.accentClass}`}
                >
                  {student.initials}
                </div>
                <div>
                  <p className="text-lg font-bold tracking-[-0.02em] text-[#171f33]">
                    {student.name}
                  </p>
                  <p className="text-sm text-slate-500">{student.email}</p>
                </div>
              </div>

              <div className="flex items-center text-sm text-[#171f33]">
                {student.enrollmentId}
              </div>

              <div className="flex items-center justify-between gap-4 lg:justify-start">
                <span className="text-sm text-[#171f33]">{student.joinedAt}</span>
                <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold text-[#2d56d6] lg:hidden">
                  {student.program}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 px-6 py-6 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-slate-500">
            Showing {(safePage - 1) * PAGE_SIZE + 1}-
            {Math.min(safePage * PAGE_SIZE, filteredStudents.length)} of{" "}
            {filteredStudents.length} students
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d7e0ee] text-slate-500 transition hover:border-[#2d56d6] hover:text-[#2d56d6]"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold transition ${
                    pageNumber === safePage
                      ? "border-[#113d8b] bg-[#113d8b] text-white"
                      : "border-[#d7e0ee] text-slate-600 hover:border-[#2d56d6] hover:text-[#2d56d6]"
                  }`}
                >
                  {pageNumber}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d7e0ee] text-slate-500 transition hover:border-[#2d56d6] hover:text-[#2d56d6]"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
