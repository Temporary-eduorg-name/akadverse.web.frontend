"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import SkillCard from "@/components/SkillCard";
import SkillDetailModal from "@/components/SkillDetailModal";

interface SkillWithUser {
  id: string;
  name: string;
  description: string;
  displayName: string;
  expertiseLevel: string;
  profilePicture?: string;
  yearsOfExperience: number;
  startingPrice: number;
  userId: string;
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
}

export default function BrowseSkillsPage({
  params,
}: {
  params: Promise<{ skillType: string }>;
}) {
  const { skillType: encodedSkillType } = use(params);
  const [skills, setSkills] = useState<SkillWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<SkillWithUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const skillType = decodeURIComponent(encodedSkillType);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch(
          `/api/marketplace/skills/by-type?type=${encodeURIComponent(skillType)}`
        );
        if (response.ok) {
          const data = await response.json();
          setSkills(data.skills || []);
        }
      } catch (error) {
        console.error("Error fetching skills:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [skillType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 py-12 px-4 flex items-center justify-center">
        <p className="text-zinc-600">Loading skills...</p>
      </div>
    );
  }

        return (
          <div className="min-h-screen bg-zinc-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-zinc-900 mb-2">
                  {skillType}
                </h1>
                <p className="text-zinc-600">
                  {skills.length === 0
                    ? "No one has this skill yet"
                    : `${skills.length} expert${skills.length !== 1 ? "s" : ""} offering this skill`}
                </p>
              </div>

              {skills.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center border border-zinc-200">
                  <p className="text-lg text-zinc-600 mb-6">
                    No one has this skill yet. Be the first to offer {skillType}!
                  </p>
                  <Link
                    href="/studashboard/main-menu/marketplace/add-skill"
                    className="inline-block bg-zinc-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-zinc-700 transition-colors"
                  >
                    Add This Skill
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="group flex flex-col w-full bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredSkill(skill.id)}
                      onMouseLeave={() => setHoveredSkill(null)}
                    >
                      {/* Skill Image with Hover Overlay */}
                      <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                        {skill.profilePicture ? (
                          <img
                            src={skill.profilePicture}
                            alt={skill.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-2xl"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-300">
                            <span className="text-4xl font-bold text-white">
                              {skill.displayName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        {hoveredSkill === skill.id && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSkill(skill);
                                setModalOpen(true);
                              }}
                              className="bg-white text-zinc-900 px-6 py-2 rounded-lg font-semibold hover:bg-zinc-100 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        )}
                      </div>
                      {/* Skill Details */}
                      <div className="flex-1 flex flex-col justify-between p-4">
                        <div>
                          <h4 className="font-bold text-slate-900 truncate mb-1" title={skill.name}>{skill.name}</h4>
                          <p className="text-xs text-slate-500 font-medium truncate mb-2">by {skill.displayName}</p>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-bold text-indigo-600 text-lg">₦{skill.startingPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Skill Detail Modal */}
            {selectedSkill && (
              <SkillDetailModal
                skill={selectedSkill}
                isOpen={modalOpen}
                onClose={() => {
                  setModalOpen(false);
                  setTimeout(() => setSelectedSkill(null), 300);
                }}
              />
            )}
          </div>
        );
      }
//             setModalOpen(false);
//             setTimeout(() => setSelectedSkill(null), 300);
//           }}
//         />
//       )}
//     </div>
//   );
// }
