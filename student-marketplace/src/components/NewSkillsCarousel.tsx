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

export default function NewSkillsCarousel() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch("/api/skills?type=new&limit=10");
        if (response.ok) {
          const data = await response.json();
          setSkills(data.skills || []);
        }
      } catch (error) {
        console.error("Error fetching new skills:", error);
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

      <div className="w-full py-12 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8 text-center">
            New Skills
          </h2>

          <div className="relative">
            <Swiper
              modules={[Autoplay, Navigation]}
              spaceBetween={20}
              slidesPerView={1}
              navigation={true}
              autoplay={{
                delay: 0,
                disableOnInteraction: false,
              }}
              speed={5000}
              loop={true}
              allowTouchMove={true}
              freeMode
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 24,
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 30,
                },
              }}
              className="skill-carousel"
            >
              {skills.map((skill) => (
                <SwiperSlide key={skill.id}>
                  <div
                    className="relative bg-zinc-50 dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:shadow-xl transition-shadow cursor-pointer h-full"
                    onMouseEnter={() => setHoveredSkill(skill.id)}
                    onMouseLeave={() => setHoveredSkill(null)}
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
                        {skill.expertiseLevel.charAt(0).toUpperCase() + skill.expertiseLevel.slice(1)}
                      </div>

                      {/* View Details Overlay */}
                      {hoveredSkill === skill.id && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSkill(skill);
                              setModalOpen(true);
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
                        <div className="text-right">
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Views
                          </p>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                            {skill.visitors}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                          Availability: <span className="text-zinc-700 dark:text-zinc-300">{skill.serviceDays}</span>
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {skill._count.reviews} reviews
                        </p>
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
