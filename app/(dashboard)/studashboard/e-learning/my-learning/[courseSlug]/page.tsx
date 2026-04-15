import { redirect } from "next/navigation";

export default async function CoursePage({
  params,
}: {
  params: { courseSlug: string };
}) {
  const { courseSlug } = params;

  redirect(
    `/studashboard/e-learning/my-learning/${courseSlug}/course-overview`,
  );
}
