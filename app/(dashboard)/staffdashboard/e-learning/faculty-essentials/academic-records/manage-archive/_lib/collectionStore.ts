export type RequirementRow = {
  id: string;
  name: string;
  fileType: string;
  maxSize: string;
};

export type CollectionLifecycle = "active" | "draft" | "archived";

export type DocumentCollection = {
  id: string;
  title: string;
  level: string;
  department: string;
  program: string;
  targetGroups: string[];
  requirements: RequirementRow[];
  startDateTime: string;
  endDateTime: string;
  totalMembers: number;
  submittedCount: number;
  lifecycle: CollectionLifecycle;
  createdAt: string;
};

export const COLLECTIONS_STORAGE_KEY = "staffDocumentCollections";
export const HOD_SUBMISSION_WINDOW_STORAGE_KEY = "hodDocumentSubmissionWindow";

const DEFAULT_COLLECTIONS: DocumentCollection[] = [
  {
    id: "hod-2024-ongoing",
    title: "HOD",
    level: "100 Level",
    department: "Electrical Engineering",
    program: "Electrical Electronics",
    targetGroups: ["100 lvl, ETE, Elect Elect"],
    requirements: [
      { id: "r1", name: "Project Report", fileType: "PDF", maxSize: "5 MB" },
      {
        id: "r2",
        name: "Official Transcripts",
        fileType: "PDF",
        maxSize: "10 MB",
      },
    ],
    startDateTime: "2026-03-20T08:00",
    endDateTime: "2026-12-15T23:59",
    totalMembers: 124,
    submittedCount: 82,
    lifecycle: "active",
    createdAt: "2026-03-15T10:12:00.000Z",
  },
  {
    id: "coren-2024-reviewing",
    title: "COREN",
    level: "300 Level",
    department: "Petroleum Engineering",
    program: "PSIR Inter rel",
    targetGroups: ["300lvl PSIR Inter rel"],
    requirements: [
      {
        id: "r1",
        name: "Government ID Card",
        fileType: "JPG/PNG",
        maxSize: "2 MB",
      },
      {
        id: "r2",
        name: "Recommendation Letters",
        fileType: "PDF",
        maxSize: "5 MB",
      },
    ],
    startDateTime: "2026-02-01T08:00",
    endDateTime: "2026-11-30T23:59",
    totalMembers: 45,
    submittedCount: 41,
    lifecycle: "active",
    createdAt: "2026-02-10T09:00:00.000Z",
  },
  {
    id: "hod-pending-2026",
    title: "HOD",
    level: "400 Level",
    department: "Computer Science",
    program: "B.Sc Computer Science",
    targetGroups: ["400lvl, CSC"],
    requirements: [
      { id: "r1", name: "Semester Result", fileType: "PDF", maxSize: "8 MB" },
    ],
    startDateTime: "2026-11-01T08:00",
    endDateTime: "2026-12-15T23:59",
    totalMembers: 124,
    submittedCount: 62,
    lifecycle: "active",
    createdAt: "2026-03-22T09:12:00.000Z",
  },
  {
    id: "coren-pending-2026",
    title: "COREN",
    level: "500 Level",
    department: "Mechanical Engineering",
    program: "Mech, Mech",
    targetGroups: ["500 lvl Mech, Mech"],
    requirements: [
      {
        id: "r1",
        name: "Curriculum Review Report",
        fileType: "PDF",
        maxSize: "20 MB",
      },
    ],
    startDateTime: "2026-10-15T08:00",
    endDateTime: "2026-11-30T23:59",
    totalMembers: 45,
    submittedCount: 41,
    lifecycle: "active",
    createdAt: "2026-03-18T13:20:00.000Z",
  },
  {
    id: "draft-cert-2024",
    title: "Certification Documents",
    level: "300 Level",
    department: "Mathematics",
    program: "B.Sc Mathematics",
    targetGroups: ["300lvl Maths"],
    requirements: [
      {
        id: "r1",
        name: "Certification Proof",
        fileType: "PDF",
        maxSize: "5 MB",
      },
    ],
    startDateTime: "2026-01-01T08:00",
    endDateTime: "2026-05-20T23:59",
    totalMembers: 112,
    submittedCount: 112,
    lifecycle: "draft",
    createdAt: "2026-01-10T08:00:00.000Z",
  },
  {
    id: "draft-annual-2023",
    title: "2023 Annual Faculty Performance Reviews",
    level: "200 Level",
    department: "Physics",
    program: "B.Sc Physics",
    targetGroups: ["200lvl Physics"],
    requirements: [
      {
        id: "r1",
        name: "Performance Review",
        fileType: "PDF",
        maxSize: "10 MB",
      },
    ],
    startDateTime: "2025-01-01T08:00",
    endDateTime: "2025-01-15T23:59",
    totalMembers: 56,
    submittedCount: 56,
    lifecycle: "draft",
    createdAt: "2025-01-01T08:00:00.000Z",
  },
  {
    id: "archived-spring-2024",
    title: "Spring 2024 Certification Documents",
    level: "100 Level",
    department: "Computer Science",
    program: "B.Sc IT",
    targetGroups: ["100lvl CSC"],
    requirements: [
      {
        id: "r1",
        name: "Official Transcript",
        fileType: "PDF",
        maxSize: "10 MB",
      },
    ],
    startDateTime: "2024-01-01T08:00",
    endDateTime: "2024-05-20T23:59",
    totalMembers: 112,
    submittedCount: 112,
    lifecycle: "archived",
    createdAt: "2024-01-01T08:00:00.000Z",
  },
  {
    id: "archived-annual-2023",
    title: "2023 Annual Faculty Performance Reviews",
    level: "200 Level",
    department: "Physics",
    program: "B.Sc Physics",
    targetGroups: ["200lvl Physics"],
    requirements: [
      { id: "r1", name: "Review Form", fileType: "PDF", maxSize: "10 MB" },
    ],
    startDateTime: "2023-12-01T08:00",
    endDateTime: "2024-01-15T23:59",
    totalMembers: 56,
    submittedCount: 56,
    lifecycle: "archived",
    createdAt: "2023-12-01T08:00:00.000Z",
  },
  {
    id: "archived-grant-2023",
    title: "Fall 2023 Grant Proposal Submissions",
    level: "500 Level",
    department: "Mechanical Engineering",
    program: "B.Eng Mechanical",
    targetGroups: ["500lvl Mech"],
    requirements: [
      { id: "r1", name: "Grant Proposal", fileType: "PDF", maxSize: "10 MB" },
    ],
    startDateTime: "2023-09-01T08:00",
    endDateTime: "2023-12-01T23:59",
    totalMembers: 89,
    submittedCount: 89,
    lifecycle: "archived",
    createdAt: "2023-09-01T08:00:00.000Z",
  },
];

