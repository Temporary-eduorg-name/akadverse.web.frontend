"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Category {
  name: string;
}

export default function CategoriesGrid() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="py-12 px-4">
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
          <p className="text-zinc-600 dark:text-zinc-400">No categories available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/category/${encodeURIComponent(category.name)}`}
                className="group relative bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 hover:shadow-xl hover:border-zinc-400 dark:hover:border-zinc-500 transition-all overflow-hidden"
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

                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Explore businesses & products
                  </p>

                  <div className="mt-4 inline-flex items-center text-zinc-900 dark:text-white font-semibold text-sm group-hover:translate-x-1 transition-transform">
                    Browse Category →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
