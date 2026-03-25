"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Building2, Copy, UserRound } from "lucide-react";
import AcademicRecordsTabs from "@/src/AcademicRecordsTabs";

const documentGroups = [
  {
    id: "hod",
    title: "HOD Documents",
    description:
      "Head of Department administrative records, meeting minutes, and faculty approvals.",
    icon: Building2,
    path: "/studashboard/e-learning/learning-dashboard/records/documentation/hodrequireddoc",
  },
  {
    id: "advisor",
    title: "Level Advisor Documents",
    description:
      "Student academic records, course registration forms, and advisor-level memos.",
    icon: UserRound,
    path: "/studashboard/e-learning/learning-dashboard/records/documentation",
  },
  {
    id: "core",
    title: "Core Documents",
    description:
      "Faculty-wide policies, general curriculum standards, and accreditation materials.",
    icon: Copy,
    path: "/studashboard/e-learning/learning-dashboard/records/documentation",
  },
];

export default function RecordsDocumentationPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen bg-[#f8fafc] text-[#334155]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <main className="mx-auto max-w-[1260px] px-6 py-4 lg:px-10">
        <AcademicRecordsTabs activeTab="documentation" />

        <section className="pt-16">
          <h1 className="text-[32px] font-extrabold tracking-tight text-[#0f172a]">
            Document Upload Center
          </h1>
          <p className="mt-3 text-[14px] font-medium text-[#94a3b8]">
            Submit and manage your official academic credentials for
            verification by the admissions office.
          </p>

          <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {documentGroups.map((group) => {
              const Icon = group.icon;
              return (
                <button
                  key={group.id}
                  onClick={() => router.push(group.path)}
                  className="relative rounded-[18px] rounded-tl-[0px] border border-[#d8dee8] bg-white px-8 pb-14 pt-10 text-center shadow-[0_1px_0_rgba(15,23,42,0.02)] transition hover:border-[#cbd5e1] hover:shadow-sm"
                >
                  <div className="absolute left-0 top-[-10px] h-[12px] w-[118px] rounded-tr-[18px] rounded-tl-[8px] bg-[#2f55c8]" />
                  <div className="mx-auto flex size-[70px] items-center justify-center rounded-full bg-[#e8edf9] text-[#2f55c8]">
                    <Icon size={38} strokeWidth={2.1} />
                  </div>
                  <h2 className="mt-8 text-[21px] font-extrabold tracking-tight text-[#1f2937]">
                    {group.title}
                  </h2>
                  <p className="mx-auto mt-1 max-w-[590px] text-[12px] font-medium leading-[1.35] text-[#6b7280]">
                    {group.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
