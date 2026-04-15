"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MySkillsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new dashboard/skills location
    router.replace("/studashboard/main-menu/marketplace/dashboard/skills");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-zinc-600">Redirecting to Skills Dashboard...</p>
      </div>
    </div>
  );
}
