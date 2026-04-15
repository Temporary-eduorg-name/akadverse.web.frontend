"use client";

import { useState } from "react";
import { PencilLine, Save, Shield } from "lucide-react";
import { useParams } from "next/navigation";
import {
  SHARED_COMPETENCY_ICON_MAP,
  SHARED_OUTCOME_ICON_MAP,
} from "@/app/lib/sharedCourseWorkspace";
import { useSharedCourseWorkspace } from "@/app/lib/useSharedCourseWorkspace";

export default function FacultyLearningOutcomePage() {
  const params = useParams<{ courseSlug: string }>();
  const { course, isSharedCourse, updateCourse } = useSharedCourseWorkspace(
    params?.courseSlug ?? "",
  );
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");

  if (!isSharedCourse || !course) {
    return null;
  }

  const startEditing = () => {
    setDraft(
      course.learningOutcomes
        .map(
          (outcome) =>
            `${outcome.title}\n${outcome.description}\n${outcome.metric}`,
        )
        .join("\n\n---\n\n"),
    );
    setIsEditing(true);
  };

  const saveChanges = () => {
    const nextOutcomes = draft
      .split("\n\n---\n\n")
      .map((block, index) => {
        const [title = "", description = "", metric = ""] = block
          .split("\n")
          .map((line) => line.trim());
        const current = course.learningOutcomes[index];

        return current
          ? {
              ...current,
              title: title || current.title,
              description: description || current.description,
              metric: metric || current.metric,
            }
          : null;
      })
      .filter(Boolean);

    updateCourse((current) => ({
      ...current,
      learningOutcomes: nextOutcomes.length
        ? (nextOutcomes as typeof current.learningOutcomes)
        : current.learningOutcomes,
    }));
    setIsEditing(false);
  };

  return (
    <div className="space-y-10 pt-4">
      <section>
        <div className="mb-7 flex items-start justify-between gap-3">
          <div>
            <h2 className="mb-2 text-[32px] font-black leading-[1.1] tracking-[-0.02em] text-[#0f172a] sm:text-[36px]">
              Learning Outcome
            </h2>
            <p className="text-[15px] leading-6 text-[#52637f]">
              What students will achieve by the end of this course.
            </p>
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
              className="inline-flex items-center gap-2 rounded-full border border-[#dbe4f0] bg-white px-4 py-2 text-sm font-semibold text-[#1d2746] transition hover:border-[#2f59db] hover:text-[#2f59db]"
            >
              <PencilLine className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={16}
            className="w-full rounded-3xl border border-[#dbe4f0] bg-[#fbfcff] px-5 py-4 text-sm leading-7 text-slate-700 outline-none transition focus:border-[#2f59db]"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {course.learningOutcomes.map((outcome) => {
              const Icon = SHARED_OUTCOME_ICON_MAP[outcome.icon];

              return (
                <article
                  key={outcome.title}
                  className="flex min-h-[122px] gap-4 rounded-[14px] border border-[#d8deea] bg-white px-4 py-4"
                >
                  <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[#2143b6] text-white">
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className="mb-1 text-[18px] font-extrabold leading-6 text-[#121927]">
                      {outcome.title}
                    </h3>
                    <p className="text-[14px] leading-[1.45] text-[#4d5d78]">
                      {outcome.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-6 flex items-center gap-2">
          <Shield className="h-6 w-6 text-[#2143b6]" strokeWidth={2.1} />
          <h2 className="text-[30px] font-black leading-none tracking-[-0.02em] text-[#0f172a] sm:text-[34px]">
            Key Competencies
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {course.competencies.map((competency) => {
            const Icon = SHARED_COMPETENCY_ICON_MAP[competency.icon];

            return (
              <article
                key={competency.name}
                className="flex min-h-[116px] flex-col items-center justify-center rounded-[12px] border border-[#d9dfeb] bg-white px-4 py-4 text-center"
              >
                <Icon
                  className="mb-3 h-6 w-6 text-[#2f52c6]"
                  strokeWidth={2.1}
                />
                <p className="text-[15px] font-semibold text-[#0f172a]">
                  {competency.name}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
