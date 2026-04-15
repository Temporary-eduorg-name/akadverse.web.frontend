"use client";

import {
  Bug,
  Cloud,
  Database,
  Gauge,
  GitBranch,
  Layers3,
  Shield,
  SquareChartGantt,
  TerminalSquare,
  Users,
  Wrench,
} from "lucide-react";
import { useParams } from "next/navigation";
import { getCourseLearningContent } from "../learningData";
import {
  SHARED_COMPETENCY_ICON_MAP,
  SHARED_OUTCOME_ICON_MAP,
} from "@/app/lib/sharedCourseWorkspace";
import { useSharedCourseWorkspace } from "@/app/lib/useSharedCourseWorkspace";

const outcomeIconMap = {
  git: GitBranch,
  blocks: SquareChartGantt,
  shield: Shield,
  gauge: Gauge,
} as const;

const competencyIconMap = {
  layers: Layers3,
  users: Users,
  wrench: Wrench,
  cloud: Cloud,
  database: Database,
  bug: Bug,
  shield: Shield,
  terminal: TerminalSquare,
} as const;

export default function LearningOutcomesPage() {
  const params = useParams<{ courseSlug: string }>();
  const courseSlug = params?.courseSlug ?? "software-engineering";
  const { course, isSharedCourse } = useSharedCourseWorkspace(courseSlug);
  const content = isSharedCourse && course
    ? {
        outcomes: course.learningOutcomes,
        competencies: course.competencies,
      }
    : getCourseLearningContent(courseSlug);

  return (
    <div className="space-y-10 pt-4">
      <section>
        <h2 className="mb-2 text-[32px] font-black leading-[1.1] tracking-[-0.02em] text-[#0f172a] sm:text-[36px]">
          Learning Outcome
        </h2>
        <p className="mb-7 text-[15px] leading-6 text-[#52637f]">
          What you will achieve by the end of this course.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {content.outcomes.map((outcome) => {
            const Icon = isSharedCourse
              ? SHARED_OUTCOME_ICON_MAP[outcome.icon]
              : outcomeIconMap[outcome.icon];
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
      </section>

      <section>
        <div className="mb-6 flex items-center gap-2">
          <Shield className="h-6 w-6 text-[#2143b6]" strokeWidth={2.1} />
          <h2 className="text-[30px] font-black leading-none tracking-[-0.02em] text-[#0f172a] sm:text-[34px]">
            Key Competencies
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {content.competencies.map((competency) => {
            const Icon = isSharedCourse
              ? SHARED_COMPETENCY_ICON_MAP[competency.icon]
              : competencyIconMap[competency.icon];
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
