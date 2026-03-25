"use client";

import React, { useMemo, useState } from "react";
import { Calculator, Lightbulb, Plus, Save, Trash2, X } from "lucide-react";
import AcademicRecordsTabs from "@/src/AcademicRecordsTabs";

type GradeOption = "A" | "B" | "C" | "D" | "F";

type CourseInput = {
  id: string;
  name: string;
  units: number;
  grade: GradeOption;
};

type SemesterProjection = {
  id: string;
  title: string;
  courses: CourseInput[];
};

const gradePointMap: Record<GradeOption, number> = {
  A: 4.0,
  B: 3.0,
  C: 2.0,
  D: 1.0,
  F: 0.0,
};

const initialSemesters: SemesterProjection[] = [
  {
    id: "semester-1",
    title: "Semester 1 - Fall 2023",
    courses: [
      { id: "c1", name: "CS101: Intro to Computing", units: 4, grade: "A" },
      { id: "c2", name: "MATH202: Linear Algebra", units: 3, grade: "B" },
      { id: "c3", name: "CS201: Data Structures", units: 4, grade: "B" },
      { id: "c4", name: "ENG301: Technical Writing", units: 2, grade: "A" },
    ],
  },
];

function buildEmptyCourse(id: string): CourseInput {
  return {
    id,
    name: "",
    units: 0,
    grade: "A",
  };
}

function getSemesterStats(courses: CourseInput[]) {
  const totalUnits = courses.reduce((sum, course) => sum + course.units, 0);
  const totalPoints = courses.reduce(
    (sum, course) => sum + course.units * gradePointMap[course.grade],
    0,
  );

  return {
    totalUnits,
    gpa: totalUnits === 0 ? 0 : totalPoints / totalUnits,
  };
}

