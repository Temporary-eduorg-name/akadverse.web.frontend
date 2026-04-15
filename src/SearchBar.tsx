"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCategoriesAndSkills } from "@/hooks/useCategoriesAndSkills";
import { getMarketplaceBase } from "./marketplaceRouteUtils";

interface SearchBarProps {
  onSearchSubmit?: (query: string, category: string) => void;
}

export default function SearchBar({ onSearchSubmit }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredType, setHoveredType] = useState<"categories" | "skills" | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const marketplaceBase = getMarketplaceBase(pathname);
  
  const { categories, skillTypes } = useCategoriesAndSkills();

  // Debounce search - auto-search after 2 seconds of inactivity or when category changes
  useEffect(() => {
    // Don't auto-search if query is empty
    if (!searchQuery.trim()) {
      return;
    }

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer - only search if there's a query
    debounceTimer.current = setTimeout(() => {
      const queryParams = new URLSearchParams();
      queryParams.set("q", searchQuery);
      if (selectedCategory) {
        queryParams.set("category", selectedCategory);
      }
      if (selectedSkill) {
        queryParams.set("skillType", selectedSkill);
      }

      if (onSearchSubmit) {
        onSearchSubmit(searchQuery, selectedCategory);
      } else {
        router.push(`${marketplaceBase}/search?${queryParams.toString()}`);
      }
    }, 2000);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery, selectedCategory, selectedSkill, onSearchSubmit, router]);

  const performSearch = () => {
    const queryParams = new URLSearchParams();
    queryParams.set("q", searchQuery);
    if (selectedCategory) {
      queryParams.set("category", selectedCategory);
    }
    if (selectedSkill) {
      queryParams.set("skillType", selectedSkill);
    }

    if (onSearchSubmit) {
      onSearchSubmit(searchQuery, selectedCategory);
    } else {
      router.push(`${marketplaceBase}/search?${queryParams.toString()}`);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      return;
    }

    // Clear debounce timer and search immediately
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    performSearch();
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedSkill("");
    setShowFilters(false);
    // useEffect will trigger performSearch() automatically
  };

  const handleSkillSelect = (skillName: string) => {
    setSelectedSkill(skillName);
    setSelectedCategory("");
    setShowFilters(false);
    // useEffect will trigger performSearch() automatically
  };

  const handleMouseLeave = () => {
    setShowFilters(false);
    setHoveredType(null);
  };

  return (
    <form onSubmit={handleSearch} className="relative flex w-full items-center gap-2">
      <div className="flex w-full items-center bg-[#f3f6fa] rounded-[12px] border border-[#e6ebf2] transition-shadow">
        <input
          type="text"
          placeholder="Search products, skills, businesses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-2 bg-transparent text-gray-800 placeholder-[#b4bfd0] focus:outline-none w-full min-w-0 max-w-[120px] sm:max-w-[150px] md:max-w-[180px] rounded-l-[12px] text-[15px]"
        />

        {/* Filter Dropdown Button */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="shrink-0 px-3 py-2 text-zinc-600 hover:text-zinc-800 transition-colors border-l border-[#e6ebf2] text-sm whitespace-nowrap rounded-none focus:bg-blue-50"
          title="Filter search"
        >
          {selectedCategory || (selectedSkill && selectedSkill) || "Filter"}
          <span className="ml-1">▼</span>
        </button>

      </div>

      {/* Unified Filter Dropdown */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onMouseLeave={handleMouseLeave}
            className="absolute top-full left-0 mt-2 flex gap-0 bg-white border border-zinc-200 rounded-lg shadow-xl z-50"
          >
            {/* Main Filter Menu */}
            <div className="w-48">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedSkill("");
                  setShowFilters(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-zinc-100 transition-colors border-b border-zinc-200 ${
                  !selectedCategory && !selectedSkill
                    ? "bg-zinc-100 text-zinc-900 font-semibold"
                    : "text-zinc-900"
                }`}
              >
                All
              </button>

              <button
                type="button"
                onMouseEnter={() => setHoveredType("categories")}
                className="w-full text-left px-4 py-3 text-sm hover:bg-zinc-100 transition-colors text-zinc-900 font-medium border-b border-zinc-200"
              >
                Categories →
              </button>

              <button
                type="button"
                onMouseEnter={() => setHoveredType("skills")}
                className="w-full text-left px-4 py-3 text-sm hover:bg-zinc-100 transition-colors text-zinc-900 font-medium"
              >
                Skills →
              </button>
            </div>

            {/* Side Panel */}
            <AnimatePresence mode="wait">
              {hoveredType === "categories" && (
                <motion.div
                  key="categories-panel"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-64 border-l border-zinc-200 max-h-80 overflow-y-auto"
                >
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-zinc-100 transition-colors ${
                        selectedCategory === cat
                          ? "bg-zinc-100 text-zinc-900 font-semibold"
                          : "text-zinc-900"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </motion.div>
              )}

              {hoveredType === "skills" && (
                <motion.div
                  key="skills-panel"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-64 border-l border-zinc-200 max-h-80 overflow-y-auto"
                >
                  {skillTypes.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillSelect(skill)}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-zinc-100 transition-colors ${
                        selectedSkill === skill
                          ? "bg-zinc-100 text-zinc-900 font-semibold"
                          : "text-zinc-900"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
