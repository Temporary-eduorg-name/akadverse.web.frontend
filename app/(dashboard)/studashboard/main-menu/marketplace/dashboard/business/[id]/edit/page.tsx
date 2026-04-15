"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Business {
  id: string;
  name: string;
  industry: string;
  description: string;
  paymentMethod: string;
  bankName: string | null;
  accountNumber: string | null;
  location: string;
  serviceDays: string;
  serviceTimes: string;
  yearEstablished: number | null;
  instagram: string | null;
  linkedin: string | null;
  website: string | null;
}

interface Bank {
  code: string;
  name: string;
}

export default function EditBusinessPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.id as string;

  const [formData, setFormData] = useState<Business | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch business data
        const businessResponse = await fetch(`/api/marketplace/businesses/${businessId}`, {
          credentials: "include",
        });

        if (businessResponse.status === 401) {
          router.push("/studashboard/main-menu/marketplace");
          return;
        }

        if (!businessResponse.ok) {
          throw new Error("Failed to fetch business");
        }

        const businessData = await businessResponse.json();
        setFormData(businessData.business);

        // Fetch banks
        const banksResponse = await fetch("/api/marketplace/paystack/banks");
        if (banksResponse.ok) {
          const banksData = await banksResponse.json();
          setBanks(banksData.banks);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load business data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [businessId, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!formData) return;

    const { name, value } = e.target;
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            [name]: name === "yearEstablished" ? (value ? parseInt(value) : null) : value,
          }
        : null
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/marketplace/businesses/${businessId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.status === 401) {
        router.push("/studashboard/main-menu/marketplace");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update business");
      }

      setSuccess("Business updated successfully!");
      setTimeout(() => {
        router.push(`/studashboard/main-menu/marketplace/dashboard/business/${businessId}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <LoadingSpinner size="md" />
          <p className="text-zinc-600 mt-4">Loading business...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-zinc-600 mb-4">Business not found</p>
          <Link href="/studashboard/main-menu/marketplace/dashboard" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link href={`/studashboard/main-menu/marketplace/dashboard/business/${businessId}`} className="text-zinc-600 hover:text-zinc-900 mb-6 inline-block">
          ← Back
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-6">
            Edit Business
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Business Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-zinc-900"
                required
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Industry
              </label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-zinc-900"
                required
              >
                <option value="">Select industry</option>
                <option value="food">Food</option>
                <option value="clothing">Clothing</option>
                <option value="electronics">Electronics</option>
                <option value="cosmetics">Cosmetics</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-zinc-900"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-zinc-900"
                required
              />
            </div>

            {/* Service Days */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Service Days
              </label>
              <input
                type="text"
                name="serviceDays"
                value={formData.serviceDays}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-zinc-900"
                required
              />
            </div>

            {/* Service Times */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Service Times
              </label>
              <input
                type="text"
                name="serviceTimes"
                value={formData.serviceTimes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-zinc-900"
                required
              />
            </div>

            {/* Year Established */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Year Established
              </label>
              <input
                type="number"
                name="yearEstablished"
                value={formData.yearEstablished || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
              />
            </div>

            {/* Social Links */}
            <div className="border-t border-zinc-200 pt-4 mt-6">
              <h3 className="text-lg font-semibold text-zinc-900 mb-4">
                Social Links
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Instagram
                  </label>
                  <input
                    type="url"
                    name="instagram"
                    value={formData.instagram || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-zinc-900"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-zinc-900 text-white py-2 rounded-md hover:bg-zinc-700 transition-colors font-medium disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <Link
                href={`/studashboard/main-menu/marketplace/dashboard/business/${businessId}`}
                className="flex-1 text-center bg-zinc-200 text-zinc-900 py-2 rounded-md hover:bg-zinc-300 transition-colors font-medium"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
