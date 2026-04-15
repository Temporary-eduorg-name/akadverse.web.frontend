"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMarketplaceBase } from "./marketplaceRouteUtils";
import { Activity } from "lucide-react";
import { useMarketplaceActivity } from "./context/MarketplaceActivityContext";

export default function ActivityDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const marketplaceBase = getMarketplaceBase(pathname);
  const { setScope, buyerActivity } = useMarketplaceActivity();

  useEffect(() => {
    setScope("buyer");
  }, [setScope]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // (Removed local EventSource logic, now handled by context)

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
        className="group flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors relative"
        title="Activity"
      >
        <span className="font-semibold text-sm text-slate-700 group-hover:text-indigo-900 transition-colors">Activity</span>
        {buyerActivity.hasOfferActivity && (
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
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-zinc-200 rounded-lg shadow-lg z-50"
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
                className="block px-4 py-2 text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors text-sm"
              >
                My Orders
              </Link>
              <Link
                href={`${marketplaceBase}/activity/offers`}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-2 text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors text-sm"
              >
                <span>My Offers</span>
                {buyerActivity.hasOfferActivity && (
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

