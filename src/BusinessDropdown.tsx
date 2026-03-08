"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface BusinessDropdownProps {
  hasActivity?: boolean;
}

export default function BusinessDropdown({ hasActivity = false }: BusinessDropdownProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleClick = () => {
    
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="relative text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
    >
      My Businesses
      {hasActivity && (
        <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-red-500" />
      )}
    </button>
  );
}
