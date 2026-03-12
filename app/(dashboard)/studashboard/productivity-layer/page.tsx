"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Book,
  Search,
  BellDot,
  User,
  LogOut,
  ArrowLeft,
  Bot,
  FileText,
  Folder,
  ListChecks,
  Table2,
  Play,
} from "lucide-react";

const Page = () => {
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Book size={28} className="text-blue-600" />
            <span className="text-lg font-semibold text-blue-600">
              AkadVerse
            </span>
          </div>
          <div className="flex-1 max-w-sm mx-6 relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search resources..."
              className="w-full pl-12 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-6">
            <button
              className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
              aria-label="Notifications"
            >
              <BellDot size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                Student Profile
              </span>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-blue-600" />
              </div>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Back to login"
              onClick={() => router.push("/login")}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Workspaces</span>
        </button>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Productivity Layer
          </h1>
          <p className="text-gray-600">
            Tools for research, writing, and organization.
          </p>
        </div>

        {/* Gemni Chat and Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Gemni Chat Card */}
          <div className="p-10 border border-transparent rounded-[20px] shadow-[0_2px_8px_rgba(16,24,40,0.07)] hover:shadow-[0_6px_14px_rgba(16,24,40,0.10)] transition-all cursor-pointer">
            <div className="w-20 h-20 bg-gradient-to-br from-[#615FFF] to-[#4F4BC4] rounded-[18px] flex items-center justify-center mb-8 shadow-[0_4px_12px_rgba(97,95,255,0.3)]">
              <Bot size={40} className="text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Gemni Chat
            </h3>
            <p className="text-base text-gray-600 leading-relaxed mb-8">
              AI chat, research assistant, note summarizer, study planner. Your
              primary companion for academic productivity.
            </p>
            <div className="flex gap-4">
              <button className="px-4 py-1 text-sm bg-[#615FFF] text-white font-normal rounded-full hover:bg-[#4F4BC4] transition-colors">
                Featured
              </button>
              <button className="px-4 py-1 text-sm bg-white text-[#615FFF] font-normal border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                New Chat
              </button>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="space-y-4">
            {[
              {
                name: "Docs",
                icon: <FileText size={24} className="text-blue-500" />,
                bg: "bg-[#eff6ff]",
                desc: "Collaborative documents for assignments and notes.",
              },
              {
                name: "Drive",
                icon: <Folder size={24} className="text-amber-500" />,
                bg: "bg-[#fffbeb]",
                desc: "Upload, organize, and manage research files.",
              },
              {
                name: "Forms",
                icon: <ListChecks size={24} className="text-purple-500" />,
                bg: "bg-[#faf5ff]",
                desc: "Create and manage surveys and questionnaires.",
              },
              {
                name: "Sheets",
                icon: <Table2 size={24} className="text-emerald-500" />,
                bg: "bg-[#ecfdf5]",
                desc: "Spreadsheets for data analysis and tracking.",
              },
            ].map((tool) => (
              <div
                key={tool.name}
                className="p-6 border border-transparent rounded-[20px] shadow-[0_2px_8px_rgba(16,24,40,0.07)] hover:shadow-[0_6px_14px_rgba(16,24,40,0.10)] transition-all cursor-pointer"
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
        <div className="bg-[#0f172b] rounded-3xl shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] p-8 mb-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pt-8 pr-8">
            <Play size={192} className="text-white" />
          </div>

          <div className="flex items-center gap-3 mb-8 relative">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Play size={16} className="text-white fill-white" />
            </div>
            <h2 className="text-2xl tracking-tight">
              <span className="font-bold text-white">AkadVerse </span>
              <span className="font-normal text-[#90a1b9]">Hub</span>
            </h2>
          </div>

          <div className="mb-8 relative">
            <h3 className="text-lg font-semibold text-[#e2e8f0] mb-4">
              Relating to your course
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {courseVideos.map((video, index) => (
                <div key={index} className="cursor-pointer group">
                  <div className="relative bg-[#1d293d] border border-[#314158] rounded-[14px] h-[180px] overflow-hidden mb-3">
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
                  <div className="relative bg-[#1d293d] border border-[#314158] rounded-[14px] h-[180px] overflow-hidden mb-3">
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
          <div className="border border-transparent rounded-[20px] shadow-[0_2px_8px_rgba(16,24,40,0.07)] overflow-hidden">
            {recentWork.map((item, index) => (
              <div
                key={item.id}
                className={`p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer ${
                  index !== recentWork.length - 1
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
