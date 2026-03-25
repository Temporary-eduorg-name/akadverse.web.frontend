"use client";

import { useState } from "react";

export default function WeeklyFocusPage() {
  const [selectedWeek, setSelectedWeek] = useState(4);

  const weeklyData = {
    4: {
      title: "Weekly Focus: Week 4",
      subtitle: "Advanced Thermodynamics & Heat Transfer",
      lectureNotes: [
        { id: 1, name: "Note 1", date: "Feb 2 2025" },
        { id: 2, name: "Note 2", date: "Feb 2 2025" },
        { id: 3, name: "Note 3", date: "Feb 2 2025" },
      ],
      externalLinks: [
        { name: "Online Article (Wiki)", icon: "🌐" },
        { name: "External Resources Online", icon: "📚" },
      ],
      tools: [
        {
          title: "Note to Audio",
          description:
            "Convert complex slides into natural-sounding audio summaries for learning on the go.",
          icon: "🎵",
        },
        {
          title: "Note to Video",
          description:
            "Generate visual AI-focused that explain difficult concepts using your lecture notes.",
          icon: "🎬",
        },
        {
          title: "YouTube Guide",
          description:
            "AI-powered curation of top YouTube tutorials specifically matching this week's syllabus.",
          icon: "▶️",
        },
      ],
      quiz: {
        difficulty: "Easy",
        format: "Multiple Choice",
        focusArea: "e.g., Entropy, Entropy...",
      },
      simulations: [
        {
          title: "Full Exam Simulation",
          duration: "3 Hours",
          difficulty: "Intermediate",
        },
        {
          title: "Mid-Semester Prep",
          duration: "Test (2 Hours)",
          difficulty: "Hard",
        },
        {
          title: "Test Preparation",
          duration: "Intensive Study + Guided Module",
          difficulty: "Intermediate",
        },
      ],
    },
  };

  const data =
    weeklyData[selectedWeek as keyof typeof weeklyData] || weeklyData[4];

  return (
    <div className="space-y-8">
      {/* Week Selector */}
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4, 5].map((week) => (
          <button
            key={week}
            onClick={() => setSelectedWeek(week)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedWeek === week
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            }`}
          >
            Week {week}
          </button>
        ))}
      </div>

      {/* Title Section */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{data.title}</h2>
        <p className="text-gray-600">{data.subtitle}</p>
      </section>

      {/* Lecture Notes Repository */}
      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📋</span> Lecture Notes Repository
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {data.lectureNotes.map((note) => (
            <div
              key={note.id}
              className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <span>📄</span>
                <p className="font-semibold text-gray-900">{note.name}</p>
              </div>
              <p className="text-xs text-gray-600">{note.date}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Important External Links */}
      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>🔗</span> Important External Links
        </h3>
        <div className="flex gap-3">
          {data.externalLinks.map((link, i) => (
            <button
              key={i}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium text-gray-900"
            >
              {link.icon} {link.name}
            </button>
          ))}
        </div>
      </section>

      {/* AI Study Enhancers */}
      <section>
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-8 text-white mb-6">
          <h3 className="text-2xl font-bold mb-2">AI Study Enhancers</h3>
          <p className="text-sm opacity-90">
            Transform your lecture materials into dynamic learning formats using
            our integrated AI tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.tools.map((tool, i) => (
            <div
              key={i}
              className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="text-3xl mb-3">{tool.icon}</div>
              <h4 className="font-bold text-gray-900 mb-2">{tool.title}</h4>
              <p className="text-sm text-gray-600">{tool.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Quiz Generator */}
      <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>✨</span> AI Quiz Generator
          </h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm">
            Launch Builder
          </button>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          Generate custom quizzes based on this unit instantly.
        </p>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600 uppercase font-semibold text-xs mb-1">
              DIFFICULTY
            </p>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white">
              <option>Easy</option>
              <option>Intermediate</option>
              <option>Hard</option>
            </select>
          </div>
          <div>
            <p className="text-gray-600 uppercase font-semibold text-xs mb-1">
              FORMAT
            </p>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white">
              <option>Multiple Choice</option>
              <option>Short Answer</option>
              <option>Essay</option>
            </select>
          </div>
          <div>
            <p className="text-gray-600 uppercase font-semibold text-xs mb-1">
              FOCUS AREA
            </p>
            <input
              type="text"
              placeholder="e.g., Entropy, Entropy..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-400"
            />
          </div>
        </div>
      </section>

      {/* Timed Simulations */}
      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>⏱️</span> Timed Simulations
          <span className="ml-auto px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
            EXAM READY
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.simulations.map((sim, i) => (
            <div
              key={i}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-teal-400 transition-all"
            >
              <h4 className="font-bold text-gray-900 mb-2">{sim.title}</h4>
              <div className="space-y-2 mb-4">
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">Duration:</span>{" "}
                  {sim.duration}
                </p>
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">Difficulty:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      sim.difficulty === "Easy"
                        ? "bg-green-100 text-green-800"
                        : sim.difficulty === "Intermediate"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {sim.difficulty}
                  </span>
                </p>
              </div>
              <button className="w-full px-3 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-semibold text-sm">
                Start Simulation
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
