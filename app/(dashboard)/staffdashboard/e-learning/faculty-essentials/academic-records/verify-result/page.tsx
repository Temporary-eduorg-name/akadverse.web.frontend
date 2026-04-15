"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Pencil,
} from "lucide-react";
import ArchiveTabs from "../manage-archive/_components/ArchiveTabs";

type GradeRow = {
  id: string;
  studentId: string;
  test1: number;
  test2: number;
  final: number;
  verified: boolean;
};

const COURSES = [
  "CS302: Advanced Algorithms",
  "CS304: Operating Systems II",
  "CS306: Database Systems",
];

const SEMESTERS = ["ALPHA Semester", "OMEGA Semester"];

const INITIAL_ROWS: GradeRow[] = [
  {
    id: "1",
    studentId: "CS-2023-0012",
    test1: 18.5,
    test2: 19.0,
    final: 56.0,
    verified: true,
  },
  {
    id: "2",
    studentId: "CS-2023-0145",
    test1: 10.0,
    test2: 10.0,
    final: 25.0,
    verified: false,
  },
  {
    id: "3",
    studentId: "CS-2023-0098",
    test1: 8.0,
    test2: 7.0,
    final: 25.0,
    verified: false,
  },
  {
    id: "4",
    studentId: "CS-2023-0221",
    test1: 19.5,
    test2: 20.0,
    final: 58.0,
    verified: true,
  },
  {
    id: "5",
    studentId: "CS-2023-0056",
    test1: 14.0,
    test2: 16.5,
    final: 40.5,
    verified: true,
  },
  {
    id: "6",
    studentId: "CS-2023-0188",
    test1: 15.0,
    test2: 14.0,
    final: 43.5,
    verified: false,
  },
  {
    id: "7",
    studentId: "CS-2023-0111",
    test1: 17.0,
    test2: 18.5,
    final: 51.0,
    verified: true,
  },
  {
    id: "8",
    studentId: "CS-2023-0194",
    test1: 11.0,
    test2: 12.0,
    final: 39.0,
    verified: false,
  },
  {
    id: "9",
    studentId: "CS-2023-0202",
    test1: 19.0,
    test2: 18.0,
    final: 55.0,
    verified: true,
  },
  {
    id: "10",
    studentId: "CS-2023-0240",
    test1: 16.0,
    test2: 15.0,
    final: 45.0,
    verified: false,
  },
];

const PAGE_SIZE = 5;

function getTotal(row: GradeRow) {
  return row.test1 + row.test2 + row.final;
}

function getGrade(total: number) {
  if (total >= 70) {
    return "A";
  }
  if (total >= 60) {
    return "B";
  }
  if (total >= 50) {
    return "C";
  }
  if (total >= 45) {
    return "D";
  }
  return "F";
}

function getGradePill(grade: string) {
  if (grade === "A") {
    return "bg-[#e0e7ff] text-[#294fbf]";
  }
  if (grade === "D") {
    return "bg-[#fff7ed] text-[#d97706]";
  }
  if (grade === "F") {
    return "bg-[#fef2f2] text-[#ef4444]";
  }
  return "bg-[#ecfeff] text-[#0891b2]";
}

