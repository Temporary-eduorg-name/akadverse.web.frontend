"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  FolderOpen,
  Users,
} from "lucide-react";

type OngoingCollection = {
  id: string;
  title: string;
  status: string;
  statusClass: string;
  dateRange: string;
  audienceLabel: string;
  submittedLabel: string;
  progressLabel: string;
  progress: number;
};

type ClosedCollection = {
  id: string;
  title: string;
  status: string;
  dateRange: string;
  submittedLabel: string;
  progress: number;
};

const ongoingCollections: OngoingCollection[] = [
  {
    id: "hod",
    title: "HOD",
    status: "IN PROGRESS",
    statusClass: "bg-[#dcfce7] text-[#15803d]",
    dateRange: "Sep 01, 2024 - Dec 15, 2024",
    audienceLabel: "124 Students enrolled",
    submittedLabel: "82/124 Submitted",
    progressLabel: "65% Complete",
    progress: 65,
  },
  {
    id: "coren",
    title: "COREN",
    status: "REVIEWING",
    statusClass: "bg-[#fef3c7] text-[#d97706]",
    dateRange: "Oct 15, 2024 - Nov 30, 2024",
    audienceLabel: "45 Faculty members",
    submittedLabel: "41/45 Submitted",
    progressLabel: "91% Complete",
    progress: 91,
  },
];

const closedCollections: ClosedCollection[] = [
  {
    id: "spring-2024",
    title: "Spring 2024 Certification Documents",
    status: "COMPLETED",
    dateRange: "Ended May 20, 2024",
    submittedLabel: "112/112 Submitted",
    progress: 100,
  },
  {
    id: "annual-2023",
    title: "2023 Annual Faculty Performance Reviews",
    status: "COMPLETED",
    dateRange: "Ended Jan 15, 2024",
    submittedLabel: "56/56 Submitted",
    progress: 100,
  },
  {
    id: "grant-2023",
    title: "Fall 2023 Grant Proposal Submissions",
    status: "COMPLETED",
    dateRange: "Ended Dec 01, 2023",
    submittedLabel: "89/89 Submitted",
    progress: 100,
  },
];

export default function StaffActiveCollectionsPage() {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-[#1f2937]">
      <main className="mx-auto w-full max-w-[760px] px-6 pb-12 pt-8">
        <div className="mb-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              router.push("/staffdashboard/academic-records/manage-archive")
            }
            className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-[#64748b] transition-colors hover:bg-white hover:text-[#1f2937]"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            <span className="text-[13px] font-semibold">Back</span>
          </button>
        </div>

        <section className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-extrabold text-[#1f2937]">
              Manage Collections
            </h1>
            <p className="mt-2 text-[14px] font-medium text-[#70819d]">
              Organize and track document submissions across your assigned
              departments.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/staffdashboard/academic-records/manage-archive/create-collection",
              )
            }
            className="rounded-xl bg-[#294fbf] px-6 py-3 text-[14px] font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-[#2342a1]"
          >
            + Create New Collection
          </button>
        </section>

        {notice ? (
          <p className="mt-4 rounded-lg bg-[#eef2ff] px-4 py-3 text-[13px] font-semibold text-[#294fbf]">
            {notice}
          </p>
        ) : null}

        <section className="mt-10">
          <div className="flex items-center gap-3">
            <h2 className="text-[18px] font-extrabold text-[#1f2937]">
              Ongoing Collections
            </h2>
            <span className="h-4 w-8 rounded-full bg-[#294fbf]" />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {ongoingCollections.map((collection) => (
              <article
                key={collection.id}
                className="rounded-2xl border border-[#dbe3ef] bg-white px-4 py-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[16px] font-extrabold text-[#1f2937]">
                    {collection.title}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${collection.statusClass}`}
                  >
                    {collection.status}
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-[13px] font-medium text-[#70819d]">
                  <p className="inline-flex items-center gap-2">
                    <CalendarDays size={14} strokeWidth={2.2} />
                    {collection.dateRange}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <Users size={14} strokeWidth={2.2} />
                    {collection.audienceLabel}
                  </p>
                </div>

                <div className="mt-4 h-[5px] rounded-full bg-[#e7edf7]">
                  <div
                    className="h-full rounded-full bg-[#294fbf]"
                    style={{ width: `${collection.progress}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-[#70819d]">
                  <span>{collection.submittedLabel}</span>
                  <span>{collection.progressLabel}</span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setNotice(
                      `${collection.title} opened in demo mode. Detailed collection management will be connected later.`,
                    )
                  }
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#294fbf] px-4 py-3 text-[13px] font-semibold text-white transition hover:bg-[#2342a1]"
                >
                  Manage Collection
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-center gap-3">
            <h2 className="text-[18px] font-extrabold text-[#1f2937]">
              Closed Collections
            </h2>
            <span className="rounded-full bg-[#e2e8f0] px-3 py-1 text-[10px] font-extrabold text-[#64748b]">
              Archived
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {closedCollections.map((collection) => (
              <article
                key={collection.id}
                className="rounded-2xl border border-[#dbe3ef] bg-white px-4 py-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="max-w-[150px] text-[15px] font-extrabold leading-6 text-[#1f2937]">
                    {collection.title}
                  </h3>
                  <span className="rounded-full bg-[#e2e8f0] px-2 py-1 text-[10px] font-extrabold text-[#64748b]">
                    {collection.status}
                  </span>
                </div>

                <div className="mt-5 space-y-3 text-[13px] font-medium text-[#70819d]">
                  <p className="inline-flex items-center gap-2">
                    <CalendarDays size={14} strokeWidth={2.2} />
                    {collection.dateRange}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <FileText size={14} strokeWidth={2.2} />
                    {collection.submittedLabel}
                  </p>
                </div>

                <div className="mt-4 h-[5px] rounded-full bg-[#e7edf7]">
                  <div
                    className="h-full rounded-full bg-[#94a3b8]"
                    style={{ width: `${collection.progress}%` }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setNotice(
                      `${collection.title} archive opened in demo mode. Archived collection details will be connected later.`,
                    )
                  }
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-[#dbe3ef] bg-white px-4 py-3 text-[13px] font-semibold text-[#334155] transition hover:bg-[#f8fafc]"
                >
                  View Archive
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
