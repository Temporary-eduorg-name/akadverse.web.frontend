"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCategoriesAndSkills } from "@/hooks/useCategoriesAndSkills";

interface Bank {
  code: string;
  name: string;
}

export default function AddBusinessPage() {
  const router = useRouter();
  const { categories: categoriesFromHook } = useCategoriesAndSkills();
  
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    description: "",
    paymentMethod: "",
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    location: "",
    serviceDays: [] as string[],
    serviceTimeFrom: "",
    serviceTimeTo: "",
    instagram: "",
    linkedin: "",
    website: "",
  });
  const [banks, setBanks] = useState<Bank[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(false);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const times = [
    "12AM", "1AM", "2AM", "3AM", "4AM", "5AM", "6AM", "7AM", "8AM", "9AM", "10AM", "11AM",
    "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM", "10PM", "11PM",
  ];

  // Fetch banks on component mount
  useEffect(() => {
    const fetchBanks = async () => {
      setLoadingBanks(true);
      try {
        const response = await fetch("/api/paystack/banks");
        const data = await response.json();
        if (response.ok) {
          setBanks(data.banks);
        } else {
          setError("Failed to load banks");
        }
      } catch (err) {
        setError("An error occurred while loading banks");
      } finally {
        setLoadingBanks(false);
      }
    };

    fetchBanks();
  }, []);

  useEffect(() => {
    if (categoriesFromHook && categoriesFromHook.length > 0) {
      setCategories(categoriesFromHook);
    }
  }, [categoriesFromHook]);

  // Auto-verify account when both bankName and accountNumber are filled
  useEffect(() => {
    if (!formData.bankName || !formData.accountNumber) {
      return;
    }

    const verifyAccount = async () => {
      setVerifyingAccount(true);
      setError("");

      try {
        const response = await fetch("/api/paystack/verify-account", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error || "Failed to verify account");
          setVerifyingAccount(false);
          return;
        }

        setFormData((prev) => ({
          ...prev,
          accountHolderName: result.accountHolderName,
        }));
        setVerifyingAccount(false);
      } catch (err) {
        setError("An error occurred while verifying account");
        setVerifyingAccount(false);
      }
    };

    verifyAccount();
  }, [formData.bankName, formData.accountNumber]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev) => {
      const days = prev.serviceDays.includes(day)
        ? prev.serviceDays.filter((d) => d !== day)
        : [...prev.serviceDays, day];
      return {
        ...prev,
        serviceDays: days,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validate service days
    if (formData.serviceDays.length === 0) {
      setError("Please select at least one service day");
      return;
    }

    // Validate service times
    if (!formData.serviceTimeFrom || !formData.serviceTimeTo) {
      setError("Please select both start and end service times");
      return;
    }

    setLoading(true);

    try {
      // Format data to send
      const submitData = {
        ...formData,
        serviceDays: formData.serviceDays.join(", "), // Convert array to comma-separated string
        serviceTimes: `${formData.serviceTimeFrom} to ${formData.serviceTimeTo}`, // String format for display
      };
      const response = await fetch("/api/businesses/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Something went wrong");
        setLoading(false);
        return;
      }

      router.push("/");
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-black px-4 py-12">
      <div className="w-full max-w-3xl">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">
            Add a Business
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Business Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                required
              />
            </div>

            {/* Industry */}
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Industry *
              </label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                required
              >
                <option value="">Select an industry</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Bio/Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="e.g., Lagos, Nigeria"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                required
              />
            </div>

            {/* Service Days */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                Service Days *
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-3">
                  {days.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        formData.serviceDays.includes(day)
                          ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                          : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                {formData.serviceDays.length > 0 && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                    Active on: {formData.serviceDays.join(", ")}
                  </p>
                )}
              </div>
            </div>

            {/* Service Times */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                Service Times *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="serviceTimeFrom" className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    From
                  </label>
                  <select
                    id="serviceTimeFrom"
                    name="serviceTimeFrom"
                    value={formData.serviceTimeFrom}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                    required
                  >
                    <option value="">Select time</option>
                    {times.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="serviceTimeTo" className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    To
                  </label>
                  <select
                    id="serviceTimeTo"
                    name="serviceTimeTo"
                    value={formData.serviceTimeTo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                    required
                  >
                    <option value="">Select time</option>
                    {times.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {formData.serviceTimeFrom && formData.serviceTimeTo && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                  Service hours: {formData.serviceTimeFrom} to {formData.serviceTimeTo}
                </p>
              )}
            </div>

            {/* Socials Section */}
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 mt-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                Social Links (Optional)
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="instagram" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Instagram
                  </label>
                  <input
                    type="url"
                    id="instagram"
                    name="instagram"
                    placeholder="https://instagram.com/yourusername"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="linkedin" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    id="linkedin"
                    name="linkedin"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    placeholder="https://yourwebsite.com"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Preferred Payment Method *
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                required
              >
                <option value="">Select payment method</option>
                <option value="cash">Cash</option>
                <option value="transfer">Bank Transfer</option>
              </select>
            </div>

            {/* Payment Details - Always shown */}
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 mt-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                Payment Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bankName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Bank Name *
                  </label>
                  <select
                    id="bankName"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                    disabled={loadingBanks}
                  >
                    <option value="">Select a bank</option>
                    {banks.map((bank) => (
                      <option key={bank.name} value={bank.name}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="accountNumber" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    placeholder="10 digits"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              {verifyingAccount && (
                <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-md text-sm flex items-center">
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Verifying account details...
                </div>
              )}

              {formData.accountHolderName && !error && (
                <div className="mt-3 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-md text-sm">
                  <strong>Account Holder Name:</strong> {formData.accountHolderName}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-2 rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Business"}
              </button>
              <Link
                href="/"
                className="flex-1 text-center bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white py-2 rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors font-medium"
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
