import { redirect } from "next/navigation";

export default async function LegacyCollectionDetailPage({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  const { collectionId } = await params;

  redirect(
    `/staffdashboard/e-learning/faculty-essentials/academic-records/manage-archive/${collectionId}`,
  );
}
