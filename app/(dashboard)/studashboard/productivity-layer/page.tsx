"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { UniversalAIInterface, AITool } from "../../../components/UniversalAIInterface";
const geminiTool: AITool = { name: "Gemini Chat" };
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  FileText,
  Folder,
  ListChecks,
  Table2,
  Play,
} from "lucide-react";
import DashboardNavbar from '@/app/components/dashboard/student/DashboardNavbar';
const Page = () => {
  const router = useRouter();
  const [showGeminiChat, setShowGeminiChat] = useState(false);

  // Ref for Gemini Chat popup
  const geminiChatRef = useRef<HTMLDivElement>(null);

  // Click outside to close logic
  useEffect(() => {
    if (!showGeminiChat) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        geminiChatRef.current &&
        !geminiChatRef.current.contains(event.target as Node)
      ) {
        setShowGeminiChat(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showGeminiChat]);

  const recentWork = [
    { id: 1, title: "Biology Final Notes (AI Summarized)", date: "1 day ago" },
    { id: 2, title: "Q3 Sociology Outline", date: "2 days ago" },
    { id: 3, title: "Quantum Physics Paper V2", date: "3 days ago" },
  ];

  const courseVideos = [
    {
      title: "Understanding Advanced Calculus",
      views: "120K views",
      duration: "15:24",
      image:
        "https://www.figma.com/api/mcp/asset/fd69e4f0-5e74-423f-b636-2e0d02844c49",
    },
    {
      title: "Physics 101: Quantum Mechanics",
      views: "85K views",
      duration: "45:10",
      image:
        "https://www.figma.com/api/mcp/asset/eb02ddfc-f00a-4168-ac46-4399e0457899",
    },
    {
      title: "Data Structures in Python",
      views: "200K views",
      duration: "22:30",
      image:
        "https://www.figma.com/api/mcp/asset/1ffa9cf4-eadb-4b04-994b-adb69fa06aef",
    },
  ];

  const careerVideos = [
    {
      title: "A Day in the Life of a Software Engineer",
      views: "500K views",
      duration: "18:05",
      image:
        "https://www.figma.com/api/mcp/asset/266e349b-7053-476f-b990-c86e129d37ba",
    },
    {
      title: "How to Build a Startup",
      views: "1M views",
      duration: "32:15",
      image:
        "https://www.figma.com/api/mcp/asset/1ffa9cf4-eadb-4b04-994b-adb69fa06aef",
    },
    {
      title: "Top 10 High-Paying Jobs 2026",
      views: "300K views",
      duration: "12:40",
      image:
        "https://www.figma.com/api/mcp/asset/fd69e4f0-5e74-423f-b636-2e0d02844c49",
    },
  ];

  // TODO: Replace this with the actual user email from your auth context or props
  const user = { email: "user@email.com" };

  // Helper to open Google service with login_hint
  const openGoogleService = (service: "docs" | "drive" | "sheets" | "forms") => {
    let continueUrl = "";
    switch (service) {
      case "docs":
        continueUrl = "https://docs.google.com";
        break;
      case "drive":
        continueUrl = "https://drive.google.com/drive/my-drive";
        break;
      case "sheets":
        continueUrl = "https://sheets.google.com";
        break;
      case "forms":
        continueUrl = "https://forms.google.com";
        break;
      default:
        continueUrl = "https://google.com";
    }
    window.open(
      `https://accounts.google.com/AccountChooser?Email=${encodeURIComponent(user.email)}&continue=${encodeURIComponent(continueUrl)}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <DashboardNavbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 sm:mb-8"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Workspaces</span>
        </button>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Productivity Layer
          </h1>
          <p className="text-gray-600">
            Tools for research, writing, and organization.
          </p>
        </div>

        {/* Gemni Chat and Features Grid */}
        <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 xl:mb-12">
          {/* Gemini Chat Card */}
          <div
            className="cursor-pointer rounded-[20px] border border-transparent p-6 shadow-[0_2px_8px_rgba(16,24,40,0.07)] transition-all hover:shadow-[0_6px_14px_rgba(16,24,40,0.10)] sm:p-8 lg:p-10"
            onClick={() => setShowGeminiChat(true)}
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#615FFF] to-[#4F4BC4] shadow-[0_4px_12px_rgba(97,95,255,0.3)] sm:mb-8 sm:h-20 sm:w-20">
              <Bot size={40} className="text-white" />
            </div>
            <h3 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">
              Gemini Chat
            </h3>
            <p className="mb-8 text-base leading-relaxed text-gray-600">
              AI chat, research assistant, note summarizer, study planner. Your
              primary companion for academic productivity.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <button className="px-4 py-1 text-sm bg-[#615FFF] text-white font-normal rounded-full hover:bg-[#4F4BC4] transition-colors">
                Featured
              </button>
              <button className="px-4 py-1 text-sm bg-white text-[#615FFF] font-normal border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                New Chat
              </button>
            </div>
          </div>
          {/* Gemini Chat Popup */}
          <AnimatePresence>
            {showGeminiChat && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div ref={geminiChatRef}>
                  <UniversalAIInterface
                    tool={geminiTool}
                    onBack={() => setShowGeminiChat(false)}
                  />
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Tools Grid */}
          <div className="space-y-4">
            {([
              {
                name: "Docs",
                icon: <FileText size={24} className="text-blue-500" />,
                bg: "bg-[#eff6ff]",
                desc: "Collaborative documents for assignments and notes.",
                service: "docs" as const
              },
              {
                name: "Drive",
                icon: <Folder size={24} className="text-amber-500" />,
                bg: "bg-[#fffbeb]",
                desc: "Upload, organize, and manage research files.",
                service: "drive" as const
              },
              {
                name: "Forms",
                icon: <ListChecks size={24} className="text-purple-500" />,
                bg: "bg-[#faf5ff]",
                desc: "Create and manage surveys and questionnaires.",
                service: "forms" as const
              },
              {
                name: "Sheets",
                icon: <Table2 size={24} className="text-emerald-500" />,
                bg: "bg-[#ecfdf5]",
                desc: "Spreadsheets for data analysis and tracking.",
                service: "sheets" as const
              },
            ]).map((tool) => (
              <div
                key={tool.name}
                className="cursor-pointer rounded-[20px] border border-transparent p-5 shadow-[0_2px_8px_rgba(16,24,40,0.07)] transition-all hover:shadow-[0_6px_14px_rgba(16,24,40,0.10)] sm:p-6"
                onClick={() => openGoogleService(tool.service)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 ${tool.bg} rounded-lg flex items-center justify-center shadow-[0_2px_6px_rgba(16,24,40,0.04)] flex-shrink-0`}
                  >
                    {tool.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {tool.name}
                    </h4>
                    <p className="text-sm text-gray-600">{tool.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AkadVerse Hub */}
        <div className="relative mb-12 overflow-y-scroll rounded-3xl bg-[#0f172b] p-5 shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] sm:p-8 h-50 lg:h-[500px]" >
          <div className="absolute right-0 top-0 h-40 w-40 px-4 pt-6 opacity-10 sm:h-64 sm:w-64 sm:pt-8 sm:pr-8">
            <Play size={192} className="text-white" />
          </div>

          <div className="relative mb-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Play size={16} className="text-white fill-white" />
            </div>
            <h2 className="text-xl tracking-tight sm:text-2xl">
              <span className="font-bold text-white">AkadVerse </span>
              <span className="font-normal text-[#90a1b9]">Hub</span>
            </h2>
          </div>

          <div className="mb-8 relative">
            <h3 className="mb-4 text-lg font-semibold text-[#e2e8f0]">
              Relating to your course
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {courseVideos.map((video, index) => (
                <div key={index} className="cursor-pointer group">
                  <div className="relative mb-3 h-44 overflow-hidden rounded-[14px] border border-[#314158] bg-[#1d293d] md:h-[180px]">
                    <img
                      src={video.image}
                      alt={video.title}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded-lg">
                      <span className="text-xs font-medium text-white">
                        {video.duration}
                      </span>
                    </div>
                  </div>
                  <p className="text-base font-medium text-white mb-1">
                    {video.title}
                  </p>
                  <p className="text-sm text-[#90a1b9]">
                    {video.views} • Recommended
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <h3 className="text-lg font-semibold text-[#e2e8f0] mb-4">
              Career & Future Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {careerVideos.map((video, index) => (
                <div key={index} className="cursor-pointer group">
                  <div className="relative mb-3 h-44 overflow-hidden rounded-[14px] border border-[#314158] bg-[#1d293d] md:h-[180px]">
                    <img
                      src={video.image}
                      alt={video.title}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded-lg">
                      <span className="text-xs font-medium text-white">
                        {video.duration}
                      </span>
                    </div>
                  </div>
                  <p className="text-base font-medium text-white mb-1">
                    {video.title}
                  </p>
                  <p className="text-sm text-[#90a1b9]">
                    {video.views} • Recommended
                  </p>
                </div>
              ))}
            </div>
          </div>

                    <div className="relative">
            <h3 className="text-lg font-semibold text-[#e2e8f0] mb-4">
              Career & Future Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {careerVideos.map((video, index) => (
                <div key={index} className="cursor-pointer group">
                  <div className="relative mb-3 h-44 overflow-hidden rounded-[14px] border border-[#314158] bg-[#1d293d] md:h-[180px]">
                    <img
                      src={video.image}
                      alt={video.title}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded-lg">
                      <span className="text-xs font-medium text-white">
                        {video.duration}
                      </span>
                    </div>
                  </div>
                  <p className="text-base font-medium text-white mb-1">
                    {video.title}
                  </p>
                  <p className="text-sm text-[#90a1b9]">
                    {video.views} • Recommended
                  </p>
                </div>
              ))}
            </div>
          </div>

                    <div className="relative">
            <h3 className="text-lg font-semibold text-[#e2e8f0] mb-4">
              Career & Future Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {careerVideos.map((video, index) => (
                <div key={index} className="cursor-pointer group">
                  <div className="relative mb-3 h-44 overflow-hidden rounded-[14px] border border-[#314158] bg-[#1d293d] md:h-[180px]">
                    <img
                      src={video.image}
                      alt={video.title}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded-lg">
                      <span className="text-xs font-medium text-white">
                        {video.duration}
                      </span>
                    </div>
                  </div>
                  <p className="text-base font-medium text-white mb-1">
                    {video.title}
                  </p>
                  <p className="text-sm text-[#90a1b9]">
                    {video.views} • Recommended
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Work Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Recent Work
          </h2>
          <div className="overflow-hidden rounded-[20px] border border-transparent shadow-[0_2px_8px_rgba(16,24,40,0.07)]">
            {recentWork.map((item, index) => (
              <div
                key={item.id}
                className={`cursor-pointer p-4 transition-colors hover:bg-gray-50 sm:flex sm:items-center sm:justify-between sm:p-6 ${index !== recentWork.length - 1
                  ? "border-b border-gray-100"
                  : ""
                  }`}
              >
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-gray-400" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 hover:text-blue-600 transition">
                      {item.title}
                    </h4>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{item.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
