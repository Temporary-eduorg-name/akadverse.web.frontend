"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { formatCurrencyInput, parseCurrencyInput } from "@/utils/currency";

const EXPERTISE_LEVELS = ["beginner", "semi-pro", "pro", "master"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIMES = [
  "12AM", "1AM", "2AM", "3AM", "4AM", "5AM", "6AM", "7AM", "8AM", "9AM", "10AM", "11AM",
  "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM", "10PM", "11PM",
];

export default function EditSkillPage() {
  const params = useParams();
  const router = useRouter();
  const skillId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [description, setDescription] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [expertiseLevel, setExpertiseLevel] = useState("");
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
    const fetchSkill = async () => {
      try {
        const response = await fetch(`/api/skills/${skillId}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch skill");
        }

        const data = await response.json();
        const skill = data.skill;

        setDescription(skill.description || "");
        setDisplayName(skill.displayName || "");
        setYearsOfExperience(skill.yearsOfExperience?.toString() || "");
        setExpertiseLevel(skill.expertiseLevel || "");
        setStartingPrice(formatCurrencyInput(skill.startingPrice?.toString() || "0"));
        
        if (skill.serviceDays) {
          setServiceDays(skill.serviceDays.split(", "));
        }
        
        if (skill.serviceTimes) {
          const [from, , to] = skill.serviceTimes.split(" ");
          setServiceTimeFrom(from || "");
          setServiceTimeTo(to || "");
        }
        
        setMostActiveSocial(skill.mostActiveSocial || "");
        setInstagram(skill.instagram || "");
        setLinkedin(skill.linkedin || "");
        setTwitter(skill.twitter || "");
        setWebsite(skill.website || "");
        setAchievements(skill.achievements || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load skill");
      } finally {
        setLoading(false);
      }
    };

    fetchSkill();
  }, [skillId]);

  const handleDayToggle = (day: string) => {
    setServiceDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handlePriceChange = (value: string) => {
    setStartingPrice(formatCurrencyInput(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/skills/${skillId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description,
          displayName,
          yearsOfExperience,
          expertiseLevel,
          startingPrice: parseCurrencyInput(startingPrice),
          serviceDays: serviceDays.join(", "),
          serviceTimes: `${serviceTimeFrom} to ${serviceTimeTo}`,
          mostActiveSocial,
          instagram,
          linkedin,
          twitter,
          website,
          achievements,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update skill");
      }

      alert("Skill updated successfully!");
      router.push(`/dashboard/skills/${skillId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update skill");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading skill...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/dashboard/skills/${skillId}`}
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            ← Back to Skill
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">
          Edit Skill
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-zinc-900 p-8 rounded-lg border border-zinc-200 dark:border-zinc-700">
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

          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
              Starting Price (₦)
            </label>
            <input
              type="text"
              value={startingPrice}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-3">
              Service Days
            </label>
            <div className="flex flex-wrap gap-3">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    serviceDays.includes(day)
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                      : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-3">
              Service Times
            </label>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={serviceTimeFrom}
                onChange={(e) => setServiceTimeFrom(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                required
              >
                <option value="">From</option>
                {TIMES.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              <select
                value={serviceTimeTo}
                onChange={(e) => setServiceTimeTo(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                required
              >
                <option value="">To</option>
                {TIMES.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

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

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-lg font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Updating..." : "Update Skill"}
            </button>
            <Link
              href={`/dashboard/skills/${skillId}`}
              className="flex-1 text-center bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white px-6 py-3 rounded-lg font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
