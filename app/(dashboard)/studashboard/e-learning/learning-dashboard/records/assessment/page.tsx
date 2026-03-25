"use client";

import React from "react";
import { FileBarChart2 } from "lucide-react";
import AcademicRecordsTabs from "@/src/AcademicRecordsTabs";

type AssessmentRow = {
  code: string;
  title: string;
  test1: number;
  test2: number;
  midSem: number;
};

const assessmentRows: AssessmentRow[] = [
  {
    code: "CS101",
    title: "Introduction to Programming",
    test1: 12,
    test2: 14,
    midSem: 25,
  },
  { code: "CS102", title: "Data Structures", test1: 10, test2: 11, midSem: 22 },
  {
    code: "MA201",
    title: "Engineering Mathematics",
    test1: 14,
    test2: 13,
    midSem: 28,
  },
  {
    code: "CS103",
    title: "Database Systems",
    test1: 11,
    test2: 12,
    midSem: 24,
  },
  {
    code: "CS301",
    title: "Artificial Intelligence",
    test1: 13,
    test2: 12,
    midSem: 26,
  },
  {
    code: "CS302",
    title: "Computer Graphics",
    test1: 11,
    test2: 14,
    midSem: 23,
  },
  {
    code: "CS303",
    title: "Operating Systems II",
    test1: 12,
    test2: 11,
    midSem: 21,
  },
  { code: "CS304", title: "Networks", test1: 14, test2: 13, midSem: 27 },
];

export default function RecordsAssessmentPage() {
  return (
    <div
      className="min-h-screen bg-[#f5f7fb] text-[#334155]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <main className="mx-auto max-w-[1220px] px-4 py-4 md:px-8">
        <AcademicRecordsTabs activeTab="assessment" />

        <section className="mx-auto mt-14 max-w-[980px]">
          <article className="overflow-hidden rounded-2xl border border-[#dce3ee] bg-white shadow-sm">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dce3ee] px-5 py-5">
              <h1 className="inline-flex items-center gap-2 text-[33px] font-extrabold tracking-tight text-[#1f2937]">
                <FileBarChart2
                  size={20}
                  strokeWidth={2.5}
                  className="text-[#2f55c8]"
                />
                Course Assessment Details
              </h1>
              <p className="text-[12px] font-semibold text-[#64748b]">
                Displaying {assessmentRows.length} Courses • Semester 1
              </p>
            </header>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left">
                <thead className="border-b border-[#dce3ee] bg-[#f8fafc] text-[11px] font-bold uppercase tracking-[0.12em] text-[#2f55c8]">
                  <tr>
                    <th className="px-5 py-4">Course Code</th>
                    <th className="px-5 py-4">Course Title</th>
                    <th className="px-5 py-4 text-center">
                      Test 1
                      <p className="text-[10px] font-semibold normal-case tracking-normal text-[#94a3b8]">
                        (15 marks)
                      </p>
                    </th>
                    <th className="px-5 py-4 text-center">
                      Test 2
                      <p className="text-[10px] font-semibold normal-case tracking-normal text-[#94a3b8]">
                        (15 marks)
                      </p>
                    </th>
                    <th className="bg-[#f1f5f9] px-5 py-4 text-center">
                      Mid-Sem
                      <p className="text-[10px] font-semibold normal-case tracking-normal text-[#94a3b8]">
                        (30 marks)
                      </p>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0] text-[15px] font-semibold text-[#475569]">
                  {assessmentRows.map((row) => (
                    <tr key={row.code}>
                      <td className="px-5 py-4 font-extrabold text-[#334155]">
                        {row.code}
                      </td>
                      <td className="px-5 py-4">{row.title}</td>
                      <td className="px-5 py-4 text-center">{row.test1}</td>
                      <td className="px-5 py-4 text-center">{row.test2}</td>
                      <td className="bg-[#f8fafc] px-5 py-4 text-center text-[#334155]">
                        {row.midSem}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="h-20 border-t border-[#e2e8f0] bg-[#f8fafc]" />
          </article>
        </section>
      </main>
    </div>
  );
}
