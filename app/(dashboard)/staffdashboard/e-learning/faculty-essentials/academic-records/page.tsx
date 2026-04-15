"use client";

import { ArrowRight, FolderCog, FolderPlus } from "lucide-react";
import { useRouter } from "next/navigation";

const actionCards = [
  {
    title: "Create New Collection",
    description:
      "Initialize a fresh repository structure and define metadata requirements.",
    buttonLabel: "Launch Creation Wizard",
    path: "/staffdashboard/e-learning/faculty-essentials/academic-records/manage-archive/create-collection",
    icon: FolderPlus,
    iconClassName: "text-[#2f4fc2]",
  },
  {
    title: "Manage Collections",
    description:
      "Review active document sets and modify access permissions.",
    buttonLabel: "View Active Collections",
    path: "/staffdashboard/e-learning/faculty-essentials/academic-records/manage-archive/manage-archive",
    icon: FolderCog,
    iconClassName: "text-[#3f4e69]",
  },
];

export default function FacultyEssentialsAcademicRecordsPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-10">
      <section className="max-w-[920px]">
        <h1 className="text-[27px] leading-[1.02] tracking-[-0.05em] text-[#151d35]">
          Document Collections
        </h1>
        <p className="mt-6 max-w-[980px] text-[15px] leading-[1.65] text-[#62738f]">
          Securely organize and manage academic document repositories for
          certifications, research outcomes, and department-wide syllabus
          tracking.
        </p>
      </section>

      <section className="mt-16 grid gap-8 xl:grid-cols-2">
        {actionCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="rounded-[26px] border border-[#dce3ef] bg-white px-15 py-12 shadow-[0_6px_20px_rgba(15,23,42,0.03)]"
            >
              <div className="flex h-[43px] w-[43px] items-center justify-center rounded-[20px] bg-[#eff3fb]">
                <Icon
                  className={`h-11 w-11 ${card.iconClassName}`}
                  strokeWidth={1.9}
                />
              </div>

              <h2 className="mt-14 text-[20px] font-black tracking-[-0.04em] text-[#151d35]">
                {card.title}
              </h2>
              <p className="mt-5 max-w-[560px] text-[15px] leading-[1.6] text-[#647791]">
                {card.description}
              </p>

              <button
                type="button"
                onClick={() => router.push(card.path)}
                className="mt-14 inline-flex items-center justify-center gap-3 rounded-[6px] bg-[#2949b9] px-4 py-5 text-[14px] text-white shadow-[0_12px_24px_rgba(41,73,185,0.25)] transition hover:bg-[#233fa1]"
              >
                {card.buttonLabel}
                <ArrowRight className="h-5 w-5" />
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
}
