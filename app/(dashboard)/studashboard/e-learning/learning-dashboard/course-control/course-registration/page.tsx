import { redirect } from "next/navigation";

export default function CourseRegistrationRedirect() {
  redirect("/studashboard/e-learning/course-control?tab=course-registration");
}
