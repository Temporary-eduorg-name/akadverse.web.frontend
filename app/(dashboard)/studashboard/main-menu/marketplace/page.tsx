"use client";

import Link from "next/link";
import ProductCarousel from "@/components/ProductCarousel";
import TrendingProductsCarousel from "@/components/TrendingProductsCarousel";
import NewBusinessCarousel from "@/components/NewBusinessCarousel";
import TrendingBusinessCarousel from "@/components/TrendingBusinessCarousel";
import NewSkillsCarousel from "@/components/NewSkillsCarousel";
import TrendingSkillsCarousel from "@/components/TrendingSkillsCarousel";
import CategoriesCarousel from "@/components/CategoriesCarousel";
import SkillsCarousel from "@/components/SkillsCarousel";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans w-full">


      {/* Categories Section */}
      <section className="w-full">
        <CategoriesCarousel />
        <SkillsCarousel />
        <ProductCarousel />
        <TrendingProductsCarousel />
        <NewSkillsCarousel />
        <TrendingSkillsCarousel />
        <NewBusinessCarousel />
        <TrendingBusinessCarousel />
      </section>
    </div>
  );
}
