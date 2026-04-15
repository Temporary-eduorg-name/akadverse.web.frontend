import { redirect } from "next/navigation";

export default function CourseRegistrationRouteRedirect() {
  redirect("/studashboard/e-learning/course-control?tab=course-registration");
}
