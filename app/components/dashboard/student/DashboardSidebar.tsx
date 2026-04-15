"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  FileText,
  Folder,
  LayoutDashboard,
  Library,
  Lightbulb,
  Mail,
} from "lucide-react";

type DashboardSidebarProps = {
  collapsed?: boolean;
  className?: string;
  onWidthChange?: (width: number) => void;
  desktopSticky?: boolean;
};

type NavSubItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
};

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
  subItems?: NavSubItem[];
};

function matchesPath(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

const mainMenuNavItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Student Dashboard",
    icon: LayoutDashboard,
    path: "/studashboard/main-menu/student-dashboard",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: BookOpen,
    path: "/studashboard/main-menu/marketplace",
  },
  {
    id: "essentials",
    label: "Student Essentials",
    icon: Folder,
    subItems: [
      {
        id: "email",
        label: "Email",
        icon: Mail,
        path: "/studashboard/main-menu/essentials/email",
      },
      {
        id: "schedule",
        label: "Schedule Manager",
        icon: Calendar,
        path: "/studashboard/main-menu/essentials/schedule-manager",
      },
      {
        id: "attendance",
        label: "Attendance",
        icon: CheckCircle,
        path: "/studashboard/main-menu/essentials/attendance",
      },
      {
        id: "suggestions",
        label: "Suggestions",
        icon: Lightbulb,
        path: "/studashboard/main-menu/essentials/suggestions",
      },
    ],
  },
];

