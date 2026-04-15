"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Download,
  FileArchive,
  FileCheck,
  FileSpreadsheet,
  Landmark,
  Upload,
} from "lucide-react";

type HodSubmissionWindow = {
  startDateTime: string;
  endDateTime: string;
};

type SubmissionStatus = "upcoming" | "open" | "closed";

type RequiredDocument = {
  id: string;
  name: string;
  formats: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
};

type UploadedDocumentState = {
  fileName: string;
  uploadedAt: string;
};

const requiredDocs: RequiredDocument[] = [
  {
    id: "birth-certificate",
    name: "Birth Certificate",
    formats: "PDF, DOCX (Max 10MB)",
    icon: FileCheck,
  },
  {
    id: "olevel-result",
    name: "O level Result",
    formats: "XLSX, CSV (Max 5MB)",
    icon: FileSpreadsheet,
  },
  {
    id: "jamb-admission-letter",
    name: "Jamb Admission Letter",
    formats: "PDF (Max 15MB)",
    icon: Landmark,
  },
  {
    id: "semester-result",
    name: "Semester Result",
    formats: "PDF, XLSX (Max 8MB)",
    icon: FileArchive,
  },
  {
    id: "curriculum-review-report",
    name: "Curriculum Review Report",
    formats: "PDF (Max 20MB)",
    icon: FileArchive,
  },
];

const DEFAULT_SUBMISSION_START = new Date("2026-03-01T08:45:19").getTime();
const DEFAULT_SUBMISSION_DEADLINE = new Date("2026-03-26T08:45:19").getTime();
const hodSubmissionWindowStorageKey = "hodDocumentSubmissionWindow";
const hodRequiredDocumentsStorageKey = "hodRequiredDocumentsUploads";
const ZERO_COUNTDOWN = { days: 0, hours: 0, minutes: 0, seconds: 0 };

function getTimeLeft(targetTime: number, fromTime: number) {
  const remaining = Math.max(targetTime - fromTime, 0);
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((remaining / (1000 * 60)) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  return { days, hours, minutes, seconds };
}

function formatUploadDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(isoDate));
}

