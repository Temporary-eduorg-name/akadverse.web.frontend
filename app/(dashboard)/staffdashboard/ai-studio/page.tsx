"use client";

import React from "react";
import StaffDashboardShell from "@/app/components/dashboard/staff/StaffDashboardShell";
import {
  Bot,
  BookOpen,
  Calendar,
  FileText,
  Layout,
  Network,
  HelpCircle,
  CheckCircle,
  FileSpreadsheet,
  FileBox,
} from "lucide-react";

type AITool = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  colorClass: string;
};

const FACULTY_TOOLS: AITool[] = [
  {
    id: "f-va-1",
    name: "Faculty Virtual Assistant",
    description: "Helps faculty manage academic workflows and classes.",
    icon: Bot,
    category: "Virtual Assistant",
    colorClass: "text-indigo-500 bg-indigo-50 border-indigo-100",
  },
  {
    id: "f-va-2",
    name: "Teaching Virtual Assistant",
    description: "Helps prepare lecture materials and explain topics.",
    icon: BookOpen,
    category: "Virtual Assistant",
    colorClass: "text-purple-500 bg-purple-50 border-purple-100",
  },
  {
    id: "f-p-1",
    name: "Workspace Integration AI",
    description: "Interact with your docs, sheets, and files using AI.",
    icon: FileBox,
    category: "Productivity AI",
    colorClass: "text-blue-500 bg-blue-50 border-blue-100",
  },
  {
    id: "f-p-2",
    name: "Schedule Manager AI",
    description: "AI planner for managing study time and schedules.",
    icon: Calendar,
    category: "Productivity AI",
    colorClass: "text-emerald-500 bg-emerald-50 border-emerald-100",
  },
  {
    id: "f-t-1",
    name: "Note Creator",
    description: "Generate structured lecture notes.",
    icon: FileText,
    category: "Teaching AI Tools",
    colorClass: "text-rose-500 bg-rose-50 border-rose-100",
  },
  {
    id: "f-t-2",
    name: "Slide Creator",
    description: "Create presentation slides automatically.",
    icon: Layout,
    category: "Teaching AI Tools",
    colorClass: "text-amber-500 bg-amber-50 border-amber-100",
  },
  {
    id: "f-t-3",
    name: "External Resource Puller",
    description: "Find academic papers and resources.",
    icon: Network,
    category: "Teaching AI Tools",
    colorClass: "text-cyan-500 bg-cyan-50 border-cyan-100",
  },
  {
    id: "f-t-4",
    name: "Assignment Generator",
    description: "Create comprehensive assignments.",
    icon: FileText,
    category: "Teaching AI Tools",
    colorClass: "text-teal-500 bg-teal-50 border-teal-100",
  },
  {
    id: "f-t-5",
    name: "Sample Question Generator",
    description: "Draft exam and quiz questions.",
    icon: HelpCircle,
    category: "Teaching AI Tools",
    colorClass: "text-violet-500 bg-violet-50 border-violet-100",
  },
  {
    id: "f-o-1",
    name: "Attendance AI",
    description: "Helps automate attendance processing.",
    icon: CheckCircle,
    category: "Operational AI",
    colorClass: "text-sky-500 bg-sky-50 border-sky-100",
  },
  {
    id: "f-o-2",
    name: "Test & Grading Upload AI",
    description: "Upload grade sheets and process scores.",
    icon: FileSpreadsheet,
    category: "Operational AI",
    colorClass: "text-lime-500 bg-lime-50 border-lime-100",
  },
];

export default function StaffAIStudio() {
  return (
    <StaffDashboardShell contentClassName="bg-white px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">AI Studio</h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FACULTY_TOOLS.map((tool) => (
            <div
              key={tool.id}
              className={`flex flex-col gap-2 rounded-xl border bg-white p-6 shadow ${tool.colorClass}`}
            >
              <div className="mb-2 flex items-center gap-3">
                <tool.icon className="h-7 w-7" />
                <span className="text-lg font-semibold">{tool.name}</span>
              </div>
              <p className="text-sm text-gray-700">{tool.description}</p>
              <span className="mt-2 inline-block rounded bg-gray-100 px-2 py-1 text-xs">
                {tool.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </StaffDashboardShell>
  );
}