export default function CgpaCalculatorPage() {
  const [semesters, setSemesters] = useState(initialSemesters);
  const [notice, setNotice] = useState<string | null>(null);

  const totals = useMemo(() => {
    const units = semesters.reduce(
      (sum, semester) => sum + getSemesterStats(semester.courses).totalUnits,
      0,
    );
    const points = semesters.reduce(
      (sum, semester) =>
        sum +
        semester.courses.reduce(
          (courseSum, course) =>
            courseSum + course.units * gradePointMap[course.grade],
          0,
        ),
      0,
    );
    const projectedCgpa = units === 0 ? 0 : points / units;
    const targetCgpa = 3.6;
    const progressToGoal = Math.min((projectedCgpa / targetCgpa) * 100, 100);

    return { units, projectedCgpa, progressToGoal, targetCgpa };
  }, [semesters]);

  const updateCourse = (
    semesterId: string,
    courseId: string,
    patch: Partial<CourseInput>,
  ) => {
    setNotice(null);
    setSemesters((previous) =>
      previous.map((semester) =>
        semester.id !== semesterId
          ? semester
          : {
              ...semester,
              courses: semester.courses.map((course) =>
                course.id !== courseId ? course : { ...course, ...patch },
              ),
            },
      ),
    );
  };

  const addCourse = (semesterId: string) => {
    setNotice(null);
    setSemesters((previous) =>
      previous.map((semester) =>
        semester.id !== semesterId
          ? semester
          : {
              ...semester,
              courses: [
                ...semester.courses,
                buildEmptyCourse(`${semesterId}-${Date.now()}`),
              ],
            },
      ),
    );
  };

  const removeCourse = (semesterId: string, courseId: string) => {
    setNotice(null);
    setSemesters((previous) =>
      previous.map((semester) =>
        semester.id !== semesterId
          ? semester
          : {
              ...semester,
              courses: semester.courses.filter(
                (course) => course.id !== courseId,
              ),
            },
      ),
    );
  };

  const addSemester = () => {
    setNotice(null);
    setSemesters((previous) => [
      ...previous,
      {
        id: `semester-${Date.now()}`,
        title: `Semester ${previous.length + 1} - New Projection`,
        courses: [buildEmptyCourse(`new-course-${Date.now()}`)],
      },
    ]);
  };

  const removeSemester = (semesterId: string) => {
    setNotice(null);
    setSemesters((previous) =>
      previous.filter((semester) => semester.id !== semesterId),
    );
  };

  const clearAll = () => {
    setSemesters([]);
    setNotice("All semester projections cleared.");
  };

  const saveProjection = () => {
    setNotice(
      "Projection saved locally for demo purposes. API persistence will be connected later.",
    );
  };

  return (
    <div
      className="min-h-screen bg-[#f8fafc] text-[#334155]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <main className="mx-auto max-w-[1220px] px-4 py-4 md:px-8">
        <AcademicRecordsTabs activeTab="cgpa" />

        <section className="mt-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-[29px] font-extrabold tracking-tight text-[#0f172a]">
                CGPA Calculator
              </h1>
              <p className="mt-1 text-[14px] font-medium text-[#64748b]">
                Simulate your academic performance and plan your path to
                graduation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-2 rounded-[10px] border border-[#d7deea] bg-white px-4 py-2.5 text-[13px] font-bold text-[#475569] transition hover:bg-[#f8fafc]"
              >
                <Trash2 size={14} strokeWidth={2.4} />
                Clear All
              </button>
              <button
                type="button"
                onClick={saveProjection}
                className="inline-flex items-center gap-2 rounded-[10px] bg-[#2f55c8] px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#2647ad]"
              >
                <Save size={14} strokeWidth={2.4} />
                Save Projection
              </button>
            </div>
          </div>

          {notice ? (
            <p className="mt-4 rounded-[10px] bg-[#eef2ff] px-4 py-3 text-[13px] font-semibold text-[#2f55c8]">
              {notice}
            </p>
          ) : null}

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
            <div className="space-y-6">
              {semesters.map((semester, semesterIndex) => {
                const stats = getSemesterStats(semester.courses);

                return (
                  <article
                    key={semester.id}
                    className="overflow-hidden rounded-[18px] border border-[#dde6f1] bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-[#edf2f7] px-5 py-4">
                      <div className="inline-flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-[10px] bg-[#eef2ff] text-[#2f55c8]">
                          <Calculator size={17} strokeWidth={2.4} />
                        </div>
                        <h2 className="text-[22px] font-bold text-[#1f2937]">
                          {semester.title}
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSemester(semester.id)}
                        className="rounded-md p-2 text-[#94a3b8] transition hover:bg-[#f8fafc] hover:text-[#64748b]"
                        aria-label={`Remove ${semester.title}`}
                      >
                        <X size={18} strokeWidth={2.4} />
                      </button>
                    </div>

                    <div className="px-5 py-5">
                      <div className="grid grid-cols-[minmax(0,1.6fr)_110px_120px_28px] items-center gap-3 px-2 pb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#94a3b8]">
                        <p>Course Name</p>
                        <p>Units</p>
                        <p>Grade</p>
                        <span />
                      </div>

                      <div className="space-y-3">
                        {semester.courses.map((course) => (
                          <div
                            key={course.id}
                            className="grid grid-cols-[minmax(0,1.6fr)_110px_120px_28px] items-center gap-3"
                          >
                            <input
                              value={course.name}
                              onChange={(event) =>
                                updateCourse(semester.id, course.id, {
                                  name: event.target.value,
                                })
                              }
                              placeholder="Enter course title"
                              className="h-11 rounded-[10px] border border-[#dce3ee] bg-[#f8fafc] px-3 text-[14px] font-medium text-[#334155] outline-none transition focus:border-[#2f55c8] focus:bg-white"
                            />
                            <input
                              value={course.units || ""}
                              type="number"
                              min={0}
                              onChange={(event) =>
                                updateCourse(semester.id, course.id, {
                                  units: Number(event.target.value) || 0,
                                })
                              }
                              className="h-11 rounded-[10px] border border-[#dce3ee] bg-[#f8fafc] px-3 text-center text-[14px] font-semibold text-[#334155] outline-none transition focus:border-[#2f55c8] focus:bg-white"
                            />
                            <select
                              value={course.grade}
                              onChange={(event) =>
                                updateCourse(semester.id, course.id, {
                                  grade: event.target.value as GradeOption,
                                })
                              }
                              className="h-11 rounded-[10px] border border-[#dce3ee] bg-[#f8fafc] px-3 text-[14px] font-semibold text-[#334155] outline-none transition focus:border-[#2f55c8] focus:bg-white"
                            >
                              {Object.entries(gradePointMap).map(
                                ([grade, points]) => (
                                  <option key={grade} value={grade}>
                                    {grade} ({points.toFixed(1)})
                                  </option>
                                ),
                              )}
                            </select>
                            <button
                              type="button"
                              onClick={() =>
                                removeCourse(semester.id, course.id)
                              }
                              className="rounded-md p-1.5 text-[#cbd5e1] transition hover:bg-[#f8fafc] hover:text-[#94a3b8]"
                              aria-label={`Remove ${course.name || "course"}`}
                            >
                              <Trash2 size={15} strokeWidth={2.3} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => addCourse(semester.id)}
                        className="mt-6 inline-flex items-center gap-2 text-[14px] font-bold text-[#2f55c8] transition hover:text-[#2647ad]"
                      >
                        <Plus size={15} strokeWidth={2.5} />
                        Add New Course
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setNotice(
                            `Projection refreshed for Semester ${semesterIndex + 1}.`,
                          )
                        }
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#2f55c8] px-4 py-3.5 text-[15px] font-bold text-white transition hover:bg-[#2647ad]"
                      >
                        <Calculator size={16} strokeWidth={2.4} />
                        Calculate CGPA
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#edf2f7] bg-[#f8fafc] px-5 py-4 text-[14px] font-semibold text-[#64748b]">
                      <p>Semester Total Units: {stats.totalUnits}</p>
                      <p>
                        Semester GPA:{" "}
                        <span className="font-extrabold text-[#2f55c8]">
                          {stats.gpa.toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </article>
                );
              })}

              <button
                type="button"
                onClick={addSemester}
                className="flex min-h-[110px] w-full flex-col items-center justify-center rounded-[18px] border border-dashed border-[#d7deea] bg-white text-[#94a3b8] transition hover:border-[#b7c7e8] hover:text-[#64748b]"
              >
                <Plus size={24} strokeWidth={2.4} />
                <span className="mt-3 text-[24px] font-semibold">
                  Add New Semester
                </span>
              </button>
            </div>

            <aside className="rounded-[18px] border border-[#dde6f1] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#fff7d6] text-[#d97706]">
                  <Lightbulb size={18} strokeWidth={2.4} />
                </div>
                <div>
                  <h2 className="text-[24px] font-bold text-[#1f2937]">
                    Academic Goals
                  </h2>
                </div>
              </div>

              <p className="mt-5 text-[15px] font-medium leading-7 text-[#64748b]">
                To achieve a{" "}
                <span className="font-bold text-[#1f2937]">First Class</span>{" "}
                honors ({totals.targetCgpa.toFixed(2)}+), you need to average a
                GPA of
                <span className="font-bold text-[#2f55c8]"> 3.65 </span>
                across your remaining 24 units.
              </p>

              <div className="mt-8">
                <div className="flex items-center justify-between text-[13px] font-bold text-[#475569]">
                  <span>Progress to Goal</span>
                  <span className="text-[#2f55c8]">
                    {Math.round(totals.progressToGoal)}%
                  </span>
                </div>
                <div className="mt-3 h-[8px] rounded-full bg-[#e2e8f0]">
                  <div
                    className="h-full rounded-full bg-[#2f55c8]"
                    style={{ width: `${Math.max(totals.progressToGoal, 6)}%` }}
                  />
                </div>
              </div>

              <div className="mt-8 rounded-[14px] bg-[#f8fafc] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#94a3b8]">
                  Projected CGPA
                </p>
                <p className="mt-2 text-[34px] font-extrabold leading-none text-[#0f172a]">
                  {totals.projectedCgpa.toFixed(2)}
                </p>
                <p className="mt-2 text-[13px] font-medium text-[#64748b]">
                  Total projected credit units: {totals.units}
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
