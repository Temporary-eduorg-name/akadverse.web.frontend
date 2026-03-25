"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  PlusCircle,
  Settings,
  Trash2,
  WandSparkles,
} from "lucide-react";

type DocumentRequirement = {
  id: string;
  name: string;
  fileType: string;
  maxSize: string;
};

const LEVELS = [
  "100 Level",
  "200 Level",
  "300 Level",
  "400 Level",
  "500 Level",
];
const DEPARTMENTS = ["Computer Science", "Mathematics", "Physics", "Chemistry"];
const PROGRAMS = [
  "B.Sc Computer Science",
  "B.Sc Software Engineering",
  "B.Sc Information Technology",
];
const FILE_TYPES = ["PDF", "JPG/PNG", "DOCX", "ZIP"];
const FILE_SIZES = ["2 MB", "5 MB", "10 MB", "15 MB", "20 MB"];

const initialRequirements: DocumentRequirement[] = [
  { id: "req-1", name: "Project Report", fileType: "PDF", maxSize: "5 MB" },
  {
    id: "req-2",
    name: "Official Transcripts",
    fileType: "PDF",
    maxSize: "10 MB",
  },
  {
    id: "req-3",
    name: "Government ID Card",
    fileType: "JPG/PNG",
    maxSize: "2 MB",
  },
  {
    id: "req-4",
    name: "Recommendation Letters",
    fileType: "PDF",
    maxSize: "5 MB",
  },
];

