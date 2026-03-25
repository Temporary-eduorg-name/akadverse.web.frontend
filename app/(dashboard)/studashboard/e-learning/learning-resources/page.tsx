"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BellDot,
  Book,
  BookOpen,
  Building2,
  Code,
  ExternalLink,
  GraduationCap,
  Languages,
  Lightbulb,
  Linkedin,
  LogOut,
  Network,
  Search,
  Sparkles,
  University,
  User,
  Video,
  WandSparkles,
  X,
} from "lucide-react";

type Resource = {
  key: string;
  title: string;
  tagline: string;
  summary: string;
  description: string;
  url: string;
  gradient: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const resources: Resource[] = [
  {
    key: "coursera",
    title: "Coursera",
    tagline: "Learn from world-class universities",
    summary:
      "Learn from world-class universities and companies with thousands of courses.",
    description:
      "Access thousands of courses from top universities and companies worldwide. From computer science to business, arts to engineering, Coursera offers professional certificates and degree programs that fit your schedule.",
    url: "https://www.coursera.org",
    gradient: "linear-gradient(135deg, #0056D2 0%, #0073e6 100%)",
    icon: GraduationCap,
  },
  {
    key: "udemy",
    title: "Udemy",
    tagline: "Learn anything, anywhere",
    summary:
      "Access 200,000+ courses taught by expert instructors on any topic.",
    description:
      "With over 200,000 courses taught by expert instructors, Udemy is the leading global marketplace for learning. Master new skills in development, business, design, marketing, and more at your own pace.",
    url: "https://www.udemy.com",
    gradient: "linear-gradient(135deg, #A435F0 0%, #c56cf0 100%)",
    icon: Video,
  },
  {
    key: "duolingo",
    title: "Duolingo",
    tagline: "The fun way to learn languages",
    summary: "Learn languages for free with fun, bite-sized lessons.",
    description:
      "Learn a new language for free with bite-sized lessons that feel like games. Duolingo is scientifically proven to work, with personalized learning and instant feedback to keep you motivated.",
    url: "https://www.duolingo.com",
    gradient: "linear-gradient(135deg, #58CC02 0%, #7ed957 100%)",
    icon: Languages,
  },
  {
    key: "brilliant",
    title: "Brilliant",
    tagline: "Learn by doing",
    summary:
      "Master math, science, and computer science through interactive problem solving.",
    description:
      "Build quantitative skills in math, science, and computer science through fun and challenging interactive explorations. Brilliant helps you master concepts through problem-solving, not memorization.",
    url: "https://www.brilliant.org",
    gradient: "linear-gradient(135deg, #1B1B1B 0%, #404040 100%)",
    icon: Lightbulb,
  },
  {
    key: "cisco",
    title: "Cisco Networking",
    tagline: "Build your IT career",
    summary:
      "Build networking skills with industry-leading certifications and training.",
    description:
      "Cisco Networking Academy provides IT skills and career building programs for students, educators, and professionals. Earn industry-recognized certifications like CCNA and advance your networking career.",
    url: "https://www.netacad.com",
    gradient: "linear-gradient(135deg, #049FD9 0%, #00bceb 100%)",
    icon: Network,
  },
  {
    key: "edx",
    title: "edX",
    tagline: "Quality education from the best",
    summary:
      "Access courses from Harvard, MIT, and top universities worldwide.",
    description:
      "Founded by Harvard and MIT, edX offers courses from the world's best universities and institutions. Earn certificates, professional credentials, or even online degrees from top schools.",
    url: "https://www.edx.org",
    gradient: "linear-gradient(135deg, #D23228 0%, #e74c3c 100%)",
    icon: University,
  },
  {
    key: "khan",
    title: "Khan Academy",
    tagline: "Free education for everyone",
    summary: "Free world-class education for anyone, anywhere, on any subject.",
    description:
      "Khan Academy offers practice exercises, instructional videos, and a personalized learning dashboard. Study math, science, computing, history, art, economics, and more-all completely free.",
    url: "https://www.khanacademy.org",
    gradient: "linear-gradient(135deg, #14BF96 0%, #1abc9c 100%)",
    icon: BookOpen,
  },
  {
    key: "mit",
    title: "MIT OpenCourseWare",
    tagline: "Unlocking knowledge",
    summary: "Free access to MIT's entire curriculum and course materials.",
    description:
      "MIT OpenCourseWare is a free publication of MIT course materials. Access lecture notes, exams, videos, and assignments from virtually all MIT courses-no registration required.",
    url: "https://ocw.mit.edu",
    gradient: "linear-gradient(135deg, #A31F34 0%, #c0392b 100%)",
    icon: Building2,
  },
  {
    key: "linkedin",
    title: "LinkedIn Learning",
    tagline: "Grow your skills",
    summary:
      "Develop business, tech, and creative skills with expert-led courses.",
    description:
      "LinkedIn Learning offers video courses taught by industry experts in software, creative, and business skills. Personalized course recommendations help you achieve your professional goals.",
    url: "https://www.linkedin.com/learning",
    gradient: "linear-gradient(135deg, #0077B5 0%, #0099e5 100%)",
    icon: Linkedin,
  },
  {
    key: "scholar",
    title: "Google Scholar",
    tagline: "Stand on the shoulders of giants",
    summary: "Search scholarly literature across many disciplines and sources.",
    description:
      "Google Scholar provides a simple way to broadly search for scholarly literature. Search across many disciplines and sources: articles, theses, books, abstracts, and court opinions.",
    url: "https://scholar.google.com",
    gradient: "linear-gradient(135deg, #F4B400 0%, #f39c12 100%)",
    icon: Search,
  },
  {
    key: "gemini",
    title: "Gemini",
    tagline: "Your AI learning companion",
    summary: "Google's most capable AI model for learning and exploration.",
    description:
      "Gemini is Google's most capable AI model, designed to help you learn, create, and explore. Ask questions, get explanations, brainstorm ideas, and accelerate your learning journey.",
    url: "https://gemini.google.com",
    gradient: "linear-gradient(135deg, #8E44AD 0%, #9b59b6 100%)",
    icon: WandSparkles,
  },
  {
    key: "freecodecamp",
    title: "freeCodeCamp",
    tagline: "Learn to code for free",
    summary:
      "Learn to code for free with interactive lessons and certifications.",
    description:
      "freeCodeCamp is a nonprofit community that helps you learn to code by building projects. Earn free verified certifications in responsive web design, JavaScript, data visualization, and more.",
    url: "https://www.freecodecamp.org",
    gradient: "linear-gradient(135deg, #0A0A23 0%, #2c3e50 100%)",
    icon: Code,
  },
];

const Page = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeResource, setActiveResource] = useState<Resource | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const filteredResources = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return resources;
    }

    return resources.filter((resource) => {
      return (
        resource.title.toLowerCase().includes(q) ||
        resource.tagline.toLowerCase().includes(q) ||
        resource.summary.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveResource(null);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight,
      });
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = activeResource ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [activeResource]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(135deg,#f5f7fa_0%,#e4e8ec_50%,#f0f4f8_100%)] font-sans">
      <div className="pointer-events-none fixed inset-0 z-0">
        {[...Array(8)].map((_, index) => {
          const base = [
            { left: 10, top: 20, size: 20, delay: 0 },
            { left: 20, top: 80, size: 15, delay: 2 },
            { left: 60, top: 40, size: 25, delay: 4 },
            { left: 90, top: 60, size: 18, delay: 6 },
            { left: 30, top: 10, size: 12, delay: 8 },
            { left: 70, top: 90, size: 22, delay: 10 },
            { left: 50, top: 50, size: 16, delay: 12 },
            { left: 80, top: 20, size: 14, delay: 14 },
          ][index];

          const speed = (index + 1) * 0.5;
          const xOffset = (mousePosition.x - 0.5) * speed * 30;
          const yOffset = (mousePosition.y - 0.5) * speed * 30;

          return (
            <span
              key={`particle-${base.left}-${base.top}`}
              className="absolute rounded-full bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] opacity-10"
              style={{
                left: `${base.left}%`,
                top: `${base.top}%`,
                width: `${base.size}px`,
                height: `${base.size}px`,
                animation: `float 15s infinite ease-in-out ${base.delay}s`,
                transform: `translate(${xOffset}px, ${yOffset}px)`,
              }}
            />
          );
        })}
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
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
              placeholder="Search platforms..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
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
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 md:py-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Page Title */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-[70px] w-[70px] items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#43cea2_0%,#185a9d_100%)] shadow-[0_15px_35px_rgba(67,206,162,0.3)] animate-[pulseBox_3s_ease-in-out_infinite]">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-[linear-gradient(135deg,#43cea2_0%,#185a9d_100%)] md:text-5xl">
            Learning Resources
          </h1>
          <p className="text-slate-500 text-lg">
            Explore the world&apos;s best educational platforms in one place.
          </p>
          <p className="text-slate-400 text-sm mt-2">
            Hover over cards to discover, click to explore
          </p>
          <div className="mx-auto mt-6 h-1 w-16 rounded bg-[linear-gradient(135deg,#43cea2_0%,#185a9d_100%)]" />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [perspective:1000px]">
          {filteredResources.map((resource) => {
            const Icon = resource.icon;

            return (
              <button
                type="button"
                key={resource.key}
                onClick={() => setActiveResource(resource)}
                className="flashcard group relative h-[200px] w-full cursor-pointer text-left"
                aria-label={`Open ${resource.title} details`}
              >
                <div className="flashcard-inner relative h-full w-full rounded-[20px] transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[20px] border border-white/80 bg-white p-6 text-center shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-shadow duration-300 [backface-visibility:hidden] group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                    <div
                      className="relative mb-4 flex h-[70px] w-[70px] items-center justify-center rounded-[18px] shadow-[0_10px_30px_rgba(15,23,42,0.18)]"
                      style={{ background: resource.gradient }}
                    >
                      <span
                        className="absolute inset-0 -z-10 rounded-[18px] blur-[15px] opacity-60 animate-[iconGlow_3s_ease-in-out_infinite]"
                        style={{ background: resource.gradient }}
                      />
                      <Icon
                        size={32}
                        className="text-white animate-[iconBounce_2s_ease-in-out_infinite]"
                      />
                    </div>
                    <h3 className="mb-2 text-base font-semibold text-slate-800">
                      {resource.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Sparkles
                        size={12}
                        className="animate-[sparkle_1.5s_infinite]"
                      />{" "}
                      Hover to flip
                    </span>
                  </div>

                  <div className="absolute inset-0 flex [transform:rotateY(180deg)] flex-col items-center justify-center rounded-[20px] border border-white/80 bg-[linear-gradient(135deg,#f8fafc_0%,#f1f5f9_100%)] p-6 text-center shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-shadow duration-300 [backface-visibility:hidden] group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                    <p className="text-sm leading-relaxed text-slate-600">
                      {resource.summary}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-500">
                      Click to learn more{" "}
                      <ExternalLink
                        size={14}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {filteredResources.length === 0 && (
          <div className="mt-10 rounded-2xl bg-white/70 p-8 text-center text-slate-500 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
            No resource matched "{searchQuery}".
          </div>
        )}

        <footer className="mt-14 text-center text-sm text-slate-400">
          Made with love for lifelong learners
        </footer>
      </div>

      {activeResource && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-md"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setActiveResource(null);
            }
          }}
          role="presentation"
        >
          <div className="relative w-full max-w-[480px] rounded-[24px] bg-white p-8 shadow-[0_25px_80px_rgba(0,0,0,0.25)] animate-[modalIn_300ms_ease-out] sm:p-10">
            <button
              type="button"
              onClick={() => setActiveResource(null)}
              aria-label="Close modal"
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:rotate-90 hover:bg-slate-200 hover:text-slate-900"
            >
              <X size={14} />
            </button>

            <div
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[20px] shadow-[0_15px_40px_rgba(0,0,0,0.15)]"
              style={{ background: activeResource.gradient }}
            >
              <activeResource.icon size={38} className="text-white" />
            </div>

            <h2 className="text-center text-2xl font-bold text-slate-800">
              {activeResource.title}
            </h2>
            <p className="mt-2 text-center text-sm text-blue-500">
              {activeResource.tagline}
            </p>
            <p className="mt-5 px-2 text-center text-sm leading-7 text-slate-500">
              {activeResource.description}
            </p>

            <a
              href={activeResource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-[14px] px-6 py-4 text-base font-semibold text-white transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)]"
              style={{ background: activeResource.gradient }}
            >
              Take me to {activeResource.title} <ExternalLink size={15} />
            </a>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          25% {
            transform: translateY(-30px) translateX(20px) rotate(90deg);
          }
          50% {
            transform: translateY(-20px) translateX(-20px) rotate(180deg);
          }
          75% {
            transform: translateY(-40px) translateX(10px) rotate(270deg);
          }
        }

        @keyframes pulseBox {
          0%,
          100% {
            transform: scale(1);
            box-shadow: 0 15px 35px rgba(67, 206, 162, 0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 20px 45px rgba(67, 206, 162, 0.4);
          }
        }

        @keyframes iconGlow {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
        }

        @keyframes iconBounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes sparkle {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.85);
          }
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Page;
