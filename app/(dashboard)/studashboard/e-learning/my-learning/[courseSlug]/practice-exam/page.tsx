"use client";

import { ChevronLeft, ChevronRight, Flag, Plus, Zap } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

interface Question {
  id: number;
  type: "multiple-choice" | "essay" | "theoretical";
  points: number;
  text: string;
  options?: string[];
}

interface ExamState {
  answers: Record<number, string>;
  flagged: number[];
  currentQuestion: number;
  timeRemaining: number;
}

const PRACTICE_EXAM_QUESTIONS: Question[] = [
  {
    id: 1,
    type: "multiple-choice",
    points: 5,
    text: "What is the primary purpose of the Scrum Master role in an Agile team?",
    options: [
      "To manage the project budget and resources",
      "To facilitate Scrum ceremonies and remove impediments for the team",
      "To make all technical decisions for the team",
      "To report directly to the CEO on project progress",
    ],
  },
  {
    id: 2,
    type: "multiple-choice",
    points: 5,
    text: "Which artifact is NOT part of the core Scrum framework?",
    options: [
      "Product Backlog",
      "Sprint Backlog",
      "Increment",
      "Project Charter",
    ],
  },
  {
    id: 3,
    type: "essay",
    points: 10,
    text: "Explain the concept of Definition of Done in Scrum and why it's important for team consistency.",
  },
  {
    id: 4,
    type: "multiple-choice",
    points: 5,
    text: "What is the ideal duration of a Sprint in Scrum?",
    options: [
      "1 week maximum",
      "2 weeks or less",
      "Between 1-4 weeks",
      "3 months maximum",
    ],
  },
  {
    id: 5,
    type: "theoretical",
    points: 8,
    text: "Describe the role of stakeholders in Sprint Review meetings and how their feedback influences the product backlog.",
  },
  {
    id: 6,
    type: "multiple-choice",
    points: 5,
    text: "Who is responsible for prioritizing the Product Backlog?",
    options: [
      "The Development Team",
      "The Scrum Master",
      "The Product Owner",
      "The CEO",
    ],
  },
  {
    id: 7,
    type: "multiple-choice",
    points: 5,
    text: "What is the timeboxed duration for a Daily Standup in Scrum?",
    options: [
      "15 minutes or less",
      "30 minutes maximum",
      "1 hour",
      "As long as needed",
    ],
  },
  {
    id: 8,
    type: "essay",
    points: 10,
    text: "Analyze how Scrum practices can be adapted for distributed teams working across multiple time zones.",
  },
  {
    id: 9,
    type: "multiple-choice",
    points: 5,
    text: "What is the primary outcome of a Sprint Planning meeting?",
    options: [
      "Selection of items from the Product Backlog to include in the Sprint",
      "Creation of the Product Backlog",
      "Review of completed work",
      "Identification of team members' vacation days",
    ],
  },
  {
    id: 10,
    type: "multiple-choice",
    points: 5,
    text: "Which of the following is NOT a Scrum ceremony?",
    options: [
      "Sprint Planning",
      "Daily Standup",
      "Monthly Review",
      "Sprint Retrospective",
    ],
  },
];

