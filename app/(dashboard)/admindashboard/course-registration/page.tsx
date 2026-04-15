"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Bell, Wrench } from "lucide-react";
import DashboardNavbar from "@/app/components/dashboard/admin/DashboardNavbar";

type Notice = {
  type: "success" | "error";
  message: string;
} | null;

type RegistrationWindowPayload = {
  startDateTime: string;
  endDateTime: string;
  maxAllowedUnits: number;
};

const storageKey = "courseRegistrationWindow";

export default function AdminCourseRegistrationPage() {
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [maxAllowedUnits, setMaxAllowedUnits] = useState("24");
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const isFormIncomplete = !startDateTime || !endDateTime || !maxAllowedUnits;

  const parsedMaxUnits = Number(maxAllowedUnits);

  const isMaxUnitsInvalid =
    !Number.isFinite(parsedMaxUnits) ||
    parsedMaxUnits <= 0 ||
    parsedMaxUnits > 60;

  const isRangeInvalid = useMemo(() => {
    if (isFormIncomplete) {
      return false;
    }

    return new Date(startDateTime).getTime() >= new Date(endDateTime).getTime();
  }, [startDateTime, endDateTime, isFormIncomplete]);

  useEffect(() => {
    const storedWindow = window.localStorage.getItem(storageKey);

    if (!storedWindow) {
      return;
    }

    try {
      const parsedWindow = JSON.parse(
        storedWindow,
      ) as Partial<RegistrationWindowPayload>;

      if (parsedWindow.startDateTime) {
        setStartDateTime(parsedWindow.startDateTime);
      }

      if (parsedWindow.endDateTime) {
        setEndDateTime(parsedWindow.endDateTime);
      }

      if (
        Number.isFinite(parsedWindow.maxAllowedUnits) &&
        Number(parsedWindow.maxAllowedUnits) > 0
      ) {
        setMaxAllowedUnits(
          String(Math.floor(Number(parsedWindow.maxAllowedUnits))),
        );
      }
    } catch {
      // Ignore malformed localStorage values and keep default form values.
    }
  }, []);

  // Backend-ready handler. For now this writes to localStorage so the student countdown page can read it.
  const applyRegistrationPeriod = async () => {
    setNotice(null);

    if (isFormIncomplete) {
      setNotice({
        type: "error",
        message: "Please provide both start and end date/time.",
      });
      return;
    }

    if (isRangeInvalid) {
      setNotice({
        type: "error",
        message: "End date/time must be after start date/time.",
      });
      return;
    }

    if (isMaxUnitsInvalid) {
      setNotice({
        type: "error",
        message: "Maximum allowed units must be between 1 and 60.",
      });
      return;
    }

    const payload: RegistrationWindowPayload = {
      startDateTime,
      endDateTime,
      maxAllowedUnits: Math.floor(parsedMaxUnits),
    };

    try {
      setIsSaving(true);

      // Placeholder persistence until API is wired.
      window.localStorage.setItem(storageKey, JSON.stringify(payload));

      setNotice({
        type: "success",
        message: `Registration period applied successfully. Students will now count down using the configured dates and ${Math.floor(parsedMaxUnits)} max units.`,
      });
    } catch {
      setNotice({
        type: "error",
        message: "Unable to save registration period. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#f1f5f9]"
      style={{ fontFamily: "var(--font-lexend), sans-serif" }}
    >
      <DashboardNavbar />

      <header className="border-b border-[#e2e8f0] bg-white">
        <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-[#1e40af] text-[12px] font-extrabold uppercase text-white">
              AD
            </div>
            <p className="text-[20px] font-extrabold text-[#111827]">ADMIN</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              aria-label="Notifications"
              className="rounded-md p-2 text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-[#334155]"
            >
              <Bell size={18} strokeWidth={2.4} />
            </button>
            <div className="flex size-9 items-center justify-center rounded-full bg-[#e2e8f0] text-[12px] font-extrabold text-[#334155]">
              AD
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-[#e2e8f0] bg-[#f8fafc]">
        <div className="mx-auto flex h-16 w-full max-w-[1180px] items-end justify-center px-6">
          <button className="relative pb-2 text-[20px] font-bold text-[#1d4ed8]">
            Course Registration
            <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#1d4ed8]" />
          </button>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[980px] px-6 py-16">
        <section className="rounded-xl border border-[#dbe4ef] bg-white px-6 py-7 shadow-sm md:px-8">
          <h1 className="inline-flex w-full items-center justify-center gap-2 text-[22px] font-extrabold text-[#1f2937]">
            <Wrench size={19} strokeWidth={2.4} />
            Registration Period Settings
          </h1>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-[15px] font-bold text-[#475569]">
                Start Date & Time
              </span>
              <input
                type="datetime-local"
                value={startDateTime}
                onChange={(event) => setStartDateTime(event.target.value)}
                className="w-full rounded-lg border border-[#cbd5e1] bg-white px-4 py-3 text-[12px] font-semibold text-[#334155] outline-none ring-[#93c5fd] transition focus:ring-2"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[15px] font-bold text-[#475569]">
                End Date & Time
              </span>
              <input
                type="datetime-local"
                value={endDateTime}
                onChange={(event) => setEndDateTime(event.target.value)}
                className="w-full rounded-lg border border-[#cbd5e1] bg-white px-4 py-3 text-[12px] font-semibold text-[#334155] outline-none ring-[#93c5fd] transition focus:ring-2"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[15px] font-bold text-[#475569]">
                Max Units / Semester
              </span>
              <input
                type="number"
                min={1}
                max={60}
                value={maxAllowedUnits}
                onChange={(event) => setMaxAllowedUnits(event.target.value)}
                className="w-full rounded-lg border border-[#cbd5e1] bg-white px-4 py-3 text-[12px] font-semibold text-[#334155] outline-none ring-[#93c5fd] transition focus:ring-2"
              />
            </label>
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={applyRegistrationPeriod}
            className="mt-8 w-full rounded-lg bg-[#2348b5] py-3 text-[20px] font-bold text-white transition-colors hover:bg-[#1d3d96] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Applying..." : "Apply Registration Period"}
          </button>

          {notice ? (
            <p
              className={`mt-4 text-[13px] font-semibold ${
                notice.type === "success" ? "text-[#15803d]" : "text-[#b91c1c]"
              }`}
            >
              {notice.message}
            </p>
          ) : null}

          {isMaxUnitsInvalid ? (
            <p className="mt-2 text-[12px] font-semibold text-[#b91c1c]">
              Enter a value from 1 to 60 units.
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
