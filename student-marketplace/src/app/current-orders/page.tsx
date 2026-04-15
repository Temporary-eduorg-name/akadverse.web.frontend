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
  items?: Array<{
    id: string;
    quantity: number;
    selectedVariants?: string | null;
    product: {
      id: string;
      name: string;
      price: number;
      images?: string[];
    };
  }>;
}

export default function CurrentOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders/current", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const eventSource = new EventSource("/api/realtime/events?scope=buyer");

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

  const handleConfirmDelivery = async (orderId: string) => {
    if (!confirm("Confirm that you received this order from the seller?")) return;

    setActionLoading(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}/deliver`, {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to confirm delivery");
      }

      alert("Delivery confirmation sent. Share your OTP with the seller to complete the order.");
      await fetchOrders();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to confirm delivery");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRaiseDispute = async (orderId: string) => {
    const reason = prompt("Describe the issue with this order (minimum 10 characters):");
    if (!reason) return;

    setActionLoading(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}/dispute`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to raise dispute");
      }

      alert("Dispute submitted successfully. Admin has been notified.");
      await fetchOrders();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to raise dispute");
    } finally {
      setActionLoading(null);
    }
  };

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
            Active Orders
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {orders.length === 0 ? "No active orders" : `${orders.length} active order(s)`}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-8 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              You have no active orders
            </p>
            <Link
              href="/"
              className="inline-block bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6"
              >
                <div className="flex justify-between items-start mb-4">
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
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === "pending"
                      ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                      : order.status === "processing"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                      : "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
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
                          {item.product.images?.[0] && (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                            <span>
                              {item.product.name} × {item.quantity}
                              {item.selectedVariants && (
                                <span className="text-xs text-zinc-500 ml-2">
                                  ({JSON.parse(item.selectedVariants)
                                    .map((v: any) => v.value)
                                    .join(", ")})
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

                {order.expectedDeliveryDate && (
                  <p className="text-sm text-green-600 dark:text-green-400 mb-3">
                    Expected delivery: {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                  </p>
                )}

                {order.status === "shipped" && (
                  <div className="mb-4">
                    <button
                      onClick={() => handleConfirmDelivery(order.id)}
                      disabled={actionLoading === order.id}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {actionLoading === order.id ? "Submitting..." : "Confirm Delivery"}
                    </button>
                  </div>
                )}

                {order.status !== "shipped" && !order.isDisputed && (
                  <div className="mb-4">
                    {order.status === "pending" && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                        If the seller hasn&apos;t accepted your order, you can raise a dispute to request a refund.
                      </p>
                    )}
                    <button
                      onClick={() => handleRaiseDispute(order.id)}
                      disabled={actionLoading === order.id}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {actionLoading === order.id ? "Submitting..." : " Dispute"}
                    </button>
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
            href="/order-history"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            ← View Delivered / Disputed Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
