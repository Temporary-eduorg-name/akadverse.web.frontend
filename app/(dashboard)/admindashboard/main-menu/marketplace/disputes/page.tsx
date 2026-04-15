"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "@/src/LoadingSpinner";

interface DisputeOrder {
  id: string;
  type: "order" | "offer";
  status: string;
  totalAmount: number;
  disputeReason: string | null;
  disputeCreatedAt: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  business: {
    id: string;
    name: string;
    userId: string;
  };
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeOrder[]>([]);
  const [activeTab, setActiveTab] = useState<"order" | "offer">("order");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resolutions, setResolutions] = useState<{ [itemId: string]: string }>({});
  const [statuses, setStatuses] = useState<{ [itemId: string]: "delivered" | "processing" }>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  const fetchDisputes = async () => {
    try {
      const response = await fetch("/api/marketplace/admin/disputes", {
        credentials: "include",
      });

      if (response.status === 403) {
        setError("Super-admin access required. Please login with a super-admin account.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch disputes");
      }

      const data = await response.json();
      setDisputes(data.disputes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (orderId: string) => {
    const resolution = resolutions[orderId]?.trim();
    const status = statuses[orderId] || "delivered";

    if (!resolution || resolution.length < 10) {
      alert("Please provide a resolution of at least 10 characters.");
      return;
    }

    setSubmitting(orderId);
    try {
      const response = await fetch(`/api/marketplace/admin/disputes/${orderId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution, status }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to resolve dispute");
      }

      setResolutions((prev) => ({ ...prev, [orderId]: "" }));
      await fetchDisputes();
      alert("Dispute resolved successfully.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to resolve dispute");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  const filteredDisputes = disputes.filter((item) => item.type === activeTab);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Admin Disputes</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">Review all disputed orders and skill offers.</p>
        </div>

        {error ? (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg">
            {error}
            <div className="mt-3">
              <Link href="/login" className="underline">
                Go to Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex gap-3">
              <button
                onClick={() => setActiveTab("order")}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  activeTab === "order"
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                    : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700"
                }`}
              >
                Order Disputes
              </button>
              <button
                onClick={() => setActiveTab("offer")}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  activeTab === "offer"
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                    : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700"
                }`}
              >
                Offer Disputes
              </button>
            </div>

            {filteredDisputes.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-8 text-center text-zinc-600 dark:text-zinc-400">
                No {activeTab === "order" ? "order" : "offer"} disputes.
              </div>
            ) : (
              <div className="space-y-6">
                {filteredDisputes.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                          {item.type === "order" ? "Order" : "Skill Offer"} #{item.id.slice(0, 8)}
                        </h2>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Buyer: {item.user.firstName} {item.user.lastName} ({item.user.email})
                        </p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          {item.type === "order" ? "Business" : "Skill"}: {item.business.name}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                        Disputed
                      </span>
                    </div>

                    <div className="mb-4 text-sm text-zinc-700 dark:text-zinc-300">
                      <p>
                        <span className="font-medium">Reason:</span> {item.disputeReason || "No reason provided"}
                      </p>
                      <p className="mt-1">
                        <span className="font-medium">Amount:</span> ₦{item.totalAmount.toLocaleString()}
                      </p>
                      {item.disputeCreatedAt && (
                        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
                          Created: {new Date(item.disputeCreatedAt).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {item.type === "order" ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Resolution Decision
                          </label>
                          <select
                            value={statuses[item.id] || "delivered"}
                            onChange={(e) =>
                              setStatuses((prev) => ({
                                ...prev,
                                [item.id]: e.target.value as "delivered" | "processing",
                              }))
                            }
                            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                          >
                            <option value="delivered">Complete Order (favor seller)</option>
                            <option value="processing">Return to Processing (refund workflow)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Resolution Notes
                          </label>
                          <textarea
                            value={resolutions[item.id] || ""}
                            onChange={(e) =>
                              setResolutions((prev) => ({ ...prev, [item.id]: e.target.value }))
                            }
                            rows={3}
                            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                            placeholder="Explain why this dispute is resolved this way..."
                          />
                        </div>

                        <button
                          onClick={() => handleResolve(item.id)}
                          disabled={submitting === item.id}
                          className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting === item.id ? "Resolving..." : "Resolve Dispute"}
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
                        Skill offer disputes are listed here for super-admin review and monitoring.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

