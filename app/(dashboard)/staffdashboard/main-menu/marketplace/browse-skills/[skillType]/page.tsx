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
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4 flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading skills...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
            {skillType}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {skills.length === 0
              ? "No one has this skill yet"
              : `${skills.length} expert${skills.length !== 1 ? "s" : ""} offering this skill`}
          </p>
        </div>

        {skills.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-12 text-center border border-zinc-200 dark:border-zinc-700">
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">
              No one has this skill yet. Be the first to offer {skillType}!
            </p>
            <Link
              href="/staffdashboard/main-menu/marketplace/add-skill"
              className="inline-block bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-lg font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              Add This Skill
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                variant="grid"
                onViewDetails={() => {
                  setSelectedSkill(skill);
                  setModalOpen(true);
                }}
              />
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
