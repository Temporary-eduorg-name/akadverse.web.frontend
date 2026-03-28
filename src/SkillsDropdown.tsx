"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { getMarketplaceBase } from "./marketplaceRouteUtils";
import { useMarketplaceActivity } from "./context/MarketplaceActivityContext";

export default function SkillsDropdown() {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, user } = useAuth();
    const [hasSkillActivity, setHasSkillActivity] = useState(false);
    const { setScope, registerOnUpdate, skillOwnerActivity } = useMarketplaceActivity();

    useEffect(() => {
        if (!isAuthenticated || !user) return;
        setScope("skill_owner");
        const unregister = registerOnUpdate(() => {
            setHasSkillActivity(skillOwnerActivity.hasSkillUpdates);
        });
        return unregister;
    }, [isAuthenticated, user, setScope, registerOnUpdate, skillOwnerActivity.hasSkillUpdates]);

    const handleClick = () => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        router.push(`${getMarketplaceBase}/dashboard/skills`);
        
        // Mark notifications as read when visiting dashboard
        fetch("/api/marketplace/skills/notifications", {
            method: "PATCH",
            credentials: "include",
        }).catch((error) => console.error("Failed to mark notifications as read:", error));
    };

    return (
        <button
            onClick={handleClick}
            className="text-zinc-700 hover:text-zinc-900 transition-colors relative"
        >
            My Skills
            {hasSkillActivity && (
                <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
        </button>
    );
}

