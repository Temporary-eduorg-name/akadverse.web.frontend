"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SHARED_COURSE_EVENT,
  SHARED_COURSE_STORAGE_KEY,
  sanitizeCourseWorkspaceForStorage,
  type SharedCourseWorkspace,
  getPreferredFacultyCourseSlug,
  getSharedCourseWorkspaceBase,
  resolveSharedCourseSlug,
} from "@/app/lib/sharedCourseWorkspace";

function isBrowser() {
  return typeof window !== "undefined";
}

function readStoredCourses() {
  if (!isBrowser()) {
    return {} as Record<string, SharedCourseWorkspace>;
  }

  try {
    const raw = window.localStorage.getItem(SHARED_COURSE_STORAGE_KEY);
    if (!raw) {
      return {} as Record<string, SharedCourseWorkspace>;
    }

    const parsed = JSON.parse(raw) as Record<string, SharedCourseWorkspace>;
    if (!parsed || typeof parsed !== "object") {
      return {} as Record<string, SharedCourseWorkspace>;
    }

    const sanitizedEntries = Object.entries(parsed).map(([slug, course]) => [
      slug,
      sanitizeCourseWorkspaceForStorage(course),
    ]);

    return Object.fromEntries(sanitizedEntries) as Record<
      string,
      SharedCourseWorkspace
    >;
  } catch {
    return {} as Record<string, SharedCourseWorkspace>;
  }
}

function writeStoredCourse(slug: string, course: SharedCourseWorkspace) {
  if (!isBrowser()) {
    return;
  }

  const allCourses = readStoredCourses();
  allCourses[slug] = sanitizeCourseWorkspaceForStorage(course);
  window.localStorage.setItem(
    SHARED_COURSE_STORAGE_KEY,
    JSON.stringify(allCourses),
  );
  window.dispatchEvent(new CustomEvent(SHARED_COURSE_EVENT, { detail: slug }));
}

function loadCourseFromStorage(slug: string, fallback: SharedCourseWorkspace) {
  return readStoredCourses()[slug] ?? fallback;
}

export function useSharedCourseWorkspace(courseSlug: string) {
  const resolvedSlug = useMemo(
    () => resolveSharedCourseSlug(courseSlug),
    [courseSlug],
  );
  const baseCourse = useMemo(
    () =>
      resolvedSlug ? getSharedCourseWorkspaceBase(resolvedSlug) : null,
    [resolvedSlug],
  );
  const [course, setCourse] = useState<SharedCourseWorkspace | null>(
    baseCourse ?? null,
  );

  useEffect(() => {
    if (!resolvedSlug || !baseCourse) {
      setCourse(null);
      return;
    }

    const syncCourse = () => {
      setCourse(loadCourseFromStorage(resolvedSlug, baseCourse));
    };

    syncCourse();

    const handleStorage = (event: StorageEvent) => {
      if (
        !event.key ||
        event.key === SHARED_COURSE_STORAGE_KEY
      ) {
        syncCourse();
      }
    };

    const handleCustomUpdate = () => {
      syncCourse();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(SHARED_COURSE_EVENT, handleCustomUpdate);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(SHARED_COURSE_EVENT, handleCustomUpdate);
    };
  }, [baseCourse, resolvedSlug]);

  const updateCourse = useCallback(
    (
      updater:
        | SharedCourseWorkspace
        | ((current: SharedCourseWorkspace) => SharedCourseWorkspace),
    ) => {
      if (!resolvedSlug || !baseCourse) {
        return;
      }

      setCourse((current) => {
        const safeCurrent = current ?? baseCourse;
        const nextCourse =
          typeof updater === "function" ? updater(safeCurrent) : updater;
        writeStoredCourse(resolvedSlug, nextCourse);
        return nextCourse;
      });
    },
    [baseCourse, resolvedSlug],
  );

  return {
    course,
    resolvedSlug,
    isSharedCourse: Boolean(course && resolvedSlug),
    updateCourse,
  };
}

export function getFacultyLandingPath(user?: { email?: string; role?: string }) {
  const slug = getPreferredFacultyCourseSlug(user);
  return `/staffdashboard/e-learning/my-learning/${slug}/course-overview`;
}