export function getDocumentCollections(): DocumentCollection[] {
  if (typeof window === "undefined") return DEFAULT_COLLECTIONS;

  const raw = window.localStorage.getItem(COLLECTIONS_STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(
      COLLECTIONS_STORAGE_KEY,
      JSON.stringify(DEFAULT_COLLECTIONS),
    );
    return DEFAULT_COLLECTIONS;
  }

  try {
    const parsed = JSON.parse(raw) as DocumentCollection[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      window.localStorage.setItem(
        COLLECTIONS_STORAGE_KEY,
        JSON.stringify(DEFAULT_COLLECTIONS),
      );
      return DEFAULT_COLLECTIONS;
    }
    return parsed;
  } catch {
    window.localStorage.setItem(
      COLLECTIONS_STORAGE_KEY,
      JSON.stringify(DEFAULT_COLLECTIONS),
    );
    return DEFAULT_COLLECTIONS;
  }
}

export function saveDocumentCollections(collections: DocumentCollection[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    COLLECTIONS_STORAGE_KEY,
    JSON.stringify(collections),
  );
}

export function upsertDocumentCollection(collection: DocumentCollection) {
  const collections = getDocumentCollections();
  const existingIndex = collections.findIndex((item) => item.id === collection.id);

  if (existingIndex === -1) {
    collections.unshift(collection);
  } else {
    collections[existingIndex] = collection;
  }

  saveDocumentCollections(collections);
  return collections;
}

export function deleteDocumentCollection(collectionId: string) {
  const collections = getDocumentCollections().filter(
    (item) => item.id !== collectionId,
  );
  saveDocumentCollections(collections);
  return collections;
}

export function computeCollectionState(
  collection: DocumentCollection,
  nowMs = Date.now(),
): "ongoing" | "pending" | "draft" | "closed" {
  if (collection.lifecycle === "draft") return "draft";
  if (collection.lifecycle === "archived") return "closed";

  const startMs = new Date(collection.startDateTime).getTime();
  const endMs = new Date(collection.endDateTime).getTime();

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return "pending";
  if (nowMs < startMs) return "pending";
  if (nowMs > endMs) return "closed";
  return "ongoing";
}

export function formatDateRange(startDateTime: string, endDateTime: string) {
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);

  const fmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  return `${fmt.format(start)} - ${fmt.format(end)}`;
}

export function toPercent(submittedCount: number, totalMembers: number) {
  if (totalMembers <= 0) return 0;
  return Math.min(100, Math.round((submittedCount / totalMembers) * 100));
}

export function createCollectionId(name: string) {
  const normalized = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${normalized || "collection"}-${Date.now()}`;
}
