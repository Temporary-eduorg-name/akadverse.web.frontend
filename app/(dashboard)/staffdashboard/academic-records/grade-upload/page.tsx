import { redirect } from "next/navigation";

export default function LegacyGradeUploadPage() {
  redirect(
    "/staffdashboard/e-learning/faculty-essentials/academic-records/grade-upload",
  );
}
