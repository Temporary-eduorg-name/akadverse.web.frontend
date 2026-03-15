"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import BusinessDropdown from "./BusinessDropdown";
import SkillsDropdown from "./SkillsDropdown";
import ActivityDropdown from "./ActivityDropdown";
import CartDropdown from "./CartDropdown";
import SearchBar from "./SearchBar";
import { getDashboardRoot, getMarketplaceBase } from "./marketplaceRouteUtils";

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className = "" }: NavbarProps) {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [hasBusinessActivity, setHasBusinessActivity] = useState(false);
  const eventSourcesRef = useRef<EventSource[]>([]);
  const setupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dashboardRoot = getDashboardRoot(pathname);
  const marketplaceBase = getMarketplaceBase(pathname);
  const marketplaceLabel = pathname.startsWith("/staffdashboard")
    ? "Faculty Marketplace"
    : "Student Marketplace";

  useEffect(() => {
    if (!isAuthenticated) {
      // Close all EventSources when user logs out
      eventSourcesRef.current.forEach((es) => es.close());
      eventSourcesRef.current = [];
      if (setupTimeoutRef.current) clearTimeout(setupTimeoutRef.current);
      return;
    }
   
    fetchCartCount();

    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Clear any pending setup timeouts
    if (setupTimeoutRef.current) clearTimeout(setupTimeoutRef.current);

    // Close old EventSources before setting up new ones
    eventSourcesRef.current.forEach((es) => es.close());
    eventSourcesRef.current = [];

    // Debounce setup to avoid rapid re-executions
    setupTimeoutRef.current = setTimeout(() => {
      setupBusinessActivityListener();
    }, 300);
    return () => {
      if (setupTimeoutRef.current) clearTimeout(setupTimeoutRef.current);
      // Don't close EventSources on cleanup - let them persist during navigation
      // Only close when authentication changes
    };

  }, [isAuthenticated]);

  const fetchCartCount = async () => {
    try {
      const response = await fetch("/api/marketplace/cart", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setCartCount(data.cartItems?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const setupBusinessActivityListener = async () => {
    try {
      const response = await fetch("/api/marketplace/businesses", { credentials: "include" });
      if (!response.ok) return;

      const data = await response.json();
      const businesses = data.businesses || [];

      if (businesses.length === 0) return;

      const activityMap = new Map<string, boolean>();

      businesses.forEach((business: { id: string }) => {
        const eventSource = new EventSource(
          `/api/marketplace/realtime/events?scope=seller&businessId=${business.id}`
        );

        // Set timeout for connection - if it doesn't connect in 5 seconds, close it
        const connectionTimeout = setTimeout(() => {
          if (eventSource.readyState === EventSource.CONNECTING) {
            eventSource.close();
          }
        }, 5000);

        eventSource.addEventListener("update", (event: MessageEvent) => {
          clearTimeout(connectionTimeout);
          try {
            const payload = JSON.parse(event.data) as {
              pending?: number;
              unreadNotifications?: number;
            };

            const hasActivity =
              (payload.pending ?? 0) > 0 || (payload.unreadNotifications ?? 0) > 0;

            activityMap.set(business.id, hasActivity);
            setHasBusinessActivity(Array.from(activityMap.values()).some((v) => v));
          } catch {}
        });

        eventSource.addEventListener("error", () => {
          clearTimeout(connectionTimeout);
          eventSource.close();
          // Remove from tracking
          eventSourcesRef.current = eventSourcesRef.current.filter(
            (es) => es !== eventSource
          );
        });

        eventSourcesRef.current.push(eventSource);
      });
    } catch (error) {
      console.error("Error setting up business activity listener:", error);
    }
  };

  return (
    <>
      <nav className={`sticky top-[70px] z-20 w-full bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 ${className}`}>
        <div className="w-full px-3 sm:px-4 lg:px-6">
          <div className="flex flex-wrap items-center gap-3 py-3 lg:flex-nowrap lg:h-16 lg:py-0">
            <div className="min-w-0 shrink-0">
              <Link href={marketplaceBase} className="block truncate text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                {marketplaceLabel}
              </Link>
            </div>

            <div className="order-3 w-full lg:order-none lg:flex-1 lg:min-w-[260px]">
              <SearchBar />
            </div>

            <div className="ml-auto flex items-center justify-end gap-3 sm:gap-4 flex-wrap">
              <BusinessDropdown hasActivity={hasBusinessActivity} />
              <SkillsDropdown />
              <ActivityDropdown />
              {isAuthenticated && user?.role === "super-admin" && !pathname.startsWith("/studashboard") && (
                <Link
                  href={`${dashboardRoot}/main-menu/admin`}
                  className="inline-flex items-center gap-1.5 text-zinc-900 dark:text-white hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors font-medium"
                  title="Super Admin Dashboard"
                >
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative text-zinc-900 dark:text-white hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                title="Cart"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
              {!isAuthenticated && (
                <Link
                  href={marketplaceBase}
                  className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
                >
                  Browse
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <CartDropdown 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onCartChange={fetchCartCount}
      />
    </>
  );
}

