"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Calculator,
  ClipboardCheck,
  FileText,
  FileUp,
} from "lucide-react";

export type AcademicRecordsTabId =
  | "performance"
  | "cgpa"
  | "records"
  | "assessment"
  | "documentation";

type TabItem = {
  id: AcademicRecordsTabId;
  label: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
  path: string;
};

const tabItems: TabItem[] = [
  {
    id: "performance",
    label: "Academic Performance Analysis",
    icon: BarChart3,
    path: "/studashboard/e-learning/learning-dashboard/records/performance-overview",
  },
  {
    id: "cgpa",
    label: "CGPA calculator",
    icon: Calculator,
    path: "/studashboard/e-learning/learning-dashboard/records/cgpa-calculator",
  },
  {
    id: "records",
    label: "Academic Records",
    icon: FileText,
    path: "/studashboard/e-learning/learning-dashboard/records/results",
  },
  {
    id: "assessment",
    label: "Academic Assessment",
    icon: ClipboardCheck,
    path: "/studashboard/e-learning/learning-dashboard/records/assessment",
  },
  {
    id: "documentation",
    label: "Document Upload",
    icon: FileUp,
    path: "/studashboard/e-learning/learning-dashboard/records/documentation",
  },
];

export default function AcademicRecordsTabs({
  activeTab,
}: {
  activeTab: AcademicRecordsTabId;
}) {
  const router = useRouter();
  const learningEssentialsPath =
    "/studashboard/e-learning/learning-dashboard/learning-essentials";

  return (
    <header className="flex items-center gap-2 border-b border-[#e5e7eb] pb-1">
      <button
        type="button"
        aria-label="Back to learning essentials"
        className="shrink-0 rounded-md p-2 text-[#94a3b8] transition-colors hover:bg-[#eef2ff] hover:text-[#475569]"
        onClick={() => router.push(learningEssentialsPath)}
      >
        <ArrowLeft size={17} strokeWidth={2.4} />
      </button>

      <nav className="flex-1 overflow-x-auto">
        <div className="flex min-w-max items-end gap-4 md:gap-8">
          {tabItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeTab;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => router.push(item.path)}
                className={`relative inline-flex items-center gap-2 whitespace-nowrap px-1 py-3 text-[13px] font-semibold transition-colors ${
                  isActive
                    ? "text-[#2f55c8]"
                    : "text-[#64748b] hover:text-[#334155]"
                }`}
              >
                <Icon size={14} strokeWidth={2.4} />
                <span>{item.label}</span>
                {isActive ? (
                  <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-t-full bg-[#2f55c8]" />
                ) : null}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