export default function StaffCreateCollectionPage() {
  const router = useRouter();
  const [collectionName, setCollectionName] = useState("");
  const [level, setLevel] = useState("");
  const [department, setDepartment] = useState("");
  const [program, setProgram] = useState("");
  const [requirements, setRequirements] = useState(initialRequirements);
  const [notice, setNotice] = useState<string | null>(null);

  const updateRequirement = (
    requirementId: string,
    key: keyof Omit<DocumentRequirement, "id">,
    value: string,
  ) => {
    setNotice(null);
    setRequirements((previous) =>
      previous.map((requirement) =>
        requirement.id === requirementId
          ? { ...requirement, [key]: value }
          : requirement,
      ),
    );
  };

  const addRequirement = () => {
    setNotice(null);
    setRequirements((previous) => [
      ...previous,
      {
        id: `req-${Date.now()}`,
        name: "",
        fileType: "PDF",
        maxSize: "5 MB",
      },
    ]);
  };

  const removeRequirement = (requirementId: string) => {
    setNotice(null);
    setRequirements((previous) =>
      previous.filter((item) => item.id !== requirementId),
    );
  };

  const saveDraft = () => {
    setNotice(
      "Draft saved in demo state. Persistent archive draft storage will be connected later.",
    );
  };

  const createCollection = () => {
    if (!collectionName.trim()) {
      setNotice(
        "Enter a collection name before creating the document collection.",
      );
      return;
    }

    if (!level || !department || !program) {
      setNotice(
        "Complete all collection parameters before creating the collection.",
      );
      return;
    }

    const hasEmptyRequirement = requirements.some((item) => !item.name.trim());
    if (hasEmptyRequirement) {
      setNotice("Each document requirement must have a document name.");
      return;
    }

    setNotice(
      "Collection created in demo mode. Backend creation flow will be connected later.",
    );
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-[#1f2937]">
      <main className="mx-auto w-full max-w-[760px] px-6 pb-12 pt-8">
        <div className="mb-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              router.push("/staffdashboard/academic-records/manage-archive/active-collections")
            }
            className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-[#64748b] transition-colors hover:bg-white hover:text-[#1f2937]"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            <span className="text-[13px] font-semibold">Back</span>
          </button>
        </div>

        <section>
          <h1 className="text-[28px] font-extrabold text-[#1f2937]">
            Create New Document Collection
          </h1>
          <p className="mt-2 text-[14px] font-medium text-[#70819d]">
            Configure the parameters and requirements for your upcoming student
            document submissions.
          </p>
        </section>

        {notice ? (
          <p className="mt-4 rounded-lg bg-[#eef2ff] px-4 py-3 text-[13px] font-semibold text-[#294fbf]">
            {notice}
          </p>
        ) : null}

        <section className="mt-6 rounded-2xl border border-[#dbe3ef] bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center gap-2 text-[16px] font-extrabold text-[#1f2937]">
            <Settings size={15} strokeWidth={2.4} className="text-[#294fbf]" />
            Collection Parameters
          </div>

          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-2 block text-[12px] font-semibold text-[#475569]">
                Collection Name
              </span>
              <input
                value={collectionName}
                onChange={(event) => setCollectionName(event.target.value)}
                placeholder="e.g. Fall 2024 Senior Thesis Submissions"
                className="h-11 w-full rounded-lg border border-[#dbe3ef] bg-[#f8fafc] px-3 text-[14px] font-medium text-[#334155] outline-none"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[12px] font-semibold text-[#475569]">
                  Level
                </span>
                <select
                  value={level}
                  onChange={(event) => setLevel(event.target.value)}
                  className="h-11 w-full rounded-lg border border-[#dbe3ef] bg-[#f8fafc] px-3 text-[14px] font-medium text-[#334155] outline-none"
                >
                  <option value="">Select Level</option>
                  {LEVELS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] font-semibold text-[#475569]">
                  Department
                </span>
                <select
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  className="h-11 w-full rounded-lg border border-[#dbe3ef] bg-[#f8fafc] px-3 text-[14px] font-medium text-[#334155] outline-none"
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-[12px] font-semibold text-[#475569]">
                Program
              </span>
              <select
                value={program}
                onChange={(event) => setProgram(event.target.value)}
                className="h-11 w-full rounded-lg border border-[#dbe3ef] bg-[#f8fafc] px-3 text-[14px] font-medium text-[#334155] outline-none"
              >
                <option value="">Select Program</option>
                {PROGRAMS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-[#dbe3ef] bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center gap-2 text-[16px] font-extrabold text-[#1f2937]">
            <FileText size={15} strokeWidth={2.4} className="text-[#294fbf]" />
            Document Requirements
          </div>

          <div className="mt-4 space-y-3">
            {requirements.map((requirement) => (
              <article
                key={requirement.id}
                className="rounded-xl border border-[#edf2f7] bg-[#f8fafc] px-3 py-3"
              >
                <div className="grid gap-3 md:grid-cols-[1.4fr_120px_120px_28px] md:items-end">
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#9aa5b5]">
                      Document Name
                    </span>
                    <input
                      value={requirement.name}
                      onChange={(event) =>
                        updateRequirement(
                          requirement.id,
                          "name",
                          event.target.value,
                        )
                      }
                      className="h-10 w-full rounded-lg border border-[#dbe3ef] bg-white px-3 text-[13px] font-medium text-[#334155] outline-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#9aa5b5]">
                      File Type
                    </span>
                    <select
                      value={requirement.fileType}
                      onChange={(event) =>
                        updateRequirement(
                          requirement.id,
                          "fileType",
                          event.target.value,
                        )
                      }
                      className="h-10 w-full rounded-lg border border-[#dbe3ef] bg-white px-3 text-[13px] font-medium text-[#334155] outline-none"
                    >
                      {FILE_TYPES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#9aa5b5]">
                      Max Size
                    </span>
                    <select
                      value={requirement.maxSize}
                      onChange={(event) =>
                        updateRequirement(
                          requirement.id,
                          "maxSize",
                          event.target.value,
                        )
                      }
                      className="h-10 w-full rounded-lg border border-[#dbe3ef] bg-white px-3 text-[13px] font-medium text-[#334155] outline-none"
                    >
                      {FILE_SIZES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={() => removeRequirement(requirement.id)}
                    className="mb-1 rounded-md p-1.5 text-[#94a3b8] transition hover:bg-white hover:text-[#64748b]"
                    aria-label="Remove requirement"
                  >
                    <Trash2 size={14} strokeWidth={2.4} />
                  </button>
                </div>
              </article>
            ))}

            <button
              type="button"
              onClick={addRequirement}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#b9c9ea] bg-white px-4 py-4 text-[14px] font-semibold text-[#294fbf] transition hover:bg-[#f8fafc]"
            >
              <PlusCircle size={15} strokeWidth={2.4} />
              Add Another Document Type
            </button>
          </div>
        </section>

        <section className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={createCollection}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#294fbf] px-5 py-4 text-[15px] font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-[#2342a1]"
          >
            Create Collection
            <WandSparkles size={15} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            onClick={saveDraft}
            className="inline-flex items-center justify-center rounded-xl border border-[#dbe3ef] bg-white px-8 py-4 text-[15px] font-semibold text-[#475569] transition hover:bg-[#f8fafc]"
          >
            Save Draft
          </button>
        </section>
      </main>
    </div>
  );
}
