"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useMarketplaceActivity } from "@/src/context/MarketplaceActivityContext";
import { useRouter } from "next/router";

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
  const { setScope, buyerActivity, registerOnUpdate } = useMarketplaceActivity();

  const router = useRouter();

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
    setScope("buyer");
  }, [setScope]);

  useEffect(() => {
    fetchOrders();
  }, [router]);

  const fetchOrdersCallback = useCallback(() => {
    fetchOrders();
  }, []);
  useEffect(() => {
    const unregister = registerOnUpdate(fetchOrdersCallback);
    return unregister;
  }, [registerOnUpdate, fetchOrdersCallback]);

  // You can now use buyerActivity.hasOfferActivity for UI if needed



  if (loading) {
    return (
      <div className="flex-1 bg-zinc-50 min-h-screen flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">
            Order History
          </h1>
          <p className="text-zinc-600">
            {orders.length === 0 ? "No complete orders" : `${orders.length} completed order(s)`}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg border border-zinc-200 p-8 text-center">
            <p className="text-zinc-600 mb-4">
              You haven't completed any orders yet
            </p>
            <Link
              href="/studashboard/main-menu/marketplace"
              className="inline-block bg-zinc-900 text-white px-6 py-2 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg border border-zinc-200 p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm text-zinc-500">
                      Order ID: {order.id.substring(0, 8)}...
                    </p>
                    <p className="text-sm text-zinc-500">
                      Business: {order.business?.name || "Business"}
                    </p>
                    <p className="text-lg font-bold text-zinc-900">
                      ₦{order.total.toFixed(2)}
                    </p>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${order.status === "delivered"
                      ? "bg-green-100 text-green-800"
                      : order.isDisputed
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {order.isDisputed ? "Disputed" : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="mb-4 pb-4 border-b border-zinc-200">
                    <h3 className="font-semibold text-zinc-900 mb-2">
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
                          <div className="flex-1 flex justify-between text-sm text-zinc-600">
                            <span>
                              {item.product.name} × {item.quantity}
                              {item.selectedVariants && (
                                <span className="text-xs text-zinc-500 ml-2">
                                  {Object.entries(JSON.parse(item.selectedVariants)).map(([key, value]) => `${key}: ${value}`).join(',')}
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
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <p className="font-medium text-yellow-900">Dispute Reason:</p>
                    <p className="text-yellow-800 mt-1">{order.disputeReason}</p>
                    {order.disputeCreatedAt && (
                      <p className="text-xs text-yellow-700 mt-1">
                        Filed: {new Date(order.disputeCreatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                <p className="text-xs text-zinc-500">
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
            href="/studashboard/main-menu/marketplace/current-orders"
            className="text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            ← View Active Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
