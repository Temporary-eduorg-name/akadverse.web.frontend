"use client";

import { ChevronLeft, ChevronRight, Flag, Grid3x3 } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import React from "react";

const SAMPLE_QUESTIONS = [
  {
    id: 1,
    number: 4,
    type: "MULTIPLE CHOICE",
    points: 2.0,
    question: "Which of the following best describes the Scrum Framework",
    options: [
      "A meeting where the team demonstrates the work completed during the sprint to stakeholders.",
      "An opportunity for the Scrum Team to inspect itself and create a plan for improvements to be enacted during the next Sprint.",
      "A daily 15-minute event for the Development Team to synchronize activities and create a plan for the next 24 hours.",
      "The process of refining the Product Backlog by adding detail, estimates, and order to items.",
    ],
    correct: 1,
  },
  {
    id: 2,
    number: 5,
    type: "MULTIPLE CHOICE",
    points: 2.0,
    question: "What is the primary goal of a Sprint Retrospective",
    options: [
      "To plan the next sprint",
      "To improve team processes and efficiency",
      "To review product features",
      "To allocate budget",
    ],
    correct: 1,
  },
  {
    id: 3,
    number: 6,
    type: "THEORETICAL",
    points: 3.0,
    question: "Explain the difference between a Sprint and a Release",
    options: [],
    correct: -1,
  },
];

export default function QuizTakingPage() {
  const params = useParams<{ courseSlug: string }>();
  const searchParams = useSearchParams();

  const courseSlug = params?.courseSlug ?? "software-engineering";
  const difficulty = searchParams.get("difficulty") || "Intermediate";
  const topic = searchParams.get("topic") || "Software Engineering";

  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [answers, setAnswers] = React.useState<(number | string)[]>(
    new Array(SAMPLE_QUESTIONS.length).fill(null),
  );
  const [flaggedQuestions, setFlaggedQuestions] = React.useState<Set<number>>(
    new Set(),
  );

  const question = SAMPLE_QUESTIONS[currentQuestion];
  const answerCount = answers.filter((a) => a !== null).length;

  const toggleFlag = () => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(currentQuestion)) {
      newFlagged.delete(currentQuestion);
    } else {
      newFlagged.add(currentQuestion);
    }
    setFlaggedQuestions(newFlagged);
  };

  const handleOptionSelect = (index: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = index;
    setAnswers(newAnswers);
  };

  const handleTextAnswer = (text: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = text;
    setAnswers(newAnswers);
  };

  return (
    <div className="flex min-h-[calc(100vh-70px)] bg-[#f5f6f7]">
      <aside className="w-[220px] border-r border-[#dde2ed] bg-white p-4">
        <h3 className="mb-2 text-[13px] font-bold text-[#2450d3]">
          AI Quiz Generator
        </h3>
        <p className="mb-4 text-[11px] text-[#6b7a94]">
          {answerCount} of {SAMPLE_QUESTIONS.length} Answered
        </p>

        <div className="mb-6 space-y-2">
          <div className="mb-2 text-[11px] font-bold uppercase text-[#8d9ab1]">
            Question Navigator
          </div>
          <div className="grid grid-cols-5 gap-2">
            {SAMPLE_QUESTIONS.map((_, index) => {
              const answered = answers[index] !== null;
              const flagged = flaggedQuestions.has(index);
              const isCurrent = index === currentQuestion;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentQuestion(index)}
                  className={`flex h-8 w-8 items-center justify-center rounded-[6px] text-[11px] font-bold transition ${
                    isCurrent
                      ? "border border-[#2450d3] bg-[#2450d3] text-white"
                      : answered
                        ? "bg-[#e8f5e9] text-[#2e7d32]"
                        : flagged
                          ? "border border-[#ff9800] bg-white text-[#ff9800]"
                          : "bg-[#eef2f8] text-[#6b7a94]"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[8px] bg-[#ecf1fb] p-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#2450d3]">
            <Grid3x3 className="h-4 w-4" />
            Calculator
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[#2450d3]">
            Question {question.number} of {SAMPLE_QUESTIONS.length}
          </h2>
          <span className="text-[12px] font-semibold text-[#6b7a94]">
            Points: {question.points}
          </span>
        </div>

        <div className="mb-8 rounded-[12px] border border-[#e5e9f3] bg-white p-8">
          <p className="mb-2 text-[11px] font-bold uppercase text-[#8d9ab1]">
            {question.type}
          </p>
          <h3 className="mb-6 text-[20px] font-bold text-[#111827]">
            {question.question}
          </h3>

          {question.type === "MULTIPLE CHOICE" ? (
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleOptionSelect(index)}
                  className={`relative flex w-full items-start gap-3 rounded-[10px] border px-4 py-3 text-left transition ${
                    answers[currentQuestion] === index
                      ? "border-[#2450d3] bg-[#eef2fa]"
                      : "border-[#e5e9f3] bg-white hover:border-[#d8deea]"
                  }`}
                >
                  <div
                    className={`mt-1 h-5 w-5 flex-shrink-0 rounded-full border-2 ${
                      answers[currentQuestion] === index
                        ? "border-[#2450d3] bg-[#2450d3]"
                        : "border-[#d8deea]"
                    }`}
                  >
                    {answers[currentQuestion] === index && (
                      <span className="absolute left-[12px] top-[14px] text-white">
                        ●
                      </span>
                    )}
                  </div>
                  <span className="text-[14px] text-[#111827]">{option}</span>
                </button>
              ))}
            </div>
          ) : (
            <textarea
              value={(answers[currentQuestion] as string) || ""}
              onChange={(e) => handleTextAnswer(e.target.value)}
              placeholder="Enter your answer here..."
              className="w-full min-h-[150px] rounded-[8px] border border-[#e5e9f3] bg-white px-4 py-3 text-[14px] text-[#111827] outline-none placeholder:text-[#b5c1d6]"
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={toggleFlag}
            className={`inline-flex items-center gap-2 rounded-[8px] border px-4 py-2 text-[13px] font-semibold transition ${
              flaggedQuestions.has(currentQuestion)
                ? "border-[#ff9800] bg-[#fff3e0] text-[#ff9800]"
                : "border-[#e5e9f3] bg-white text-[#6b7a94] hover:border-[#d8deea]"
            }`}
          >
            <Flag className="h-4 w-4" />
            Flag for Review
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setCurrentQuestion(Math.max(0, currentQuestion - 1))
              }
              disabled={currentQuestion === 0}
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#e5e9f3] bg-white px-4 py-2 text-[13px] font-semibold text-[#6b7a94] transition disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentQuestion(
                  Math.min(SAMPLE_QUESTIONS.length - 1, currentQuestion + 1),
                )
              }
              disabled={currentQuestion === SAMPLE_QUESTIONS.length - 1}
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#2450d3] px-4 py-2 text-[13px] font-semibold text-white transition disabled:opacity-50"
            >
              Next Question
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>

      <aside className="w-[140px] border-l border-[#dde2ed] bg-white p-4">
        <button
          type="button"
          className="w-full rounded-[8px] bg-[#2450d3] px-4 py-2 text-[13px] font-bold text-white transition hover:bg-[#1a3ca3]"
        >
          Submit Exam
        </button>
      </aside>
    </div>
  );
}

function Calculator() {
  return <div>🧮</div>;
}
