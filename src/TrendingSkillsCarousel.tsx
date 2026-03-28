"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import LoadingSpinner from "./LoadingSpinner";
import SkillDetailModal from "./SkillDetailModal";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

interface Skill {
  id: string;
  name: string;
  description: string;
  displayName: string;
  yearsOfExperience: number;
  expertiseLevel: string;
  startingPrice: number;
  profilePicture?: string;
  visitors: number;
  serviceDays: string;
  serviceTimes: string;
  achievements?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  createdAt?: string;
  userId: string;
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

export default function TrendingSkillsCarousel() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch("/api/marketplace/skills?type=trending&limit=10");
        if (response.ok) {
          const data = await response.json();
          setSkills(data.skills || []);
        }
      } catch (error) {
        console.error("Error fetching trending skills:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-12">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (skills.length === 0) {
    return null;
  }

  return (
    <>
      {selectedSkill && (
        <SkillDetailModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          skill={selectedSkill}
        />
      )}

      <div className="w-full py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Trending Skills</h2>
            </div>
          </div>

          <div className="relative">
            <Swiper
              modules={[Autoplay]}
              spaceBetween={16}
              slidesPerView={1}
              loop
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              speed={500}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              className="skill-carousel"
            >
              {skills.map((skill) => (
                <SwiperSlide key={skill.id}>
                  <div
                    className="group flex flex-col w-[260px] bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
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
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-200 to-red-300">
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
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </>
  );
}

