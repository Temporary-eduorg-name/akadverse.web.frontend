"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { getDashboardRoot } from "@/src/marketplaceRouteUtils";

type NotificationItem = {
  id: string;
  source: "notification" | "skill";
  type: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: string;
};

const formatRelativeTime = (value: string) => {
  const createdAt = new Date(value).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - createdAt);
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;

  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(value).toLocaleDateString();
};

export default function NotificationBell() {
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const dashboardRoot = getDashboardRoot(pathname);

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/notifications?limit=20", {
        credentials: "include",
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(Number(data.unreadCount || 0));
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        credentials: "include",
      });

      if (!response.ok) {
        return;
      }

      setUnreadCount(0);
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const markOneRead = async (item: NotificationItem) => {
    if (item.read) return;

    try {
      const response = await fetch(`/api/notifications/${item.source}:${item.id}`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!response.ok) {
        return;
      }

      setNotifications((prev) =>
        prev.map((entry) =>
          entry.source === item.source && entry.id === item.id
            ? { ...entry, read: true }
            : entry
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const resolveNotificationLink = (item: NotificationItem) => {
    if (item.link) {
      return item.link;
    }

    if (item.source === "skill") {
      return `${dashboardRoot}/main-menu/marketplace/dashboard/skills`;
    }

    if (item.type === "schedule_created" || item.type === "task_deadline_reached") {
      return `${dashboardRoot}/main-menu/essentials/schedule-manager`;
    }

    return null;
  };

  useEffect(() => {
    fetchNotifications();

    try {
      const eventSource = new EventSource("/api/notifications/stream");
      eventSourceRef.current = eventSource;

      eventSource.addEventListener("update", (event) => {
        const payload = JSON.parse((event as MessageEvent).data) as {
          unreadCount?: number;
        };

        setUnreadCount(payload.unreadCount ?? 0);
      });

      eventSource.addEventListener("error", () => {
        eventSource.close();
        eventSourceRef.current = null;
      });
    } catch (error) {
      console.error("Failed to start notifications stream:", error);
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Notifications"
        title="Notifications"
        onClick={() => {
          const next = !isOpen;
          setIsOpen(next);
          if (next) {
            fetchNotifications();
          }
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[min(24rem,calc(100vw-1rem))] sm:w-96 max-w-[calc(100vw-1rem)] bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={markAllRead}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400"
              disabled={unreadCount === 0}
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-6 text-sm text-gray-500">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-500">No notifications yet.</div>
            ) : (
              <ul>
                {notifications.map((item) => (
                  <li key={`${item.source}:${item.id}`}>
                    <button
                      type="button"
                      onClick={async () => {
                        await markOneRead(item);
                        setIsOpen(false);
                        const targetLink = resolveNotificationLink(item);
                        if (targetLink) {
                          router.push(targetLink);
                        }
                      }}
                      className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        item.read ? "bg-white" : "bg-red-50/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm text-gray-800 leading-snug">{item.message}</p>
                        {!item.read && <span className="mt-1 w-2 h-2 bg-red-500 rounded-full" />}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{formatRelativeTime(item.createdAt)}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
