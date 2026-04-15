import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import StaffDashboardShell from "@/app/components/dashboard/staff/StaffDashboardShell";
import FacultyCourseWorkspaceShell from "./FacultyCourseWorkspaceShell";
import { getSharedCourseWorkspaceBase } from "@/app/lib/sharedCourseWorkspace";

export default async function FacultyCourseLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const course = getSharedCourseWorkspaceBase(courseSlug);

  if (!course) {
    notFound();
  }

  return (
    <StaffDashboardShell contentClassName="bg-[#F8F6F6] p-0">
      <FacultyCourseWorkspaceShell course={course} courseSlug={courseSlug}>
        {children}
      </FacultyCourseWorkspaceShell>
    </StaffDashboardShell>
  );
}
