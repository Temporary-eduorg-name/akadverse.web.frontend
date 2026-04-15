"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Briefcase, Wrench, Activity, ShoppingCart } from "lucide-react";
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
      {/* Essentials/Figma-style Navbar */}

      <nav className={`border-b border-slate-200 bg-white sticky top-0 z-20 mx-auto${className}`} style={{margin: '24px 0px'}}>
        {/* Essentials/Figma-style Navbar - exact spacing and layout */}
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-2 lg:gap-3 xl:gap-4">
          {/* Left: Logo/Label */}
          <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => window.location.assign('/studashboard/main-menu/marketplace')}>
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <span className="font-bold text-lg">M</span>
            </div>
            <span className="font-bold text-lg text-slate-900 hidden sm:block tracking-tight">{marketplaceLabel}</span>
          </div>

          {/* Center: SearchBar (with 'Filter' word) */}
          <div className="flex-1 flex justify-center mx-2 min-w-0">
            <div className="relative w-full max-w-[170px] sm:max-w-[200px] md:max-w-[220px] lg:max-w-[240px] xl:max-w-[260px]">
              <SearchBar />
            </div>
          </div>

          {/* Right: Dropdowns and Cart */}
          <div className="hidden lg:flex items-center gap-1 shrink-0 min-w-0">
            {/* My Businesses NavItem */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  window.location.assign("/login");
                } else {
                  window.location.assign(`${marketplaceBase}/dashboard`);
                }
              }}
              className="group flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors relative"
              title="My Businesses"
            >
              <Briefcase className="w-5 h-5 text-slate-500 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-300" />
              <span className="font-semibold text-sm text-slate-700 group-hover:text-indigo-900 transition-colors">My Businesses</span>
              {hasBusinessActivity && (
                <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>

            {/* My Skills NavItem */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  window.location.assign("/login");
                } else {
                  window.location.assign(`${marketplaceBase}/dashboard/skills`);
                  fetch("/api/marketplace/skills/notifications", {
                    method: "PATCH",
                    credentials: "include",
                  }).catch(() => {});
                }
              }}
              className="group flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors relative"
              title="My Skills"
            >
              <Wrench className="w-5 h-5 text-slate-500 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-300" />
              <span className="font-semibold text-sm text-slate-700 group-hover:text-indigo-900 transition-colors">My Skills</span>
            </button>

            {/* Activity NavItem */}
            <ActivityDropdown />
      
            {/* Cart NavItem */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="group flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors relative"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5 text-slate-500 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-300" />
              <span className="font-semibold text-sm text-slate-700 group-hover:text-indigo-900 transition-colors">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            {/* Admin Link (unchanged) */}
            {isAuthenticated && user?.role === "super-admin" && !pathname.startsWith("/studashboard") && (
              <Link
                href={`${dashboardRoot}/main-menu/admin`}
                className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 transition-colors font-medium"
                title="Super Admin Dashboard"
              >
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            {!isAuthenticated && (
              <Link
                href={marketplaceBase}
                className="bg-blue-600 text-white px-4 py-2 rounded-[10px] font-semibold shadow hover:bg-blue-700 transition-colors"
              >
                Browse
              </Link>
            )}
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

