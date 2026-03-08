"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  expectedDeliveryDate: string | null;
  shipOtp: string | null;
  shipOtpExpiry: string | null;
  deliveryOtp: string | null;
  deliveryOtpExpiry: string | null;
  deliveryOtpAttempts: number;
  isDisputed: boolean;
  disputeReason: string | null;
  disputeCreatedAt: string | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  items: {
    id: string;
    quantity: number;
    price: number;
    selectedVariants: string | null;
    product: {
      id: string;
      name: string;
      secure_url: string | null;
    };
  }[];
}

interface OrdersComponentProps {
  onActivityChange?: () => void;
}

export default function OrdersComponent({ onActivityChange }: OrdersComponentProps) {
  const params = useParams();
  const businessId = params.id as string;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSubTab, setActiveSubTab] = useState<"pending" | "processing" | "shipped" | "delivered" | "disputed">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState<{ [orderId: string]: string }>({});
  const [deliveryOtpInput, setDeliveryOtpInput] = useState<{ [orderId: string]: string }>({});    
   const [deliveryAttemptsLeft, setDeliveryAttemptsLeft] = useState<{ [orderId: string]: number }>({});  const [attempts,setattemps ] = useState<number>(5)
  const previousRealtimeCounts = useRef<{ pending: number; processing: number; shipped: number } | null>(null);

  useEffect(() => {
    fetchOrders(true);
  }, [businessId]);

  useEffect(() => {
    if (!businessId) return;

    const eventSource = new EventSource(
      `/api/realtime/events?scope=seller&businessId=${businessId}`
    );

    const onUpdate = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data) as {
          pending?: number;
          processing?: number;
          shipped?: number;
        };

        const nextCounts = {
          pending: payload.pending ?? 0,
          processing: payload.processing ?? 0,
          shipped: payload.shipped ?? 0,
        };

        const prevCounts = previousRealtimeCounts.current;
        const hasChanged =
          !prevCounts ||
          prevCounts.pending !== nextCounts.pending ||
          prevCounts.processing !== nextCounts.processing ||
          prevCounts.shipped !== nextCounts.shipped;

        previousRealtimeCounts.current = nextCounts;

        if (hasChanged) {
          fetchOrders(false);
        }
      } catch {
        // ignore malformed realtime payload
      }
    };

    eventSource.addEventListener("update", onUpdate);

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.removeEventListener("update", onUpdate);
      eventSource.close();
    };
  }, [businessId]);

  const fetchOrders = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await fetch(`/api/businesses/${businessId}/orders`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeSubTab === "disputed") {
      return order.isDisputed && order.status === "disputed";
    }
    return order.status === activeSubTab;
  });

  const handleAcceptOrder = async (orderId: string) => {
    if (!confirm("Accept this order?")) return;

    setActionLoading(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "processing" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to accept order");
      }

      await fetchOrders();
      onActivityChange?.();
      alert("Order accepted successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to accept order");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestShipOtp = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}/ship`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to request shipping OTP");
      }

      await fetchOrders();
      alert("Shipping OTP sent to your email! Check your inbox.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to request OTP");
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyShipOtp = async (orderId: string) => {
    const otp = otpInput[orderId];
    if (!otp || otp.length !== 6) {
      alert("Please enter the 6-digit OTP");
      return;
    }

    setActionLoading(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}/ship`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ otp }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to verify OTP");
      }

      await fetchOrders();
      setOtpInput({ ...otpInput, [orderId]: "" });
      alert("Order marked as shipped! Buyer has received delivery OTP.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to verify OTP");
    } finally {
      setActionLoading(null);
    }
  };
  const handleMarkDelivered = async (orderId: string) => {
    const otp = deliveryOtpInput[orderId];
    if (!otp || otp.length !== 6) {
      alert("Please enter the 6-digit delivery OTP from the buyer");
      return;
    }

    setActionLoading(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}/deliver`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ otp }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.attemptsLeft !== undefined) {
          setDeliveryAttemptsLeft({ ...deliveryAttemptsLeft, [orderId]: data.attemptsLeft });
        }
        throw new Error(data.error || "Failed to mark delivered");
      }

      await fetchOrders();
      setDeliveryOtpInput({ ...deliveryOtpInput, [orderId]: "" });
      setDeliveryAttemptsLeft({ ...deliveryAttemptsLeft, [orderId]: 5 });
      alert("Order marked as delivered! Buyer has 24 hours to dispute.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to mark delivered");
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
      <div className="flex items-center justify-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-4 mb-6 border-b border-zinc-200 dark:border-zinc-700 pb-4">
        <button
          onClick={() => setActiveSubTab("pending")}
          className={`px-4 py-2 font-medium transition-colors ${activeSubTab === "pending"
              ? "text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-white"
              : "text-zinc-600 dark:text-zinc-400"
            }`}
        >
          Pending Orders ({orders.filter((o) => o.status === "pending").length})
        </button>
        <button
          onClick={() => setActiveSubTab("processing")}
          className={`px-4 py-2 font-medium transition-colors ${activeSubTab === "processing"
              ? "text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-white"
              : "text-zinc-600 dark:text-zinc-400"
            }`}
        >
          Processing ({orders.filter((o) => o.status === "processing").length})
        </button>
        <button
          onClick={() => setActiveSubTab("shipped")}
          className={`px-4 py-2 font-medium transition-colors ${activeSubTab === "shipped"
              ? "text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-white"
              : "text-zinc-600 dark:text-zinc-400"
            }`}
        >
          Shipped ({orders.filter((o) => o.status === "shipped").length})
        </button>
        <button
          onClick={() => setActiveSubTab("delivered")}
          className={`px-4 py-2 font-medium transition-colors ${activeSubTab === "delivered"
              ? "text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-white"
              : "text-zinc-600 dark:text-zinc-400"
            }`}
        >
          Delivered ({orders.filter((o) => o.status === "delivered").length})
        </button>
        <button
          onClick={() => setActiveSubTab("disputed")}
          className={`px-4 py-2 font-medium transition-colors ${activeSubTab === "disputed"
              ? "text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-600 dark:border-yellow-400"
              : "text-zinc-600 dark:text-zinc-400"
            }`}
        >
          Disputed ({orders.filter((o) => o.isDisputed && o.status === "disputed").length})
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-600 dark:text-zinc-400">
            No {activeSubTab} orders yet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    Order #{order.id.substring(0, 8)}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Ordered: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  {order.expectedDeliveryDate && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Expected: {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Customer: {order.user.firstName} {order.user.lastName}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === "pending"
                      ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                      : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                    }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-4 space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3"
                  >
                    {item.product.secure_url && (
                      <img
                        src={item.product.secure_url}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 flex justify-between text-sm">
                      <span>
                        {item.product.name} x {item.quantity}
                        {item.selectedVariants && (
                          <span className="text-xs text-zinc-500 ml-2">
                            {/* ({JSON.parse(item.selectedVariants).map((v: any) => v.value).join(", ")}) */}
                            {Object.entries(JSON.parse(item.selectedVariants)).map(([key,value]) => `${key}: ${value}`).join(',')}
                          </span>
                        )}
                      </span>
                      <span className="font-medium">₦{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    Total
                  </span>
                  <span className="text-lg font-bold text-zinc-900 dark:text-white">
                    ₦{order.totalAmount.toFixed(2)}
                  </span>
                </div>

                {/* Action Buttons */}
                {order.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptOrder(order.id)}
                      disabled={actionLoading === order.id}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {actionLoading === order.id ? "Processing..." : "Accept Order"}
                    </button>
                  </div>
                )}

                {order.status === "processing" && (
                  <div>
                    {!order.shipOtp ? (
                      <button
                        onClick={() => handleRequestShipOtp(order.id)}
                        disabled={actionLoading === order.id}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {actionLoading === order.id ? "Sending..." : "Ready to ship"}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Enter the 6-digit OTP sent to your email:
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={otpInput[order.id] || ""}
                            onChange={(e) => setOtpInput({ ...otpInput, [order.id]: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                            placeholder="Enter OTP"
                            className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                            maxLength={6}
                          />
                          <button
                            onClick={() => handleVerifyShipOtp(order.id)}
                            disabled={actionLoading === order.id}
                            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {actionLoading === order.id ? "Verifying..." : "Ship Now"}
                          </button>
                        </div>
                        {order.shipOtpExpiry && new Date(order.shipOtpExpiry) < new Date() && (
                          <p className="text-sm text-red-600">OTP expired. Request a new one.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {order.status === "shipped" && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Enter the 6-digit delivery OTP from the buyer ({deliveryAttemptsLeft[order.id] ?? (5 - order.deliveryOtpAttempts)} attempts left):
                      </p>
                      {!order.isDisputed && (
                        <button
                          onClick={() => handleRaiseDispute(order.id)}
                          disabled={actionLoading === order.id}
                          className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Dispute
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={deliveryOtpInput[order.id] || ""}
                        onChange={(e) => setDeliveryOtpInput({ ...deliveryOtpInput, [order.id]: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                        placeholder="Enter buyer's OTP"
                        className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                        maxLength={6}
                      />
                      <button
                        onClick={() => handleMarkDelivered(order.id)}
                        disabled={actionLoading === order.id || order.deliveryOtpAttempts >= 5}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {actionLoading === order.id ? "Verifying..." : "Mark Delivered"}
                      </button>
                    </div>
                    {order.deliveryOtpAttempts >= 5 && (
                      <p className="text-sm text-red-600">Maximum attempts reached. Contact support.</p>
                    )}
                  </div>
                )}

                {order.status === "delivered" && (
                  <div className="text-center py-2 text-green-600 dark:text-green-400 font-medium">
                    ✓ Order completed successfully!
                  </div>
                )}

                {order.isDisputed && order.status === "disputed" && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                    <p className="font-medium text-yellow-900 dark:text-yellow-200">⚠️ Dispute Filed</p>
                    {order.disputeReason && (
                      <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">{order.disputeReason}</p>
                    )}
                    {order.disputeCreatedAt && (
                      <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                        Filed: {new Date(order.disputeCreatedAt).toLocaleString()}
                      </p>
                    )}
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-2">
                      An admin will review this dispute and contact both parties.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
