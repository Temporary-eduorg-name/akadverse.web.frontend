"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMarketplaceBase } from "./marketplaceRouteUtils";

export default function ActivityDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [hasOfferActivity, setHasOfferActivity] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const marketplaceBase = getMarketplaceBase(pathname);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    try {
      const eventSource = new EventSource("/api/marketplace/realtime/events?scope=buyer");
      eventSourceRef.current = eventSource;

      eventSource.addEventListener("update", (event) => {
        const data = JSON.parse((event as MessageEvent).data);
        // Show notification dot only if skill owner made updates (unreadOfferNotifications > 0)
        setHasOfferActivity(data.unreadOfferNotifications > 0);
      });

      eventSource.addEventListener("error", () => {
        console.error("Activity real-time listener disconnected");
        eventSource.close();
        eventSourceRef.current = null;
      });
    } catch (error) {
      console.error("Failed to setup activity real-time listener:", error);
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          // Mark notifications as read when opening dropdown
          if (!isOpen) {
            fetch("/api/marketplace/buyer-notifications", {
              method: "PATCH",
              credentials: "include",
            }).catch((error) => console.error("Failed to mark notifications as read:", error));
          }
        }}
        className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors relative"
      >
        Activity
        {hasOfferActivity && (
          <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50"
            style={{
              maxWidth: "calc(100vw - 32px)",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <div className="p-2">
              <Link
                href={`${marketplaceBase}/activity/orders`}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-sm"
              >
                My Orders
              </Link>
              <Link
                href={`${marketplaceBase}/activity/offers`}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-2 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-sm"
              >
                <span>My Offers</span>
                {hasOfferActivity && (
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

