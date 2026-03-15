"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  expectedDeliveryDate?: string | null;
  business?: { id: string; name: string };
  isDisputed?: boolean;
  disputeReason?: string | null;
  disputeCreatedAt?: string | null;
  items?: Array<{
    id: string;
    quantity: number;
    selectedVariants?: string | null;
    product: {
      id: string;
      name: string;
      price: number;
      secure_url?: string;
    };
  }>;
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/marketplace/orders/history", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching order history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const eventSource = new EventSource("/api/marketplace/realtime/events?scope=buyer");

    const onUpdate = () => {
      fetchOrders();
    };

    eventSource.addEventListener("update", onUpdate);
    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.removeEventListener("update", onUpdate);
      eventSource.close();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex-1 bg-zinc-50 dark:bg-black min-h-screen flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-black min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Order History
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {orders.length === 0 ? "No complete orders" : `${orders.length} completed order(s)`}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-8 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              You haven't completed any orders yet
            </p>
            <Link
              href="/staffdashboard/main-menu/marketplace"
              className="inline-block bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Order ID: {order.id.substring(0, 8)}...
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Business: {order.business?.name || "Business"}
                    </p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-white">
                      ₦{order.total.toFixed(2)}
                    </p>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === "delivered"
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : order.isDisputed
                        ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                        : "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {order.isDisputed ? "Disputed" : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="mb-4 pb-4 border-b border-zinc-200 dark:border-zinc-700">
                    <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                      Items:
                    </h3>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3"
                        >
                          {item.product.secure_url?.[0] && (
                            <img
                              src={item.product.secure_url}
                              alt={item.product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                            <span>
                              {item.product.name} × {item.quantity}
                              {item.selectedVariants && (
                                <span className="text-xs text-zinc-500 ml-2">
                            {Object.entries(JSON.parse(item.selectedVariants)).map(([key,value]) => `${key}: ${value}`).join(',')}

                                </span>
                              )}
                            </span>
                            <span>
                              ₦{(item.product.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {order.isDisputed && order.disputeReason && (
                  <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded text-sm">
                    <p className="font-medium text-yellow-900 dark:text-yellow-200">Dispute Reason:</p>
                    <p className="text-yellow-800 dark:text-yellow-300 mt-1">{order.disputeReason}</p>
                    {order.disputeCreatedAt && (
                      <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                        Filed: {new Date(order.disputeCreatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Ordered on{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/staffdashboard/main-menu/marketplace/current-orders"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            ← View Active Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
