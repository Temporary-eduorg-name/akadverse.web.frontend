"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, FilePlus2, FolderCog } from "lucide-react";

export default function StaffManageArchivePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-[#1f2937]">
      <main className="mx-auto w-full max-w-[760px] px-6 pb-12 pt-8">
        <div className="mb-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/staffdashboard/academic-records")}
            className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-[#64748b] transition-colors hover:bg-white hover:text-[#1f2937]"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            <span className="text-[13px] font-semibold">Back</span>
          </button>
        </div>

        <section>
          <h1 className="text-[28px] font-extrabold text-[#1f2937]">
            Document Collections
          </h1>
          <p className="mt-2 max-w-[680px] text-[14px] font-medium leading-7 text-[#70819d]">
            Securely organize and manage academic document repositories for
            certifications, research outcomes, and department-wide syllabus
            tracking.
          </p>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-[#dbe3ef] bg-white px-6 py-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef2ff] text-[#294fbf]">
              <FilePlus2 size={24} strokeWidth={2.1} />
            </div>
            <h2 className="mt-6 text-[18px] font-extrabold text-[#1f2937]">
              Create New Collection
            </h2>
            <p className="mt-2 text-[14px] font-medium leading-7 text-[#70819d]">
              Initialize a fresh repository structure and define metadata
              requirements.
            </p>
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/staffdashboard/academic-records/manage-archive/create-collection",
                )
              }
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#294fbf] px-4 py-3 text-[13px] font-semibold text-white transition hover:bg-[#2342a1]"
            >
              Launch Creation Wizard
              <ArrowRight size={14} strokeWidth={2.4} />
            </button>
          </article>

          <article className="rounded-2xl border border-[#dbe3ef] bg-white px-6 py-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f8fafc] text-[#475569]">
              <FolderCog size={24} strokeWidth={2.1} />
            </div>
            <h2 className="mt-6 text-[18px] font-extrabold text-[#1f2937]">
              Manage Collections
            </h2>
            <p className="mt-2 text-[14px] font-medium leading-7 text-[#70819d]">
              Review active document sets and modify access permissions.
            </p>
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/staffdashboard/academic-records/manage-archive/active-collections",
                )
              }
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#294fbf] px-4 py-3 text-[13px] font-semibold text-white transition hover:bg-[#2342a1]"
            >
              View Active Collections
              <ArrowRight size={14} strokeWidth={2.4} />
            </button>
          </article>
        </section>
      </main>
    </div>
  );
}
