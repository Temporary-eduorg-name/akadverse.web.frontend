"use client";

import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Info, PencilLine, Save } from "lucide-react";
import { useParams } from "next/navigation";
import { useSharedCourseWorkspace } from "@/app/lib/useSharedCourseWorkspace";

export default function FacultyCourseOverviewPage() {
  const params = useParams<{ courseSlug: string }>();
  const { course, isSharedCourse, updateCourse } = useSharedCourseWorkspace(
    params?.courseSlug ?? "",
  );
  const [isEditing, setIsEditing] = useState(false);

  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [objectivesDraft, setObjectivesDraft] = useState("");

  const courseData = useMemo(() => course, [course]);

  if (!isSharedCourse || !courseData) {
    return null;
  }

  const startEditing = () => {
    setDescriptionDraft(courseData.overview.description.join("\n\n"));
    setObjectivesDraft(courseData.overview.objectives.join("\n"));
    setIsEditing(true);
  };

  const saveChanges = () => {
    updateCourse((current) => ({
      ...current,
      overview: {
        ...current.overview,
        description: descriptionDraft
          .split(/\n{2,}/)
          .map((item) => item.trim())
          .filter(Boolean),
        objectives: objectivesDraft
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      },
    }));
    setIsEditing(false);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_360px]">
      <section className="rounded-[28px] border border-[#e4ebf4] bg-white p-6 shadow-[0_22px_48px_rgba(16,24,40,0.05)] sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <BookOpen className="mt-1 h-6 w-6 text-[#2f59db]" />
            <div>
              <h2 className="text-2xl font-bold text-[#1d2746]">
                Course Description
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Updates here are mirrored into the student course overview.
              </p>
            </div>
          </div>

          {isEditing ? (
            <button
              type="button"
              onClick={saveChanges}
              className="inline-flex items-center gap-2 rounded-full bg-[#2f59db] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2449b5]"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
          ) : (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center gap-2 rounded-full border border-[#dbe4f0] px-4 py-2 text-sm font-semibold text-[#1d2746] transition hover:border-[#2f59db] hover:text-[#2f59db]"
            >
              <PencilLine className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <textarea
            value={descriptionDraft}
            onChange={(event) => setDescriptionDraft(event.target.value)}
            rows={10}
            className="w-full rounded-3xl border border-[#dbe4f0] bg-[#fbfcff] px-5 py-4 text-sm leading-7 text-slate-700 outline-none transition focus:border-[#2f59db]"
          />
        ) : (
          <div className="space-y-4 text-base leading-8 text-slate-600">
            {courseData.overview.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        )}
      </section>

      <aside className="space-y-4 xl:row-span-2">
        <div className="rounded-[28px] border border-[#e4ebf4] bg-[#f9fbff] p-6 shadow-[0_22px_48px_rgba(16,24,40,0.05)]">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-[#2f59db]" />
            <h3 className="text-lg font-bold text-[#1d2746]">
              Key Information
            </h3>
          </div>
          <div className="mt-5 space-y-4">
            {courseData.overview.keyDetails.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-[#e5ebf5] bg-white px-4 py-3"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-1 text-base font-semibold text-[#1d2746]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <section className="rounded-[28px] border border-[#e4ebf4] bg-white p-6 shadow-[0_22px_48px_rgba(16,24,40,0.05)] sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 h-6 w-6 text-[#2f59db]" />
            <div>
              <h2 className="text-2xl font-bold text-[#1d2746]">
                Course Objectives
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                One objective per line.
              </p>
            </div>
          </div>
        </div>

        {isEditing ? (
          <textarea
            value={objectivesDraft}
            onChange={(event) => setObjectivesDraft(event.target.value)}
            rows={8}
            className="w-full rounded-3xl border border-[#dbe4f0] bg-[#fbfcff] px-5 py-4 text-sm leading-7 text-slate-700 outline-none transition focus:border-[#2f59db]"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {courseData.overview.objectives.map((objective) => (
              <div
                key={objective}
                className="rounded-2xl border border-[#dbe7ff] bg-[#f7faff] p-5"
              >
                <p className="text-sm leading-7 text-slate-600">
                  {objective}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
