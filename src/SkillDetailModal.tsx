"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { InstagramLink, LinkedInLink, TwitterLink, WebsiteLink } from "./SocialLinks";

interface SkillDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill: {
    id: string;
    name: string;
    description: string;
    displayName: string;
    yearsOfExperience: number;
    expertiseLevel: string;
    startingPrice: number;
    profilePicture?: string;
    visitors: number;
    serviceDays: string;
    serviceTimes: string;
    achievements?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
    createdAt?: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
    _count: {
      offers: number;
      reviews: number;
    };
  };
}

export default function SkillDetailModal({
  isOpen,
  onClose,
  skill,
}: SkillDetailModalProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [offerFrom, setOfferFrom] = useState("");
  const [offerTo, setOfferTo] = useState("");
  const [proposedPrice, setProposedPrice] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Get current date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  console.log(skill)
  const registeredDate = skill.createdAt
    ? new Date(skill.createdAt).toLocaleDateString()
    : "Not available";

  const handleSubmitOffer = async () => {
    // Check if user is authenticated before submitting
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      if (!offerFrom || !offerTo) {
        setError("Please select both start and end dates");
        setSubmitting(false);
        return;
      }

      // Validate that offerTo is not before offerFrom
      if (offerTo < offerFrom) {
        setError("End date cannot be before start date");
        setSubmitting(false);
        return;
      }

      if (!proposedPrice) {
        setError("Please enter your proposed price");
        setSubmitting(false);
        return;
      }

      if (!description.trim()) {
        setError("Please provide a description of what you need");
        setSubmitting(false);
        return;
      }

      const price = Number(proposedPrice);
      if (!Number.isFinite(price) || price <= 0) {
        setError("Price must be a valid number greater than zero");
        setSubmitting(false);
        return;
      }

      const payload = {
        offerFrom,
        offerTo,
        negotiatedPrice: price,
        description: description.trim(),
      };

      const response = await fetch(`/api/marketplace/skills/${skill.id}/offers`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.status === 401) {
        // Redirect to login if not authenticated
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit offer");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setOfferFrom("");
        setOfferTo("");
        setProposedPrice("");
        setDescription("");
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit offer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 p-6 flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                  {skill.name}
                </h2>
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  by {skill.displayName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Skill Image and Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Image */}
                <div>
                  {skill.profilePicture ? (
                    <img
                      src={skill.profilePicture}
                      alt={skill.name}
                      className="w-full h-72 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-72 bg-gradient-to-br from-blue-200 to-purple-300 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
                      <span className="text-6xl font-bold text-white">
                        {skill.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info Cards */}
                <div className="space-y-4">
                  <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Expertise Level</p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                      {skill.expertiseLevel.charAt(0).toUpperCase() + skill.expertiseLevel.slice(1)}
                    </p>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Years of Experience</p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                      {skill.yearsOfExperience}+ years
                    </p>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Availability</p>
                    <p className="text-sm text-zinc-900 dark:text-white font-medium">{skill.serviceDays}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{skill.serviceTimes}</p>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Engagement</p>
                    <p className="text-sm text-zinc-900 dark:text-white">
                      {skill._count.reviews} reviews • {skill.visitors} views
                    </p>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Registered On</p>
                    <p className="text-sm text-zinc-900 dark:text-white font-medium">{registeredDate}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">About This Skill</h3>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {skill.description}
                </p>
              </div>

              {/* Achievements */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Achievements</h3>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {skill.achievements?.trim() || "No achievements added yet."}
                </p>
              </div>

              {/* Social Links */}
              {(skill.instagram || skill.linkedin || skill.twitter || skill.website) && (
                <div className="mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-700">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Connect</h3>
                  <div className="flex gap-3 flex-wrap">
                    {skill.instagram && (
                      <InstagramLink username={skill.instagram} />
                    )}
                    {skill.linkedin && (
                      <LinkedInLink username={skill.linkedin} />
                    )}
                    {skill.twitter && (
                      <TwitterLink username={skill.twitter} />
                    )}
                    {skill.website && (
                      <WebsiteLink url={skill.website} />
                    )}
                  </div>
                </div>
              )}

              {/* Offer Form */}
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Make an Offer</h3>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitOffer();
                  }}
                  className="space-y-4"
                >
                  <div className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">Select the duration of your offer request</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Offer From and Offer To define how long your request stays active. If this duration expires before the offer is handled, it is automatically moved to Ignored.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                        Offer Duration - From
                      </label>
                      <input
                        type="date"
                        value={offerFrom}
                        min={today}
                        onChange={(e) => setOfferFrom(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                        Offer Duration - To
                      </label>
                      <input
                        type="date"
                        value={offerTo}
                        min={today}
                        onChange={(e) => setOfferTo(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                      Your Budget
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(e.target.value)}
                      placeholder="Enter amount you're willing to pay"
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                      What do you need from this skill owner?
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what you need in detail..."
                      rows={4}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white resize-none"
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  )}

                  {success && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      ✓ Offer submitted successfully! The skill owner will review it shortly.
                    </p>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={submitting || success}
                      className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-3 rounded-lg font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors disabled:opacity-60"
                    >
                      {submitting ? "Submitting..." : success ? "✓ Sent!" : "Send Offer"}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white px-4 py-3 rounded-lg font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

