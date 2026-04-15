"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useCategoriesAndSkills } from "@/hooks/useCategoriesAndSkills";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface SkillType {
  name: string;
}

const SKILL_COLORS = [
  { from: "from-blue-400", to: "to-blue-600" },
  { from: "from-purple-400", to: "to-purple-600" },
  { from: "from-pink-400", to: "to-pink-600" },
  { from: "from-red-400", to: "to-red-600" },
  { from: "from-orange-400", to: "to-orange-600" },
  { from: "from-yellow-400", to: "to-yellow-600" },
  { from: "from-green-400", to: "to-green-600" },
  { from: "from-cyan-400", to: "to-cyan-600" },
  { from: "from-indigo-400", to: "to-indigo-600" },
  { from: "from-teal-400", to: "to-teal-600" },
  { from: "from-violet-400", to: "to-violet-600" },
];

export default function SkillsCarousel() {
  const [skillTypes, setSkillTypes] = useState<SkillType[]>([]);
  const { skillTypes: skillTypesFromHook } = useCategoriesAndSkills();

  useEffect(() => {
    if (skillTypesFromHook && skillTypesFromHook.length > 0) {
      setSkillTypes(skillTypesFromHook.map((name) => ({ name })));
    }
  }, [skillTypesFromHook]);

  return (
    <div className="py-12 px-4 bg-zinc-50 dark:bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Available Skills
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Browse and discover skilled students across various expertise areas
          </p>
        </div>

        {skillTypes.length === 0 ? (
          <div className="text-zinc-600 dark:text-zinc-400">No skill types available yet.</div>
        ) : (

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          className="skills-carousel"
        >
          {skillTypes.map((skillTypeItem, index) => {
            const skillType = skillTypeItem.name;
            const colorPair = SKILL_COLORS[index % SKILL_COLORS.length];
            return (
              <SwiperSlide key={skillType}>
                <Link
                  href={`/browse-skills/${encodeURIComponent(skillType)}`}
                  className="group block bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 hover:shadow-xl hover:border-zinc-400 dark:hover:border-zinc-500 transition-all overflow-hidden h-full"
                >
                  {/* Gradient Background */}
                  <div
                    className={`relative h-48 bg-gradient-to-br ${colorPair.from} ${colorPair.to} flex items-center justify-center group-hover:scale-105 transition-transform`}
                  >
                    <span className="text-5xl font-bold text-white opacity-20">
                      {skillType.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Skill Details */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3 line-clamp-2">
                      {skillType}
                    </h3>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
        )}
      </div>
    </div>
  );
}
