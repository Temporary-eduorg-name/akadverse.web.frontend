"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Plus, Users } from "lucide-react";
import ArchiveTabs from "./_components/ArchiveTabs";
import {
  DocumentCollection,
  computeCollectionState,
  formatDateRange,
  getDocumentCollections,
  toPercent,
} from "./_lib/collectionStore";

export default function StaffManageArchivePage() {
  const router = useRouter();
  const [collections, setCollections] = useState<DocumentCollection[]>([]);

  useEffect(() => {
    setCollections(getDocumentCollections());
  }, []);

  const groupedCollections = useMemo(() => {
    const ongoing: DocumentCollection[] = [];
    const pending: DocumentCollection[] = [];
    const drafts: DocumentCollection[] = [];
    const closed: DocumentCollection[] = [];

    collections.forEach((collection) => {
      const state = computeCollectionState(collection);
      if (state === "ongoing") {
        ongoing.push(collection);
      } else if (state === "pending") {
        pending.push(collection);
      } else if (state === "draft") {
        drafts.push(collection);
      } else {
        closed.push(collection);
      }
    });

    return { ongoing, pending, drafts, closed };
  }, [collections]);

  const renderCollectionCard = (
    collection: DocumentCollection,
    variant: "default" | "draft" | "closed" = "default",
  ) => {
    const state = computeCollectionState(collection);
    const progress = toPercent(
      collection.submittedCount,
      collection.totalMembers,
    );

    const statusText =
      state === "ongoing"
        ? "IN PROGRESS"
        : state === "pending"
          ? "PENDING"
          : state === "draft"
            ? "DRAFT"
            : "COMPLETED";

    const statusClass =
      state === "ongoing"
        ? "bg-[#dcfce7] text-[#15803d]"
        : state === "pending"
          ? "bg-[#fef3c7] text-[#b45309]"
          : state === "draft"
            ? "bg-[#ffe4e6] text-[#be123c]"
            : "bg-[#e2e8f0] text-[#475569]";

    const progressColor =
      variant === "draft"
        ? "bg-[#ef4444]"
        : variant === "closed"
          ? "bg-[#94a3b8]"
          : "bg-[#294fbf]";

    const buttonClass =
      variant === "closed"
        ? "border border-[#dbe3ef] bg-white text-[#475569]"
        : "bg-[#294fbf] text-white";

    const buttonLabel =
      variant === "closed"
        ? "View Archive"
        : state === "pending"
          ? "Edit Collections"
          : variant === "draft"
            ? "Manage Draft"
            : "Manage Collection";

    const buttonPath =
      state === "draft"
        ? `/staffdashboard/e-learning/faculty-essentials/academic-records/manage-archive/create-collection?collectionId=${collection.id}`
        : state === "ongoing" || state === "pending"
          ? `/staffdashboard/e-learning/faculty-essentials/academic-records/manage-archive/active-collections?collectionId=${collection.id}`
          : `/staffdashboard/e-learning/faculty-essentials/academic-records/manage-archive/${collection.id}`;

    return (
      <article
        key={collection.id}
        className="rounded-2xl border border-[#dbe3ef] bg-white px-4 py-4 shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[19px] font-extrabold text-[#1f2937]">
            {collection.title}
          </h3>
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${statusClass}`}
          >
            {statusText}
          </span>
        </div>

        <div className="mt-4 space-y-2 text-[12px] font-medium text-[#70819d]">
          <p className="inline-flex items-center gap-2">
            <CalendarDays size={13} strokeWidth={2.2} />
            {state === "closed"
              ? `Ended ${formatDateRange(collection.startDateTime, collection.endDateTime).split(" - ")[1]}`
              : formatDateRange(
                  collection.startDateTime,
                  collection.endDateTime,
                )}
          </p>
          <p className="inline-flex items-center gap-2">
            <Users size={13} strokeWidth={2.2} />
            {collection.totalMembers} Students enrolled
          </p>
        </div>

        <div className="mt-4 h-[5px] rounded-full bg-[#e7edf7]">
          <div
            className={`h-full rounded-full ${progressColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-[#70819d]">
          <span>
            {collection.submittedCount}/{collection.totalMembers} Submitted
          </span>
          <span>{progress}% Complete</span>
        </div>

        <button
          type="button"
          onClick={() => router.push(buttonPath)}
          className={`mt-4 inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-[13px] font-semibold transition hover:opacity-90 ${buttonClass}`}
        >
          {buttonLabel}
        </button>
      </article>
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
          <span className="text-[13px] font-semibold">Back to Dashboard</span>
        </button>
      </div>

      <section className="mt-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[42px] font-extrabold leading-none tracking-tight text-[#1f2937]">
            Manage Collections
          </h1>
          <p className="mt-3 text-[15px] font-medium text-[#70819d]">
            Organize and track document submissions across your assigned
            departments.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/staffdashboard/e-learning/faculty-essentials/academic-records/manage-archive/create-collection",
            )
          }
          className="inline-flex items-center gap-2 rounded-xl bg-[#294fbf] px-6 py-3 text-[14px] font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-[#2342a1]"
        >
          <Plus size={15} strokeWidth={2.4} />
          Create New Collection
        </button>
      </section>

      <section className="mt-9">
        <div className="flex items-center gap-3">
          <h2 className="text-[34px] font-extrabold text-[#1f2937]">
            Ongoing Collections
          </h2>
          <span className="rounded-full bg-[#dbeafe] px-3 py-1 text-[10px] font-extrabold text-[#1d4ed8]">
            {groupedCollections.ongoing.length} Active
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {groupedCollections.ongoing.map((collection) =>
            renderCollectionCard(collection),
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center gap-3">
          <h2 className="text-[34px] font-extrabold text-[#1f2937]">
            Pending Collections
          </h2>
          <span className="rounded-full bg-[#e0e7ff] px-3 py-1 text-[10px] font-extrabold text-[#4338ca]">
            {groupedCollections.pending.length} waiting
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {groupedCollections.pending.map((collection) =>
            renderCollectionCard(collection),
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[34px] font-extrabold text-[#1f2937]">
          Draft Collections
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {groupedCollections.drafts.map((collection) =>
            renderCollectionCard(collection, "draft"),
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center gap-3">
          <h2 className="text-[34px] font-extrabold text-[#1f2937]">
            Closed Collections
          </h2>
          <span className="rounded-full bg-[#e2e8f0] px-3 py-1 text-[10px] font-extrabold text-[#64748b]">
            Archived
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {groupedCollections.closed.map((collection) =>
            renderCollectionCard(collection, "closed"),
          )}
        </div>
      </section>
    </div>
  );
}
