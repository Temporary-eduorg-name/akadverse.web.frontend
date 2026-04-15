import { redirect } from "next/navigation";

export default async function LegacyStaffActiveCollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ collectionId?: string }>;
}) {
  const params = await searchParams;
  const collectionId = params.collectionId;

  redirect(
    collectionId
      ? `/staffdashboard/e-learning/faculty-essentials/academic-records/manage-archive/active-collections?collectionId=${encodeURIComponent(collectionId)}`
      : "/staffdashboard/e-learning/faculty-essentials/academic-records/manage-archive/manage-archive",
  );
}
