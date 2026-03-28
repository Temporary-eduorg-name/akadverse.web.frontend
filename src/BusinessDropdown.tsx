"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMarketplaceBase } from "./marketplaceRouteUtils";

interface BusinessDropdownProps {
  hasActivity?: boolean;
}

export default function BusinessDropdown({ hasActivity = false }: BusinessDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const marketplaceBase = getMarketplaceBase(pathname);

  const handleClick = () => {
    
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      router.push(`${marketplaceBase}/dashboard`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="relative text-zinc-700 hover:text-zinc-900 transition-colors"
    >
      My Businesses
      {hasActivity && (
        <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-red-500" />
      )}
    </button>
  );
}
