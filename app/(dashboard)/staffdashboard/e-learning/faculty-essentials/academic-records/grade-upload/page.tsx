"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  CloudUpload,
  Image as ImageIcon,
  Mic,
  Paperclip,
  SendHorizontal,
  Share2,
  Sparkles,
  MoreHorizontal,
} from "lucide-react";
import ArchiveTabs from "../manage-archive/_components/ArchiveTabs";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  kind: "text" | "upload" | "result";
  text?: string;
  files?: string[];
  result?: {
    studentName: string;
    studentId: string;
    currentScore: string;
    coreSubject: string;
    accuracy: string;
  };
};

const dummyReplies = [
  "I can help with that. Based on uploaded records, performance trend is stable across core modules.",
  "Noted. I suggest checking attendance and continuous assessment spread before final submission.",
  "Understood. I can generate a concise faculty summary once more student files are uploaded.",
  "Thanks. I have added this to your analysis context and prepared the next recommendation.",
];

function buildDummyResult(fileName: string) {
  const seed = fileName.length % 3;

  if (seed === 0) {
    return {
      studentName: "Jonathan A. Miller",
      studentId: "CS-2024-8832",
      currentScore: "49/70",
      coreSubject: "A (Excellent)",
      accuracy: "100% Accuracy",
    };
  }

  if (seed === 1) {
    return {
      studentName: "Mariam O. Lewis",
      studentId: "CS-2024-7710",
      currentScore: "44/70",
      coreSubject: "B+ (Very Good)",
      accuracy: "99% Accuracy",
    };
  }

  return {
    studentName: "Khalid R. Mensah",
    studentId: "CS-2024-9134",
    currentScore: "41/70",
    coreSubject: "B (Good)",
    accuracy: "98% Accuracy",
  };
}

