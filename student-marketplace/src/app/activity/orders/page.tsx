"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";

interface OrderItem {
  id: string;
  productId: string;
  product: {
    name: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  orderItems: OrderItem[];
}

const STATUS_FILTERS = ["pending", "completed", "active", "disputed"];

export default function ActivityOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders/current", {
          method: "GET",
          credentials: "include",
        });

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          setError("Failed to fetch orders");
          setLoading(false);
          return;
        }

        const data = await response.json();
        const allOrders = data.orders || [];
        setOrders(allOrders);
        
        // Set default filter to pending if there are any pending orders
        const hasPending = allOrders.some((o: Order) => o.status.toLowerCase() === "pending");
        if (hasPending) {
          setActiveStatus("pending");
          setFilteredOrders(allOrders.filter((o: Order) => o.status.toLowerCase() === "pending"));
        } else if (allOrders.length > 0) {
          setActiveStatus(allOrders[0].status.toLowerCase());
          setFilteredOrders(allOrders);
        }
      } catch (err) {
        setError("An error occurred while fetching orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const handleStatusFilter = (status: string | null) => {
    setActiveStatus(status);
    if (status === null) {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((order) => order.status.toLowerCase() === status.toLowerCase()));
    }
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      case "completed":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "active":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "disputed":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      default:
        return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">
            My Orders
          </h1>

          {orders.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-12 text-center">
              <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-lg">
                You don't have any orders yet.
              </p>
              <Link
                href="/"
                className="inline-block bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-lg font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <>
              {/* Status Filters */}
              <div className="flex gap-2 mb-6 flex-wrap">
                <button
                  onClick={() => handleStatusFilter(null)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeStatus === null
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                      : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  All ({orders.length})
                </button>
                {STATUS_FILTERS.map((status) => {
                  const count = orders.filter((o) => o.status.toLowerCase() === status.toLowerCase()).length;
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusFilter(status)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                        activeStatus === status
                          ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                          : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {status} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8 text-center">
                  <p className="text-zinc-600 dark:text-zinc-400">
                    No {activeStatus ? activeStatus : ""} orders found.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-700 hover:shadow-lg transition-shadow p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                            Order ID: {order.id}
                          </p>
                          <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                            ₦{order.total.toFixed(2)}
                          </p>
                        </div>
                        <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>

                      {/* Order Items */}
                      <div className="mb-4">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                          {order.orderItems.length} item{order.orderItems.length !== 1 ? "s" : ""}
                        </p>
                        <div className="space-y-1">
                          {order.orderItems.slice(0, 2).map((item) => (
                            <p key={item.id} className="text-sm text-zinc-700 dark:text-zinc-300">
                              {item.product.name} x {item.quantity}
                            </p>
                          ))}
                          {order.orderItems.length > 2 && (
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              +{order.orderItems.length - 2} more item{order.orderItems.length - 2 !== 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Date */}
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