const eLearningNavItems: NavItem[] = [
  {
    id: "learning-dashboard",
    label: "Learning Dashboard",
    icon: LayoutDashboard,
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

export default function DashboardSidebar({
  collapsed = false,
  className = "",
  onWidthChange,
  desktopSticky = false,
}: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isELearningContext = pathname.startsWith("/studashboard/e-learning");
  const [essentialsExpanded, setEssentialsExpanded] = useState(
    pathname.startsWith("/studashboard/main-menu/essentials"),
  );
  const [learningEssentialsExpanded, setLearningEssentialsExpanded] = useState(
    pathname.startsWith("/studashboard/e-learning/course-control") ||
      pathname.startsWith("/studashboard/e-learning/academic-records") ||
      pathname.startsWith("/studashboard/e-learning/my-learning"),
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (collapsed) {
      onWidthChange?.(56);
      return;
    }

    onWidthChange?.(sidebarCollapsed ? 64 : 256);
  }, [collapsed, sidebarCollapsed, onWidthChange]);

  useEffect(() => {
    if (pathname.startsWith("/studashboard/main-menu/essentials")) {
      setEssentialsExpanded(true);
    }

    if (
      pathname.startsWith("/studashboard/e-learning/course-control") ||
      pathname.startsWith("/studashboard/e-learning/academic-records") ||
      pathname.startsWith("/studashboard/e-learning/my-learning")
    ) {
      setLearningEssentialsExpanded(true);
    }
  }, [pathname]);

  const navItems = isELearningContext ? eLearningNavItems : mainMenuNavItems;

  const isItemActive = (item: NavItem) => {
    if (item.path) {
      return matchesPath(pathname, item.path);
    }

    return (
      item.subItems?.some((subItem) => matchesPath(pathname, subItem.path)) ??
      false
    );
  };

  const compactItems = isELearningContext
    ? [
        {
          id: "learning-dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          path: "/studashboard/e-learning/learning-dashboard",
        },
        {
          id: "learning-essentials",
          label: "Essentials",
          icon: Folder,
          path: "/studashboard/e-learning/course-control",
        },
        {
          id: "academic-records",
          label: "Records",
          icon: FileText,
          path: "/studashboard/e-learning/academic-records/performance-overview",
        },
        {
          id: "my-learning",
          label: "Learning",
          icon: Lightbulb,
          path: "/studashboard/e-learning/my-learning",
        },
        {
          id: "learning-resource",
          label: "Resources",
          icon: Library,
          path: "/studashboard/e-learning/learning-resources",
        },
      ]
    : [
        {
          id: "dashboard",
          label: "Home",
          icon: LayoutDashboard,
          path: "/studashboard/main-menu/student-dashboard",
        },
        {
          id: "marketplace",
          label: "Market",
          icon: BookOpen,
          path: "/studashboard/main-menu/marketplace",
        },
        {
          id: "essentials",
          label: "Essentials",
          icon: Folder,
          path: "/studashboard/main-menu/essentials/suggestions",
        },
      ];

  if (collapsed) {
    return (
      <div
        className={`fixed bottom-0 left-0 right-0 top-auto h-16 w-auto border-t border-gray-200 bg-white z-30 ${
          desktopSticky
            ? "lg:sticky lg:top-[70px] lg:left-auto lg:right-auto lg:bottom-auto"
            : "lg:fixed lg:left-0 lg:top-[70px] lg:bottom-auto lg:right-auto"
        } lg:flex lg:h-[calc(100vh-70px)] lg:w-14 lg:flex-col lg:border-r lg:border-t-0 ${className}`}
      >
        <nav className="flex h-full items-center gap-1 overflow-x-auto px-2 lg:hidden">
          {compactItems.map((item) => {
            const active = matchesPath(pathname, item.path);

            return (
              <button
                key={`collapsed-mobile-${item.id}`}
                onClick={() => router.push(item.path)}
                className={`flex min-w-[56px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-[10px] font-medium transition-colors ${
                  active
                    ? "text-blue-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
                title={item.label}
                aria-label={item.label}
              >
                <item.icon size={16} />
                <span className="leading-none">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <nav className="hidden h-full overflow-y-auto px-2 lg:block lg:space-y-2 lg:p-2">
          {compactItems.map((item) => {
            const active = matchesPath(pathname, item.path);

            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  active
                    ? "text-blue-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
                title={item.label}
                aria-label={item.label}
              >
                <item.icon size={16} />
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <>
      <nav
        className={`fixed bottom-0 left-0 right-0 z-30 h-14 border-t border-gray-200 bg-white lg:hidden ${className}`}
      >
        <div className="flex h-full items-center gap-1 overflow-x-auto px-2">
          {compactItems.map((item) => {
            const active = matchesPath(pathname, item.path);

            return (
              <button
                key={`mobile-${item.id}`}
                onClick={() => router.push(item.path)}
                className={`flex min-w-[56px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-[10px] font-medium transition-colors ${
                  active
                    ? "text-blue-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
                title={item.label}
                aria-label={item.label}
              >
                <item.icon size={16} />
                <span className="leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 64 : 256 }}
        transition={{ duration: 0.26, ease: [0.25, 0.1, 0.25, 1] }}
        className={`hidden overflow-hidden border-r border-gray-200 bg-white z-30 lg:flex lg:h-[calc(100vh-70px)] lg:flex-col ${desktopSticky ? "sticky top-[70px] self-start" : "fixed left-0 top-[70px]"} ${className}`}
      >
        <div
          className={
            sidebarCollapsed
              ? "flex justify-center pt-2 pb-1"
              : "relative flex items-center justify-end px-4 pb-2 pt-3"
          }
        >
          {!sidebarCollapsed ? (
            <p className="absolute left-1/2 -translate-x-1/2 text-lg font-bold tracking-wide text-gray-900">
              {isELearningContext ? "E-Learning" : "Main Menu"}
            </p>
          ) : null}

          <motion.button
            whileTap={{ scale: 0.96 }}
            className="flex h-8 w-8 items-center justify-center rounded-[10px] border-2 border-[#d1d9e6] bg-white text-[#8492a6] shadow-[0_2px_12px_rgba(15,23,42,0.1)] transition-colors duration-200 hover:border-[#667eea] hover:text-[#667eea]"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <motion.span
              initial={false}
              animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex items-center justify-center"
            >
              <ChevronLeft size={16} />
            </motion.span>
          </motion.button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {sidebarCollapsed ? (
            <motion.nav
              key="sidebar-compact"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.16 }}
              className="flex-1 space-y-2 overflow-y-auto p-2"
            >
              {compactItems.map((item) => {
                const active = matchesPath(pathname, item.path);

                return (
                  <button
                    key={item.id}
                    onClick={() => router.push(item.path)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                      active
                        ? "text-blue-600"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                    title={item.label}
                    aria-label={item.label}
                  >
                    <item.icon size={16} />
                  </button>
                );
              })}
            </motion.nav>
          ) : (
            <motion.nav
              key="sidebar-expanded"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
              className="flex-1 space-y-2 overflow-y-auto p-6"
            >
              {navItems.map((item) => {
                const expanded =
                  item.id === "essentials"
                    ? essentialsExpanded
                    : item.id === "learning-essentials"
                      ? learningEssentialsExpanded
                      : false;

                return (
                  <div key={item.id}>
                    <button
                      onClick={() => {
                        if (item.path) {
                          router.push(item.path);
                          return;
                        }

                        if (item.id === "essentials") {
                          setEssentialsExpanded((prev) => !prev);
                        }

                        if (item.id === "learning-essentials") {
                          setLearningEssentialsExpanded((prev) => !prev);
                        }
                      }}
                      className={`flex w-full items-center justify-between rounded-[10px] px-4 py-3 text-sm font-medium transition-all ${
                        isItemActive(item)
                          ? "text-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <item.icon size={16} />
                        <span>{item.label}</span>
                      </span>
                      {item.subItems ? (
                        <ChevronDown
                          size={16}
                          className={expanded ? "rotate-180" : ""}
                        />
                      ) : null}
                    </button>

                    {item.subItems && expanded ? (
                      <div className="mt-2 ml-6 space-y-2 border-l-2 border-gray-200">
                        {item.subItems.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => router.push(subItem.path)}
                            className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs transition-all ${
                              matchesPath(pathname, subItem.path)
                                ? "font-semibold text-blue-600"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            <subItem.icon size={14} />
                            {subItem.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.aside>
    </>
  );
}
