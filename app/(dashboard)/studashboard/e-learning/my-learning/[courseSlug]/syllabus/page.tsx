"use client";

import { useState } from "react";

export default function SyllabusPage() {
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  const modules = [
    {
      id: 1,
      title: "Module 1",
      topics: [
        {
          week: "WEEK 01",
          title: "Introduction to Software Design Patterns",
          description:
            "Foundation of the course covering why architectural patterns matter in large-scale systems and revisiting SOLID principles.",
          topics: [
            "Creational Patterns",
            "Structural Patterns",
            "SOLID Principles",
          ],
          focusArea:
            "WEEKLY FOCUS: Understanding asynchronous communication using message brokers and managing state across distributed services.",
        },
        {
          week: "WEEK 02",
          title: "Microservices Architecture & Event-Driven Systems",
          description:
            "Transitioning from Monoliths to Microservices. Exploring communication protocols, data consistency, and event sourcing.",
          topics: ["API Gateways", "Kafka/RabbitMQ", "Service Discovery"],
          focusArea:
            "WEEKLY FOCUS: Understanding asynchronous communication using message brokers and managing state across distributed services.",
        },
        {
          week: "WEEK 03",
          title: "Domain-Driven Design (DDD)",
          description:
            "Mastering the art of aligning software design with business domains using bounded contexts and ubiquitous language.",
          topics: [
            "Bounded Contexts",
            "Entities & Value Objects",
            "Aggregates",
          ],
          focusArea:
            "WEEKLY FOCUS: Breaking down complex business requirements into manageable sub-domains and defining clear interface boundaries between aggregates.",
        },
      ],
    },
    {
      id: 2,
      title: "Module 2",
      topics: [
        {
          week: "WEEK 04",
          title: "Project Milestone 1: System Proposal",
          description:
            "Submission of the technical proposal for the semester-long group project. Defense sessions scheduled for Friday.",
          topics: ["Architecture Diagram", "Technology Stack", "Timeline"],
          focusArea: "DEADLINE: Friday, 11:50 PM",
        },
        {
          week: "WEEK 05",
          title: "Cloud-Native Delivery & DevOps",
          description:
            "Implementing CI/CD pipelines and exploring container orchestration using Kubernetes and Docker.",
          topics: ["GitHub Actions", "Kubernetes Helm", "Terraform"],
          focusArea:
            "FOCUS AREA: Automating the deployment lifecycle and understanding infrastructure as code (IaC) principles.",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Syllabus</h2>

      <div className="space-y-4">
        {modules.map((module) => (
          <div
            key={module.id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() =>
                setExpandedModule(
                  expandedModule === module.id ? null : module.id,
                )
              }
              className="w-full px-6 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
            >
              <span
                className={`flex items-center justify-center w-6 h-6 rounded-full transition-transform ${
                  expandedModule === module.id ? "rotate-180" : ""
                }`}
              >
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </span>
              <h3 className="text-lg font-bold text-gray-900">
                {module.title}
              </h3>
            </button>

            {expandedModule === module.id && (
              <div className="border-t border-gray-200 p-6 space-y-6 bg-gray-50">
                {module.topics.map((topic, i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-200 rounded-lg p-5 space-y-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full text-sm">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase font-bold text-blue-600 mb-1">
                          {topic.week}
                        </p>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">
                          {topic.title}
                        </h4>
                        <p className="text-gray-700 text-sm mb-3">
                          {topic.description}
                        </p>
                      </div>
                    </div>

                    <div className="bg-blue-700 text-white rounded p-4 space-y-2">
                      <p className="text-sm font-bold">WEEKLY FOCUS</p>
                      <p className="text-sm">{topic.focusArea}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <p className="text-xs uppercase font-bold text-gray-600 col-span-3">
                        KEY TOPICS
                      </p>
                      {topic.topics.map((t, j) => (
                        <span
                          key={j}
                          className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
