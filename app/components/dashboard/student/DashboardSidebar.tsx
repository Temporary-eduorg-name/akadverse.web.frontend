'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Lightbulb,
  Folder,
  ChevronDown,
  ChevronLeft,
  Mail,
  Calendar,
  CheckCircle,
} from 'lucide-react';

type DashboardSidebarProps = {
  collapsed?: boolean;
  className?: string;
  onWidthChange?: (width: number) => void;
};

const DashboardSidebar = ({ collapsed = false, className = '', onWidthChange }: DashboardSidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [essentialsExpanded, setEssentialsExpanded] = useState(pathname.startsWith('/studashboard/main-menu/essentials'));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (collapsed) {
      onWidthChange?.(56);
      return;
    }

    onWidthChange?.(sidebarCollapsed ? 64 : 256);
  }, [collapsed, sidebarCollapsed, onWidthChange]);

  const navItems = [
    { id: 'dashboard', label: 'Student Dashboard', icon: LayoutDashboard, path: '/studashboard/main-menu/student-dashboard', subItems: null },
    { id: 'marketplace', label: 'Marketplace', icon: BookOpen, path: '/studashboard/main-menu/marketplace', subItems: null },
    {
      id: 'essentials',
      label: 'Student Essentials',
      icon: Folder,
      path: null,
      subItems: [
        { id: 'email', label: 'Email', icon: Mail, path: '/studashboard/main-menu/essentials/email' },
        { id: 'schedule', label: 'Schedule Manager', icon: Calendar, path: '/studashboard/main-menu/essentials/schedule-manager' },
        { id: 'attendance', label: 'Attendance', icon: CheckCircle, path: '/studashboard/main-menu/essentials/attendance' },
        { id: 'suggestions', label: 'Suggestions', icon: Lightbulb, path: '/studashboard/main-menu/essentials/suggestions' },
      ],
    },
  ];

  const isActive = (path: string | null) => {
    if (!path) return false;
    return pathname === path;
  };

  const isEssentialsSectionActive = pathname.startsWith('/studashboard/main-menu/essentials');
  const compactItems = [
    { id: 'dashboard', icon: LayoutDashboard, path: '/studashboard/main-menu/student-dashboard' },
    { id: 'marketplace', icon: BookOpen, path: '/studashboard/main-menu/marketplace' },
    { id: 'essentials', icon: Folder, path: '/studashboard/main-menu/essentials/suggestions' },
  ];

  if (collapsed) {
    return (
      <div className={`fixed left-0 top-[70px] w-14 h-[calc(100vh-70px)] bg-white border-r border-gray-200 z-30 ${className}`}>
        <nav className="p-2 space-y-2">
          {compactItems.map((item) => {
            const active = item.id === 'essentials' ? isEssentialsSectionActive : isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                  active ? 'text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
                title={item.id}
                aria-label={item.id}
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
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 256 }}
      transition={{ duration: 0.26, ease: [0.25, 0.1, 0.25, 1] }}
      className={`fixed left-0 top-[70px] h-[calc(100vh-70px)] bg-white border-r border-gray-200 z-30 overflow-hidden ${className}`}
    >
      <div className={sidebarCollapsed ? 'flex justify-center pt-2 pb-1' : 'relative flex items-center justify-end px-4 pt-3 pb-2'}>
        {!sidebarCollapsed && <p className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-gray-900 tracking-wide">Main Menu</p>}
        <motion.button
          whileTap={{ scale: 0.96 }}
          className={
            sidebarCollapsed
              ? 'h-8 w-8 rounded-[10px] border-2 border-[#d1d9e6] bg-white text-[#8492a6] hover:text-[#667eea] hover:border-[#667eea] flex items-center justify-center shadow-[0_2px_12px_rgba(15,23,42,0.1)] transition-colors duration-200'
              : 'h-8 w-8 rounded-[10px] border-2 border-[#d1d9e6] bg-white text-[#8492a6] hover:text-[#667eea] hover:border-[#667eea] flex items-center justify-center shadow-[0_2px_12px_rgba(15,23,42,0.1)] transition-colors duration-200'
          }
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.span
            initial={false}
            animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
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
            className="p-2 space-y-2"
          >
            {compactItems.map((item) => {
              const active = item.id === 'essentials' ? isEssentialsSectionActive : isActive(item.path);
              return (
                <button
                  key={item.id}
                  onClick={() => router.push(item.path)}
                  className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                    active ? 'text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                  title={item.id}
                  aria-label={item.id}
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
            className="p-6 space-y-2"
          >
            {navItems.map((item) => {
              const itemActive = item.id === 'essentials' ? isEssentialsSectionActive : isActive(item.path);

              return (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      if (item.path) {
                        router.push(item.path);
                      } else {
                        setEssentialsExpanded(!essentialsExpanded);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-[10px] text-sm font-medium transition-all ${
                      itemActive ? 'text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={16} />
                      <span>{item.label}</span>
                    </div>
                    {item.subItems && <ChevronDown size={16} className={`transition-transform ${essentialsExpanded ? 'rotate-180' : ''}`} />}
                  </button>

                  {item.subItems && essentialsExpanded && (
                    <div className="mt-2 ml-6 space-y-2 border-l-2 border-gray-200">
                      {item.subItems.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => router.push(subItem.path)}
                          className={`w-full text-left px-3 py-2 rounded text-xs transition-all flex items-center gap-2 ${
                            isActive(subItem.path)
                              ? 'font-semibold text-blue-600'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          {subItem.icon && <subItem.icon size={14} />}
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};

export default DashboardSidebar;
