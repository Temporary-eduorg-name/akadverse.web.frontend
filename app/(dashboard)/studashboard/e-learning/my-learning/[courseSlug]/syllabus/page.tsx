"use client";

import { CalendarDays } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { getCourseLearningContent } from "../learningData";
import { useSharedCourseWorkspace } from "@/app/lib/useSharedCourseWorkspace";

export default function SyllabusPage() {
  const params = useParams<{ courseSlug: string }>();
  const router = useRouter();
  const courseSlug = params?.courseSlug ?? "software-engineering";
  const { course, isSharedCourse } = useSharedCourseWorkspace(courseSlug);
  const modules =
    isSharedCourse && course
      ? course.modules
      : getCourseLearningContent(courseSlug).modules;

  return (
    <div className="space-y-12 pt-3">
      {modules.map((module) => (
        <section
          key={module.id}
          className="rounded-[26px] border border-[#d7deeb] bg-[#f7f9fc] px-4 py-6 md:px-6"
        >
          <h2 className="mb-6 text-[30px] font-black tracking-[-0.02em] text-[#5a6d8a] sm:text-[34px]">
            {module.title}
          </h2>

          <div className="space-y-4">
            {module.weeks.map((week) => (
              <article
                key={week.weekNumber}
                className="relative rounded-[14px] border border-[#d6ddeb] bg-white p-5 md:p-6"
              >
                <span className="absolute -left-[9px] top-3 h-4 w-4 rounded-full border-2 border-[#3a61d5] bg-white" />
                <div className="absolute -left-[3px] top-7 h-[calc(100%-28px)] w-[2px] bg-[#d6deed]" />

                <p className="mb-1 text-[12px] font-bold uppercase tracking-[0.04em] text-[#2450d3]">
                  {week.weekLabel}
                </p>
                <h3 className="mb-2 text-[27px] font-black leading-tight tracking-[-0.02em] text-[#101828] sm:text-[30px]">
                  {week.title}
                </h3>
                <p className="mb-4 text-[14px] leading-6 text-[#4e5f7b]">
                  {week.description}
                </p>

                <div className="grid gap-4 border-t border-[#e5e9f1] pt-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <div
                   onClick={() =>
                        router.push(
                          `/studashboard/e-learning/my-learning/${courseSlug}/weekly-focus?week=${week.weekNumber}`,
                        )
                      } 
                  className="rounded-[8px] bg-[#2143b6] px-4 py-4 text-white">
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#b8c7ff]">
                      Weekly Focus
                    </p>
                    <p className="mb-3 text-[14px] leading-6">
                      {week.focusSummary}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/studashboard/e-learning/my-learning/${courseSlug}/weekly-focus?week=${week.weekNumber}`,
                        )
                      }
                      className="text-[12px] font-bold uppercase tracking-[0.04em] text-white"
                    >
                      View Details -&gt;
                    </button>
                  </div>

                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8d9ab1]">
                      {week.deadline ? "Deadline" : "Key Topics"}
                    </p>
                    {week.deadline ? (
                      <p className="inline-flex items-center gap-2 rounded-[8px] bg-[#fff1f1] px-3 py-2 text-[14px] font-semibold text-[#e23a3a]">
                        <CalendarDays className="h-4 w-4" />
                        {week.deadline}
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {week.keyTopics.map((topic) => (
                          <span
                            key={topic}
                            className="rounded-full bg-[#f1f4f9] px-3 py-1 text-[12px] text-[#5f6d85]"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
