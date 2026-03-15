"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { getMarketplaceBase } from "./marketplaceRouteUtils";

export default function SkillsDropdown() {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, user } = useAuth();
    const [hasSkillActivity, setHasSkillActivity] = useState(false);
    const eventSourceRef = useRef<EventSource | null>(null);
    const marketplaceBase = getMarketplaceBase(pathname);

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        try {
            const eventSource = new EventSource("/api/marketplace/realtime/events?scope=skill_owner");
            eventSourceRef.current = eventSource;

            eventSource.addEventListener("update", (event) => {
                const data = JSON.parse((event as MessageEvent).data);
                setHasSkillActivity(data.unreadNotifications > 0);
            });

            eventSource.addEventListener("error", () => {
                console.error("Real-time notification listener disconnected");
                eventSource.close();
                eventSourceRef.current = null;
            });
        } catch (error) {
            console.error("Failed to setup real-time listener:", error);
        }

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, [isAuthenticated, user]);

    const handleClick = () => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        router.push(`${marketplaceBase}/dashboard/skills`);
        
        // Mark notifications as read when visiting dashboard
        fetch("/api/marketplace/skills/notifications", {
            method: "PATCH",
            credentials: "include",
        }).catch((error) => console.error("Failed to mark notifications as read:", error));
    };

    return (
        <button
            onClick={handleClick}
            className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors relative"
        >
            My Skills
            {hasSkillActivity && (
                <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
        </button>
    );
}

