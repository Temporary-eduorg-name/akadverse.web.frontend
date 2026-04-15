"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Plus,
  Save,
  Trash2,
  Users,
} from "lucide-react";
import ArchiveTabs from "../_components/ArchiveTabs";
import {
  DocumentCollection,
  RequirementRow,
  computeCollectionState,
  createCollectionId,
  formatDateRange,
  getDocumentCollections,
  toPercent,
  upsertDocumentCollection,
} from "../_lib/collectionStore";

type RequirementDraft = RequirementRow;

type CollectionFormState = {
  title: string;
  level: string;
  department: string;
  program: string;
  targetGroupsText: string;
  startDateTime: string;
  endDateTime: string;
  totalMembers: string;
  submittedCount: string;
  lifecycle: "active" | "draft" | "archived";
  requirements: RequirementDraft[];
};

const EMPTY_FORM: CollectionFormState = {
  title: "",
  level: "",
  department: "",
  program: "",
  targetGroupsText: "",
  startDateTime: "",
  endDateTime: "",
  totalMembers: "0",
  submittedCount: "0",
  lifecycle: "draft",
  requirements: [{ id: "r-1", name: "", fileType: "PDF", maxSize: "5 MB" }],
};

function toFormState(collection: DocumentCollection): CollectionFormState {
  return {
    title: collection.title,
    level: collection.level,
    department: collection.department,
    program: collection.program,
    targetGroupsText: collection.targetGroups.join(", "),
    startDateTime: collection.startDateTime,
    endDateTime: collection.endDateTime,
    totalMembers: String(collection.totalMembers),
    submittedCount: String(collection.submittedCount),
    lifecycle: collection.lifecycle,
    requirements:
      collection.requirements.length > 0
        ? collection.requirements
        : [{ id: "r-1", name: "", fileType: "PDF", maxSize: "5 MB" }],
  };
}

function toCollectionPayload(
  form: CollectionFormState,
  existingId?: string,
): DocumentCollection {
  const nowIso = new Date().toISOString();

  const sanitizedRequirements = form.requirements
    .map((item, index) => ({
      id: item.id || `req-${index + 1}`,
      name: item.name.trim(),
      fileType: item.fileType.trim() || "PDF",
      maxSize: item.maxSize.trim() || "5 MB",
    }))
    .filter((item) => item.name.length > 0);

  return {
    id: existingId ?? createCollectionId(form.title || "collection"),
    title: form.title.trim() || "Untitled Collection",
    level: form.level.trim() || "Not specified",
    department: form.department.trim() || "Not specified",
    program: form.program.trim() || "Not specified",
    targetGroups: form.targetGroupsText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    requirements:
      sanitizedRequirements.length > 0
        ? sanitizedRequirements
        : [
            {
              id: "req-1",
              name: "Required Document",
              fileType: "PDF",
              maxSize: "5 MB",
            },
          ],
    startDateTime: form.startDateTime,
    endDateTime: form.endDateTime,
    totalMembers: Number(form.totalMembers) || 0,
    submittedCount: Number(form.submittedCount) || 0,
    lifecycle: form.lifecycle,
    createdAt: nowIso,
  };
}

