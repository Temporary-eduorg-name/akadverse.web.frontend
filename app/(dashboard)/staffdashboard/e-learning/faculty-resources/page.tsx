"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ExternalLink,
  FileSearch,
  GraduationCap,
  Library,
  MonitorPlay,
  Network,
  NotebookTabs,
  PencilRuler,
  Search,
  Sparkles,
  Users,
  WandSparkles,
  X,
} from "lucide-react";
import StaffDashboardShell from "@/app/components/dashboard/staff/StaffDashboardShell";

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
    key: "google-scholar",
    title: "Google Scholar",
    tagline: "Search scholarly literature fast",
    summary: "Track papers, citations, and current academic conversations.",
    description:
      "Google Scholar helps faculty discover papers, theses, books, and citations across disciplines while staying close to mainstream research discovery workflows.",
    url: "https://scholar.google.com",
    gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    icon: Search,
  },
  {
    key: "jstor",
    title: "JSTOR",
    tagline: "Deep academic archive access",
    summary: "A trusted archive for journals, books, and primary-source research.",
    description:
      "JSTOR is especially useful for faculty looking for durable scholarly references, archived journals, and course-reading source material.",
    url: "https://www.jstor.org",
    gradient: "linear-gradient(135deg, #0f766e 0%, #115e59 100%)",
    icon: Library,
  },
  {
    key: "eric",
    title: "ERIC",
    tagline: "Education research database",
    summary: "Useful for pedagogy, curriculum design, and classroom research.",
    description:
      "ERIC gives faculty access to education-focused papers, reports, and evidence-backed instructional resources.",
    url: "https://eric.ed.gov",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
    icon: GraduationCap,
  },
  {
    key: "acm",
    title: "ACM Digital Library",
    tagline: "Computing research at depth",
    summary: "Strong for software engineering, HCI, and computer science research.",
    description:
      "The ACM Digital Library is a high-value resource for faculty teaching and researching computing and software systems.",
    url: "https://dl.acm.org",
    gradient: "linear-gradient(135deg, #111827 0%, #374151 100%)",
    icon: MonitorPlay,
  },
  {
    key: "ieee",
    title: "IEEE Xplore",
    tagline: "Engineering and technology papers",
    summary: "Access engineering conference papers, standards, and journals.",
    description:
      "IEEE Xplore is especially strong for electrical engineering, networking, AI, embedded systems, and systems research.",
    url: "https://ieeexplore.ieee.org",
    gradient: "linear-gradient(135deg, #0f4c81 0%, #2563eb 100%)",
    icon: Network,
  },
  {
    key: "springer",
    title: "SpringerLink",
    tagline: "Books and journals for course prep",
    summary: "Useful for finding textbooks, reference chapters, and journal articles.",
    description:
      "SpringerLink gives faculty access to journals and book chapters that are helpful for lecture preparation and reading lists.",
    url: "https://link.springer.com",
    gradient: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
    icon: BookOpen,
  },
  {
    key: "scopus",
    title: "Scopus",
    tagline: "Track impact and citations",
    summary: "Find authors, institutions, and citation trends across research fields.",
    description:
      "Scopus is useful for tracking research impact, cross-disciplinary references, and publication visibility.",
    url: "https://www.scopus.com",
    gradient: "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)",
    icon: FileSearch,
  },
  {
    key: "zotero",
    title: "Zotero",
    tagline: "Reference management for academics",
    summary: "Collect, organize, cite, and share references with ease.",
    description:
      "Zotero helps faculty manage citations, collaborate on reading collections, and keep research sources tidy.",
    url: "https://www.zotero.org",
    gradient: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
    icon: NotebookTabs,
  },
  {
    key: "overleaf",
    title: "Overleaf",
    tagline: "Collaborative academic writing",
    summary: "Write papers, reports, and structured teaching documents with LaTeX.",
    description:
      "Overleaf is useful for faculty preparing publication-ready papers, lab manuals, and mathematically heavy course materials.",
    url: "https://www.overleaf.com",
    gradient: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
    icon: PencilRuler,
  },
  {
    key: "coursera",
    title: "Coursera",
    tagline: "Faculty upskilling and course ideas",
    summary: "A useful place to benchmark modern course content and learn new tools.",
    description:
      "Faculty can use Coursera for professional growth, comparative curriculum scanning, and continuing education.",
    url: "https://www.coursera.org",
    gradient: "linear-gradient(135deg, #0056D2 0%, #0073e6 100%)",
    icon: GraduationCap,
  },
  {
    key: "miro",
    title: "Miro",
    tagline: "Collaborative teaching boards",
    summary: "Run workshops, planning sessions, and interactive classroom collaboration.",
    description:
      "Miro is useful for lesson planning, visual facilitation, and collaborative class exercises in hybrid or online settings.",
    url: "https://miro.com",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    icon: Users,
  },
  {
    key: "notion",
    title: "Notion",
    tagline: "Organize course operations",
    summary: "Manage course plans, research notes, and faculty workflows in one place.",
    description:
      "Notion can support faculty dashboards, curriculum planning, reading lists, supervision notes, and committee work.",
    url: "https://www.notion.so",
    gradient: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
    icon: WandSparkles,
  },
];

export default function FacultyResourcesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeResource, setActiveResource] = useState<Resource | null>(null);

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

  return (
    <StaffDashboardShell contentClassName="bg-[#f8f9fc] px-4 py-6 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-[70px] w-[70px] items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#43cea2_0%,#185a9d_100%)] shadow-[0_15px_35px_rgba(67,206,162,0.3)]">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="mb-3 bg-[linear-gradient(135deg,#43cea2_0%,#185a9d_100%)] bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
            Faculty Resources
          </h1>
          <p className="text-lg text-slate-500">
            Curated resources to help faculty teach, research, publish, and stay productive.
          </p>
          <div className="mx-auto mt-6 h-1 w-16 rounded bg-[linear-gradient(135deg,#43cea2_0%,#185a9d_100%)]" />
        </div>

        <div className="mx-auto mb-8 max-w-xl rounded-2xl border border-[#dbe4ef] bg-white p-3 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search faculty resources"
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredResources.map((resource) => {
            const Icon = resource.icon;

            return (
              <button
                type="button"
                key={resource.key}
                onClick={() => setActiveResource(resource)}
                className="group relative h-[200px] w-full cursor-pointer text-left"
                aria-label={`Open ${resource.title} details`}
              >
                <div className="relative flex h-full w-full flex-col items-center justify-center rounded-[20px] border border-white/80 bg-white p-6 text-center shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                  <div
                    className="relative mb-4 flex h-[70px] w-[70px] items-center justify-center rounded-[18px] shadow-[0_10px_30px_rgba(15,23,42,0.18)]"
                    style={{ background: resource.gradient }}
                  >
                    <Icon size={32} className="text-white" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-slate-800">
                    {resource.title}
                  </h3>
                  <p className="text-xs text-slate-500">{resource.tagline}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs text-blue-500">
                    <Sparkles size={12} />
                    Open details
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {filteredResources.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-white p-8 text-center text-slate-500 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
            No resource matched "{searchQuery}".
          </div>
        ) : null}

        {activeResource ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-md"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setActiveResource(null);
              }
            }}
            role="presentation"
          >
            <div className="relative w-full max-w-[480px] rounded-[24px] bg-white p-8 shadow-[0_25px_80px_rgba(0,0,0,0.25)] sm:p-10">
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
        ) : null}
      </div>
    </StaffDashboardShell>
  );
}
