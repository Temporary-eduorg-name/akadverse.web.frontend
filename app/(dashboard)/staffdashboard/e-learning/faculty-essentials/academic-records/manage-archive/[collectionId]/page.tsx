"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Save, Users } from "lucide-react";
import ArchiveTabs from "../_components/ArchiveTabs";
import {
  DocumentCollection,
  computeCollectionState,
  formatDateRange,
  getDocumentCollections,
  saveDocumentCollections,
  toPercent,
} from "../_lib/collectionStore";

export default function CollectionDetailPage() {
  const params = useParams<{ collectionId: string }>();
  const router = useRouter();
  const [collection, setCollection] = useState<DocumentCollection | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const found = getDocumentCollections().find(
      (item) => item.id === params.collectionId,
    );
    setCollection(found ?? null);
  }, [params.collectionId]);

  const state = useMemo(() => {
    if (!collection) return "pending" as const;
    return computeCollectionState(collection);
  }, [collection]);

  if (!collection) {
    return (
      <div className="mx-auto w-full max-w-[1120px] px-2 pb-16 pt-2 sm:px-4 sm:pt-4">
        <ArchiveTabs activeTab="document-collection" />
        <div className="mt-8 rounded-2xl border border-[#dbe3ef] bg-white p-8 text-center">
          <p className="text-[16px] font-semibold text-[#475569]">
            Collection not found.
          </p>
          <button
            type="button"
            onClick={() => router.back()}
            className="mt-4 rounded-xl bg-[#294fbf] px-5 py-2.5 text-[13px] font-semibold text-white"
          >
            Back to Manage Collections
          </button>
        </div>
      </div>
    );
  }

  const percent = toPercent(collection.submittedCount, collection.totalMembers);

  const persist = (nextCollection: DocumentCollection, message: string) => {
    const next = getDocumentCollections().map((item) =>
      item.id === nextCollection.id ? nextCollection : item,
    );
    saveDocumentCollections(next);
    setCollection(nextCollection);
    setNotice(message);
  };

  return (
    <div className="mx-auto w-full max-w-[1120px] px-2 pb-16 pt-2 sm:px-4 sm:pt-4">
      <ArchiveTabs activeTab="document-collection" />

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-[#64748b] hover:bg-white hover:text-[#1f2937]"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          <span className="text-[13px] font-semibold">Back</span>
        </button>
      </div>

      <section className="mt-5 rounded-2xl border border-[#dbe3ef] bg-white px-6 py-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-extrabold text-[#1f2937]">
              {collection.title}
            </h1>
            <p className="mt-2 text-[14px] font-medium text-[#70819d]">
              {collection.level} • {collection.department} •{" "}
              {collection.program}
            </p>
            <p className="mt-2 inline-flex items-center gap-2 text-[13px] font-medium text-[#70819d]">
              <CalendarDays size={14} strokeWidth={2.2} />
              {formatDateRange(
                collection.startDateTime,
                collection.endDateTime,
              )}
            </p>
            <p className="mt-1 inline-flex items-center gap-2 text-[13px] font-medium text-[#70819d]">
              <Users size={14} strokeWidth={2.2} />
              {collection.submittedCount}/{collection.totalMembers} Submitted
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${
              state === "ongoing"
                ? "bg-[#dcfce7] text-[#15803d]"
                : state === "pending"
                  ? "bg-[#fef3c7] text-[#b45309]"
                  : state === "draft"
                    ? "bg-[#fee2e2] text-[#b91c1c]"
                    : "bg-[#e2e8f0] text-[#475569]"
            }`}
          >
            {state.toUpperCase()}
          </span>
        </div>

        <div className="mt-5 h-[6px] rounded-full bg-[#e7edf7]">
          <div
            className="h-full rounded-full bg-[#294fbf]"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <button
            type="button"
            onClick={() =>
              persist(
                { ...collection, lifecycle: "active" },
                "Collection marked active.",
              )
            }
            className="rounded-xl bg-[#294fbf] px-4 py-3 text-[13px] font-semibold text-white"
          >
            Mark Active
          </button>
          <button
            type="button"
            onClick={() =>
              persist(
                { ...collection, lifecycle: "draft" },
                "Collection moved to drafts.",
              )
            }
            className="rounded-xl border border-[#dbe3ef] bg-white px-4 py-3 text-[13px] font-semibold text-[#475569]"
          >
            Move to Draft
          </button>
          <button
            type="button"
            onClick={() =>
              persist(
                { ...collection, lifecycle: "archived" },
                "Collection archived.",
              )
            }
            className="rounded-xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-[13px] font-semibold text-[#b91c1c]"
          >
            Archive Collection
          </button>
        </div>

        {notice ? (
          <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#eef2ff] px-3 py-2 text-[12px] font-semibold text-[#294fbf]">
            <Save size={14} strokeWidth={2.4} />
            {notice}
          </p>
        ) : null}
      </section>

      <section className="mt-5 rounded-2xl border border-[#dbe3ef] bg-white px-6 py-6 shadow-sm">
        <h2 className="text-[18px] font-extrabold text-[#1f2937]">
          Required Documents
        </h2>
        <div className="mt-4 space-y-2">
          {collection.requirements.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-1 gap-2 rounded-xl border border-[#edf2f7] bg-[#f8fafc] px-4 py-3 text-[13px] font-semibold text-[#334155] md:grid-cols-[1fr_140px_120px]"
            >
              <span>{item.name}</span>
              <span>{item.fileType}</span>
              <span>{item.maxSize}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