export default function StaffVerifyResultPage() {
  const router = useRouter();
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [selectedCourse, setSelectedCourse] = useState(COURSES[0]);
  const [selectedSemester, setSelectedSemester] = useState(SEMESTERS[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, currentPage]);

  const highestScore = useMemo(
    () => Math.max(...rows.map((row) => getTotal(row))),
    [rows],
  );

  const passRate = useMemo(() => {
    const passing = rows.filter((row) => getTotal(row) >= 45).length;
    return rows.length === 0 ? 0 : (passing / rows.length) * 100;
  }, [rows]);

  const updateRow = (
    rowId: string,
    key: "test1" | "test2" | "final",
    value: number,
  ) => {
    setRows((previous) =>
      previous.map((row) =>
        row.id === rowId ? { ...row, [key]: Math.max(value, 0) } : row,
      ),
    );
  };

  const toggleVerifyAll = () => {
    setRows((previous) => previous.map((row) => ({ ...row, verified: true })));
    setNotice(
      "All visible result records have been marked as verified for this demo.",
    );
  };

  const exportPdf = () => {
    setNotice(
      "Export to PDF is using dummy behavior for now. Backend export will be connected later.",
    );
  };

  return (
    <div className="mx-auto w-full max-w-[760px] px-2 pb-12 pt-2 text-[#1f2937] sm:px-4 sm:pt-4">
        <ArchiveTabs activeTab="grade-verification" />

        <div className="mb-6 mt-14 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-[#64748b] transition-colors hover:bg-white hover:text-[#1f2937]"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            <span className="text-[13px] font-semibold">Back</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={exportPdf}
              className="inline-flex items-center gap-2 rounded-lg border border-[#dbe3ef] bg-white px-4 py-3 text-[13px] font-semibold text-[#334155] transition hover:bg-[#f8fafc]"
            >
              <Download size={14} strokeWidth={2.4} />
              Export to PDF
            </button>
            <button
              type="button"
              onClick={toggleVerifyAll}
              className="inline-flex items-center gap-2 rounded-lg bg-[#294fbf] px-4 py-3 text-[13px] font-semibold text-white transition hover:bg-[#2342a1]"
            >
              <CheckCircle2 size={14} strokeWidth={2.4} />
              Verify All
            </button>
          </div>
        </div>

        <section>
          <h1 className="text-[24px] font-extrabold text-[#1f2937]">
            Verify Examination Results
          </h1>
          <p className="mt-1 text-[14px] font-medium text-[#7b8798]">
            Reviewing grades for{" "}
            <span className="font-semibold text-[#294fbf]">
              {selectedCourse}
            </span>{" "}
            - {selectedSemester}
          </p>
        </section>

        {notice ? (
          <p className="mt-4 rounded-lg bg-[#eef2ff] px-4 py-3 text-[13px] font-semibold text-[#294fbf]">
            {notice}
          </p>
        ) : null}

        <section className="mt-6 rounded-xl border border-[#dbe3ef] bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="relative block">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#9aa5b5]">
                Course:
              </span>
              <select
                value={selectedCourse}
                onChange={(event) => setSelectedCourse(event.target.value)}
                className="h-11 w-full appearance-none rounded-lg border border-[#edf2f7] bg-[#f8fafc] px-24 pr-10 text-[14px] font-semibold text-[#334155] outline-none"
              >
                {COURSES.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                strokeWidth={2.6}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />
            </label>

            <label className="relative block">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#9aa5b5]">
                Semester:
              </span>
              <select
                value={selectedSemester}
                onChange={(event) => setSelectedSemester(event.target.value)}
                className="h-11 w-full appearance-none rounded-lg border border-[#edf2f7] bg-[#f8fafc] px-24 pr-10 text-[14px] font-semibold text-[#334155] outline-none"
              >
                {SEMESTERS.map((semester) => (
                  <option key={semester} value={semester}>
                    {semester}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                strokeWidth={2.6}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />
            </label>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-xl border border-[#dbe3ef] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-[#f8fafc] text-left text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#7b8798]">
                <tr>
                  <th className="px-4 py-4">Student ID</th>
                  <th className="px-4 py-4">Test 1 (20)</th>
                  <th className="px-4 py-4">Test 2 (20)</th>
                  <th className="px-4 py-4">Final (60)</th>
                  <th className="px-4 py-4">Total (100)</th>
                  <th className="px-4 py-4">Grade</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf2f7] text-[14px] font-semibold text-[#334155]">
                {paginatedRows.map((row) => {
                  const total = getTotal(row);
                  const grade = getGrade(total);
                  const isEditing = editingRowId === row.id;

                  return (
                    <tr key={row.id}>
                      <td className="px-4 py-4 font-semibold text-[#70819d]">
                        {row.studentId}
                      </td>
                      <td className="px-4 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={row.test1}
                            onChange={(event) =>
                              updateRow(
                                row.id,
                                "test1",
                                Number(event.target.value) || 0,
                              )
                            }
                            className="w-16 rounded border border-[#dbe3ef] px-2 py-1 outline-none"
                          />
                        ) : (
                          row.test1.toFixed(1)
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={row.test2}
                            onChange={(event) =>
                              updateRow(
                                row.id,
                                "test2",
                                Number(event.target.value) || 0,
                              )
                            }
                            className="w-16 rounded border border-[#dbe3ef] px-2 py-1 outline-none"
                          />
                        ) : (
                          row.test2.toFixed(1)
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={row.final}
                            onChange={(event) =>
                              updateRow(
                                row.id,
                                "final",
                                Number(event.target.value) || 0,
                              )
                            }
                            className="w-16 rounded border border-[#dbe3ef] px-2 py-1 outline-none"
                          />
                        ) : (
                          row.final.toFixed(1)
                        )}
                      </td>
                      <td className="px-4 py-4 font-extrabold text-[#294fbf]">
                        {total.toFixed(1)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded px-2 py-1 text-[12px] font-extrabold ${getGradePill(grade)}`}
                        >
                          {grade}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingRowId(isEditing ? null : row.id);
                            setNotice(
                              isEditing
                                ? "Row changes saved for demo state."
                                : null,
                            );
                          }}
                          className="rounded-md p-1.5 text-[#94a3b8] transition hover:bg-[#f8fafc] hover:text-[#64748b]"
                        >
                          <Pencil size={15} strokeWidth={2.5} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-[#edf2f7] bg-[#f8fafc] px-4 py-3 text-[13px] font-medium text-[#7b8798]">
            <p>
              Showing {(currentPage - 1) * PAGE_SIZE + 1}-
              {Math.min(currentPage * PAGE_SIZE, rows.length)} of {rows.length}{" "}
              students
            </p>
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((previous) => Math.max(previous - 1, 1))
                }
                className="rounded p-1.5 text-[#94a3b8] transition hover:bg-white hover:text-[#334155]"
              >
                <ChevronLeft size={15} strokeWidth={2.6} />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`rounded px-3 py-1.5 text-[13px] font-bold transition ${
                      currentPage === page
                        ? "bg-[#294fbf] text-white"
                        : "text-[#334155] hover:bg-white"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((previous) =>
                    Math.min(previous + 1, totalPages),
                  )
                }
                className="rounded p-1.5 text-[#94a3b8] transition hover:bg-white hover:text-[#334155]"
              >
                <ChevronRight size={15} strokeWidth={2.6} />
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-[#dbe3ef] bg-white px-5 py-5 shadow-sm">
            <p className="text-[13px] font-medium text-[#7b8798]">
              Highest Score
            </p>
            <p className="mt-2 text-[25px] font-extrabold text-[#1f2937]">
              {highestScore.toFixed(1)}
            </p>
            <p className="mt-1 text-[12px] font-medium text-[#9aa5b5]">
              Achieved by 1 student
            </p>
          </article>

          <article className="rounded-xl border border-[#dbe3ef] bg-white px-5 py-5 shadow-sm">
            <p className="text-[13px] font-medium text-[#7b8798]">Pass Rate</p>
            <p className="mt-2 text-[25px] font-extrabold text-[#1f2937]">
              {passRate.toFixed(1)}%
            </p>
            <div className="mt-3 h-[5px] rounded-full bg-[#e5e7eb]">
              <div
                className="h-full rounded-full bg-[#22c55e]"
                style={{ width: `${passRate}%` }}
              />
            </div>
          </article>
        </section>
    </div>
  );
}
