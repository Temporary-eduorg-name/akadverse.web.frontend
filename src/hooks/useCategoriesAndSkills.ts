import { useEffect, useState } from "react";

interface CacheData {
  categories: string[];
  skillTypes: string[];
  timestamp: number;
}

// Browser-level cache (shared across all instances)
const CACHE_KEY = "categoriesAndSkills";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useCategoriesAndSkills() {
  const [categories, setCategories] = useState<string[]>([]);
  const [skillTypes, setSkillTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if we have cached data
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const data: CacheData = JSON.parse(cached);
          // If cache is still valid, use it
          if (Date.now() - data.timestamp < CACHE_DURATION) {
            setCategories(data.categories);
            setSkillTypes(data.skillTypes);
            setLoading(false);
            return;
          }
        }

        // Fetch both in parallel
        const [categoriesRes, skillTypesRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/skill-types"),
        ]);

        if (!categoriesRes.ok || !skillTypesRes.ok) {
          throw new Error("Failed to fetch categories or skill types");
        }

        const categoriesData = await categoriesRes.json();
        const skillTypesData = await skillTypesRes.json();

        const cats = (categoriesData.categories || []).map(
          (item: { name: string }) => item.name
        );
        const skills = (skillTypesData.skillTypes || []).map(
          (item: { name: string }) => item.name
        );

        setCategories(cats);
        setSkillTypes(skills);

        // Cache the data
        const cacheData: CacheData = {
          categories: cats,
          skillTypes: skills,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { categories, skillTypes, loading, error };
}
