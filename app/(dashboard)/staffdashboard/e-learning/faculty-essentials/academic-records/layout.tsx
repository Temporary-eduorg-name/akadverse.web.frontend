import StaffDashboardShell from "@/app/components/dashboard/staff/StaffDashboardShell";

export default function AcademicRecordsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StaffDashboardShell contentClassName="bg-[#f3f4f6] px-4 py-6 text-[#1f2937] sm:px-6 lg:px-8">
      {children}
    </StaffDashboardShell>
  );
}