export default function RecordsHodRequiredDocumentsPage() {
  const router = useRouter();
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [countdown, setCountdown] = useState(ZERO_COUNTDOWN);
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>("open");
  const [submissionWindow, setSubmissionWindow] = useState({
    startDateTime: DEFAULT_SUBMISSION_START,
    endDateTime: DEFAULT_SUBMISSION_DEADLINE,
  });
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<
    Record<string, UploadedDocumentState>
  >({});

  useEffect(() => {
    const storedWindow = window.localStorage.getItem(
      hodSubmissionWindowStorageKey,
    );
    if (!storedWindow) return;

    try {
      const parsed = JSON.parse(storedWindow) as HodSubmissionWindow;
      const parsedStart = new Date(parsed.startDateTime).getTime();
      const parsedEnd = new Date(parsed.endDateTime).getTime();

      if (Number.isFinite(parsedStart) && Number.isFinite(parsedEnd)) {
        setSubmissionWindow({
          startDateTime: parsedStart,
          endDateTime: parsedEnd,
        });
      }
    } catch {
      // Ignore malformed values and continue with fallback defaults.
    }
  }, []);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();

      if (now < submissionWindow.startDateTime) {
        setSubmissionStatus("upcoming");
        setCountdown(getTimeLeft(submissionWindow.startDateTime, now));
        return;
      }

      if (now >= submissionWindow.endDateTime) {
        setSubmissionStatus("closed");
        setCountdown(ZERO_COUNTDOWN);
        return;
      }

      setSubmissionStatus("open");
      setCountdown(getTimeLeft(submissionWindow.endDateTime, now));
    };

    updateTimer();
    const timer = window.setInterval(updateTimer, 1000);

    return () => window.clearInterval(timer);
  }, [submissionWindow]);

  useEffect(() => {
    const storedUploads = window.localStorage.getItem(
      hodRequiredDocumentsStorageKey,
    );
    if (!storedUploads) return;

    try {
      const parsed = JSON.parse(storedUploads) as Record<
        string,
        UploadedDocumentState
      >;
      setUploadedDocuments(parsed);
    } catch {
      // Ignore malformed upload metadata.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      hodRequiredDocumentsStorageKey,
      JSON.stringify(uploadedDocuments),
    );
  }, [uploadedDocuments]);

  const handleUploadClick = (documentId: string) => {
    if (submissionStatus !== "open") return;

    setActiveDocumentId(documentId);
    uploadInputRef.current?.click();
  };

  const handleDocumentSelected = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile || !activeDocumentId || submissionStatus !== "open") {
      setActiveDocumentId(null);
      event.target.value = "";
      return;
    }

    setUploadedDocuments((prev) => ({
      ...prev,
      [activeDocumentId]: {
        fileName: selectedFile.name,
        uploadedAt: new Date().toISOString(),
      },
    }));

    event.target.value = "";
    setActiveDocumentId(null);
  };

  const countdownTotalSeconds =
    countdown.days * 24 * 60 * 60 +
    countdown.hours * 60 * 60 +
    countdown.minutes * 60 +
    countdown.seconds;
  const shouldShowWarningBanner =
    submissionStatus === "closed" ||
    (submissionStatus === "open" && countdown.days <= 3);
  const bannerWrapperClass = shouldShowWarningBanner
    ? "bg-gradient-to-r from-[#ef4444] to-[#b91c1c]"
    : "bg-gradient-to-r from-[#4f46e5] to-[#1e40af]";
  const timerTileClass = shouldShowWarningBanner
    ? "bg-[#f97316]/60"
    : "bg-[#4f6ce9]/70";
  const timerTextClass = shouldShowWarningBanner
    ? "text-[#fee2e2]"
    : "text-[#c7d2fe]";
  const statusPillClass = shouldShowWarningBanner
    ? "text-[#fee2e2]"
    : "text-[#dbeafe]";
  const statusDotClass = shouldShowWarningBanner
    ? "bg-[#facc15]"
    : submissionStatus === "closed"
      ? "bg-[#facc15]"
      : "bg-[#22c55e]";
  const statusLabel =
    submissionStatus === "open"
      ? "SYSTEM STATUS: SUBMISSION ACTIVE"
      : submissionStatus === "upcoming"
        ? "SYSTEM STATUS: SUBMISSION NOT OPEN"
        : "SYSTEM STATUS: SUBMISSION CLOSED";
  const bannerHeading =
    submissionStatus === "upcoming"
      ? "Submission Opens In:"
      : submissionStatus === "closed"
        ? "Submission Window Closed"
        : "Submission Period Closing In:";
  const bannerBody =
    submissionStatus === "open"
      ? "This document submission timer is configured by the HOD. Ensure all required files are uploaded before deadline."
      : submissionStatus === "upcoming"
        ? "Submission has not opened yet. Countdown reflects the HOD-configured opening time."
        : "The submission period has ended. Contact your department for late-submission guidance.";

  return (
    <div
      className="min-h-screen bg-[#f8fafc] text-[#334155]"
      style={{ fontFamily: "var(--font-lexend), sans-serif" }}
    >
      <input
        ref={uploadInputRef}
        type="file"
        className="hidden"
        onChange={handleDocumentSelected}
      />

      <main className="mx-auto max-w-[1260px] px-6 py-6 lg:px-10">
        <button
          aria-label="Go back"
          className="rounded-lg border border-[#e2e8f0] bg-white p-2.5 text-[#64748b] transition hover:bg-[#f8fafc]"
          onClick={() =>
            router.push(
              "/studashboard/e-learning/learning-dashboard/records/documentation",
            )
          }
        >
          <ArrowLeft size={18} strokeWidth={2.4} />
        </button>

        <section
          className={`mt-8 overflow-hidden rounded-[14px] px-8 py-9 text-white shadow-md ${bannerWrapperClass}`}
        >
          <div className="text-center">
            <p
              className={`inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${statusPillClass}`}
            >
              <span className={`size-2 rounded-full ${statusDotClass}`} />
              {statusLabel}
            </p>
            <h1 className="mt-3 text-[32px] font-extrabold leading-tight md:text-[42px]">
              {bannerHeading}
            </h1>
            <div className="mt-5 flex items-center justify-center gap-4">
              {[
                {
                  label: "Days",
                  value:
                    submissionStatus === "closed" && countdownTotalSeconds === 0
                      ? 0
                      : countdown.days,
                },
                {
                  label: "Hours",
                  value:
                    submissionStatus === "closed" && countdownTotalSeconds === 0
                      ? 0
                      : countdown.hours,
                },
                {
                  label: "Mins",
                  value:
                    submissionStatus === "closed" && countdownTotalSeconds === 0
                      ? 0
                      : countdown.minutes,
                },
                {
                  label: "Secs",
                  value:
                    submissionStatus === "closed" && countdownTotalSeconds === 0
                      ? 0
                      : countdown.seconds,
                },
              ].map((part) => (
                <div key={part.label} className="text-center">
                  <div
                    className={`flex size-[68px] items-center justify-center rounded-[12px] text-[32px] font-extrabold leading-none ${timerTileClass}`}
                  >
                    {String(part.value).padStart(2, "0")}
                  </div>
                  <p
                    className={`mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] ${timerTextClass}`}
                  >
                    {part.label}
                  </p>
                </div>
              ))}
            </div>
            <p
              className={`mx-auto mt-5 max-w-[620px] text-[13px] font-medium leading-relaxed ${statusPillClass}`}
            >
              {bannerBody}
            </p>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-center gap-2 text-[12px] font-medium text-[#94a3b8]">
            <span>Documents</span>
            <ChevronRight size={14} strokeWidth={2.5} />
            <span>HOD Required Documents</span>
          </div>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-[34px] font-extrabold tracking-tight text-[#0f172a]">
                HOD Required Documents
              </h2>
              <p className="mt-2 text-[14px] font-medium text-[#64748b]">
                Manage and upload mandatory documentation for departmental
                records.
              </p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-md border border-[#d1d9e6] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#334155] transition hover:bg-[#f8fafc]">
              <Download size={14} strokeWidth={2.4} />
              Export Report
            </button>
          </div>

          <article className="mt-6 overflow-hidden rounded-xl border border-[#e2e8f0] bg-white">
            <div className="grid grid-cols-[1.8fr_1fr_1fr] border-b border-[#e8edf5] bg-[#f8fafc] px-6 py-4">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#64748b]">
                Document Name
              </p>
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#64748b]">
                Last Updated
              </p>
              <p className="text-right text-[11px] font-extrabold uppercase tracking-wide text-[#64748b]">
                Upload Action
              </p>
            </div>

            {requiredDocs.map((doc) => {
              const Icon = doc.icon;
              const uploadedDocument = uploadedDocuments[doc.id];
              const isUploaded = Boolean(uploadedDocument);
              const lastUpdated = uploadedDocument
                ? formatUploadDate(uploadedDocument.uploadedAt)
                : "Not yet uploaded";
              return (
                <div
                  key={doc.id}
                  className="grid grid-cols-[1.8fr_1fr_1fr] items-center border-b border-[#eef2f7] px-6 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-[#eef2f7] text-[#1f4ac3]">
                      <Icon size={17} strokeWidth={2.3} />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[#0f172a]">
                        {doc.name}
                      </p>
                      <p className="text-[11px] font-medium text-[#94a3b8]">
                        {doc.formats}
                      </p>
                      {uploadedDocument && (
                        <p className="mt-1 text-[11px] font-semibold text-[#1f4ac3]">
                          {uploadedDocument.fileName}
                        </p>
                      )}
                    </div>
                  </div>
                  <p
                    className={`text-[13px] font-medium ${isUploaded ? "text-[#334155]" : "italic text-[#9ca3af]"}`}
                  >
                    {lastUpdated}
                  </p>
                  <div className="text-right">
                    <button
                      type="button"
                      disabled={submissionStatus !== "open"}
                      onClick={() => handleUploadClick(doc.id)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#1f4ac3] px-3.5 py-2 text-[12px] font-semibold text-white transition hover:bg-[#1d43b1] disabled:cursor-not-allowed disabled:bg-[#94a3b8] disabled:hover:bg-[#94a3b8]"
                    >
                      <Upload size={13} strokeWidth={2.4} />
                      Upload Document
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#f8fafc] px-6 py-4">
              <p className="text-[12px] font-medium text-[#94a3b8]">
                Showing 5 of 5 required documents
              </p>
              <div className="inline-flex items-center rounded-md border border-[#e2e8f0] bg-white">
                <button
                  className="px-3 py-1.5 text-[12px] font-medium text-[#cbd5e1]"
                  disabled
                >
                  Previous
                </button>
                <button
                  className="border-l border-[#e2e8f0] px-3 py-1.5 text-[12px] font-medium text-[#cbd5e1]"
                  disabled
                >
                  Next
                </button>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
