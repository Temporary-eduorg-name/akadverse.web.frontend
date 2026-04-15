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
        const response = await fetch("/api/marketplace/orders/current", {
          method: "GET",
          credentials: "include",
        });

        if (response.status === 401) {
          router.push("/studashboard/main-menu/marketplace");
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
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "disputed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-6">
            My Orders
          </h1>

          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-zinc-600 mb-6 text-lg">
                You don't have any orders yet.
              </p>
              <Link
                href="/studashboard/main-menu/marketplace"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <>
              {/* Status Filters */}
              <div className="flex gap-2 mb-6 flex-wrap bg-blue-50 p-2 rounded-lg">
                <button
                  onClick={() => handleStatusFilter(null)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeStatus === null
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50"
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
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50"
                      }`}
                    >
                      {status} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <p className="text-zinc-600">
                    No {activeStatus ? activeStatus : ""} orders found.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/studashboard/main-menu/marketplace`}
                      className="bg-white rounded-lg shadow-md border border-zinc-200 hover:shadow-lg transition-shadow p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-zinc-500 mb-1">
                            Order ID: {order.id}
                          </p>
                          <p className="text-lg font-semibold text-zinc-900">
                            ₦{order.total.toFixed(2)}
                          </p>
                        </div>
                        <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>

                      {/* Order Items */}
                      <div className="mb-4">
                        <p className="text-sm text-zinc-600 mb-2">
                          {order.orderItems.length} item{order.orderItems.length !== 1 ? "s" : ""}
                        </p>
                        <div className="space-y-1">
                          {order.orderItems.slice(0, 2).map((item) => (
                            <p key={item.id} className="text-sm text-zinc-700">
                              {item.product.name} x {item.quantity}
                            </p>
                          ))}
                          {order.orderItems.length > 2 && (
                            <p className="text-sm text-zinc-600">
                              +{order.orderItems.length - 2} more item{order.orderItems.length - 2 !== 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Date */}
                      <p className="text-xs text-zinc-500">
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
