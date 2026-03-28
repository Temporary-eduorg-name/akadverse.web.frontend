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
  image?: string;
  rating?: number;
  reviews?: number;
}

export default function TrendingBusinessCarousel() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBusiness, setHoveredBusiness] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingBusinesses = async () => {
      try {
        const response = await fetch("/api/marketplace/businesses/trending");
        if (response.ok) {
          const data = await response.json();
          setBusinesses(data.businesses || []);
        }
      } catch (error) {
        console.error("Error fetching trending businesses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrendingBusinesses();
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
    <div className="w-full py-8 bg-[#f7fafd]">
      <div className="max-w-7xl mx-auto px-4">
      <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Trending Businesses</h2>
            </div>
          </div>
        <div className="relative">
          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={20}
            slidesPerView={1}
            navigation
            loop
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              reverseDirection: true,
            }}
            speed={500}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            className="trending-business-carousel"
          >
            {businesses.map((business, idx) => (
              <SwiperSlide key={business.id} className="!w-[260px] mx-2">
                <div
                  className="flex w-[240px] p-4 gap-4 bg-white rounded-2xl border border-zinc-100 shadow group hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredBusiness(business.id)}
                  onMouseLeave={() => setHoveredBusiness(null)}
                >
                  {/* Business Image with Fallback */}
                  <div className="flex items-center justify-center">
                    {business.image ? (
                      <img
                        src={business.image}
                        alt={business.name}
                        className="w-16 h-16 object-cover rounded-xl border border-zinc-200 bg-zinc-50"
                      />
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-200 to-zinc-300">
                        <span className="text-zinc-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  {/* Business Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 truncate mb-1 text-base" title={business.name}>{business.name}</h4>
                      <p className="text-xs text-slate-500 font-medium truncate">{business.industry}</p>
                    </div>
                    {/* Star rating and reviews (static for demo) */}
                    {/* <div className="flex items-center gap-1">
                      <span className="text-amber-400 text-base">★</span>
                      <span className="text-sm font-semibold text-zinc-800">{business.rating ?? (4.5 + (idx % 3) * 0.1).toFixed(1)}</span>
                      <span className="text-xs text-zinc-500 ml-1">({business.reviews ?? (200 + idx * 37)})</span>
                    </div> */}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}

