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
    <div className="flex-1 bg-zinc-50 dark:bg-black">
      {/* Hero Section */}
      <div className="flex items-center justify-center px-4 py-12">
        <main className="w-full max-w-2xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-6">
            Welcome to Student Marketplace
          </h1>
          
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
            Connect with other students, offer your services, and find the skills you need.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                Offer Services
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Sell your skills and services to other students in your community.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                Find Help
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Discover services offered by fellow students and get the help you need.
              </p>
            </div>
          </div>

          {!isLoading && !isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-lg font-medium hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white px-6 py-3 rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </main>
      </div>

      {/* Categories Section */}
      <CategoriesCarousel />

      {/* Skills Grid Carousel Section */}
      <SkillsCarousel />

      {/* Product Carousel Section */}
      <ProductCarousel />
      <TrendingProductsCarousel />
            
      {/* Skills Carousel Section */}
      <NewSkillsCarousel />
      <TrendingSkillsCarousel />
      
      {/* Business Carousel Section */}
      <NewBusinessCarousel />
      <TrendingBusinessCarousel />

    </div>
  );
}
