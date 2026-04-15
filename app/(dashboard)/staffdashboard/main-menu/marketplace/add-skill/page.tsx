"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCategoriesAndSkills } from "@/hooks/useCategoriesAndSkills";

const EXPERTISE_LEVELS = ["beginner", "semi-pro", "pro", "master"];

const PRICE_RANGES = [5000, 10000, 15000, 20000, 25000, 30000, 50000, 75000, 100000];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TIMES = [
  "12AM", "1AM", "2AM", "3AM", "4AM", "5AM", "6AM", "7AM", "8AM", "9AM", "10AM", "11AM",
  "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM", "10PM", "11PM",
];

export default function AddSkillPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const { skillTypes } = useCategoriesAndSkills();
  
  const [skillName, setSkillName] = useState("");
  const [isCustomSkill, setIsCustomSkill] = useState(false);
  const [customSkillName, setCustomSkillName] = useState("");
  const [description, setDescription] = useState("");
  const [customDisplayName, setCustomDisplayName] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [expertiseLevel, setExpertiseLevel] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [serviceDays, setServiceDays] = useState<string[]>([]);
  const [serviceTimeFrom, setServiceTimeFrom] = useState("");
  const [serviceTimeTo, setServiceTimeTo] = useState("");
  const [mostActiveSocial, setMostActiveSocial] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [website, setWebsite] = useState("");
  const [achievements, setAchievements] = useState("");

  useEffect(() => {
    if (skillTypes && skillTypes.length > 0) {
      setAvailableSkills(skillTypes);
    }
  }, [skillTypes]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDayToggle = (day: string) => {
    setServiceDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate service days
      if (serviceDays.length === 0) {
        throw new Error("Please select at least one service day");
      }

      // Validate service times
      if (!serviceTimeFrom || !serviceTimeTo) {
        throw new Error("Please select both start and end service times");
      }

      // Validate display name
      if (!customDisplayName.trim()) {
        throw new Error("Please enter a display name");
      }

      const formData = new FormData();
      
      const finalSkillName = isCustomSkill ? customSkillName : skillName;
      if (!finalSkillName) {
        throw new Error("Please select or enter a skill name");
      }

      formData.append("name", finalSkillName);
      formData.append("description", description);
      formData.append("displayName", customDisplayName);
      formData.append("yearsOfExperience", yearsOfExperience);
      formData.append("expertiseLevel", expertiseLevel);
      formData.append("paymentMethod", paymentMethod);
      formData.append("startingPrice", startingPrice);
      formData.append("serviceDays", serviceDays.join(", "));
      formData.append("serviceTimes", `${serviceTimeFrom} to ${serviceTimeTo}`);
      formData.append("mostActiveSocial", mostActiveSocial);
      formData.append("instagram", instagram);
      formData.append("linkedin", linkedin);
      formData.append("twitter", twitter);
      formData.append("website", website);
      formData.append("achievements", achievements);

      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      const response = await fetch("/api/marketplace/skills/create", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create skill");
      }

      alert("Skill created successfully!");
      router.push("/staffdashboard/main-menu/marketplace/dashboard/skills");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">
          Add New Skill
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-zinc-900 p-8 rounded-lg border border-zinc-200 dark:border-zinc-800">
          {/* Skill Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
              Skill Name
            </label>
            {!isCustomSkill ? (
              <>
                <select
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  required
                >
                  <option value="">Select a skill</option>
                  {availableSkills.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsCustomSkill(true)}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  + Add custom skill
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={customSkillName}
                  onChange={(e) => setCustomSkillName(e.target.value)}
                  placeholder="Enter custom skill name"
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsCustomSkill(false)}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Choose from available skills
                </button>
              </>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
              required
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
              Display Name (The name you want to use for this skill)
            </label>
            <input
              type="text"
              value={customDisplayName}
              onChange={(e) => setCustomDisplayName(e.target.value)}
              placeholder="e.g., John Doe, JD Studios, etc."
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Years of Experience */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                required
              />
            </div>

            {/* Expertise Level */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                Expertise Level
              </label>
              <select
                value={expertiseLevel}
                onChange={(e) => setExpertiseLevel(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                required
              >
                <option value="">Select level</option>
                {EXPERTISE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                Preferred Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                required
              >
                <option value="cash">Cash</option>
                <option value="transfer">Bank Transfer</option>
              </select>
            </div>

            {/* Starting Price */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                Starting Price (₦)
              </label>
              <select
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                required
              >
                <option value="">Select price</option>
                {PRICE_RANGES.map((price) => (
                  <option key={price} value={price}>
                    ₦{price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
              Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
            />
            {profilePicturePreview && (
              <img
                src={profilePicturePreview}
                alt="Preview"
                className="mt-4 w-32 h-32 object-cover rounded-lg"
              />
            )}
          </div>

          {/* Service Days */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-3">
              Service Days *
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-3">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      serviceDays.includes(day)
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                        : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              {serviceDays.length > 0 && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                  Active on: {serviceDays.join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Service Times */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-3">
              Service Times *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="serviceTimeFrom" className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  From
                </label>
                <select
                  id="serviceTimeFrom"
                  value={serviceTimeFrom}
                  onChange={(e) => setServiceTimeFrom(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  required
                >
                  <option value="">Select time</option>
                  {TIMES.map((time) => (
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
                  value={serviceTimeTo}
                  onChange={(e) => setServiceTimeTo(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  required
                >
                  <option value="">Select time</option>
                  {TIMES.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {serviceTimeFrom && serviceTimeTo && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                Service hours: {serviceTimeFrom} to {serviceTimeTo}
              </p>
            )}
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Social Links for Contact
            </h3>

            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                Most Active Social Platform
              </label>
              <select
                value={mostActiveSocial}
                onChange={(e) => setMostActiveSocial(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
              >
                <option value="">Select platform</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter</option>
                <option value="website">Website</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                  Instagram
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@username"
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                  LinkedIn
                </label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="Profile URL"
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                  Twitter
                </label>
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="@username"
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                  Website
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://"
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
              Achievements & Certifications
            </label>
            <textarea
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              rows={4}
              placeholder="List your achievements, certifications, awards, etc."
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-lg font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creating Skill..." : "Create Skill"}
          </button>
        </form>
      </div>
      </div>
  );
}
