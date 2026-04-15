"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
} from "lucide-react";
import ArchiveTabs from "../_components/ArchiveTabs";
import {
  DocumentCollection,
  computeCollectionState,
  formatDateRange,
  getDocumentCollections,
  toPercent,
} from "../_lib/collectionStore";

type CourseProgress = {
  id: string;
  code: string;
  title: string;
  submitted: number;
  total: number;
};

type SubmissionRow = {
  id: string;
  sn: number;
  studentName: string;
  matricNo: string;
  docs: number;
  status: "Submitted" | "Pending";
};

const PAGE_SIZE = 10;

const COURSE_PREFIXES = ["CVE", "ELE", "MCE", "CPE", "SCE", "CHE", "IME"];

const COURSE_TITLES = [
  "Civil Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Computer Engineering",
  "Structural Engineering",
  "Chemical Engineering",
  "Industrial Engineering",
];

const FIRST_NAMES = [
  "Adekunle",
  "Bamidele",
  "Chioma",
  "David",
  "Esther",
  "Fatima",
  "Gabriel",
  "Hannah",
  "Ibrahim",
  "Jennifer",
  "Kelechi",
  "Lilian",
  "Moses",
  "Nkem",
  "Obinna",
  "Precious",
  "Queenie",
  "Racheal",
  "Samuel",
  "Tolu",
  "Uche",
  "Victoria",
  "Wale",
  "Xavier",
  "Yemi",
  "Zainab",
  "Amaka",
  "Benson",
  "Chinedu",
  "Dinma",
];

const LAST_NAMES = [
  "Johnson",
  "Okafor",
  "Adewale",
  "Usman",
  "Eze",
  "Balogun",
  "Abubakar",
  "Nwosu",
  "Ibrahim",
  "Musa",
];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function buildCourseProgress(collection: DocumentCollection): CourseProgress[] {
  const baseHash = hashString(collection.id);

  return COURSE_PREFIXES.map((prefix, index) => {
    const codeNum = 311 + index;
    const baseTotal = Math.max(18, Math.floor(collection.totalMembers / 7));
    const variance = (baseHash + index * 7) % 18;
    const total = baseTotal + variance;
    const submittedSeed = Math.max(
      0,
      Math.min(
        total,
        Math.floor((total * (56 + ((baseHash + index * 11) % 36))) / 100),
      ),
    );

    return {
      id: `${collection.id}-${prefix}-${codeNum}`,
      code: `${prefix} ${codeNum}`,
      title: COURSE_TITLES[index] ?? "Engineering",
      submitted: submittedSeed,
      total,
    };
  });
}

function buildRows(course: CourseProgress): SubmissionRow[] {
  const seed = hashString(course.id);
  const rowTotal = Math.max(course.total, PAGE_SIZE + 4);

  return Array.from({ length: rowTotal }, (_, index) => {
    const first = FIRST_NAMES[(seed + index) % FIRST_NAMES.length];
    const last = LAST_NAMES[(seed + index * 3) % LAST_NAMES.length];
    const matricNo = `${course.code.replace(" ", "")}${String(index + 10001)}`;
    const docs = 1 + ((seed + index * 5) % 4);
    const status: "Submitted" | "Pending" =
      index < course.submitted ? "Submitted" : "Pending";

    return {
      id: `${course.id}-${index + 1}`,
      sn: index + 1,
      studentName: `${first} ${last}`,
      matricNo,
      docs,
      status,
    };
  });
}

