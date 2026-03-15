"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";

interface SkillOffer {
  id: string;
  skillId: string;
  skillName: string;
  skillOwnerName: string;
  skillOwnerEmail: string;
  status:
    | "pending"
    | "negotiated"
    | "ongoing"
    | "completed"
    | "rejected"
    | "cancelled"
    | "disputed"
    | "ignored";
  description: string;
  originalPrice: number;
  currentPrice: number | null;
  skillOwnerAcceptedPrice: number | null;
  buyerAcceptedPrice: number | null;
  rejectedBy: string | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
  disputeReason: string | null;
  disputedBy: string | null;
  completedAt: string | null;
  rejectedAt: string | null;
  cancelledAt: string | null;
  disputedAt: string | null;
  offerFrom: string;
  offerTo: string;
  createdAt: string;
  updatedAt: string;
  latestCounterOffer?: {
    id: string;
    counterPrice: number;
    reason: string | null;
    madeBy: string;
    createdAt: string;
  } | null;
}

export default function ActivityOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<SkillOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const eventSourceRef = useRef<EventSource | null>(null);

  const statuses = [
    { key: "all", label: "All", color: "bg-zinc-100 dark:bg-zinc-900" },
    { key: "pending", label: "Pending", color: "bg-yellow-100 dark:bg-yellow-900" },
    { key: "negotiated", label: "Negotiating", color: "bg-blue-100 dark:bg-blue-900" },
    { key: "ongoing", label: "Ongoing", color: "bg-purple-100 dark:bg-purple-900" },
    { key: "completed", label: "Completed", color: "bg-green-100 dark:bg-green-900" },
    { key: "rejected", label: "Rejected", color: "bg-red-100 dark:bg-red-900" },
    { key: "cancelled", label: "Cancelled", color: "bg-orange-100 dark:bg-orange-900" },
    { key: "disputed", label: "Disputed", color: "bg-amber-100 dark:bg-amber-900" },
    { key: "ignored", label: "Ignored", color: "bg-gray-100 dark:bg-gray-900" },
  ];

  const fetchOffers = async () => {
    try {
      const params = new URLSearchParams();
      if (activeStatus !== "all") {
        params.set("status", activeStatus);
      }

      const response = await fetch(`/api/marketplace/offers?${params}`, {
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/studashboard/main-menu/marketplace");
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch offers");

      const data = await response.json();
      setOffers(data.offers || []);
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
      fetchOffers();
    }, [activeStatus, router]);

    useEffect(() => {
      // Set up EventSource listener for real-time updates
      const setupRealtimeListener = () => {
        try {
          const eventSource = new EventSource("/api/marketplace/realtime/events?scope=buyer");
          eventSourceRef.current = eventSource;

          eventSource.addEventListener("connected", () => {
            console.log("Connected to real-time offer updates");
          });

          eventSource.addEventListener("update", () => {
            // Refresh offers when real-time updates occur
            fetchOffers();
          });

          eventSource.addEventListener("error", (error) => {
            console.error("EventSource error:", error);
            eventSource.close();
            eventSourceRef.current = null;
          });
        } catch (error) {
          console.error("Failed to setup real-time listener:", error);
        }
      };

      setupRealtimeListener();

      // Cleanup on unmount
      return () => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
      };
    }, []);

  const handleAcceptNegotiation = async (offerId: string) => {
    try {
      const response = await fetch(`/api/marketplace/offers/${offerId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      });

      const result = await response.json();

      if (response.ok) {
        setOffers((prev) =>
          prev.map((offer) =>
            offer.id === offerId ? { ...offer, status: "ongoing" } : offer
          )
        );
      } else {
        throw new Error(result.error || "Failed to accept negotiated offer");
      }
    } catch (error) {
      console.error("Error accepting offer:", error);
      alert(error instanceof Error ? error.message : "Failed to accept offer");
    }
  };

  const handleRejectNegotiation = async (offerId: string) => {
    try {
      const response = await fetch(`/api/marketplace/offers/${offerId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      });

      const result = await response.json();

      if (response.ok) {
        setOffers((prev) =>
          prev.map((offer) =>
            offer.id === offerId
              ? { ...offer, status: "rejected", rejectedBy: "buyer" }
              : offer
          )
        );
      } else {
        throw new Error(result.error || "Failed to reject negotiated offer");
      }
    } catch (error) {
      console.error("Error rejecting offer:", error);
      alert(error instanceof Error ? error.message : "Failed to reject offer");
    }
  };

  const handleNegotiate = async (offerId: string, price: number, reason?: string) => {
    try {
      const response = await fetch(`/api/marketplace/offers/${offerId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "negotiate", counterPrice: price, reason }),
      });

      const result = await response.json();

      if (response.ok) {
        setOffers((prev) =>
          prev.map((offer) =>
            offer.id === offerId
              ? {
                  ...offer,
                  status: "negotiated",
                  buyerAcceptedPrice: price,
                  currentPrice: price,
                  latestCounterOffer: {
                    id: `temp-${Date.now()}`,
                    counterPrice: price,
                    reason: reason || null,
                    madeBy: "buyer",
                    createdAt: new Date().toISOString(),
                  },
                }
              : offer
          )
        );
      } else {
        throw new Error(result.error || "Failed to negotiate");
      }
    } catch (error) {
      console.error("Error negotiating offer:", error);
      alert(error instanceof Error ? error.message : "Failed to negotiate");
    }
  };

  const handleCancelOngoing = async (offerId: string, reason: string) => {
    try {
      const response = await fetch(`/api/marketplace/offers/${offerId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", reason }),
      });

      const result = await response.json();

      if (response.ok) {
        setOffers((prev) =>
          prev.map((offer) =>
            offer.id === offerId
              ? {
                  ...offer,
                  status: "cancelled",
                  cancelledBy: "buyer",
                  cancellationReason: reason,
                }
              : offer
          )
        );
      } else {
        throw new Error(result.error || "Failed to cancel offer");
      }
    } catch (error) {
      console.error("Error cancelling offer:", error);
      alert(error instanceof Error ? error.message : "Failed to cancel offer");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900";
      case "negotiated":
        return "bg-blue-100 dark:bg-blue-900";
      case "ongoing":
        return "bg-purple-100 dark:bg-purple-900";
      case "completed":
        return "bg-green-100 dark:bg-green-900";
      case "rejected":
        return "bg-red-100 dark:bg-red-900";
      case "cancelled":
        return "bg-orange-100 dark:bg-orange-900";
      case "disputed":
        return "bg-amber-100 dark:bg-amber-900";
      case "ignored":
        return "bg-gray-100 dark:bg-gray-900";
      default:
        return "bg-gray-100 dark:bg-gray-900";
    }
  };

  const filteredOffers =
    activeStatus === "all"
      ? offers
      : offers.filter((offer) => offer.status === activeStatus);

  if (loading) {
    return (
      <div className="flex-1 bg-zinc-50 dark:bg-black min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-black min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-8">
          My Offers
        </h1>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {statuses.map((status) => {
            const count = status.key === "all" 
              ? offers.length 
              : offers.filter((o) => o.status === status.key).length;
            
            return (
              <button
                key={status.key}
                onClick={() => setActiveStatus(status.key)}
                className={`px-4 py-2 rounded font-semibold transition-colors ${
                  activeStatus === status.key
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                }`}
              >
                {status.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Offers List */}
        {filteredOffers.length > 0 ? (
          <div className="space-y-4">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-zinc-200 dark:border-zinc-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                      {offer.skillName}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                      by {offer.skillOwnerName}
                    </p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(offer.status)} text-zinc-900 dark:text-white`}>
                      {offer.status.charAt(0).toUpperCase() +
                        offer.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                      ₦{(offer.skillOwnerAcceptedPrice || offer.buyerAcceptedPrice || offer.currentPrice || offer.originalPrice).toLocaleString()}
                    </p>
                  </div>
                </div>

                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  {offer.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400">From</p>
                    <p className="text-zinc-900 dark:text-white font-semibold">
                      {new Date(offer.offerFrom).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400">To</p>
                    <p className="text-zinc-900 dark:text-white font-semibold">
                      {new Date(offer.offerTo).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {offer.status === "negotiated" && offer.latestCounterOffer && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Negotiation Details</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-blue-700 dark:text-blue-300">Original Price:</p>
                        <p className="font-bold text-blue-900 dark:text-blue-100">₦{offer.originalPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-blue-700 dark:text-blue-300">Counter Offer:</p>
                        <p className="font-bold text-blue-900 dark:text-blue-100">₦{offer.latestCounterOffer.counterPrice.toLocaleString()}</p>
                      </div>
                    </div>
                    {offer.latestCounterOffer.reason && (
                      <div className="mt-2">
                        <p className="text-blue-700 dark:text-blue-300 text-sm">Reason:</p>
                        <p className="text-blue-900 dark:text-blue-100 text-sm italic">{offer.latestCounterOffer.reason}</p>
                      </div>
                    )}
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      Made by: {offer.latestCounterOffer.madeBy === "buyer" ? "You (Buyer)" : "Skill Owner"}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {offer.status === "pending" && (
                  <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    <p className="mb-2">Waiting for skill owner response.</p>
                    <p>Offered at: {new Date(offer.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                  </div>
                )}

                {offer.status === "negotiated" && (
                  <div className="flex gap-3">
                    {/* Hide Accept button if buyer made the latest counter-offer */}
                    {offer.latestCounterOffer?.madeBy !== "buyer" && (
                      <button
                        onClick={() => handleAcceptNegotiation(offer.id)}
                        className="flex-1 bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                      >
                        Accept New Price
                      </button>
                    )}
                    <button
                      onClick={() => handleRejectNegotiation(offer.id)}
                      className="flex-1 bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded font-semibold hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                    >
                      Reject New Price
                    </button>
                    <button
                      onClick={() => {
                        const price = prompt("Enter your new counter-offer price:");
                        if (!price) return;
                        const parsedPrice = parseFloat(price);
                        if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
                          alert("Please enter a valid price");
                          return;
                        }
                        const reason = prompt("Optional reason for this negotiation:") || "";
                        handleNegotiate(offer.id, parsedPrice, reason);
                      }}
                      className="flex-1 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                      Negotiate Further
                    </button>
                  </div>
                )}

                {offer.status === "ongoing" && (
                  <div className="space-y-3">
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      This offer is ongoing. You can cancel with a reason if needed.
                    </div>
                    <button
                      onClick={() => {
                        const reason = prompt("Provide reason for cancellation:");
                        if (!reason) return;
                        handleCancelOngoing(offer.id, reason);
                      }}
                      className="bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded font-semibold hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                    >
                      Cancel Offer
                    </button>
                  </div>
                )}

                {offer.status === "rejected" && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    Rejected by: {offer.rejectedBy === "buyer" ? "Buyer" : "Skill Owner"}
                  </div>
                )}

                {offer.status === "cancelled" && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    <p>Cancelled by: {offer.cancelledBy === "buyer" ? "Buyer" : "Skill Owner"}</p>
                    {offer.cancellationReason && <p>Reason: {offer.cancellationReason}</p>}
                  </div>
                )}

                {offer.status === "disputed" && (
                  <div className="text-sm text-amber-600 dark:text-amber-400">
                    <p>Disputed by: {offer.disputedBy === "buyer" ? "Buyer" : "Skill Owner"}</p>
                    {offer.disputeReason && <p>Reason: {offer.disputeReason}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-zinc-200 dark:border-zinc-700 p-12 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              No offers in this category
            </p>
            <Link
              href="/studashboard/main-menu/marketplace/browse-skills"
              className="inline-block bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-lg font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              Browse Skills
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

