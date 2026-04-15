"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";

interface SkillDashboardData {
  skill: {
    id: string;
    name: string;
    description: string;
    displayName: string;
    expertiseLevel: string;
    startingPrice: number;
    yearsOfExperience: number;
    profilePicture?: string;
    serviceDays: string;
    serviceTimes: string;
    visitors: number;
  };
  stats: {
    totalOffers: number;
    acceptedOffers: number;
    completedOffers: number;
    totalRevenue: number;
    averagePrice: number;
    totalReviews: number;
    averageRating: number;
  };
  recentOffers: Array<{
    id: string;
    status: string;
    originalPrice: number;
    negotiatedPrice: number | null;
    offerFrom: string;
    offerTo: string;
    fulfillmentOtpAttempts: number;
    buyer: {
      firstName: string;
      lastName: string;
    };
  }>;
  recentReviews: Array<{
    id: string;
    rating: number;
    comment: string;
    sentiment: string;
    createdAt: string;
    buyer: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export default function SkillDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const skillId = params.id as string;

  const [data, setData] = useState<SkillDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "offers" | "reviews">("overview");
  const [offerActionLoading, setOfferActionLoading] = useState<string | null>(null);
  const [fulfillmentOtpByOffer, setFulfillmentOtpByOffer] = useState<Record<string, string>>({});

  const fetchSkillData = async () => {
    try {
      const response = await fetch(`/api/skills/${skillId}/dashboard`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch skill data");
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching skill data:", error);
      router.push("/dashboard/skills");
    } finally {
      setLoading(false);
    }
  };

  const updateOfferStatus = async (offerId: string, status: "accepted" | "rejected" | "ignored") => {
    try {
      setOfferActionLoading(offerId);
      const response = await fetch(`/api/skills/offers/${offerId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update offer status");
      }

      await fetchSkillData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update offer status");
    } finally {
      setOfferActionLoading(null);
    }
  };

  const fulfillOffer = async (offerId: string) => {
    try {
      const otp = fulfillmentOtpByOffer[offerId]?.trim();
      if (!otp) {
        alert("Please enter the buyer OTP.");
        return;
      }

      setOfferActionLoading(offerId);
      const response = await fetch(`/api/skills/offers/${offerId}/fulfill`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fulfill offer");
      }

      setFulfillmentOtpByOffer((prev) => ({ ...prev, [offerId]: "" }));
      await fetchSkillData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to fulfill offer");
    } finally {
      setOfferActionLoading(null);
    }
  };

  const handleDeleteSkill = async () => {
    if (!data) return;
    
    if (!confirm(`Are you sure you want to delete "${data.skill.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/skills/${skillId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete skill");
      }

      alert("Skill deleted successfully!");
      router.push("/dashboard/skills");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete skill");
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    if (skillId) {
      fetchSkillData();
    }
  }, [skillId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="md" />
          <p className="text-zinc-600 dark:text-zinc-400 mt-4">Loading skill dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">Skill not found</p>
          <Link href="/dashboard/skills" className="text-blue-600 hover:underline">
            Back to My Skills
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard/skills"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              ← Back to My Skills
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Profile Picture */}
              {data.skill.profilePicture ? (
                <img
                  src={data.skill.profilePicture}
                  alt={data.skill.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-zinc-200 dark:border-zinc-700"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-200 to-purple-300 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center border-2 border-zinc-200 dark:border-zinc-700">
                  <span className="text-2xl font-bold text-white">
                    {data.skill.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">
                  {data.skill.name}
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400">
                  by {data.skill.displayName} • {data.skill.expertiseLevel.charAt(0).toUpperCase() + data.skill.expertiseLevel.slice(1)}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">
                  👁️ {data.skill.visitors} views
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/dashboard/skills/${skillId}/edit`}
                className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2 rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors font-medium text-center"
              >
                Edit Skill
              </Link>
              <button
                onClick={handleDeleteSkill}
                disabled={deleteLoading}
                className="bg-red-600 dark:bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-4 font-medium transition-colors relative ${
                activeTab === "overview"
                  ? "text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-white"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("offers")}
              className={`px-4 py-4 font-medium transition-colors relative ${
                activeTab === "offers"
                  ? "text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-white"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Offers ({data.stats.totalOffers})
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-4 py-4 font-medium transition-colors relative ${
                activeTab === "reviews"
                  ? "text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-white"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Reviews ({data.stats.totalReviews})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-700">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Offers</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-white">{data.stats.totalOffers}</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-700">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Accepted</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{data.stats.acceptedOffers}</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-700">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Completed</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{data.stats.completedOffers}</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-700">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-white">₦{data.stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-700">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Average Price</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">₦{data.stats.averagePrice.toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-700">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Average Rating</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{data.stats.averageRating.toFixed(1)} ⭐</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-700">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Starting Price</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">₦{data.skill.startingPrice.toLocaleString()}</p>
              </div>
            </div>

            {/* Skill Details */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border border-zinc-200 dark:border-zinc-700">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Skill Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Description</p>
                  <p className="text-zinc-900 dark:text-white">{data.skill.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Experience</p>
                    <p className="text-zinc-900 dark:text-white">{data.skill.yearsOfExperience}+ years</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Expertise Level</p>
                    <p className="text-zinc-900 dark:text-white capitalize">{data.skill.expertiseLevel}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Service Days</p>
                    <p className="text-zinc-900 dark:text-white">{data.skill.serviceDays}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Service Times</p>
                    <p className="text-zinc-900 dark:text-white">{data.skill.serviceTimes}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "offers" && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-zinc-200 dark:border-zinc-700">
            <div className="p-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Recent Offers</h2>
              {data.recentOffers.length === 0 ? (
                <p className="text-zinc-600 dark:text-zinc-400 text-center py-8">No offers yet</p>
              ) : (
                <div className="space-y-4">
                  {data.recentOffers.map((offer) => (
                    <div
                      key={offer.id}
                      className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            {offer.buyer.firstName} {offer.buyer.lastName}
                          </p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {new Date(offer.offerFrom).toLocaleDateString()} - {new Date(offer.offerTo).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          offer.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                          offer.status === "accepted" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                          offer.status === "fulfilled" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}>
                          {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Original: <span className="font-semibold text-zinc-900 dark:text-white">₦{offer.originalPrice.toLocaleString()}</span>
                        </p>
                        {offer.negotiatedPrice && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Negotiated: <span className="font-semibold text-green-600 dark:text-green-400">₦{offer.negotiatedPrice.toLocaleString()}</span>
                          </p>
                        )}
                      </div>

                      {offer.status === "pending" && (
                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() => updateOfferStatus(offer.id, "accepted")}
                            disabled={offerActionLoading === offer.id}
                            className="bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-60"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => updateOfferStatus(offer.id, "rejected")}
                            disabled={offerActionLoading === offer.id}
                            className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-60"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {offer.status === "accepted" && (
                        <div className="mt-4">
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                            Ask buyer for OTP, then submit below to complete fulfillment.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              maxLength={6}
                              value={fulfillmentOtpByOffer[offer.id] ?? ""}
                              onChange={(event) =>
                                setFulfillmentOtpByOffer((prev) => ({
                                  ...prev,
                                  [offer.id]: event.target.value,
                                }))
                              }
                              placeholder="Enter 6-digit OTP"
                              className="w-full sm:w-56 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                            />
                            <button
                              type="button"
                              onClick={() => fulfillOffer(offer.id)}
                              disabled={offerActionLoading === offer.id}
                              className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-60"
                            >
                              Mark Fulfilled
                            </button>
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                            Failed attempts: {offer.fulfillmentOtpAttempts}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-zinc-200 dark:border-zinc-700">
            <div className="p-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Reviews</h2>
              {data.recentReviews.length === 0 ? (
                <p className="text-zinc-600 dark:text-zinc-400 text-center py-8">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {data.recentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            {review.buyer.firstName} {review.buyer.lastName}
                          </p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-zinc-900 dark:text-white">{review.rating}</span>
                          <span className="text-yellow-500">⭐</span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                            review.sentiment === "positive" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                            review.sentiment === "negative" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
                            "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                          }`}>
                            {review.sentiment}
                          </span>
                        </div>
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
