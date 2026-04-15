"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useCategoriesAndSkills } from "@/hooks/useCategoriesAndSkills";
import { motion } from "framer-motion";
import { Star, Wrench } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname()

  useEffect(() => {
    if (skillTypesFromHook && skillTypesFromHook.length > 0) {
      setSkillTypes(skillTypesFromHook.map((name) => ({ name })));
    }
  }, [skillTypesFromHook]);

  return (
    <div className=" px-4 mb-14 bg-zinc-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Available Skills</h2>
        </div>
        </div>

        {skillTypes.length === 0 ? (
          <div className="text-zinc-600">No skill types available yet.</div>
        ) : (
          <div className="mb-10">
            <Swiper
              modules={[Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
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
                // Mock data for demo
                const seller = ["Lily Garcia", "Chloe Smith", "David Lopez", "Lily Martinez"][index % 4];
                const price = [16000, 67000, 7000, 80000][index % 4];
                const rating = [3.5, 3.8, 4.3, 4.9][index % 4];
                const reviews = [116, 319, 91, 200][index % 4];
                return (
                  <SwiperSlide key={skillType}>
                    <Link
                      href={`${pathname}/browse-skills/${encodeURIComponent(skillType)}`}
                      className="group block h-full"
                    >
                      <motion.div
                        whileHover={{ y: -6, scale: 1.02 }}
                        className="relative flex-none h-[160px] rounded-[24px] overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${colorPair.from} ${colorPair.to} opacity-90 group-hover:opacity-100 transition-opacity`} />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                        <div className="relative h-full p-5 flex flex-col justify-between text-white z-10">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-lg leading-tight line-clamp-2 drop-shadow-md group-hover:text-white transition-colors">{skillType}</h4>
                              <Wrench className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:rotate-12 transition-all shrink-0" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>
            {/* Add spacing for pagination below the slides */}
            <div className="h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
