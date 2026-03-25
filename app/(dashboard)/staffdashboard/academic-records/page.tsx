"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import module1 from "@/src/icons/module1.svg";
import module2 from "@/src/icons/module2.svg";
import module3 from "@/src/icons/module3.svg";
import {
  Archive,
  BellDot,
  Book,
  CheckCircle2,
  FileText,
  FileUp,
  LogOut,
  Search,
  ShieldCheck,
  User,
} from "lucide-react";

type StaffTab = "academic-records" | "document-collection";

type ModuleCard = {
  id: string;
  module: string;
  title: string;
  actionText: string;
  actionPath?: string;
  helperText: string;
  tint: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
  iconTint: string;
};

const documentCollectionModules: ModuleCard[] = [
  {
    id: "module-1",
    module: "MODULE 01",
    title: "Grade Upload",
    actionText: "Upload New Grades",
    actionPath: "/staffdashboard/academic-records/grade-upload",
    helperText: "Last uploaded: 2 hours ago",
    tint: "bg-[#dfe7f8]",
    icon: FileUp,
    iconTint: "text-[#89a1df]",
  },
  {
    id: "module-2",
    module: "MODULE 02",
    title: "Verify Result",
    actionText: "Process Submissions",
    actionPath: "/staffdashboard/academic-records/verify-result",
    helperText: "",
    tint: "bg-[#d5efe9]",
    icon: ShieldCheck,
    iconTint: "text-[#70c5af]",
  },
  {
    id: "module-3",
    module: "MODULE 03",
    title: "Document Collection",
    actionText: "Manage Archive",
    actionPath: "/staffdashboard/academic-records/manage-archive",
    helperText: "15 new files today",
    tint: "bg-[#e5dcf4]",
    icon: Archive,
    iconTint: "text-[#b08ce8]",
  },
];

const academicRecordModules: ModuleCard[] = [
  {
    id: "module-a1",
    module: "MODULE 01",
    title: "Result Ledger",
    actionText: "Open Gradebook",
    helperText: "18 classes synced",
    tint: "bg-[#dfe7f8]",
    icon: FileText,
    iconTint: "text-[#89a1df]",
  },
  {
    id: "module-a2",
    module: "MODULE 02",
    title: "Academic Validation",
    actionText: "Run Validation",
    helperText: "6 records need review",
    tint: "bg-[#d5efe9]",
    icon: CheckCircle2,
    iconTint: "text-[#52b79b]",
  },
  {
    id: "module-a3",
    module: "MODULE 03",
    title: "Semester Archive",
    actionText: "View Records",
    helperText: "2024/2025 session active",
    tint: "bg-[#e5dcf4]",
    icon: Archive,
    iconTint: "text-[#b08ce8]",
  },
];

export default function StaffAcademicRecordsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<StaffTab>("document-collection");

  const activeModules =
    activeTab === "document-collection"
      ? documentCollectionModules
      : academicRecordModules;

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Book size={28} className="text-blue-600" />
            <span className="text-lg font-semibold text-blue-600">
              AkadVerse
            </span>
          </div>

          <div className="relative mx-6 max-w-sm flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search records..."
              className="w-full rounded-full border border-gray-200 bg-gray-100 py-2 pl-12 pr-4 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-600 transition-colors hover:text-gray-800">
              <BellDot size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                Faculty Profile
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <User size={16} className="text-blue-600" />
              </div>
            </div>
            <button
              className="text-gray-400 transition-colors hover:text-gray-600"
              onClick={() => router.push("/login")}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[920px] py-10">
        <div className="rounded-md bg-white px-4 shadow-sm">
          <div className="mx-auto flex h-12 items-end justify-center gap-10">
            <button
              type="button"
              onClick={() => setActiveTab("academic-records")}
              className={`relative pb-2 text-[13px] font-semibold transition-colors ${
                activeTab === "academic-records"
                  ? "text-[#294fbf]"
                  : "text-[#6b7280] hover:text-[#334155]"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <FileText size={13} strokeWidth={2.4} />
                Academic Records
              </span>
              {activeTab === "academic-records" ? (
                <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#294fbf]" />
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("document-collection")}
              className={`relative pb-2 text-[13px] font-semibold transition-colors ${
                activeTab === "document-collection"
                  ? "text-[#294fbf]"
                  : "text-[#6b7280] hover:text-[#334155]"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <FileUp size={13} strokeWidth={2.4} />
                Document Collection
              </span>
              {activeTab === "document-collection" ? (
                <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#294fbf]" />
              ) : null}
            </button>
          </div>
        </div>

        <section className="mt-10 space-y-6">
          {activeModules.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.id}
                className="grid overflow-hidden rounded-xl border border-[#dbe3ef] bg-white md:grid-cols-[300px_1fr]"
              >
                <div
                  className={`flex min-h-[118px] items-center justify-center ${item.tint}`}
                >
                  <Icon size={42} strokeWidth={2.1} className={item.iconTint} />
                </div>

                <div className="px-5 py-5">
                  <Image
                    src={
                      item.module === "MODULE 01"
                        ? module3
                        : item.module === "MODULE 02"
                          ? module1
                          : module2
                    }
                    height={15}
                    width={15}
                    alt="Module Icon"
                    className="inline-block"
                  /> {"  "}
                  <p className="text-[14px] inline-block font-extrabold uppercase tracking-wider text-[#344055]">
                    {item.module}
                  </p>
                  <h2 className="text-[21px] pt-2 font-extrabold leading-none text-[#1f2937]">
                    {item.title}
                  </h2>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (item.actionPath) {
                          router.push(item.actionPath);
                        }
                      }}
                      className="rounded-md bg-[#244bbf] px-5 py-2 text-[12px] font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-[#1f40a4]"
                    >
                      {item.actionText}
                    </button>

                    {item.id === "module-2" &&
                    activeTab === "document-collection" ? (
                      <div className="flex items-center">
                        <div className="-mr-2 h-6 w-6 rounded-full border-2 border-white bg-[#c5cedb]" />
                        <div className="-mr-2 h-6 w-6 rounded-full border-2 border-white bg-[#aab8cd]" />
                        <div className="h-6 w-6 rounded-full border-2 border-white bg-[#94a3bf]" />
                        <span className="-ml-2 rounded-full bg-[#c7d2fe] px-1.5 py-0.5 text-[10px] font-extrabold text-[#1e40af]">
                          +42
                        </span>
                      </div>
                    ) : null}

                    {item.helperText ? (
                      <p className="text-[12px] font-medium text-[#9aa5b5]">
                        {item.helperText}
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
