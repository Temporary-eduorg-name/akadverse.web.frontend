"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

type OfferStatus =
  | "pending"
  | "negotiated"
  | "ongoing"
  | "completed"
  | "rejected"
  | "cancelled"
  | "disputed"
  | "ignored";

interface DashboardOffer {
  id: string;
  status: OfferStatus;
  description: string | null;
  originalPrice: number;
  currentPrice: number | null;
  skillOwnerAcceptedPrice: number | null;
  buyerAcceptedPrice: number | null;
  offerFrom: string;
  offerTo: string;
  createdAt: string;
  completedAt: string | null;
  rejectedAt: string | null;
  rejectedBy: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
  disputedAt: string | null;
  disputedBy: string | null;
  disputeReason: string | null;
  skill: {
    id: string;
    name: string;
  };
  buyer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  counterOffers: Array<{
    id: string;
    counterPrice: number;
    reason: string | null;
    madeBy: string;
    createdAt: string;
  }>;
}

export default function SkillOffersManager() {
  const [offers, setOffers] = useState<DashboardOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string>("all");

  const fetchOffers = async () => {
    try {
      const response = await fetch("/api/skills/dashboard/offers", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard offers");
      }

      const data = await response.json();
      console.log(data.offers)
      setOffers(data.offers || []);
    } catch (error) {
      console.error("Fetch dashboard offers error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const counts = useMemo(() => {
    const result = {
      all: offers.length,
      pending: 0,
      negotiated: 0,
      ongoing: 0,
      completed: 0,
      rejected: 0,
      cancelled: 0,
      disputed: 0,
      ignored: 0,
    };

    offers.forEach((offer) => {
      if (result[offer.status as keyof typeof result] !== undefined) {
        result[offer.status as keyof typeof result] += 1;
      }
    });

    return result;
  }, [offers]);

  const filteredOffers = useMemo(() => {
    if (activeStatus === "all") {
      return offers;
    }

    return offers.filter((offer) => offer.status === activeStatus);
  }, [offers, activeStatus]);

  const updateOffer = async (
    offerId: string,
    payload: {
      action:
        | "accept"
        | "reject"
        | "negotiate"
        | "send_completion_otp"
        | "complete"
        | "cancel"
        | "dispute";
      counterPrice?: number;
      reason?: string;
      otp?: string;
    }
  ) => {
    try {
      setActionLoading(offerId);

      const response = await fetch("/api/skills/dashboard/offers", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId, ...payload }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update offer");
      }

      await fetchOffers();
      alert("Offer updated successfully.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update offer");
    } finally {
      setActionLoading(null);
    }
  };

  const getCurrentPrice = (offer: DashboardOffer) => {
    return (
      offer.skillOwnerAcceptedPrice ||
      offer.buyerAcceptedPrice ||
      offer.currentPrice ||
      offer.originalPrice
    );
  };

  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  const statusTabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "negotiated", label: "Negotiated" },
    { key: "ongoing", label: "Ongoing" },
    { key: "completed", label: "Completed" },
    { key: "rejected", label: "Rejected" },
    { key: "cancelled", label: "Cancelled" },
    { key: "disputed", label: "Disputed" },
    { key: "ignored", label: "Ignored" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveStatus(tab.key)}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              activeStatus === tab.key
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white"
            }`}
          >
            {tab.label} ({counts[tab.key as keyof typeof counts] || 0})
          </button>
        ))}
      </div>

      {filteredOffers.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-zinc-200 dark:border-zinc-700 p-10 text-center text-zinc-600 dark:text-zinc-400">
          No offers in this state.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-zinc-200 dark:border-zinc-700 p-6"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {offer.skill.name}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Buyer: {offer.buyer.firstName} {offer.buyer.lastName} ({offer.buyer.email})
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    {new Date(offer.offerFrom).toLocaleDateString()} - {new Date(offer.offerTo).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Current price</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                    ₦{getCurrentPrice(offer).toLocaleString()}
                  </p>
                  <p className="text-xs font-semibold mt-1 text-zinc-600 dark:text-zinc-400 capitalize">
                    {offer.status}
                  </p>
                </div>
              </div>

              {offer.description && (
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">{offer.description}</p>
              )}

              {offer.status === "negotiated" && offer.counterOffers[0] && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Negotiation Details</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-blue-700 dark:text-blue-300">Original Price:</p>
                      <p className="font-bold text-blue-900 dark:text-blue-100">₦{offer.originalPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-blue-700 dark:text-blue-300">Counter Offer:</p>
                      <p className="font-bold text-blue-900 dark:text-blue-100">₦{offer.counterOffers[0].counterPrice.toLocaleString()}</p>
                    </div>
                  </div>
                  {offer.counterOffers[0].reason && (
                    <div className="mt-2">
                      <p className="text-blue-700 dark:text-blue-300 text-sm">Reason:</p>
                      <p className="text-blue-900 dark:text-blue-100 text-sm italic">{offer.counterOffers[0].reason}</p>
                    </div>
                  )}
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    Made by: {offer.counterOffers[0].madeBy === "skill_owner" ? "You (Skill Owner)" : "Buyer"}
                  </p>
                </div>
              )}

              {offer.status === "rejected" && offer.rejectedBy && (
                <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                  Rejected by: {offer.rejectedBy === "buyer" ? "Buyer" : "Skill Owner"}
                </p>
              )}

              {offer.status === "cancelled" && (
                <div className="mb-4 text-sm text-red-600 dark:text-red-400">
                  <p>Cancelled by: {offer.cancelledBy === "buyer" ? "Buyer" : "Skill Owner"}</p>
                  {offer.cancellationReason && <p>Reason: {offer.cancellationReason}</p>}
                </div>
              )}

              {offer.status === "disputed" && (
                <div className="mb-4 text-sm text-orange-600 dark:text-orange-400">
                  <p>Disputed by: {offer.disputedBy === "buyer" ? "Buyer" : "Skill Owner"}</p>
                  {offer.disputeReason && <p>Reason: {offer.disputeReason}</p>}
                </div>
              )}

              {offer.status === "pending" && (
                <div className="flex flex-wrap gap-2">
                  <div className="w-full text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                    <p className="mb-1">Period: {new Date(offer.offerFrom).toLocaleDateString()} at {new Date(offer.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {new Date(offer.offerTo).toLocaleDateString()}</p>
                  </div>
                  <button
                    type="button"
                    disabled={actionLoading === offer.id}
                    onClick={() => updateOffer(offer.id, { action: "accept" })}
                    className="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-60"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading === offer.id}
                    onClick={() => updateOffer(offer.id, { action: "reject" })}
                    className="bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded font-semibold hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-60"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading === offer.id}
                    onClick={() => {
                      const priceInput = prompt("Enter your counter-offer price:");
                      if (!priceInput) return;
                      const parsedPrice = Number(priceInput);
                      if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
                        alert("Please enter a valid price.");
                        return;
                      }
                      const reason = prompt("Optional reason for this negotiation:") || "";
                      updateOffer(offer.id, {
                        action: "negotiate",
                        counterPrice: parsedPrice,
                        reason,
                      });
                    }}
                    className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-60"
                  >
                    Negotiate
                  </button>
                </div>
              )}

              {offer.status === "negotiated" && (
                <div className="flex flex-wrap gap-2">
                  {/* Hide Accept button if seller made the latest counter-offer */}
                  {offer.counterOffers[0]?.madeBy !== "skill_owner" && (
                    <button
                      type="button"
                      disabled={actionLoading === offer.id}
                      onClick={() => updateOffer(offer.id, { action: "accept" })}
                      className="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-60"
                    >
                      Accept Negotiated Price
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={actionLoading === offer.id}
                    onClick={() => updateOffer(offer.id, { action: "reject" })}
                    className="bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded font-semibold hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-60"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading === offer.id}
                    onClick={() => {
                      const priceInput = prompt("Enter another counter-offer price:");
                      if (!priceInput) return;
                      const parsedPrice = Number(priceInput);
                      if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
                        alert("Please enter a valid price.");
                        return;
                      }
                      const reason = prompt("Optional reason for this negotiation:") || "";
                      updateOffer(offer.id, {
                        action: "negotiate",
                        counterPrice: parsedPrice,
                        reason,
                      });
                    }}
                    className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-60"
                  >
                    Counter Again
                  </button>
                </div>
              )}

              {offer.status === "ongoing" && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={actionLoading === offer.id}
                    onClick={() => updateOffer(offer.id, { action: "send_completion_otp" })}
                    className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-60"
                  >
                    Send OTP To Buyer
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading === offer.id}
                    onClick={() => {
                      const otp = prompt("Enter OTP provided by buyer:");
                      if (!otp) return;
                      updateOffer(offer.id, { action: "complete", otp });
                    }}
                    className="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-60"
                  >
                    Mark Completed (OTP)
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading === offer.id}
                    onClick={() => {
                      const reason = prompt("Provide cancellation reason:");
                      if (!reason) return;
                      updateOffer(offer.id, { action: "cancel", reason });
                    }}
                    className="bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded font-semibold hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-60"
                  >
                    Cancel Offer
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading === offer.id}
                    onClick={() => {
                      const reason = prompt("Describe the dispute for admin:");
                      if (!reason) return;
                      updateOffer(offer.id, { action: "dispute", reason });
                    }}
                    className="bg-orange-600 dark:bg-orange-500 text-white px-4 py-2 rounded font-semibold hover:bg-orange-700 dark:hover:bg-orange-600 disabled:opacity-60"
                  >
                    Dispute To Admin
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