export default function StaffGradeUploadPage() {
  const router = useRouter();
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "assistant",
      kind: "text",
      text: "Hello Dr. Wilson! I am ready to assist with academic records. Please upload a student transcript or record (PDF/JPG/PNG) and I will extract key performance indicators for you.",
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const hiddenFileInputRef = useRef<HTMLInputElement | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  const replyCount = useRef(0);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  const canSend = useMemo(
    () => messageInput.trim().length > 0 && !isProcessing,
    [messageInput, isProcessing],
  );

  const addAssistantReply = (text: string) => {
    setMessages((previous) => [
      ...previous,
      {
        id: `${Date.now()}-assistant-${Math.random().toString(36).slice(2)}`,
        role: "assistant",
        kind: "text",
        text,
      },
    ]);
  };

  const handleSendText = () => {
    const trimmed = messageInput.trim();

    if (!trimmed || isProcessing) {
      return;
    }

    setMessages((previous) => [
      ...previous,
      {
        id: `${Date.now()}-user-${Math.random().toString(36).slice(2)}`,
        role: "user",
        kind: "text",
        text: trimmed,
      },
    ]);
    setMessageInput("");
    setIsProcessing(true);

    window.setTimeout(() => {
      const nextReply = dummyReplies[replyCount.current % dummyReplies.length];
      replyCount.current += 1;
      addAssistantReply(nextReply);
      setIsProcessing(false);
    }, 850);
  };

  const handleSelectFiles = () => {
    hiddenFileInputRef.current?.click();
  };

  const handleIncomingFiles = (files: FileList | null) => {
    if (!files || files.length === 0 || isProcessing) {
      return;
    }

    const fileNames = Array.from(files).map((file) => file.name);
    const firstFileName = fileNames[0];

    setMessages((previous) => [
      ...previous,
      {
        id: `${Date.now()}-upload-${Math.random().toString(36).slice(2)}`,
        role: "user",
        kind: "upload",
        files: fileNames,
      },
    ]);

    setIsProcessing(true);

    window.setTimeout(() => {
      const result = buildDummyResult(firstFileName);

      setMessages((previous) => [
        ...previous,
        {
          id: `${Date.now()}-assistant-summary-${Math.random().toString(36).slice(2)}`,
          role: "assistant",
          kind: "text",
          text: "I have processed the document. Here is the summary of the extracted data:",
        },
        {
          id: `${Date.now()}-assistant-result-${Math.random().toString(36).slice(2)}`,
          role: "assistant",
          kind: "result",
          result,
        },
      ]);
      setIsProcessing(false);
    }, 1100);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1060px] flex-col px-2 pb-10 pt-2 text-[#1f2937] sm:px-4 sm:pt-4">
        <ArchiveTabs activeTab="grade-upload" />

        <header className="flex items-center mt-14 justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-[#64748b] transition-colors hover:bg-white hover:text-[#1f2937]"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            <span className="text-[13px] font-semibold">Back</span>
          </button>

          <h1 className="text-[30px] font-bold text-[#1f2937]">
            Faculty Portal AI
          </h1>

          <div className="flex items-center gap-2 text-[#94a3b8]">
            <button className="rounded-md p-2 transition-colors hover:bg-white hover:text-[#475569]">
              <Share2 size={15} strokeWidth={2.4} />
            </button>
            <button className="rounded-md p-2 transition-colors hover:bg-white hover:text-[#475569]">
              <MoreHorizontal size={16} strokeWidth={2.6} />
            </button>
          </div>
        </header>

        <section className="mx-auto mt-8 w-full max-w-[730px] space-y-6">
          {messages.map((message) => {
            if (message.kind === "result" && message.result) {
              return (
                <article
                  key={message.id}
                  className="overflow-hidden rounded-[16px] border border-[#d8e2f1] bg-white"
                >
                  <div className="flex items-center justify-between border-b border-[#e2e8f0] bg-[#f8fafc] px-4 py-3">
                    <p className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#64748b]">
                      <Sparkles
                        size={12}
                        strokeWidth={2.5}
                        className="text-[#2f55c8]"
                      />
                      Extraction Results
                    </p>
                    <span className="rounded-full bg-[#dcfce7] px-2 py-1 text-[10px] font-extrabold text-[#15803d]">
                      {message.result.accuracy}
                    </span>
                  </div>

                  <div className="grid gap-4 px-4 py-4 md:grid-cols-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#94a3b8]">
                        Student Name
                      </p>
                      <p className="mt-1 text-[20px] font-extrabold text-[#1f2937]">
                        {message.result.studentName}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#94a3b8]">
                        Student ID
                      </p>
                      <p className="mt-1 text-[20px] font-extrabold text-[#2f55c8]">
                        {message.result.studentId}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#94a3b8]">
                        Current Score
                      </p>
                      <p className="mt-1 text-[30px] font-extrabold text-[#10b981]">
                        {message.result.currentScore}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#94a3b8]">
                        Core Subject (AI)
                      </p>
                      <p className="mt-1 text-[24px] font-extrabold text-[#1f2937]">
                        {message.result.coreSubject}
                      </p>
                    </div>
                  </div>
                </article>
              );
            }

            if (message.kind === "upload" && message.files) {
              return (
                <article
                  key={message.id}
                  className="rounded-xl border border-[#d8e2f1] bg-[#f8fafc] px-4 py-3"
                >
                  <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#64748b]">
                    Uploaded Files
                  </p>
                  <ul className="mt-2 space-y-1 text-[14px] font-medium text-[#334155]">
                    {message.files.map((fileName) => (
                      <li
                        key={fileName}
                        className="inline-flex items-center gap-2"
                      >
                        <ImageIcon
                          size={14}
                          strokeWidth={2.3}
                          className="text-[#2f55c8]"
                        />
                        {fileName}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            }

            return (
              <article
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" ? (
                  <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#244bbf] text-white">
                    <Bot size={15} strokeWidth={2.2} />
                  </span>
                ) : null}

                <div
                  className={`max-w-[88%] rounded-[14px] px-4 py-3 text-[16px] font-medium leading-relaxed ${
                    message.role === "assistant"
                      ? "bg-white text-[#334155]"
                      : "bg-[#2f55c8] text-white"
                  }`}
                >
                  {message.text}
                </div>
              </article>
            );
          })}

          <div className="rounded-[16px] border border-dashed border-[#c9d6ea] bg-[#f8fafc] p-7 text-center">
            <button
              type="button"
              onClick={handleSelectFiles}
              disabled={isProcessing}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#d8e2f1] bg-white text-[#2f55c8]"
            >
              <CloudUpload size={24} strokeWidth={2.2} />
            </button>
            <p className="mt-4 text-[26px] font-bold text-[#1f2937]">
              Drop student records here
            </p>
            <p className="mt-1 text-[14px] font-medium text-[#94a3b8]">
              PDF, JPG or PNG up to 10MB
            </p>
            <button
              type="button"
              onClick={handleSelectFiles}
              disabled={isProcessing}
              className="mt-4 rounded-full bg-[#2f55c8] px-6 py-2 text-[14px] font-semibold text-white transition hover:bg-[#274ab0] disabled:opacity-60"
            >
              Select Files
            </button>
            <input
              ref={hiddenFileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(event) => handleIncomingFiles(event.target.files)}
            />
          </div>

          {isProcessing ? (
            <div className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#64748b]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#2f55c8]" />
              AI processing in progress...
            </div>
          ) : null}

          <div ref={endOfMessagesRef} />
        </section>

        <section className="mx-auto mt-8 w-full max-w-[760px] rounded-[18px] border border-[#d8e2f1] bg-white px-5 py-4 shadow-lg shadow-slate-200/50">
          <textarea
            value={messageInput}
            onChange={(event) => setMessageInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSendText();
              }
            }}
            placeholder="Ask a follow-up question..."
            rows={3}
            className="w-full resize-none border-none text-[14px] font-medium text-[#334155] outline-none placeholder:text-[#94a3b8]"
          />

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[#94a3b8]">
              <button
                type="button"
                onClick={handleSelectFiles}
                className="rounded-md p-1.5 transition-colors hover:bg-[#f8fafc] hover:text-[#64748b]"
              >
                <Paperclip size={14} strokeWidth={2.4} />
              </button>
              <button className="rounded-md p-1.5 transition-colors hover:bg-[#f8fafc] hover:text-[#64748b]">
                <ImageIcon size={14} strokeWidth={2.4} />
              </button>
              <button className="rounded-md p-1.5 transition-colors hover:bg-[#f8fafc] hover:text-[#64748b]">
                <Mic size={14} strokeWidth={2.4} />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#94a3b8]">
                Shift + Enter for new line
              </p>
              <button
                type="button"
                disabled={!canSend}
                onClick={handleSendText}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2f55c8] text-white transition hover:bg-[#274ab0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SendHorizontal size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </section>
    </div>
  );
}
