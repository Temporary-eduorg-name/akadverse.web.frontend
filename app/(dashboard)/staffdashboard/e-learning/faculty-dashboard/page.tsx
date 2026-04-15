"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getFacultyLandingPath } from "@/app/lib/useSharedCourseWorkspace";

export default function FacultyDashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getFacultyLandingPath());
  }, [router]);

  return null;
}
