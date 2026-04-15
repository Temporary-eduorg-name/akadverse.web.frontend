"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function OrdersDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentOrders, setCurrentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = async () => {
    if (!isOpen) {
      setLoading(true);
      try {
        const response = await fetch("/api/orders/current", {
          method: "GET",
          credentials: "include",
        });

        if (response.status === 401) {
          setIsAuthenticated(false);
          setCurrentOrders([]);
        } else if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setCurrentOrders(data.orders || []);
        } else {
          setIsAuthenticated(false);
          setCurrentOrders([]);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setCurrentOrders([]);
      } finally {
        setLoading(false);
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
      >
        My Orders
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50 max-h-96"
            style={{
              maxWidth: "calc(100vw - 32px)",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <div className="p-4">
              {loading ? (
                <p className="text-center text-zinc-600 dark:text-zinc-400">
                  Loading...
                </p>
              ) : !isAuthenticated ? (
                <div className="text-center py-4">
                  <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                    You aren't logged in, please{" "}
                    <Link
                      href="/login"
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      sign in
                    </Link>
                  </p>
                </div>
              ) : currentOrders.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                    No pending orders
                  </p>
                  <Link
                    href="/order-history"
                    className="inline-block bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-md text-sm hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
                  >
                    View Order History
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <h3 className="font-semibold text-zinc-900 dark:text-white mb-2 text-sm">
                      Current Orders ({currentOrders.length})
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {currentOrders.map((order) => (
                        <Link
                          key={order.id}
                          href={`/current-orders`}
                          className="block p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-zinc-900 dark:text-white text-sm">
                              ₦{order.total.toFixed(2)}
                            </p>
                            <span className="inline-block px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                              Pending
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-zinc-200 dark:border-zinc-700 pt-3">
                    <Link
                      href="/current-orders"
                      className="block w-full text-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-md text-sm hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
                    >
                      View All Orders
                    </Link>
                    <Link
                      href="/order-history"
                      className="block w-full text-center bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-4 py-2 rounded-md text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      Order History
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
