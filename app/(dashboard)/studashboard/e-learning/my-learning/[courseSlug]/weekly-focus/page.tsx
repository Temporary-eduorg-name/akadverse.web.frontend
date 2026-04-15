"use client";

import {
  ArrowLeft,
  CirclePlay,
  Download,
  FileText,
  Folder,
  Link as LinkIcon,
  Mic,
  Sparkles,
  Timer,
  Video,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { getSharedCourseAssetUrl } from "@/app/lib/sharedCourseAssets";
import { getAllCourseWeeks } from "../learningData";
import { getSharedCourseWeeks } from "@/app/lib/sharedCourseWorkspace";
import { useSharedCourseWorkspace } from "@/app/lib/useSharedCourseWorkspace";

type Difficulty = "Easy" | "Intermediate" | "Hard";

export default function WeeklyFocusPage() {
  const params = useParams<{ courseSlug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseSlug = params?.courseSlug ?? "software-engineering";
  const { course, isSharedCourse } = useSharedCourseWorkspace(courseSlug);
  const allWeeks = React.useMemo(
    () =>
      isSharedCourse && course
        ? getSharedCourseWeeks(course)
        : getAllCourseWeeks(courseSlug),
    [course, courseSlug, isSharedCourse],
  );

  const firstAvailableWeek = allWeeks[0]?.weekNumber ?? 1;
  const searchWeek = Number(searchParams.get("week"));
  const initialWeek =
    Number.isInteger(searchWeek) &&
    allWeeks.some((week) => week.weekNumber === searchWeek)
      ? searchWeek
      : firstAvailableWeek;

  const [selectedWeek, setSelectedWeek] = React.useState(initialWeek);
  const [quizDifficulty, setQuizDifficulty] =
    React.useState<Difficulty>("Intermediate");
  const [noteUrls, setNoteUrls] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    setSelectedWeek(initialWeek);
  }, [initialWeek]);

  const data =
    allWeeks.find((week) => week.weekNumber === selectedWeek) || allWeeks[0];

  React.useEffect(() => {
    if (!data) {
      setNoteUrls({});
      return;
    }

    let cancelled = false;
    let objectUrls: string[] = [];

    const resolveNoteUrls = async () => {
      const entries = await Promise.all(
        data.notes.map(async (note) => {
          if (note.fileUrl) {
            return [note.id, note.fileUrl] as const;
          }

          if (!note.assetId) {
            return [note.id, ""] as const;
          }

          const assetUrl = await getSharedCourseAssetUrl(note.assetId);
          if (assetUrl?.startsWith("blob:")) {
            objectUrls.push(assetUrl);
          }

          return [note.id, assetUrl ?? ""] as const;
        }),
      );

      if (cancelled) {
        objectUrls.forEach((url) => URL.revokeObjectURL(url));
        return;
      }

      setNoteUrls(
        Object.fromEntries(entries.filter(([, url]) => Boolean(url))),
      );
    };

    resolveNoteUrls();

    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [data]);

  if (!data) {
    return null;
  }

  const aiTools = [
    {
      title: "Note to Audio",
      description:
        "Convert complex slides into natural-sounding audio summaries for learning on the go.",
      icon: Mic,
    },
    {
      title: "Note to Video",
      description:
        "Generate visual AI lectures that explain difficult concepts using your lecture notes.",
      icon: Video,
    },
    {
      title: "YouTube Guide",
      description:
        "AI-powered curation of top video tutorials specifically matching this week's syllabus.",
      icon: CirclePlay,
      path: "/studashboard/productivity-layer",
    },
  ];

  const simulations = [
    {
      tag: "3 Hours",
      title: "Full Exam Simulation",
      subtitle: "Unit 1 - 4 Comprehensive Review",
    },
    {
      tag: "2 Hours",
      title: "Mid-Semester Prep",
      subtitle: "Core Content Phase 2 Review",
    },
    {
      tag: "45 Mins",
      title: "Test Preparation",
      subtitle: "Intensive Study - Current Module",
    },
  ];

  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-wrap gap-2">
        {allWeeks.map((week) => (
          <button
            key={week.weekNumber}
            type="button"
            onClick={() => setSelectedWeek(week.weekNumber)}
            className={`rounded-[7px] px-3 py-2 text-[12px] font-semibold ${
              selectedWeek === week.weekNumber
                ? "bg-[#2c4ec0] text-white"
                : "bg-[#eef2f8] text-[#415273]"
            }`}
          >
            Week {week.weekNumber}
          </button>
        ))}
      </div>

      <section>
        <button
          type="button"
          onClick={() =>
            setSelectedWeek(Math.max(firstAvailableWeek, selectedWeek - 1))
          }
          className="mb-4 inline-flex items-center gap-2 text-[#5d6f8b]"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="mb-2 mt-4 text-[32px] font-black leading-none tracking-[-0.02em] text-[#111827] sm:text-[36px]">
          Weekly Focus: Week {data.weekNumber}
        </h2>
        <p className="text-[15px] leading-6 text-[#50617d]">{data.title}</p>
      </section>

      <section className="overflow-hidden rounded-[12px] border border-[#d8deea] bg-white">
        <div className="border-b border-[#e5ebf5] px-4 py-3">
          <h3 className="flex items-center gap-2 text-[24px] leading-none tracking-[-0.02em] p-3 text-[#1a2434] sm:text-[20px]">
            <Folder className="h-5 w-5 text-[#2e53c6]" />
            Lecture Notes Repository
          </h3>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-3">
          {data.notes.map((note) => (
            <article
              key={note.id}
              className="flex items-center justify-between rounded-[8px] border border-[#e4e9f3] bg-[#fbfcff] px-3 py-3"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#294fbe]" />
                <div>
                  <p className="text-[13px] font-semibold text-[#1f2a3d]">
                    {note.name}
                  </p>
                  <p className="text-[11px] text-[#8896ad]">
                    {note.fileType} - {note.size}
                  </p>
                </div>
              </div>

              {noteUrls[note.id] ? (
                <a
                  href={noteUrls[note.id]}
                  download={note.name}
                  className="rounded p-1 text-[#8c9ab0] hover:bg-[#eef2fa]"
                  aria-label={`Download ${note.name}`}
                >
                  <Download className="h-4 w-4" />
                </a>
              ) : (
                <span className="rounded p-1 text-[#b8c2d4]" aria-hidden>
                  <Download className="h-4 w-4" />
                </span>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[12px] border border-[#d8deea] bg-white">
        <div className="border-b border-[#e5ebf5] px-4 py-3">
          <h3 className="flex items-center gap-2 text-[24px] p-3 leading-none tracking-[-0.02em] text-[#1a2434] sm:text-[20px]">
            <LinkIcon className="h-5 w-5 text-[#2e53c6]" />
            Important External Links
          </h3>
        </div>
        <div className="flex flex-wrap gap-4 px-4 py-4">
          {data.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-w-[260px] items-center justify-center rounded-[10px] border border-[#e6ebf4] bg-white px-4 py-3 text-[13px] font-semibold text-[#3d4f6b]"
            >
              {link.name}
            </a>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[12px] border border-[#d8deea] bg-white">
        <div className="bg-gradient-to-r from-[#6650f2] to-[#4d8fda] px-4 py-8 text-center text-white">
          <h3 className="text-[30px]  leading-none tracking-[-0.02em] sm:text-[24px]">
            AI Study Enhancers
          </h3>
          <p className="mt-2 text-[13px] text-[#dce7ff]">
            Transform your lecture materials into dynamic learning formats using
            our integrated AI tools.
          </p>
        </div>

        <div className="grid gap-3 p-4 md:grid-cols-3">
          {aiTools.map((tool) => {
            const Icon = tool.icon;
            const content = (
              <>
                <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[12px] bg-[#ecf1fb] text-[#2d53c4]">
                  <Icon className="h-6 w-6" />
                </span>
                <h4 className="mb-2 text-[20px] leading-none tracking-[-0.02em] text-[#1a2434] sm:text-[22px]">
                  {tool.title}
                </h4>
                <p className="text-[13px] leading-5 text-[#61708a]">
                  {tool.description}
                </p>
              </>
            );

            return tool.path ? (
              <button
                key={tool.title}
                type="button"
                onClick={() => router.push(tool.path)}
                className="rounded-[10px] border border-[#e4e9f3] bg-[#fbfcff] px-4 py-5 text-center transition hover:border-[#d0daf0] hover:shadow-[0_12px_24px_rgba(16,24,40,0.06)]"
              >
                {content}
              </button>
            ) : (
              <article
                key={tool.title}
                className="rounded-[10px] border border-[#e4e9f3] bg-[#fbfcff] px-4 py-5 text-center"
              >
                {content}
              </article>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-[12px] border border-[#d8deea] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5ebf5] px-4 py-3">
          <div>
            <h3 className="flex items-center gap-2 text-[24px] p-3 leading-none tracking-[-0.02em] text-[#1a2434] sm:text-[20px]">
              <Sparkles className="h-5 w-5 text-[#2e53c6]" />
              AI Quiz Generator
            </h3>
            <p className="text-[13px] text-[#60708a]">
              Generate custom assessments for this unit instantly.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              router.push(
                `/studashboard/e-learning/my-learning/${courseSlug}/quiz-generator?difficulty=${encodeURIComponent(quizDifficulty)}`,
              )
            }
            className="rounded-[8px] bg-[#294dbc] px-6 py-2 text-[13px] font-bold text-white"
          >
            Launch Builder
          </button>
        </div>

        <div className="grid gap-3 px-4 py-4 md:grid-cols-3">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#8d9ab1]">
              Difficulty
            </p>
            <div className="grid grid-cols-3 rounded-[8px] border border-[#dbe2ef] bg-[#f8fafd] p-1 text-[12px]">
              <button
                type="button"
                onClick={() => setQuizDifficulty("Easy")}
                className={`rounded-[6px] py-2 ${
                  quizDifficulty === "Easy"
                    ? "bg-[#2f53c4] text-white"
                    : "text-[#243149]"
                }`}
              >
                Easy
              </button>
              <button
                type="button"
                onClick={() => setQuizDifficulty("Intermediate")}
                className={`rounded-[6px] py-2 ${
                  quizDifficulty === "Intermediate"
                    ? "bg-[#2f53c4] text-white"
                    : "text-[#243149]"
                }`}
              >
                Intermediate
              </button>
              <button
                type="button"
                onClick={() => setQuizDifficulty("Hard")}
                className={`rounded-[6px] py-2 ${
                  quizDifficulty === "Hard"
                    ? "bg-[#2f53c4] text-white"
                    : "text-[#243149]"
                }`}
              >
                Hard
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#8d9ab1]">
              Format
            </p>
            <select className="w-full rounded-[8px] border border-[#dbe2ef] bg-white px-3 py-2 text-[13px] text-[#273550]">
              <option>Multiple Choice</option>
              <option>Short Answer</option>
              <option>Essay</option>
            </select>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#8d9ab1]">
              Focus Area
            </p>
            <input
              type="text"
              placeholder="e.g. Entropy, Enthalpy..."
              className="w-full rounded-[8px] border border-[#dbe2ef] bg-white px-3 py-2 text-[13px] text-[#273550] placeholder:text-[#96a3b8]"
            />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[12px] border border-[#d8deea] bg-white">
        <div className="flex items-center justify-between border-b border-[#e5ebf5] px-4 py-3">
          <h3 className="flex items-center gap-2 text-[24px] p-3 leading-none tracking-[-0.02em] text-[#1a2434] sm:text-[20px]">
            <Timer className="h-5 w-5 text-[#14a37f]" />
            Timed Simulations
          </h3>
          <span className="rounded-full bg-[#d6faec] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0a8a66]">
            Exam Ready
          </span>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-3">
          {simulations.map((simulation, idx) => (
            <article
              key={simulation.title}
              className="flex flex-col rounded-[10px] border border-[#e5eaf4] bg-[#fbfcff] px-4 py-4"
            >
              <p className="mb-3 inline-block rounded-full bg-[#d6faec] px-2 py-1 text-[10px] font-bold uppercase text-[#0a8a66]">
                {simulation.tag}
              </p>
              <h4 className="text-[18px]  leading-tight tracking-[-0.02em] text-[#1a2434] sm:text-[20px]">
                {simulation.title}
              </h4>
              <p className="mt-1 flex-1 text-[12px] text-[#73829b]">
                {simulation.subtitle}
              </p>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/studashboard/e-learning/my-learning/${courseSlug}/timed-simulations`,
                  )
                }
                className="mt-4 rounded-[8px] bg-[#14a37f] px-4 py-2 text-[12px] font-bold text-white transition hover:bg-[#0d8a6b]"
              >
                View Simulations
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
