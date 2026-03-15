"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationsComponentProps {
  onActivityChange?: () => void;
}

export default function NotificationsComponent({ onActivityChange }: NotificationsComponentProps) {
  const params = useParams();
  const businessId = params.id as string;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, [businessId]);

  useEffect(() => {
    if (!businessId) return;

    const eventSource = new EventSource(
      `/api/realtime/events?scope=seller&businessId=${businessId}`
    );

    const onUpdate = () => {
      fetchNotifications();
    };

    eventSource.addEventListener("update", onUpdate);

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.removeEventListener("update", onUpdate);
      eventSource.close();
    };
  }, [businessId]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `/api/businesses/${businessId}/notifications`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/businesses/${businessId}/notifications/${notificationId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ read: true }),
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        onActivityChange?.();
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/businesses/${businessId}/notifications/${notificationId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== notificationId)
        );
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return "📦";
      case "payment":
        return "💳";
      case "review":
        return "⭐";
      default:
        return "🔔";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div>
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-600 dark:text-zinc-400">
            No notifications yet
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-lg border p-4 flex items-start justify-between ${
                notification.read
                  ? "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                  : "bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800"
              }`}
            >
              <div className="flex items-start gap-4 flex-1">
                <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      notification.read
                        ? "text-zinc-600 dark:text-zinc-400"
                        : "text-blue-900 dark:text-blue-100"
                    }`}
                  >
                    {notification.type.charAt(0).toUpperCase() +
                      notification.type.slice(1)}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      notification.read
                        ? "text-zinc-700 dark:text-zinc-300"
                        : "text-blue-800 dark:text-blue-200"
                    }`}
                  >
                    {notification.message}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                    {new Date(notification.createdAt).toLocaleDateString()} at{" "}
                    {new Date(notification.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {!notification.read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    Read
                  </button>
                )}
                <button
                  onClick={() => handleDeleteNotification(notification.id)}
                  className="text-sm px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
