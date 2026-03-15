"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useCategoriesAndSkills } from "@/hooks/useCategoriesAndSkills";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Category {
  name: string;
}

export default function CategoriesCarousel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const { categories: categoriesFromHook } = useCategoriesAndSkills();

  useEffect(() => {
    if (categoriesFromHook && categoriesFromHook.length > 0) {
      setCategories(categoriesFromHook.map((name) => ({ name })));
    }
  }, [categoriesFromHook]);

  return (
    <div className="py-12 px-4 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Browse by Category
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Explore businesses and products in different categories
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-zinc-600 dark:text-zinc-400">No categories available yet.</div>
        ) : (

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          className="categories-carousel"
        >
          {categories.map((category) => (
            <SwiperSlide key={category.name}>
              <Link
                href={`/category/${encodeURIComponent(category.name)}`}
                className="group block bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 hover:shadow-xl hover:border-zinc-400 dark:hover:border-zinc-500 transition-all h-full"
              >
                <div className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-4 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6 text-zinc-600 dark:text-zinc-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 line-clamp-2">
                    {category.name}
                  </h3>

                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    Explore businesses & products
                  </p>

                  <div className="inline-flex items-center text-zinc-900 dark:text-white font-semibold text-sm group-hover:translate-x-1 transition-transform">
                    Browse Category →
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
        )}
      </div>
    </div>
  );
}
