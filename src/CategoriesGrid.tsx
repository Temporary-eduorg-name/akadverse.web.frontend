"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkle, Zap, Tag, Wrench } from "lucide-react";

interface Category {
  name: string;
}

export default function CategoriesGrid() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/marketplace/categories");
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

  // Demo icon assignment (cycle through icons)
  const icons = [Sparkle, Zap, Tag, Wrench];
  return (
    <div className="py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Browse Categories</h2>
        </div>
        {categories.length === 0 ? (
          <p className="text-slate-600">No categories available yet.</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x -mx-2">
            {categories.map((category, i) => {
              const Icon = icons[i % icons.length];
              return (
                <Link
                  key={category.name}
                  href={`/category/${encodeURIComponent(category.name)}`}
                  className="group relative flex-none w-[200px] h-[140px] rounded-3xl p-5 border border-slate-200/60 overflow-hidden text-left bg-white shadow-sm hover:shadow-xl transition-all duration-300"
                  style={{ minWidth: 200, maxWidth: 200 }}
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500 bg-indigo-100" />
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm bg-indigo-100 text-indigo-600 mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 text-lg truncate">{category.name}</h3>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

