"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  FileText,
  Folder,
  GraduationCap,
  Library,
  Lightbulb,
} from "lucide-react";

type SidebarSubItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
};

type SidebarItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
  subItems?: SidebarSubItem[];
};

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    id: "learning-dashboard",
    label: "Learning Dashboard",
    icon: GraduationCap,
    path: "/studashboard/e-learning/learning-dashboard",
  },
  {
    id: "learning-essentials",
    label: "Learning Essentials",
    icon: Folder,
    subItems: [
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
        label: "My learning",
        icon: Lightbulb,
        path: "/studashboard/e-learning/my-learning",
      },
    ],
  },
  {
    id: "learning-resource",
    label: "Learning Resource",
    icon: Library,
    path: "/studashboard/e-learning/learning-resources",
  },
];

function isActivePath(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export default function ELearningSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const learningEssentialsExpanded = SIDEBAR_ITEMS[1].subItems?.some((item) =>
    isActivePath(pathname, item.path),
  );

  return (
    <aside className="hidden h-full w-[288px] shrink-0 flex-col border-r border-white/10 bg-[#1e40af] text-white xl:flex">
      <div className="px-6 pb-5 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <svg
              width="22"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon
                points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
                fill="white"
                stroke="white"
              />
            </svg>
          </div>
          <div>
            <p className="text-[18px] font-bold leading-[22px]">
              Learning Dashboard
            </p>
            <p className="text-[12px] text-white/60">Vibrant Blue Edition</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const hasSubItems = Boolean(item.subItems?.length);
          const isItemActive = item.path
            ? isActivePath(pathname, item.path)
            : (item.subItems?.some((subItem) =>
                isActivePath(pathname, subItem.path),
              ) ?? false);

          return (
            <div key={item.id} className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  if (item.path) {
                    router.push(item.path);
                  }
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-[15px] transition-all ${
                  isItemActive
                    ? "bg-white/40 font-medium text-white"
                    : "font-normal text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </span>
                {hasSubItems ? (
                  <ChevronDown
                    size={16}
                    className={learningEssentialsExpanded ? "rotate-180" : ""}
                  />
                ) : null}
              </button>

              {hasSubItems && learningEssentialsExpanded ? (
                <div className="ml-5 space-y-2 border-l border-white/15 pl-4">
                  {item.subItems?.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isSubItemActive = isActivePath(
                      pathname,
                      subItem.path,
                    );

                    return (
                      <button
                        key={subItem.id}
                        type="button"
                        onClick={() => router.push(subItem.path)}
                        className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-[14px] transition-all ${
                          isSubItemActive
                            ? "bg-white/30 font-semibold text-white"
                            : "text-white/75 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <SubIcon size={16} />
                        <span>{subItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
