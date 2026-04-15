"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CircleHelp,
  Download,
  ExternalLink,
  FileText,
  FilePenLine,
  FolderOpen,
  Link2,
  Plus,
  Trash2,
  Upload,
  WandSparkles,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { getSharedCourseWeeks } from "@/app/lib/sharedCourseWorkspace";
import {
  deleteSharedCourseAsset,
  getSharedCourseAssetUrl,
  saveSharedCourseAsset,
} from "@/app/lib/sharedCourseAssets";
import { useSharedCourseWorkspace } from "@/app/lib/useSharedCourseWorkspace";

function formatFileSize(size: number) {
  const sizeInMb = size / 1024 / 1024;
  if (sizeInMb >= 1) {
    return `${sizeInMb.toFixed(1)}MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))}KB`;
}

export default function FacultyWeeklyFocusPage() {
  const params = useParams<{ courseSlug: string }>();
  const { course, isSharedCourse, updateCourse } = useSharedCourseWorkspace(
    params?.courseSlug ?? "",
  );
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [noteUrls, setNoteUrls] = useState<Record<string, string>>({});

  const allWeeks = useMemo(
    () => (course ? getSharedCourseWeeks(course) : []),
    [course],
  );

  const activeWeek =
    allWeeks.find((week) => week.weekNumber === selectedWeek) ?? allWeeks[0];

  const openAiTool = (tool: string) => {
    router.push(
      `/staffdashboard/ai-studio?source=my-learning&tool=${tool}&course=${course.code}`,
    );
  };

  const replaceWeek = (
    targetWeekNumber: number,
    updater: (week: (typeof allWeeks)[number]) => (typeof allWeeks)[number],
  ) => {
    updateCourse((current) => ({
      ...current,
      modules: current.modules.map((module) => ({
        ...module,
        weeks: module.weeks.map((week) =>
          week.weekNumber === targetWeekNumber ? updater(week) : week,
        ),
      })),
    }));
  };

  useEffect(() => {
    if (!activeWeek) {
      setNoteUrls({});
      return;
    }

    let cancelled = false;
    let objectUrls: string[] = [];

    const resolveNoteUrls = async () => {
      const entries = await Promise.all(
        activeWeek.notes.map(async (note) => {
          if (note.fileUrl) {
            return [note.id, note.fileUrl] as const;
          }

          if (!note.assetId) {
            return [note.id, ""] as const;
          }

          const assetUrl = await getSharedCourseAssetUrl(note.assetId);
          if (assetUrl?.startsWith("blob:")) {
            objectUrls.push(assetUrl);
          }

          return [note.id, assetUrl ?? ""] as const;
        }),
      );

      if (cancelled) {
        objectUrls.forEach((url) => URL.revokeObjectURL(url));
        return;
      }

      setNoteUrls(
        Object.fromEntries(entries.filter(([, url]) => Boolean(url))),
      );
    };

    resolveNoteUrls();

    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [activeWeek]);

  if (!isSharedCourse || !course || !activeWeek) {
    return null;
  }

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (!selectedFiles.length) {
      return;
    }

    const uploadedNotes = await Promise.all(
      selectedFiles.map(async (file, index) => {
        const assetId = `${course.code}-${activeWeek.weekNumber}-${Date.now()}-${index}`;
        await saveSharedCourseAsset(file, assetId);

        return {
          id: `${activeWeek.weekNumber}-${file.name}-${file.size}-${index}`,
          name: file.name,
          fileType:
            file.name.split(".").pop()?.toUpperCase() || file.type || "FILE",
          size: formatFileSize(file.size),
          assetId,
        };
      }),
    );

    replaceWeek(activeWeek.weekNumber, (week) => ({
      ...week,
      notes: [
        ...week.notes,
        ...uploadedNotes,
      ],
    }));
    event.target.value = "";
  };

  const deleteNote = async (noteId: string, assetId?: string) => {
    if (assetId) {
      await deleteSharedCourseAsset(assetId);
    }

    replaceWeek(activeWeek.weekNumber, (week) => ({
      ...week,
      notes: week.notes.filter((note) => note.id !== noteId),
    }));
  };

  const addLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) {
      return;
    }

    replaceWeek(activeWeek.weekNumber, (week) => ({
      ...week,
      links: [
        ...week.links,
        {
          name: newLinkLabel.trim(),
          url: newLinkUrl.trim(),
        },
      ],
    }));
    setNewLinkLabel("");
    setNewLinkUrl("");
    setShowLinkForm(false);
  };

  const aiTools = [
    {
      id: "assignment-generator",
      title: "Assignment Generator",
      description:
        "Create assignment briefs and faculty-ready classroom tasks from this week's topic.",
      icon: FilePenLine,
    },
    {
      id: "sample-question-generator",
      title: "Sample Question Generator",
      description:
        "Build assessment questions that align with the active week and course outcome targets.",
      icon: CircleHelp,
    },
  ];

  return (
    <div className="space-y-6">
      <section>
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-[#2d56d6]"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-3xl font-black tracking-[-0.04em] text-[#171f33] sm:text-[2.15rem]">
          Weekly Focus
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Upload notes and links here. Students enrolled in this course see the
          same updates in their weekly focus view.
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        {allWeeks.map((week) => (
          <button
            key={week.weekNumber}
            type="button"
            onClick={() => setSelectedWeek(week.weekNumber)}
            className={`rounded-[7px] px-3 py-2 text-[12px] font-semibold ${
              activeWeek.weekNumber === week.weekNumber
                ? "bg-[#2c4ec0] text-white"
                : "bg-[#eef2f8] text-[#415273]"
            }`}
          >
            Week {week.weekNumber}
          </button>
        ))}
      </div>

      <section className="rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_22px_55px_rgba(16,24,40,0.06)] sm:p-8">
        <div className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-[#2d56d6]">
          {activeWeek.weekLabel}
        </div>
        <h3 className="text-2xl font-bold text-[#171f33]">{activeWeek.title}</h3>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          {activeWeek.description}
        </p>
      </section>

      <section className="rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_22px_55px_rgba(16,24,40,0.06)] sm:p-8">
        <div className="mb-6 flex items-center gap-2 text-lg font-bold text-[#171f33]">
          <FolderOpen className="h-5 w-5 text-[#2d56d6]" />
          <h3>Lecture Notes Repository</h3>
        </div>

        <div className="mx-auto flex max-w-[360px] flex-col items-center rounded-[22px] border border-dashed border-[#d8e3f2] bg-[#fdfefe] px-8 py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#dce7fb] bg-white text-[#2d56d6] shadow-sm">
            <Upload className="h-6 w-6" />
          </div>
          <p className="mt-5 text-sm font-semibold text-[#171f33]">
            Upload all slides and notes
          </p>
          <p className="mt-2 text-xs text-slate-500">
            PDF, PNG, JPG or JPEG. Uploaded notes appear in the student weekly
            focus immediately.
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-5 rounded-full bg-[#2d56d6] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#2347b4]"
          >
            Select Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        <div className="mt-6 space-y-3">
          {activeWeek.notes.map((note) => (
            <div
              key={note.id}
              className="flex items-center justify-between rounded-2xl border border-[#ebf1f7] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-[#2d56d6]" />
                <div>
                  <span className="text-sm text-slate-600">{note.name}</span>
                  <p className="text-xs text-slate-400">
                    {note.fileType} - {note.size}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {noteUrls[note.id] ? (
                  <a
                    href={noteUrls[note.id]}
                    download={note.name}
                    className="rounded-full p-2 text-slate-400 transition hover:bg-[#eef2fa] hover:text-[#2d56d6]"
                    aria-label={`Download ${note.name}`}
                  >
                    <Download className="h-4 w-4" />
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => deleteNote(note.id, note.assetId)}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-[#fff1f2] hover:text-[#dc2626]"
                  aria-label={`Delete ${note.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[22px] border border-[#dde6f2] bg-white shadow-[0_14px_40px_rgba(16,24,40,0.04)]">
        <div className="border-b border-[#edf2f8] px-5 py-4">
          <div className="flex items-center gap-2 text-lg font-bold text-[#171f33]">
            <Link2 className="h-4 w-4 text-[#2d56d6]" />
            <h3>Upload External Links</h3>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 px-5 py-5">
          {activeWeek.links.map((link) => (
            <a
              key={`${link.name}-${link.url}`}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#e6edf6] bg-white px-4 py-3 text-sm text-[#171f33] transition hover:border-[#2d56d6] hover:text-[#2d56d6]"
            >
              <ExternalLink className="h-4 w-4 text-slate-400" />
              <span>{link.name}</span>
            </a>
          ))}

          <button
            type="button"
            onClick={() => setShowLinkForm((current) => !current)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#e6edf6] bg-[#fbfcfe] px-4 py-3 text-sm text-slate-500 transition hover:border-[#2d56d6] hover:text-[#2d56d6]"
          >
            <Plus className="h-4 w-4" />
            <span>Add link</span>
          </button>
        </div>

        {showLinkForm ? (
          <div className="grid gap-3 border-t border-[#edf2f8] px-5 py-5 md:grid-cols-[1fr_1fr_auto]">
            <input
              value={newLinkLabel}
              onChange={(event) => setNewLinkLabel(event.target.value)}
              placeholder="Link label"
              className="rounded-xl border border-[#dbe4f0] px-4 py-3 text-sm outline-none transition focus:border-[#2d56d6]"
            />
            <input
              value={newLinkUrl}
              onChange={(event) => setNewLinkUrl(event.target.value)}
              placeholder="https://example.com"
              className="rounded-xl border border-[#dbe4f0] px-4 py-3 text-sm outline-none transition focus:border-[#2d56d6]"
            />
            <button
              type="button"
              onClick={addLink}
              className="rounded-xl bg-[#2d56d6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2347b4]"
            >
              Save Link
            </button>
          </div>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-[22px] border border-[#dbe4f0] bg-white shadow-[0_16px_40px_rgba(16,24,40,0.04)]">
        <div className="bg-gradient-to-r from-[#6d4df3] to-[#5a95df] px-6 py-6 text-center text-white sm:px-10">
          <h3 className="text-2xl font-bold tracking-[-0.03em]">
            AI Study Enhancers
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/90">
            Transform your lecture materials into dynamic learning formats using
            our integrated AI tools.
          </p>
        </div>

        <div className="grid gap-5 px-5 py-6 lg:grid-cols-2 lg:px-6">
          {aiTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => openAiTool(tool.id)}
                className="rounded-[20px] border border-[#e7edf5] bg-white px-6 py-7 text-center transition hover:-translate-y-0.5 hover:border-[#d3dcf2] hover:shadow-[0_14px_28px_rgba(16,24,40,0.06)]"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef3ff] text-[#5146ff]">
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="mt-5 text-xl font-bold tracking-[-0.03em] text-[#171f33]">
                  {tool.title}
                </h4>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
                  {tool.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_22px_55px_rgba(16,24,40,0.06)] sm:p-8">
        <div className="flex items-center gap-2 text-lg font-bold text-[#171f33]">
          <WandSparkles className="h-5 w-5 text-[#2d56d6]" />
          <h3>Weekly Focus Snapshot</h3>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          {activeWeek.focusSummary}
        </p>
      </section>
    </div>
  );
}
