"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import Link from "next/link";
import LoadingSpinner from "./LoadingSpinner";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Business {
  id: string;
  name: string;
  industry: string;
  description: string;
  location: string;
}

export default function NewBusinessCarousel() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewBusinesses = async () => {
      try {
        const response = await fetch("/api/businesses/new");
        if (response.ok) {
          const data = await response.json();
          setBusinesses(data.businesses || []);
        }
      } catch (error) {
        console.error("Error fetching new businesses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewBusinesses();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-12">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (businesses.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-12 bg-zinc-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8 text-center">
          New Businesses
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
            1024: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
          }}
          className="new-business-carousel"
        >
          {businesses.map((business) => (
            <SwiperSlide key={business.id}>
              <Link
                href={`/business/${business.id}`}
                className="block bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:shadow-xl transition-shadow h-full"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 line-clamp-1">
                    {business.name}
                  </h3>

                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                    {business.industry}
                  </p>

                  <p className="text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-3">
                    {business.description}
                  </p>

                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    📍 {business.location}
                  </p>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
        </div>
      </div>
    </div>
  );
}

