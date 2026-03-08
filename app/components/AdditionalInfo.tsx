"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AdditionalInfoData } from "../types/form";

type SkillLevel = "Beginner" | "Intermediate" | "Professional" | "Expert";

interface Skill {
  name: string;
  level: SkillLevel;
  percent: number;
}

interface Props {
  data?: AdditionalInfoData;
  onBack?: (values: AdditionalInfoData) => void;
  onNext: (values: AdditionalInfoData) => void;
}

export default function AdditionalInfo({ data, onBack, onNext }: Props) {
  const initial: AdditionalInfoData = {
    researchInterests: [],
    technicalSkills: {},
    nonTechnicalSkills: {},
    preferences: {},
    profiles: {},
    additionalComments: "",
    showAdditionalInfo: true,
  };

  const [form, setForm] = useState<AdditionalInfoData>(data ?? initial);
  const [showForm, setShowForm] = useState(data ? true : false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [nonTechSkills, setNonTechSkills] = useState<Skill[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [searchType, setSearchType] = useState<"tech" | "nonTech">("tech");

  useEffect(() => {
    if (data) {
      setForm(data);
    }
  }, [data]);

  // Mock external API call – replace with your real API endpoint later
  useEffect(() => {
    if (!searchTerm) return setSearchResults([]);
    const controller = new AbortController();
    const fetchSkills = async () => {
      try {
        const res = await fetch(
          `https://api.datamuse.com/words?ml=${encodeURIComponent(searchTerm)}`,
          { signal: controller.signal },
        );
        const data: { word: string }[] = await res.json();
        setSearchResults(data.slice(0, 10).map((d) => d.word));
      } catch {
        /* ignore */
      }
    };
    fetchSkills();
    return () => controller.abort();
  }, [searchTerm]);

  // Helpers
  const addInterest = (interest: string) => {
    if (!form.researchInterests.includes(interest)) {
      setForm({
        ...form,
        researchInterests: [...form.researchInterests, interest],
      });
    }
  };

  const removeInterest = (interest: string) => {
    setForm({
      ...form,
      researchInterests: form.researchInterests.filter((i) => i !== interest),
    });
  };

  const addSkill = (type: "tech" | "nonTech", name: string) => {
    const newSkill: Skill = { name, level: "Intermediate", percent: 50 };
    if (type === "tech" && !skills.find((s) => s.name === name)) {
      setSkills([...skills, newSkill]);
      setForm({
        ...form,
        technicalSkills: { ...form.technicalSkills, [name]: 50 },
      });
    } else if (
      type === "nonTech" &&
      !nonTechSkills.find((s) => s.name === name)
    ) {
      setNonTechSkills([...nonTechSkills, newSkill]);
      setForm({
        ...form,
        nonTechnicalSkills: { ...form.nonTechnicalSkills, [name]: 50 },
      });
    }
    setSearchTerm("");
    setSearchResults([]);
  };

  const updateSkillLevel = (
    type: "tech" | "nonTech",
    name: string,
    level: SkillLevel,
  ) => {
    const levelMap: Record<SkillLevel, number> = {
      Beginner: 25,
      Intermediate: 50,
      Professional: 75,
      Expert: 100,
    };
    const percent = levelMap[level];
    const updater = (arr: Skill[]) =>
      arr.map((s) => (s.name === name ? { ...s, level, percent } : s));
    if (type === "tech") {
      setSkills(updater(skills));
      setForm({
        ...form,
        technicalSkills: { ...form.technicalSkills, [name]: percent },
      });
    } else {
      setNonTechSkills(updater(nonTechSkills));
      setForm({
        ...form,
        nonTechnicalSkills: { ...form.nonTechnicalSkills, [name]: percent },
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
              <path
                d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 
              0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-8 
              14H7v-4h4v4zm0-6H7V7h4v4zm6 
              6h-4v-4h4v4zm0-6h-4V7h4v4z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Additional Information
            </h2>
            <p className="text-gray-500">Help us personalize your experience</p>
          </div>
        </div>

        {/* Toggle */}
        <label className="flex items-center gap-3 cursor-pointer text-gray-800 font-medium">
          <input
            type="checkbox"
            checked={showForm}
            onChange={() => setShowForm(!showForm)}
            className="w-5 h-5 accent-blue-600 cursor-pointer"
          />
          I would like to provide additional information
        </label>

        {/* Collapsible Form */}
        <div
          className={`transition-all duration-700 overflow-hidden ${
            showForm
              ? "max-h-[5000px] opacity-100 animate-fadeIn"
              : "max-h-0 opacity-0 animate-fadeOut"
          }`}
        >
          {/* Research Interests */}
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Research Interests
            </h2>
            <div className="flex flex-wrap gap-3 mb-4">
              {[
                "Artificial Intelligence",
                "Machine Learning",
                "Signal Processing",
                "Control Systems",
                "Power Systems",
                "Embedded Systems",
                "Computer Networks",
                "Digital Communications",
                "Robotics",
                "Cybersecurity",
              ].map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => addInterest(topic)}
                  disabled={form.researchInterests.includes(topic)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-300 ${
                    form.researchInterests.includes(topic)
                      ? "bg-blue-100 text-blue-700 cursor-not-allowed"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 bg-blue-50 p-3 rounded-lg min-h-[48px]">
              {form.researchInterests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className="bg-white/20 hover:bg-white/30 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </section>

          {/* Technical & Non-Technical Skills */}
          {(["tech", "nonTech"] as const).map((type) => (
            <section key={type} className="mt-10">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                {type === "tech" ? "Technical Skills" : "Non-Technical Skills"}
              </h2>
              <input
                type="text"
                placeholder={`Search ${
                  type === "tech" ? "technical" : "non-technical"
                } skills...`}
                value={searchType === type ? searchTerm : ""}
                onFocus={() => setSearchType(type)}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSearchType(type);
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:border-blue-500 focus:ring focus:ring-blue-100 outline-none mb-3"
              />
              {searchType === type && searchResults.length > 0 && (
                <ul className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto mb-4">
                  {searchResults.map((result) => (
                    <li
                      key={result}
                      onClick={() => addSkill(type, result)}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-700 text-sm"
                    >
                      {result}
                    </li>
                  ))}
                </ul>
              )}

              {(type === "tech" ? skills : nonTechSkills).map((skill) => (
                <div key={skill.name} className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">
                      {skill.name}
                    </span>
                    <div className="flex gap-2">
                      {(
                        [
                          "Beginner",
                          "Intermediate",
                          "Professional",
                          "Expert",
                        ] as SkillLevel[]
                      ).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() =>
                            updateSkillLevel(type, skill.name, lvl)
                          }
                          className={`px-2 py-1 text-sm rounded transition-all duration-200 ${
                            skill.level === lvl
                              ? "bg-blue-600 text-white"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded overflow-hidden">
                    <div
                      className={`h-full rounded transition-all duration-300 ${
                        skill.percent <= 25
                          ? "bg-red-500"
                          : skill.percent <= 50
                            ? "bg-orange-500"
                            : skill.percent <= 75
                              ? "bg-green-400"
                              : "bg-green-700"
                      }`}
                      style={{ width: `${skill.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </section>
          ))}

          {/* Preferences */}
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Preferences
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Department Newsletter",
                  desc: "Receive updates about department events, research opportunities, and news.",
                },
                {
                  title: "Research Updates",
                  desc: "Get notified about new research papers and projects.",
                },
                {
                  title: "Career Opportunities",
                  desc: "Receive information about internships and jobs.",
                },
                {
                  title: "Collaboration Requests",
                  desc: "Allow others to contact you for collaborations.",
                },
                {
                  title: "Mentorship Program",
                  desc: "Join as a mentor or mentee.",
                },
              ].map((pref) => (
                <div
                  key={pref.title}
                  className="flex gap-3 bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-all duration-200 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.preferences[pref.title] ?? false}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        preferences: {
                          ...form.preferences,
                          [pref.title]: e.target.checked,
                        },
                      })
                    }
                    className="accent-blue-600 w-5 h-5 mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{pref.title}</p>
                    <p className="text-gray-500 text-sm">{pref.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Connect Profiles */}
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Connect Your Profiles (Optional)
            </h2>
            {[
              {
                key: "linkedin",
                icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg",
                placeholder: "LinkedIn Profile URL",
              },
              {
                key: "github",
                icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
                placeholder: "GitHub Profile URL",
              },
              {
                key: "portfolio",
                icon: "",
                placeholder: "Portfolio Website URL",
              },
            ].map((p) => (
              <div key={p.key} className="flex items-center gap-3 mb-4">
                {p.icon ? (
                  <Image
                    src={p.icon}
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                ) : (
                  <svg
                    className="w-6 h-6 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 
                    0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 
                    0-2-2zm-8 14H7v-4h4v4zm0-6H7V7h4v4zm6 
                    6h-4v-4h4v4zm0-6h-4V7h4v4z"
                    />
                  </svg>
                )}
                <input
                  type="text"
                  value={
                    form.profiles[p.key as keyof typeof form.profiles] ?? ""
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      profiles: {
                        ...form.profiles,
                        [p.key as keyof typeof form.profiles]: e.target.value,
                      },
                    })
                  }
                  placeholder={p.placeholder}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:border-blue-500 focus:ring focus:ring-blue-100 outline-none"
                />
              </div>
            ))}
            <p className="text-gray-500 text-sm">
              Connecting your profiles helps build your academic network.
            </p>
          </section>

          {/* Additional Comments */}
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Additional Comments
            </h2>
            <textarea
              value={form.additionalComments}
              onChange={(e) =>
                setForm({ ...form, additionalComments: e.target.value })
              }
              placeholder="Is there anything else you'd like us to know?"
              className="w-full h-32 border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:border-blue-500 focus:ring focus:ring-blue-100 outline-none resize-y"
            />
          </section>
        </div>
        {/* Navigation */}
        <div className="flex justify-between pt-4 mt-10">
          <button
            type="button"
            onClick={() => onBack?.(form)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-300 text-gray-700"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M20 11H7.83l5.59-5.59L12 
              4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
              />
            </svg>
            Return to Student Details
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300"
          >
            Complete Registration
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path
                d="M12 4l-1.41 1.41L16.17 
              11H4v2h12.17l-5.58 5.59L12 
              20l8-8z"
              />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
}
