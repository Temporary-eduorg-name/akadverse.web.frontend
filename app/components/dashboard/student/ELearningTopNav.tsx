"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, FileText, LayoutGrid, Lightbulb, Video } from "lucide-react";

type TopNavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
};

const TOP_NAV_ITEMS: TopNavItem[] = [
  {
    id: "learning-dashboard",
    label: "Learning Dashboard",
    icon: LayoutGrid,
    path: "/studashboard/e-learning/learning-dashboard",
  },
  {
    id: "course-control",
    label: "Course Control",
    icon: BookOpen,
    path: "/studashboard/e-learning/course-control",
  },
  {
    id: "academic-records",
    label: "Academic Records",
    icon: FileText,
    path: "/studashboard/e-learning/academic-records/performance-overview",
  },
  {
    id: "my-learning",
    label: "My Learning",
    icon: Lightbulb,
    path: "/studashboard/e-learning/my-learning",
  },
  {
    id: "learning-resource",
    label: "Learning Resource",
    icon: Video,
    path: "/studashboard/e-learning/learning-resources",
  },
];

export default function ELearningTopNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="mb-6 overflow-x-auto rounded-2xl border border-[#dce5f1] bg-white/90 p-2 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="flex min-w-max items-center gap-2">
        {TOP_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.path || pathname.startsWith(`${item.path}/`);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => router.push(item.path)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? "bg-[#1e40af] text-white shadow-[0_10px_20px_rgba(30,64,175,0.2)]"
                  : "text-slate-600 hover:bg-[#eef4ff] hover:text-[#1e40af]"
              }`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
