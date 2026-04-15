"use client";

import { Sparkles } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";

const SIMULATIONS = [
  {
    id: "full-exam",
    tag: "3 Hours",
    label: "SIMULATION",
    title: "Full Exam Simulation",
    subtitle: "Unit 1 - 4 Comprehensive Review",
    description:
      "A 3-hour full simulation exam is a timed practice test designed to replicate real exam conditions, helping users assess their knowledge, improve time management, and build exam confidence.",
    buttonColor: "bg-[#14a37f]",
  },
  {
    id: "mid-semester",
    tag: "2 Hours",
    label: "MID-TERM",
    title: "Mid-Semester Prep",
    subtitle: "Core Content Phase 2 Review",
    description:
      "Focused preparation covering mid-term content. Review Phase 2 concepts with targeted practice questions and explanations designed to solidify understanding.",
  },
  {
    id: "test-prep",
    tag: "45 Mins",
    label: "UNIT FOCUS",
    title: "Test Preparation",
    subtitle: "Intensive Study - Current Module",
    description:
      "Quick-burst focused study session. Perfect for last-minute preparation on the current module with intensive, high-yield practice questions.",
  },
];

export default function TimedSimulationsPage() {
  const params = useParams<{ courseSlug: string }>();
  const router = useRouter();
  const courseSlug = params?.courseSlug ?? "software-engineering";

  const handleSimulationStart = (simulationId: string) => {
    const routeMap: Record<string, string> = {
      "full-exam": "practice-exam",
      "mid-semester": "mid-semester-prep",
      "test-prep": "test-preparation",
    };
    const route = routeMap[simulationId] || "practice-exam";
    router.push(
      `/studashboard/e-learning/my-learning/${courseSlug}/${route}?simulation=${simulationId}`,
    );
  };

  return (
    <div className="min-h-full bg-[#f5f6f7] px-4 py-8">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-8">
          <h1 className="mb-2 text-[32px] font-black text-[#111827] sm:text-[36px]">
            📋 Timed Simulations
          </h1>
          <p className="text-[15px] text-[#6b7a94]">
            Practice exams designed to replicate real testing conditions
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SIMULATIONS.map((simulation) => (
            <div
              key={simulation.id}
              className="flex flex-col rounded-[18px] border-2 border-[#e5e9f3] bg-white p-6 transition hover:border-[#d8deea] hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <span
                  className={`inline-block rounded-full ${
                    simulation.id === "full-exam"
                      ? "bg-[#c8fae0]"
                      : "bg-[#e3f2fd]"
                  } px-3 py-1 text-[11px] font-bold ${
                    simulation.id === "full-exam"
                      ? "text-[#0d6d4f]"
                      : "text-[#1565c0]"
                  }`}
                >
                  {simulation.tag}
                </span>
                <span className="text-[10px] font-bold uppercase text-[#8d9ab1]">
                  {simulation.label}
                </span>
              </div>

              <h3 className="mb-1 text-[18px] font-black text-[#111827]">
                {simulation.title}
              </h3>
              <p className="mb-4 text-[12px] text-[#6b7a94]">
                {simulation.subtitle}
              </p>

              <p className="mb-6 flex-1 text-[13px] leading-6 text-[#7a8a9f]">
                {simulation.description}
              </p>

              <button
                type="button"
                onClick={() => handleSimulationStart(simulation.id)}
                className={`inline-flex items-center justify-center gap-2 rounded-[10px] px-4 py-3 text-[13px] font-bold text-white transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${
                  simulation.id === "full-exam"
                    ? "bg-[#14a37f]"
                    : "bg-[#2450d3]"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                Generate Exam
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