export default function PracticeExamPage() {
  const params = useParams<{ courseSlug: string }>();
  const searchParams = useSearchParams();
  const courseSlug = params?.courseSlug ?? "software-engineering";
  const simulationType = searchParams?.get("simulation") ?? "full-exam";

  const [examState, setExamState] = useState<ExamState>({
    answers: {},
    flagged: [],
    currentQuestion: 0,
    timeRemaining: 3 * 60 * 60, // 3 hours in seconds
  });

  const [submitted, setSubmitted] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setExamState((prev) => ({
        ...prev,
        timeRemaining: Math.max(0, prev.timeRemaining - 1),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const currentQ = PRACTICE_EXAM_QUESTIONS[examState.currentQuestion];

  const handleOptionSelect = (option: string) => {
    setExamState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQ.id]: option,
      },
    }));
  };

  const handleEssayChange = (text: string) => {
    setExamState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQ.id]: text,
      },
    }));
  };

  const toggleFlag = () => {
    setExamState((prev) => ({
      ...prev,
      flagged: prev.flagged.includes(currentQ.id)
        ? prev.flagged.filter((id) => id !== currentQ.id)
        : [...prev.flagged, currentQ.id],
    }));
  };

  const goToQuestion = (index: number) => {
    setExamState((prev) => ({
      ...prev,
      currentQuestion: index,
    }));
  };

  const navigatePrevious = () => {
    if (examState.currentQuestion > 0) {
      goToQuestion(examState.currentQuestion - 1);
    }
  };

  const navigateNext = () => {
    if (examState.currentQuestion < PRACTICE_EXAM_QUESTIONS.length - 1) {
      goToQuestion(examState.currentQuestion + 1);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isAnswered = currentQ && examState.answers[currentQ.id];
  const isFlagged = currentQ && examState.flagged.includes(currentQ.id);

  const answeredCount = Object.keys(examState.answers).length;
  const totalPoints = PRACTICE_EXAM_QUESTIONS.reduce(
    (sum, q) => sum + q.points,
    0,
  );
  const currentQPoints = currentQ?.points || 0;

  if (submitted) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#f5f6f7] px-4 py-8">
        <div className="max-w-md rounded-[18px] bg-white p-8 text-center shadow-sm">
          <div className="mb-4 text-5xl">✓</div>
          <h1 className="mb-2 text-2xl font-black text-[#111827]">
            Exam Submitted
          </h1>
          <p className="mb-6 text-[14px] text-[#6b7a94]">
            You answered {answeredCount} out of {PRACTICE_EXAM_QUESTIONS.length}{" "}
            questions.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-block rounded-[10px] bg-[#2450d3] px-6 py-2 text-[13px] font-bold text-white transition hover:bg-[#1d3ba8]"
          >
            Return to My Learning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full bg-[#f5f6f7]">
      {/* Left Sidebar - Question Navigator */}
      <div className="hidden w-[180px] border-r-2 border-[#e5e9f3] bg-white px-4 py-6 lg:block">
        <div className="mb-4">
          <h3 className="mb-2 text-[11px] font-bold uppercase text-[#8d9ab1]">
            Questions ({answeredCount}/{PRACTICE_EXAM_QUESTIONS.length})
          </h3>
        </div>

        <div className="mb-6 grid grid-cols-5 gap-2">
          {PRACTICE_EXAM_QUESTIONS.map((q, idx) => {
            const isCurrentQuestion = idx === examState.currentQuestion;
            const isQAnswered = examState.answers[q.id];
            const isQFlagged = examState.flagged.includes(q.id);

            let bgColor = "bg-[#f0f3f8]";
            let textColor = "text-[#7a8a9f]";
            let borderColor = "border-[#e5e9f3]";

            if (isCurrentQuestion) {
              bgColor = "bg-[#2450d3]";
              textColor = "text-white";
              borderColor = "border-[#2450d3]";
            } else if (isQAnswered && isQFlagged) {
              bgColor = "bg-[#fef3c7]";
              textColor = "text-[#92400e]";
              borderColor = "border-[#fcd34d]";
            } else if (isQAnswered) {
              bgColor = "bg-[#c8fae0]";
              textColor = "text-[#065f46]";
              borderColor = "border-[#86efac]";
            } else if (isQFlagged) {
              bgColor = "bg-[#fee2e2]";
              textColor = "text-[#991b1b]";
              borderColor = "border-[#fca5a5]";
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => goToQuestion(idx)}
                className={`flex h-8 w-8 items-center justify-center rounded-[6px] border border-transparent text-[11px] font-bold transition ${bgColor} ${textColor}`}
              >
                {q.id}
              </button>
            );
          })}
        </div>

        {/* Calculator Button */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowCalculator(!showCalculator)}
            className="flex w-full items-center justify-center gap-2 rounded-[8px] border-2 border-[#e5e9f3] bg-white px-3 py-2 text-[11px] font-bold text-[#7a8a9f] transition hover:border-[#d8deea]"
          >
            <Plus className="h-3 w-3" />
            Calculator
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar - Timer and Submit */}
        <div className="flex items-center justify-between border-b-2 border-[#e5e9f3] bg-white px-6 py-4">
          <div className="text-[13px] font-black text-[#111827]">
            {simulationType === "full-exam"
              ? "Full Exam Simulation"
              : "Practice Exam"}
          </div>
          <div className="flex items-center gap-6">
            <div
              className={`flex items-center gap-2 rounded-[8px] ${
                examState.timeRemaining < 600
                  ? "bg-[#fee2e2] px-3 py-1"
                  : "bg-[#f0f3f8] px-3 py-1"
              } text-[13px] font-bold ${
                examState.timeRemaining < 600
                  ? "text-[#991b1b]"
                  : "text-[#2450d3]"
              }`}
            >
              <Zap className="h-4 w-4" />
              {formatTime(examState.timeRemaining)}
            </div>
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              className="rounded-[8px] bg-[#2450d3] px-6 py-2 text-[13px] font-bold text-white transition hover:bg-[#1d3ba8]"
            >
              Submit Exam
            </button>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Question Panel */}
          <div className="flex flex-1 flex-col overflow-y-auto px-6 py-8">
            <div className="mx-auto w-full max-w-3xl">
              {/* Question Header */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="inline-block rounded-full bg-[#e3f2fd] px-3 py-1 text-[11px] font-bold uppercase text-[#1565c0]">
                    {currentQ.type === "multiple-choice"
                      ? "Multiple Choice"
                      : currentQ.type === "essay"
                        ? "Essay"
                        : "Theoretical"}
                  </span>
                  <span className="text-[13px] font-bold text-[#8d9ab1]">
                    {currentQPoints} points
                  </span>
                </div>
                <h2 className="text-[18px] font-black text-[#111827]">
                  Question {currentQ.id}
                </h2>
              </div>

              {/* Question Text */}
              <div className="mb-8 rounded-[12px] border-2 border-[#e5e9f3] bg-[#fafbfd] p-6">
                <p className="text-[15px] leading-7 text-[#2d3748]">
                  {currentQ.text}
                </p>
              </div>

              {/* Options */}
              <div className="mb-8 space-y-3">
                {currentQ.type === "multiple-choice" && currentQ.options ? (
                  currentQ.options.map((option, idx) => (
                    <label
                      key={idx}
                      className={`flex cursor-pointer items-center gap-3 rounded-[10px] border-2 p-4 transition ${
                        examState.answers[currentQ.id] === option
                          ? "border-[#2450d3] bg-[#f0f3f8]"
                          : "border-[#e5e9f3] bg-white hover:border-[#d8deea]"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQ.id}`}
                        value={option}
                        checked={examState.answers[currentQ.id] === option}
                        onChange={() => handleOptionSelect(option)}
                        className="h-4 w-4 cursor-pointer"
                      />
                      <span className="text-[14px] text-[#2d3748]">
                        {option}
                      </span>
                    </label>
                  ))
                ) : currentQ.type === "essay" ||
                  currentQ.type === "theoretical" ? (
                  <textarea
                    value={examState.answers[currentQ.id] || ""}
                    onChange={(e) => handleEssayChange(e.target.value)}
                    placeholder="Type your answer here..."
                    className="min-h-[200px] w-full rounded-[10px] border-2 border-[#e5e9f3] bg-white p-4 text-[14px] placeholder-[#a0adb5] outline-none transition focus:border-[#2450d3]"
                  />
                ) : null}
              </div>

              {/* Flag Button */}
              <div className="mb-8">
                <button
                  type="button"
                  onClick={toggleFlag}
                  className={`flex items-center gap-2 rounded-[8px] px-4 py-2 text-[13px] font-bold transition ${
                    isFlagged
                      ? "bg-[#fee2e2] text-[#991b1b]"
                      : "border-2 border-[#e5e9f3] bg-white text-[#7a8a9f] hover:border-[#d8deea]"
                  }`}
                >
                  <Flag className="h-4 w-4" />
                  {isFlagged ? "Flagged" : "Flag for Review"}
                </button>
              </div>

              {/* Navigation */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={navigatePrevious}
                  disabled={examState.currentQuestion === 0}
                  className="flex items-center gap-2 rounded-[8px] border-2 border-[#e5e9f3] bg-white px-4 py-2 text-[13px] font-bold text-[#7a8a9f] transition hover:border-[#d8deea] disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={navigateNext}
                  disabled={
                    examState.currentQuestion ===
                    PRACTICE_EXAM_QUESTIONS.length - 1
                  }
                  className="flex items-center gap-2 rounded-[8px] border-2 border-[#e5e9f3] bg-white px-4 py-2 text-[13px] font-bold text-[#7a8a9f] transition hover:border-[#d8deea] disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
