import LearningDashboardLayout from "../learning-dashboard/layout";

export default function AcademicRecordsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LearningDashboardLayout>{children}</LearningDashboardLayout>;
}
