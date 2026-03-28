"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkle, Zap, Tag, Wrench, ChevronRight, Shirt } from "lucide-react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useCategoriesAndSkills } from "@/hooks/useCategoriesAndSkills";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { usePathname } from "next/navigation";

interface Category {
  name: string;
}

export default function CategoriesCarousel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const pathname = usePathname()
  const { categories: categoriesFromHook } = useCategoriesAndSkills();

  useEffect(() => {
    if (categoriesFromHook && categoriesFromHook.length > 0) {
      setCategories(categoriesFromHook.map((name) => ({ name })));
    }
  }, [categoriesFromHook]);
  useEffect(() => { console.log(hoveredIndex) }, [hoveredIndex])


  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">elmarvel
        <div className="mb-6">
          {/* <h2 className="text-xl font-bold text-slate-900 mb-2">Browse Categories</h2> */}
        </div>

        {categories.length === 0 ? (
          <div className="text-zinc-600">No categories available yet.</div>
        ) : (
          <div className="mb-10 md:flex md:h-50 md:items-center">
            <Swiper
              modules={[Autoplay]}
              spaceBetween={32}
              slidesPerView={1}
              autoplay={{ delay: 2500, disableOnInteraction: false }}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              className="categories-carousel pb-20"
            >
              {categories.map((category, i) => {
                // Map category name to icon/color
                let Icon = Sparkle, bg = "bg-rose-100", color = "text-rose-500", blob = "bg-rose-100/60";
                if (/electronic/i.test(category.name)) {
                  Icon = Zap; bg = "bg-blue-100"; color = "text-blue-500"; blob = "bg-blue-100/60";
                } else if (/food/i.test(category.name)) {
                  Icon = Tag; bg = "bg-amber-100"; color = "text-amber-500"; blob = "bg-amber-100/60";
                } else if (/service/i.test(category.name)) {
                  Icon = Wrench; bg = "bg-emerald-100"; color = "text-emerald-500"; blob = "bg-emerald-100/60";
                } else if (/cloth|wear|fashion/i.test(category.name)) {
                  Icon = Shirt; bg = "bg-purple-100"; color = "text-purple-500"; blob = "bg-purple-100/60";
                }
                const isHovered = hoveredIndex === i;
                return (
                  <SwiperSlide key={category.name}>
                    <Link
                      href={`${pathname}/category/${encodeURIComponent(category.name)}`}
                      className={
                        `group relative flex flex-col w-[200px] h-[140px] rounded-[32px] border border-slate-100 bg-white transition-all duration-200 ease-out overflow-hidden px-6 py-5 ` +
                        (isHovered
                          ? "shadow-[0_6px_14px_rgba(16,24,40,0.10)] scale-105"
                          : "shadow-[0_2px_8px_rgba(16,24,40,0.07)] scale-100")
                      }
                      style={{ minWidth: 200, maxWidth: 200 }}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Soft pastel background blob - pointer-events-none so it doesn't block hover */}
                      <div
                        className={`pointer-events-none absolute left-1/2 bottom-1/2 w-32 h-32 rounded-full ${blob} opacity-60 transition-transform duration-200 ease-out ${isHovered ? "scale-110" : ""}`}
                      />
                      {/* Icon */}
                      <motion.div
                        animate={isHovered ? { scale: 1.12, rotate: 8 } : { scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 12, mass: 0.5 }}
                        className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-sm ${bg} transition-all duration-200 ease-out`}
                      >
                        <Icon className={`w-6 h-6 ${color}`} />
                      </motion.div>
                      {/* Text */}
                      <div className="relative z-10 flex justify-between items-center w-full transition-all duration-200 ease-out">
                        <h3 className="font-semibold text-slate-800 text-base mb-1 text-center truncate">{category.name}</h3>
                        <ChevronRight className={`w-5 h-5 transition-all duration-200 ease-out ${isHovered ? "text-slate-500 translate-x-1" : "text-slate-300"}`} />
                      </div>
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
