"use client";

import { useState } from "react";

interface SkillCardProps {
  skill: {
    id: string;
    name: string;
    description: string;
    displayName: string;
    yearsOfExperience: number;
    expertiseLevel: string;
    startingPrice: number;
    profilePicture?: string;
    visitors?: number;
    serviceDays?: string;
    user?: {
      firstName: string;
      lastName: string;
    };
    _count?: {
      reviews: number;
    };
  };
  onViewDetails?: () => void;
  variant?: "grid" | "carousel"; // "grid" = browse page, "carousel" = home page style
}

export default function SkillCard({ skill, onViewDetails, variant = "grid" }: SkillCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  console.log(skill)
  // Determine display name
  const displayName = skill.user 
    ? `${skill.user.firstName} ${skill.user.lastName}`
    : skill.displayName;

  if (variant === "carousel") {
    return (
      <div
        className="relative bg-zinc-50 dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:shadow-xl transition-shadow cursor-pointer h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Profile Picture */}
        <div className="relative">
          {skill.profilePicture ? (
            <img
              src={skill.profilePicture}
              alt={skill.name}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-blue-200 to-purple-300 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {skill.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Expertise Badge */}
          <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
            {skill.expertiseLevel.charAt(0).toUpperCase() +
              skill.expertiseLevel.slice(1)}
          </div>

          {/* View Details Overlay */}
          {isHovered && onViewDetails && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails();
                }}
                className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-6 py-2 rounded-lg font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                View Details
              </button>
            </div>
          )}
        </div>

        {/* Skill Details */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1 line-clamp-1">
            {skill.name}
          </h3>

          <p className="text-sm text-blue-600 dark:text-blue-400 mb-2 font-medium">
            by {skill.displayName}
          </p>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
            {skill.description}
          </p>

          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Experience
              </p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                {skill.yearsOfExperience}+ years
              </p>
            </div>
            {skill.visitors !== undefined && (
              <div className="text-right">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Views
                </p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {skill.visitors}
                </p>
              </div>
            )}
          </div>

          {skill.serviceDays && (
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                Availability: <span className="text-zinc-700 dark:text-zinc-300">{skill.serviceDays}</span>
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {skill._count?.reviews || 0} reviews
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default grid variant (browse page style)
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:shadow-xl transition-shadow">
      {/* Profile Picture */}
      <div className="relative">
        {skill.profilePicture ? (
          <img
            src={skill.profilePicture}
            alt={skill.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-200 to-purple-300 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
            <span className="text-4xl font-bold text-white">
              {skill.displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Expertise Badge */}
        <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
          {skill.expertiseLevel.charAt(0).toUpperCase() +
            skill.expertiseLevel.slice(1)}
        </div>
      </div>

      {/* Skill Details */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
          {skill.name}
        </h3>

        <p className="text-sm text-blue-600 dark:text-blue-400 mb-3 font-medium">
          by {displayName}
        </p>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
          {skill.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-zinc-200 dark:border-zinc-700">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Experience
            </p>
            <p className="text-lg font-bold text-zinc-900 dark:text-white">
              {skill.yearsOfExperience}+ yrs
            </p>
          </div>
          {skill._count && (
            <div className="text-right">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Reviews
              </p>
              <p className="text-lg font-bold text-zinc-900 dark:text-white">
                {skill._count.reviews}
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        {onViewDetails ? (
          <button
            onClick={onViewDetails}
            className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-center px-4 py-2 rounded-lg font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            View Details
          </button>
        ) : (
          <a
            href={`/dashboard/skills/${skill.id}`}
            className="block w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-center px-4 py-2 rounded-lg font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            View Profile
          </a>
        )}
      </div>
    </div>
  );
}
