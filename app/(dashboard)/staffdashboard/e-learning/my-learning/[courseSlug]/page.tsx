import { redirect } from "next/navigation";

export default async function FacultyCourseIndexPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;

  redirect(
    `/staffdashboard/e-learning/my-learning/${courseSlug}/course-overview`,
  );
}