export default function CreateCollectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loadedCollection, setLoadedCollection] =
    useState<DocumentCollection | null>(null);
  const [form, setForm] = useState<CollectionFormState>(EMPTY_FORM);
  const [notice, setNotice] = useState<string | null>(null);

  const collectionId = searchParams.get("collectionId") ?? "";

  useEffect(() => {
    if (!collectionId) {
      setLoadedCollection(null);
      setForm(EMPTY_FORM);
      return;
    }

    const found =
      getDocumentCollections().find((item) => item.id === collectionId) ?? null;
    setLoadedCollection(found);
    setForm(found ? toFormState(found) : EMPTY_FORM);
  }, [collectionId]);

  const previewCollection = useMemo(
    () => toCollectionPayload(form, loadedCollection?.id),
    [form, loadedCollection?.id],
  );

  const previewState = computeCollectionState(previewCollection);
  const previewProgress = toPercent(
    previewCollection.submittedCount,
    previewCollection.totalMembers,
  );

  const onFieldChange = (key: keyof CollectionFormState, value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const onRequirementChange = (
    requirementId: string,
    key: keyof RequirementDraft,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      requirements: previous.requirements.map((item) =>
        item.id === requirementId ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const addRequirement = () => {
    setForm((previous) => ({
      ...previous,
      requirements: [
        ...previous.requirements,
        {
          id: `r-${Date.now()}`,
          name: "",
          fileType: "PDF",
          maxSize: "5 MB",
        },
      ],
    }));
  };

  const removeRequirement = (requirementId: string) => {
    setForm((previous) => {
      if (previous.requirements.length <= 1) {
        return previous;
      }

      return {
        ...previous,
        requirements: previous.requirements.filter(
          (item) => item.id !== requirementId,
        ),
      };
    });
  };

  const saveCollection = (nextLifecycle: "active" | "draft" | "archived") => {
    const payload = toCollectionPayload(
      { ...form, lifecycle: nextLifecycle },
      loadedCollection?.id,
    );
    upsertDocumentCollection(payload);

    setLoadedCollection(payload);
    setForm(toFormState(payload));
    setNotice(
      nextLifecycle === "draft"
        ? "Draft saved successfully."
        : "Collection saved successfully.",
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1120px] px-2 pb-16 pt-2 text-[#1f2937] sm:px-4 sm:pt-4">
      <ArchiveTabs activeTab="document-collection" />

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-[#64748b] transition-colors hover:bg-white hover:text-[#1f2937]"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          <span className="text-[13px] font-semibold">
            Back to Manage Collections
          </span>
        </button>
      </div>

      <section className="mt-5 rounded-2xl border border-[#dbe3ef] bg-white px-6 py-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[32px] font-extrabold text-[#1f2937]">
              {loadedCollection ? "Edit Collection" : "Create Collection"}
            </h1>
            <p className="mt-1 text-[14px] font-medium text-[#70819d]">
              {loadedCollection
                ? "Update this draft and continue where you left off."
                : "Set up a new collection and define submission requirements."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => saveCollection("draft")}
              className="inline-flex items-center gap-2 rounded-lg border border-[#dbe3ef] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#475569] transition hover:bg-[#f8fafc]"
            >
              <Save size={14} strokeWidth={2.4} />
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => {
                saveCollection("active");
                router.push(
                  "/staffdashboard/e-learning/faculty-essentials/academic-records/manage-archive/manage-archive",
                );
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#294fbf] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#2342a1]"
            >
              Publish Collection
            </button>
          </div>
        </div>

        {notice ? (
          <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#eef2ff] px-3 py-2 text-[12px] font-semibold text-[#294fbf]">
            <Save size={13} strokeWidth={2.4} />
            {notice}
          </p>
        ) : null}
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-[#dbe3ef] bg-white px-5 py-5 shadow-sm">
          <h2 className="text-[18px] font-extrabold text-[#1f2937]">
            Collection Details
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-[12px] font-semibold text-[#64748b]">
                Collection Name
              </span>
              <input
                value={form.title}
                onChange={(event) => onFieldChange("title", event.target.value)}
                className="h-10 w-full rounded-lg border border-[#dbe3ef] px-3 text-[14px] font-medium text-[#334155] outline-none focus:border-[#94a3b8]"
                placeholder="HOD"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[12px] font-semibold text-[#64748b]">
                Level
              </span>
              <input
                value={form.level}
                onChange={(event) => onFieldChange("level", event.target.value)}
                className="h-10 w-full rounded-lg border border-[#dbe3ef] px-3 text-[14px] font-medium text-[#334155] outline-none focus:border-[#94a3b8]"
                placeholder="300 Level"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[12px] font-semibold text-[#64748b]">
                Department
              </span>
              <input
                value={form.department}
                onChange={(event) =>
                  onFieldChange("department", event.target.value)
                }
                className="h-10 w-full rounded-lg border border-[#dbe3ef] px-3 text-[14px] font-medium text-[#334155] outline-none focus:border-[#94a3b8]"
                placeholder="Civil Engineering"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[12px] font-semibold text-[#64748b]">
                Program
              </span>
              <input
                value={form.program}
                onChange={(event) =>
                  onFieldChange("program", event.target.value)
                }
                className="h-10 w-full rounded-lg border border-[#dbe3ef] px-3 text-[14px] font-medium text-[#334155] outline-none focus:border-[#94a3b8]"
                placeholder="B.Sc Civil Engineering"
              />
            </label>

            <label className="space-y-1 md:col-span-2">
              <span className="text-[12px] font-semibold text-[#64748b]">
                Target Groups (comma separated)
              </span>
              <input
                value={form.targetGroupsText}
                onChange={(event) =>
                  onFieldChange("targetGroupsText", event.target.value)
                }
                className="h-10 w-full rounded-lg border border-[#dbe3ef] px-3 text-[14px] font-medium text-[#334155] outline-none focus:border-[#94a3b8]"
                placeholder="300 lvl, Civil, CIVE"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[12px] font-semibold text-[#64748b]">
                Start Date
              </span>
              <input
                type="datetime-local"
                value={form.startDateTime}
                onChange={(event) =>
                  onFieldChange("startDateTime", event.target.value)
                }
                className="h-10 w-full rounded-lg border border-[#dbe3ef] px-3 text-[14px] font-medium text-[#334155] outline-none focus:border-[#94a3b8]"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[12px] font-semibold text-[#64748b]">
                End Date
              </span>
              <input
                type="datetime-local"
                value={form.endDateTime}
                onChange={(event) =>
                  onFieldChange("endDateTime", event.target.value)
                }
                className="h-10 w-full rounded-lg border border-[#dbe3ef] px-3 text-[14px] font-medium text-[#334155] outline-none focus:border-[#94a3b8]"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[12px] font-semibold text-[#64748b]">
                Total Members
              </span>
              <input
                type="number"
                min={0}
                value={form.totalMembers}
                onChange={(event) =>
                  onFieldChange("totalMembers", event.target.value)
                }
                className="h-10 w-full rounded-lg border border-[#dbe3ef] px-3 text-[14px] font-medium text-[#334155] outline-none focus:border-[#94a3b8]"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[12px] font-semibold text-[#64748b]">
                Submitted Count
              </span>
              <input
                type="number"
                min={0}
                value={form.submittedCount}
                onChange={(event) =>
                  onFieldChange("submittedCount", event.target.value)
                }
                className="h-10 w-full rounded-lg border border-[#dbe3ef] px-3 text-[14px] font-medium text-[#334155] outline-none focus:border-[#94a3b8]"
              />
            </label>
          </div>
        </article>

        <article className="rounded-2xl border border-[#dbe3ef] bg-white px-5 py-5 shadow-sm">
          <h2 className="text-[18px] font-extrabold text-[#1f2937]">
            Live Preview
          </h2>

          <div className="mt-4 rounded-xl border border-[#e4eaf3] bg-[#f8fafc] p-4">
            <h3 className="text-[20px] font-extrabold text-[#1f2937]">
              {previewCollection.title}
            </h3>
            <p className="mt-1 text-[12px] font-semibold text-[#64748b]">
              {previewCollection.level} • {previewCollection.department}
            </p>
            <p className="mt-1 inline-flex items-center gap-2 text-[12px] font-semibold text-[#64748b]">
              <CalendarDays size={13} strokeWidth={2.3} />
              {previewCollection.startDateTime && previewCollection.endDateTime
                ? formatDateRange(
                    previewCollection.startDateTime,
                    previewCollection.endDateTime,
                  )
                : "Date range not set"}
            </p>
            <p className="mt-1 inline-flex items-center gap-2 text-[12px] font-semibold text-[#64748b]">
              <Users size={13} strokeWidth={2.3} />
              {previewCollection.submittedCount}/
              {previewCollection.totalMembers} Submitted
            </p>

            <div className="mt-3 h-[6px] rounded-full bg-[#dbe3ef]">
              <div
                className="h-full rounded-full bg-[#294fbf]"
                style={{ width: `${previewProgress}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[12px] font-semibold text-[#64748b]">
              <span>{previewProgress}% Complete</span>
              <span
                className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${
                  previewState === "ongoing"
                    ? "bg-[#dcfce7] text-[#15803d]"
                    : previewState === "pending"
                      ? "bg-[#fef3c7] text-[#b45309]"
                      : previewState === "draft"
                        ? "bg-[#fee2e2] text-[#b91c1c]"
                        : "bg-[#e2e8f0] text-[#475569]"
                }`}
              >
                {previewState.toUpperCase()}
              </span>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-5 rounded-2xl border border-[#dbe3ef] bg-white px-5 py-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[18px] font-extrabold text-[#1f2937]">
            Required Documents
          </h2>
          <button
            type="button"
            onClick={addRequirement}
            className="inline-flex items-center gap-2 rounded-lg border border-[#dbe3ef] bg-white px-3 py-2 text-[12px] font-semibold text-[#475569] transition hover:bg-[#f8fafc]"
          >
            <Plus size={13} strokeWidth={2.5} />
            Add Requirement
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {form.requirements.map((item, index) => (
            <div
              key={item.id}
              className="grid gap-3 rounded-xl border border-[#e4eaf3] bg-[#f8fafc] px-4 py-4 md:grid-cols-[1.4fr_1fr_0.8fr_auto]"
            >
              <label className="space-y-1">
                <span className="text-[11px] font-semibold text-[#64748b]">
                  Document Name {index + 1}
                </span>
                <input
                  value={item.name}
                  onChange={(event) =>
                    onRequirementChange(item.id, "name", event.target.value)
                  }
                  className="h-10 w-full rounded-lg border border-[#dbe3ef] px-3 text-[13px] font-medium text-[#334155] outline-none focus:border-[#94a3b8]"
                  placeholder="Official Transcript"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[11px] font-semibold text-[#64748b]">
                  File Type
                </span>
                <input
                  value={item.fileType}
                  onChange={(event) =>
                    onRequirementChange(item.id, "fileType", event.target.value)
                  }
                  className="h-10 w-full rounded-lg border border-[#dbe3ef] px-3 text-[13px] font-medium text-[#334155] outline-none focus:border-[#94a3b8]"
                  placeholder="PDF"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[11px] font-semibold text-[#64748b]">
                  Max Size
                </span>
                <input
                  value={item.maxSize}
                  onChange={(event) =>
                    onRequirementChange(item.id, "maxSize", event.target.value)
                  }
                  className="h-10 w-full rounded-lg border border-[#dbe3ef] px-3 text-[13px] font-medium text-[#334155] outline-none focus:border-[#94a3b8]"
                  placeholder="5 MB"
                />
              </label>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeRequirement(item.id)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#fecaca] bg-[#fff1f2] text-[#be123c] transition hover:bg-[#ffe4e6]"
                >
                  <Trash2 size={14} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
