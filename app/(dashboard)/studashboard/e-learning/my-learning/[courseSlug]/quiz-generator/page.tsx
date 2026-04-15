"use client";

import { ChevronDown, Sparkles } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React from "react";

type Difficulty = "Easy" | "Intermediate" | "Hard";

const TOPICS = [
  "Software Engineering",
  "AI Ethics",
  "Data Structures",
  "Neural Networks",
  "Cybersecurity",
  "System Design",
];

const QUESTION_FORMATS = [
  { id: "multiple-choice", label: "Multiple Choice", checked: true },
  { id: "theoretical", label: "Theoretical/Essay", checked: true },
  { id: "fill-gap", label: "Fill in the Gap", checked: false },
  { id: "match", label: "Match to Match", checked: false },
  { id: "solving", label: "Solving Tasks", checked: false },
  { id: "coding", label: "Coding Snippets", checked: false },
];

export default function QuizGeneratorPage() {
  const params = useParams<{ courseSlug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseSlug = params?.courseSlug ?? "software-engineering";

  const requestedDifficulty = searchParams.get("difficulty");
  const initialDifficulty: Difficulty =
    requestedDifficulty === "Easy" ||
    requestedDifficulty === "Intermediate" ||
    requestedDifficulty === "Hard"
      ? requestedDifficulty
      : "Intermediate";

  const [difficulty, setDifficulty] =
    React.useState<Difficulty>(initialDifficulty);
  const [topic, setTopic] = React.useState("Software Engineering");
  const [formats, setFormats] = React.useState(
    QUESTION_FORMATS.filter((f) => f.checked).map((f) => f.id),
  );

  React.useEffect(() => {
    setDifficulty(initialDifficulty);
  }, [initialDifficulty]);

  const toggleFormat = (id: string) => {
    setFormats((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  const handleGenerateQuiz = () => {
    const params = new URLSearchParams({
      difficulty,
      topic,
      formats: formats.join(","),
    });
    router.push(
      `/studashboard/e-learning/my-learning/${courseSlug}/ai-quiz-taking?${params}`,
    );
  };

  return (
    <div className="mx-auto w-full max-w-[900px] space-y-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2450d3] text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-[24px] font-bold text-[#2450d3] sm:text-[28px]">
            AI Quiz Generator
          </h1>
        </div>
      </div>

      <section className="space-y-6 rounded-[14px] border border-[#d8deea] bg-white p-6">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2450d3] text-sm font-bold text-white">
              1
            </span>
            <h2 className="text-[18px] font-bold text-[#111827]">
              Difficulty Level
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(["Easy", "Intermediate", "Hard"] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                className={`rounded-[12px] border px-4 py-4 text-center transition ${
                  difficulty === level
                    ? "border-[#2f53c4] bg-[#eef2fa] shadow-[0_0_0_3px_rgba(47,83,196,0.1)]"
                    : "border-[#e5e9f3] bg-white hover:border-[#d8deea]"
                }`}
              >
                <span
                  className={`block text-[13px] font-bold ${
                    difficulty === level ? "text-[#2f53c4]" : "text-[#8d9ab1]"
                  }`}
                >
                  {level === "Easy" && "😊"}
                  {level === "Intermediate" && "🧠"}
                  {level === "Hard" && "⚡"}
                </span>
                <span
                  className={`block text-[14px] font-bold ${
                    difficulty === level ? "text-[#2f53c4]" : "text-[#111827]"
                  }`}
                >
                  {level}
                </span>
                <span className="block text-[11px] text-[#6b7a94]">
                  {level === "Easy" &&
                    "Foundational concepts, basic terminology, and direct recall"}
                  {level === "Intermediate" &&
                    "Application-based questions, analysis, and standard logic"}
                  {level === "Hard" &&
                    "Complex problem-solving, synthesis, and deep technical theory"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-[#e5e9f3]" />

        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2450d3] text-sm font-bold text-white">
              2
            </span>
            <h2 className="text-[18px] font-bold text-[#111827]">
              Academic Topic
            </h2>
          </div>

          <div className="relative">
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full appearance-none rounded-[10px] border border-[#d8deea] bg-white px-4 py-3 pr-10 text-[14px] font-semibold text-[#111827] outline-none"
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d9ab1]" />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "AI Ethics",
              "Data Structures",
              "Neural Networks",
              "Cybersecurity",
              "System Design",
            ].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setTopic(tag)}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                  topic === tag
                    ? "bg-[#2450d3] text-white"
                    : "border border-[#d8deea] bg-white text-[#6b7a94] hover:border-[#2450d3]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-[#e5e9f3]" />

        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2450d3] text-sm font-bold text-white">
              3
            </span>
            <h2 className="text-[18px] font-bold text-[#111827]">
              Question Formats
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {QUESTION_FORMATS.map((format) => (
              <label
                key={format.id}
                className="flex cursor-pointer items-center gap-3 rounded-[10px] border border-[#e5e9f3] px-4 py-3 hover:border-[#d8deea]"
              >
                <input
                  type="checkbox"
                  checked={formats.includes(format.id)}
                  onChange={() => toggleFormat(format.id)}
                  className="h-4 w-4 cursor-pointer accent-[#2450d3]"
                />
                <span className="text-[13px] font-semibold text-[#111827]">
                  {format.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleGenerateQuiz}
          className="inline-flex items-center gap-2 rounded-[8px] bg-[#2450d3] px-8 py-3 text-[14px] font-bold text-white transition hover:bg-[#1a3ca3]"
        >
          <Sparkles className="h-4 w-4" />
          Generate Quiz
        </button>
      </div>
    </div>
  );
}