export default function ActiveCollectionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [collection, setCollection] = useState<DocumentCollection | null>(null);
  const [activeCourseId, setActiveCourseId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const collectionId = searchParams.get("collectionId") ?? "";

  useEffect(() => {
    const found =
      getDocumentCollections().find((item) => item.id === collectionId) ?? null;
    setCollection(found);
  }, [collectionId]);

  const courses = useMemo(() => {
    if (!collection) return [];
    return buildCourseProgress(collection);
  }, [collection]);

  useEffect(() => {
    if (courses.length === 0) {
      setActiveCourseId("");
      return;
    }

    setActiveCourseId((current) =>
      current && courses.some((course) => course.id === current)
        ? current
        : courses[0].id,
    );
  }, [courses]);

  useEffect(() => {
    setPage(1);
  }, [activeCourseId, query]);

  const activeCourse =
    courses.find((course) => course.id === activeCourseId) ??
    courses[0] ??
    null;

  const rows = useMemo(() => {
    if (!activeCourse) return [];
    const all = buildRows(activeCourse);

    if (!query.trim()) {
      return all;
    }

    const normalized = query.trim().toLowerCase();
    return all.filter(
      (item) =>
        item.studentName.toLowerCase().includes(normalized) ||
        item.matricNo.toLowerCase().includes(normalized),
    );
  }, [activeCourse, query]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, safePage]);

  const overallSubmitted = courses.reduce(
    (sum, item) => sum + item.submitted,
    0,
  );
  const overallTotal = courses.reduce((sum, item) => sum + item.total, 0);
  const overallPercent = toPercent(overallSubmitted, overallTotal);

  if (!collection) {
    return (
      <div className="mx-auto w-full max-w-[1120px] px-2 pb-16 pt-2 sm:px-4 sm:pt-4">
        <ArchiveTabs activeTab="document-collection" />
        <div className="mt-8 rounded-2xl border border-[#dbe3ef] bg-white p-8 text-center">
          <p className="text-[16px] font-semibold text-[#475569]">
            Collection not found.
          </p>
          <button
            type="button"
            onClick={() =>
              router.push(
                "/staffdashboard/e-learning/faculty-essentials/academic-records/manage-archive/manage-archive",
              )
            }
            className="mt-4 rounded-xl bg-[#294fbf] px-5 py-2.5 text-[13px] font-semibold text-white"
          >
            Back to Manage Collections
          </button>
        </div>
      </div>
    );
  }

  const state = computeCollectionState(collection);

  return (
    <div className="mx-auto w-full max-w-[1120px] px-2 pb-16 pt-2 text-[#1f2937] sm:px-4 sm:pt-4">
      <ArchiveTabs activeTab="document-collection" />

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-[#64748b] transition-colors hover:bg-white hover:text-[#1f2937]"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          <span className="text-[13px] font-semibold">Back to Dashboard</span>
        </button>
      </div>

      <section className="mt-5 rounded-2xl border border-[#dbe3ef] bg-white px-6 py-6 shadow-sm">
        <h1 className="text-[36px] font-extrabold leading-tight text-[#1f2937]">
          {collection.title} Document Submission
        </h1>
        <p className="mt-1 text-[14px] font-medium text-[#70819d]">
          {formatDateRange(collection.startDateTime, collection.endDateTime)}
        </p>

        <div className="mt-5 grid gap-4 rounded-xl border border-[#e4eaf3] bg-[#f8fafc] p-4 md:grid-cols-2">
          <div>
            <p className="text-[13px] font-semibold text-[#16a34a]">Active</p>
            <p className="mt-1 text-[12px] font-semibold text-[#475569]">
              Total Students: {overallTotal}
            </p>
            <p className="mt-1 text-[12px] font-semibold text-[#475569]">
              Total Submitted: {overallSubmitted}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between text-[12px] font-semibold text-[#475569]">
              <span>Overall Progress</span>
              <span>{overallPercent}%</span>
            </div>
            <div className="mt-2 h-[7px] rounded-full bg-[#dbe3ef]">
              <div
                className="h-full rounded-full bg-[#10b981]"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
            <div className="mt-2 text-right text-[11px] font-semibold text-[#70819d]">
              {overallSubmitted}/{overallTotal}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 rounded-xl border border-[#e4eaf3] bg-[#f8fafc] p-3">
          {courses.map((course) => {
            const isActive = course.id === activeCourseId;
            const coursePercent = toPercent(course.submitted, course.total);

            return (
              <button
                key={course.id}
                type="button"
                onClick={() => setActiveCourseId(course.id)}
                className={`min-w-[132px] rounded-xl border px-3 py-2 text-left transition ${
                  isActive
                    ? "border-[#294fbf] bg-[#3b6ad9] text-white shadow-sm"
                    : "border-[#e2e8f0] bg-white text-[#334155] hover:border-[#cbd5e1]"
                }`}
              >
                <p className="text-[11px] font-extrabold">{course.code}</p>
                <p
                  className={`mt-0.5 text-[10px] font-medium ${isActive ? "text-blue-100" : "text-[#64748b]"}`}
                >
                  {course.title}
                </p>
                <p
                  className={`mt-1 text-[11px] font-bold ${isActive ? "text-white" : "text-[#1f2937]"}`}
                >
                  {course.submitted}/{course.total}
                </p>
                <div
                  className={`mt-2 h-[4px] rounded-full ${isActive ? "bg-blue-300/40" : "bg-[#e2e8f0]"}`}
                >
                  <div
                    className="h-full rounded-full bg-[#294fbf]"
                    style={{ width: `${coursePercent}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {activeCourse ? (
        <section className="mt-6 rounded-2xl border border-[#dbe3ef] bg-white px-6 py-6 shadow-sm">
          <h2 className="text-[28px] font-extrabold text-[#1f2937]">
            {activeCourse.code} - {activeCourse.title} I
          </h2>

          <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-[#e4eaf3] bg-[#f8fafc] px-4 py-3 text-[13px] font-semibold text-[#475569]">
            <p>
              Submitted{" "}
              <span className="font-extrabold text-[#1f2937]">
                {activeCourse.submitted}/{activeCourse.total}
              </span>
            </p>
            <p>
              Progress{" "}
              <span className="font-extrabold text-[#1f2937]">
                {toPercent(activeCourse.submitted, activeCourse.total)}%
              </span>
            </p>
            <div className="hidden h-[6px] w-[280px] rounded-full bg-[#dbe3ef] md:block">
              <div
                className="h-full rounded-full bg-[#10b981]"
                style={{
                  width: `${toPercent(activeCourse.submitted, activeCourse.total)}%`,
                }}
              />
            </div>
          </div>

          <button
            type="button"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#3b6ad9] px-4 py-3 text-[13px] font-semibold text-white transition hover:bg-[#2d57b7]"
          >
            <Download size={14} strokeWidth={2.4} />
            Download All Submissions (ZIP)
          </button>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="relative block flex-1 min-w-[230px]">
              <Search
                size={14}
                strokeWidth={2.5}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name or matric..."
                className="h-10 w-full rounded-lg border border-[#dbe3ef] bg-white pl-9 pr-3 text-[13px] font-medium text-[#334155] outline-none placeholder:text-[#94a3b8] focus:border-[#94a3b8]"
              />
            </label>

            <span
              className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${
                state === "ongoing"
                  ? "bg-[#dcfce7] text-[#15803d]"
                  : "bg-[#fef3c7] text-[#b45309]"
              }`}
            >
              {state === "ongoing" ? "Ongoing" : "Pending"}
            </span>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-[#e5e7eb]">
            <table className="min-w-full text-left">
              <thead className="bg-[#f8fafc] text-[11px] uppercase tracking-[0.08em] text-[#94a3b8]">
                <tr>
                  <th className="px-4 py-3">S/N</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Matric No</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Docs</th>
                  <th className="px-4 py-3">Download</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-[#eef2f7] text-[13px] text-[#334155]"
                  >
                    <td className="px-4 py-3 font-semibold">{row.sn}</td>
                    <td className="px-4 py-3 font-semibold text-[#1f2937]">
                      {row.studentName}
                    </td>
                    <td className="px-4 py-3">{row.matricNo}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
                          row.status === "Submitted"
                            ? "bg-[#dcfce7] text-[#15803d]"
                            : "bg-[#fef3c7] text-[#b45309]"
                        }`}
                      >
                        {row.status === "Submitted" ? (
                          <CheckCircle2 size={12} strokeWidth={2.4} />
                        ) : null}
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{row.docs} files</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-full bg-[#22c55e] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#16a34a]"
                      >
                        <Download size={11} strokeWidth={2.5} />
                        Download ZIP
                      </button>
                    </td>
                  </tr>
                ))}

                {pagedRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-[13px] font-semibold text-[#64748b]"
                    >
                      No submissions match your search.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-[12px] font-semibold text-[#64748b]">
            <p>
              Showing{" "}
              {pagedRows.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(safePage * PAGE_SIZE, rows.length)} of {rows.length}
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#dbe3ef] bg-white text-[#475569] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} strokeWidth={2.4} />
              </button>

              {Array.from({ length: Math.min(3, totalPages) }, (_, index) => {
                const pageNumber = index + 1;
                const isCurrent = pageNumber === safePage;

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold ${
                      isCurrent
                        ? "bg-[#3b6ad9] text-white"
                        : "border border-[#dbe3ef] bg-white text-[#64748b]"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#dbe3ef] bg-white text-[#475569] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={14} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
