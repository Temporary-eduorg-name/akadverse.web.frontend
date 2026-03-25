import { redirect } from "next/navigation";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;

  redirect(
    `/studashboard/e-learning/my-learning/${courseSlug}/course-overview`,
  );
}
