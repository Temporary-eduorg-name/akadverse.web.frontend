"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Download,
  FileArchive,
  FileCheck,
  FileSpreadsheet,
  Landmark,
  Upload,
} from "lucide-react";

type RequiredDocument = {
  id: string;
  name: string;
  formats: string;
  lastUpdated: string;
  isUploaded?: boolean;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
};

const requiredDocs: RequiredDocument[] = [
  {
    id: "birth-certificate",
    name: "Birth Certificate",
    formats: "PDF, DOCX (Max 10MB)",
    lastUpdated: "Oct 24, 2023",
    isUploaded: true,
    icon: FileCheck,
  },
  {
    id: "olevel-result",
    name: "O level Result",
    formats: "XLSX, CSV (Max 5MB)",
    lastUpdated: "Jan 12, 2024",
    isUploaded: true,
    icon: FileSpreadsheet,
  },
  {
    id: "jamb-admission-letter",
    name: "Jamb Admission Letter",
    formats: "PDF (Max 15MB)",
    lastUpdated: "Feb 05, 2024",
    isUploaded: true,
    icon: Landmark,
  },
  {
    id: "semester-result",
    name: "Semester Result",
    formats: "PDF, XLSX (Max 8MB)",
    lastUpdated: "Not yet uploaded",
    isUploaded: false,
    icon: FileArchive,
  },
  {
    id: "curriculum-review-report",
    name: "Curriculum Review Report",
    formats: "PDF (Max 20MB)",
    lastUpdated: "Mar 10, 2024",
    isUploaded: true,
    icon: FileArchive,
  },
];

export default function RecordsHodRequiredDocumentsPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen bg-[#f8fafc] text-[#334155]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <main className="mx-auto max-w-[1260px] px-6 py-6 lg:px-10">
        <button
          aria-label="Go back"
          className="rounded-lg border border-[#e2e8f0] bg-white p-2.5 text-[#64748b] transition hover:bg-[#f8fafc]"
          onClick={() =>
            router.push(
              "/studashboard/e-learning/learning-dashboard/records/documentation"
            )
          }
        >
          <ArrowLeft size={18} strokeWidth={2.4} />
        </button>

        <section className="mt-8 rounded-xl border border-dashed border-[#bfd0ea] bg-white px-6 py-14 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#e8edf9] text-[#2f55c8]">
            <Upload size={24} strokeWidth={2.4} />
          </div>
          <h1 className="mt-4 text-[32px] font-extrabold text-[#0f172a]">
            Drag and drop files here
          </h1>
          <p className="mt-2 text-[14px] font-medium text-[#94a3b8]">
            Supported formats: PDF, JPG, PNG (Max 10MB per file)
          </p>
          <button className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#1f4ac3] px-5 py-2.5 text-[12px] font-bold text-white transition hover:bg-[#1d43b1]">
            + Select Files to Upload
          </button>
        </section>

        <section className="mt-10">
          <div className="flex items-center gap-2 text-[12px] font-medium text-[#94a3b8]">
            <span>Documents</span>
            <ChevronRight size={14} strokeWidth={2.5} />
            <span>HOD Required Documents</span>
          </div>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-[34px] font-extrabold tracking-tight text-[#0f172a]">
                HOD Required Documents
              </h2>
              <p className="mt-2 text-[14px] font-medium text-[#64748b]">
                Manage and upload mandatory documentation for departmental records.
              </p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-md border border-[#d1d9e6] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#334155] transition hover:bg-[#f8fafc]">
              <Download size={14} strokeWidth={2.4} />
              Export Report
            </button>
          </div>

          <article className="mt-6 overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
            <div className="grid grid-cols-[1.8fr_1fr_1fr] border-b border-[#e8edf5] bg-[#f8fafc] px-6 py-4">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#64748b]">
                Document Name
              </p>
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#64748b]">
                Last Updated
              </p>
              <p className="text-right text-[11px] font-extrabold uppercase tracking-wide text-[#64748b]">
                Upload Action
              </p>
            </div>

            {requiredDocs.map((doc) => {
              const Icon = doc.icon;
              return (
                <div
                  key={doc.id}
                  className="grid grid-cols-[1.8fr_1fr_1fr] items-center border-b border-[#eef2f7] px-6 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-[#eef2f7] text-[#1f4ac3]">
                      <Icon size={17} strokeWidth={2.3} />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[#0f172a]">{doc.name}</p>
                      <p className="text-[11px] font-medium text-[#94a3b8]">{doc.formats}</p>
                    </div>
                  </div>
                  <p className={`text-[13px] font-medium ${doc.isUploaded ? "text-[#334155]" : "italic text-[#9ca3af]"}`}>
                    {doc.lastUpdated}
                  </p>
                  <div className="text-right">
                    <button className="inline-flex items-center gap-1.5 rounded-md bg-[#1f4ac3] px-3.5 py-2 text-[12px] font-semibold text-white transition hover:bg-[#1d43b1]">
                      <Upload size={13} strokeWidth={2.4} />
                      Upload Document
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#f8fafc] px-6 py-4">
              <p className="text-[12px] font-medium text-[#94a3b8]">
                Showing 5 of 5 required documents
              </p>
              <div className="inline-flex items-center rounded-md border border-[#e2e8f0] bg-white">
                <button className="px-3 py-1.5 text-[12px] font-medium text-[#cbd5e1]" disabled>
                  Previous
                </button>
                <button className="border-l border-[#e2e8f0] px-3 py-1.5 text-[12px] font-medium text-[#cbd5e1]" disabled>
                  Next
                </button>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
