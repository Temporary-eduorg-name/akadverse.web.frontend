"use client";

import { MapPin, Mail } from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";
import {
  DEFAULT_LECTURER_IMAGE,
  getCourseLearningContent,
  normalizeLecturerPayload,
  type LecturerProfile,
} from "../learningData";
import { useSharedCourseWorkspace } from "@/app/lib/useSharedCourseWorkspace";

export default function LecturerOverviewPage() {
  const params = useParams<{ courseSlug: string }>();
  const courseSlug = params?.courseSlug ?? "software-engineering";
  const { course, isSharedCourse } = useSharedCourseWorkspace(courseSlug);
  const [lecturers, setLecturers] = React.useState<LecturerProfile[]>(
    isSharedCourse && course
      ? course.lecturers
      : getCourseLearningContent(courseSlug).lecturers,
  );

  React.useEffect(() => {
    if (isSharedCourse && course) {
      setLecturers(course.lecturers);
    }
  }, [course, isSharedCourse]);

  React.useEffect(() => {
    if (isSharedCourse) {
      return;
    }

    let cancelled = false;

    const loadLecturers = async () => {
      try {
        const response = await fetch(
          `/api/e-learning/courses/${courseSlug}/lecturers`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        const normalized = normalizeLecturerPayload(
          Array.isArray(payload) ? payload : payload?.lecturers,
        );

        if (!cancelled && normalized.length > 0) {
          setLecturers(normalized);
        }
      } catch {
        // Keep fallback lecturer data when API is unavailable.
      }
    };

    loadLecturers();

    return () => {
      cancelled = true;
    };
  }, [courseSlug, isSharedCourse]);

  return (
    <section className="space-y-5 pt-2">
      <h2 className="text-[32px] font-black leading-none tracking-[-0.02em] text-[#111827] sm:text-[36px]">
        Lecturer Overview
      </h2>

      <div className="space-y-4">
        {lecturers.map((lecturer) => (
          <article
            key={lecturer.id}
            className="overflow-hidden rounded-[12px] border border-[#d8deea] bg-white"
          >
            <div className="flex flex-col md:flex-row">
              <div className="flex min-h-[180px] w-full items-center justify-center bg-[#edf1f8] px-7 py-6 md:w-[230px]">
                <img
                  src={lecturer.imageUrl || DEFAULT_LECTURER_IMAGE}
                  alt={lecturer.name}
                  className="h-[120px] w-[120px] rounded-full border-2 border-[#dce4f2] object-cover"
                  onError={(event) => {
                    event.currentTarget.src = DEFAULT_LECTURER_IMAGE;
                  }}
                />
              </div>

              <div className="flex-1 px-5 py-4 md:px-6">
                <p className="mb-1 text-[12px] font-bold uppercase tracking-[0.04em] text-[#2450d3]">
                  {lecturer.department}
                </p>
                <h3 className="mb-2 text-[24px] font-black leading-none tracking-[-0.02em] text-[#111827] sm:text-[28px]">
                  {lecturer.name}
                </h3>
                <p className="mb-4 text-[14px] leading-6 text-[#4f5e77]">
                  {lecturer.bio}
                </p>

                <div className="flex flex-col gap-3 text-[13px] text-[#52627d] sm:flex-row sm:items-center sm:gap-10">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#2d53c4]" />
                    <span>Office: {lecturer.office}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#2d53c4]" />
                    <span>{lecturer.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
