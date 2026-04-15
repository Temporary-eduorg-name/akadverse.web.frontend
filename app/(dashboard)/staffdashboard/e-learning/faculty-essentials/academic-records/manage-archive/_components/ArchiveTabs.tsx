"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FileCheck2, FileUp, FolderOpenDot } from "lucide-react";

type ArchiveTabsProps = {
  activeTab: "grade-upload" | "document-collection" | "grade-verification";
};

export default function ArchiveTabs({ activeTab }: ArchiveTabsProps) {
  const router = useRouter();

  return (
    <div className="rounded-md bg-white px-4 shadow-sm">
      <div className="mx-auto flex h-12 items-end justify-center gap-10">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/staffdashboard/e-learning/faculty-essentials/academic-records/grade-upload",
            )
          }
          className={`relative pb-2 text-[13px] font-semibold transition-colors ${
            activeTab === "grade-upload"
              ? "text-[#294fbf]"
              : "text-[#6b7280] hover:text-[#334155]"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <FileUp size={13} strokeWidth={2.4} />
            Grade upload
          </span>
          {activeTab === "grade-upload" ? (
            <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#294fbf]" />
          ) : null}
        </button>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/staffdashboard/e-learning/faculty-essentials/academic-records/manage-archive/manage-archive",
            )
          }
          className={`relative pb-2 text-[13px] font-semibold transition-colors ${
            activeTab === "document-collection"
              ? "text-[#294fbf]"
              : "text-[#6b7280] hover:text-[#334155]"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <FolderOpenDot size={13} strokeWidth={2.4} />
            Document collection
          </span>
          {activeTab === "document-collection" ? (
            <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#294fbf]" />
          ) : null}
        </button>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/staffdashboard/e-learning/faculty-essentials/academic-records/verify-result",
            )
          }
          className={`relative pb-2 text-[13px] font-semibold transition-colors ${
            activeTab === "grade-verification"
              ? "text-[#294fbf]"
              : "text-[#6b7280] hover:text-[#334155]"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <FileCheck2 size={13} strokeWidth={2.4} />
            Grade verification
          </span>
          {activeTab === "grade-verification" ? (
            <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#294fbf]" />
          ) : null}
        </button>
      </div>
    </div>
  );
}
