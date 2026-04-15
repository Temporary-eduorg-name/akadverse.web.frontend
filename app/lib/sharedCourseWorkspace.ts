import {
  Blocks,
  Bug,
  Cloud,
  Database,
  Gauge,
  GitBranch,
  Layers3,
  Shield,
  TerminalSquare,
  Users,
  Wrench,
} from "lucide-react";

export type SharedOutcomeIcon = "git" | "blocks" | "shield" | "gauge";

export type SharedCompetencyIcon =
  | "layers"
  | "users"
  | "wrench"
  | "cloud"
  | "database"
  | "bug"
  | "shield"
  | "terminal";

export type SharedCourseOutcome = {
  icon: SharedOutcomeIcon;
  title: string;
  description: string;
  metric: string;
};

export type SharedCourseCompetency = {
  icon: SharedCompetencyIcon;
  name: string;
};

export type SharedCourseLecturer = {
  id: string;
  name: string;
  department: string;
  bio: string;
  office: string;
  email: string;
  imageUrl?: string;
};

export type SharedCourseNote = {
  id: string;
  name: string;
  fileType: string;
  size: string;
  assetId?: string;
  fileUrl?: string;
};

export type SharedCourseLink = {
  name: string;
  url: string;
};

export type SharedCourseWeek = {
  weekNumber: number;
  weekLabel: string;
  title: string;
  description: string;
  focusSummary: string;
  keyTopics: string[];
  deadline?: string;
  notes: SharedCourseNote[];
  links: SharedCourseLink[];
};

export type SharedCourseModule = {
  id: string;
  title: string;
  weeks: SharedCourseWeek[];
};

export type SharedCourseStudent = {
  id: string;
  name: string;
  email: string;
  enrollmentId: string;
  joinedAt: string;
  program: string;
  initials: string;
  accentClass: string;
  carryover?: boolean;
};

export type SharedCourseWorkspace = {
  slug: string;
  aliases: string[];
  code: string;
  title: string;
  summary: string;
  department: string;
  credits: number;
  level: string;
  semester: string;
  section: string;
  contactHours: string;
  prerequisite: string;
  overview: {
    description: string[];
    keyDetails: Array<{ label: string; value: string }>;
    objectives: string[];
  };
  learningOutcomes: SharedCourseOutcome[];
  competencies: SharedCourseCompetency[];
  lecturers: SharedCourseLecturer[];
  modules: SharedCourseModule[];
  students: SharedCourseStudent[];
};

export const SHARED_OUTCOME_ICON_MAP = {
  git: GitBranch,
  blocks: Blocks,
  shield: Shield,
  gauge: Gauge,
} as const;

export const SHARED_COMPETENCY_ICON_MAP = {
  layers: Layers3,
  users: Users,
  wrench: Wrench,
  cloud: Cloud,
  database: Database,
  bug: Bug,
  shield: Shield,
  terminal: TerminalSquare,
} as const;

export const SHARED_COURSE_STORAGE_KEY =
  "akadverse-shared-course-workspace-v1";
export const SHARED_COURSE_EVENT = "akadverse-shared-course-workspace-update";

export const DEFAULT_SHARED_COURSE_SLUG = "advanced-software-engineering";

const ADVANCED_SOFTWARE_ENGINEERING_WORKSPACE: SharedCourseWorkspace = {
  slug: "advanced-software-engineering",
  aliases: ["software-engineering"],
  code: "CS402",
  title: "Advanced Software Engineering",
  summary:
    "Master CI/CD pipelines, production architecture, and collaborative software delivery at scale.",
  department: "COMPUTER SCIENCE DEPARTMENT",
  credits: 6,
  level: "400 Level",
  semester: "Rain Semester",
  section: "A-01",
  contactHours: "3 Lectures / Week",
  prerequisite: "CS301",
  overview: {
    description: [
      "CS402: Advanced Software Engineering provides an in-depth exploration of contemporary software development paradigms. This course focuses on mastering high-level architectural patterns, building resilient and scalable distributed systems, and implementing advanced agile delivery pipelines.",
      "Students engage with real-world engineering scenarios, learning to balance technical debt, performance optimization, release confidence, and security considerations in a professional software environment.",
    ],
    keyDetails: [
      { label: "Credits", value: "6 Units" },
      { label: "Level", value: "400 Level" },
      { label: "Semester", value: "Rain Semester" },
      { label: "Section", value: "A-01" },
      { label: "Contact Hours", value: "3 Lectures / Week" },
      { label: "Prerequisite", value: "CS301" },
    ],
    objectives: [
      "Design maintainable large-scale software systems using layered and service-oriented architectures.",
      "Guide students through agile planning, issue decomposition, sprint delivery, and release retrospectives.",
      "Teach advanced testing, observability, and reliability concepts for production software.",
      "Evaluate student outputs across technical depth, collaboration quality, and engineering tradeoffs.",
    ],
  },
  learningOutcomes: [
    {
      icon: "git",
      title: "Understand advanced SDLC models",
      description:
        "Master Waterfall, Agile, and DevOps methodologies in depth for enterprise projects.",
      metric: "82% target mastery",
    },
    {
      icon: "blocks",
      title: "Analyze architectural patterns",
      description:
        "Evaluate microservices, serverless, and modular monolith architectures for scalability and maintainability.",
      metric: "90% project completion",
    },
    {
      icon: "shield",
      title: "Implement secure delivery practices",
      description:
        "Apply industry-standard security checks throughout planning, coding, testing, and release workflows.",
      metric: "75% quality benchmark",
    },
    {
      icon: "gauge",
      title: "Optimize system performance",
      description:
        "Identify bottlenecks and implement caching, monitoring, and database tuning strategies.",
      metric: "Peer review average 4.2/5",
    },
  ],
  competencies: [
    { icon: "layers", name: "System Design" },
    { icon: "users", name: "Agile Delivery" },
    { icon: "wrench", name: "Refactoring" },
    { icon: "cloud", name: "Cloud Infrastructure" },
    { icon: "database", name: "SQL & NoSQL" },
    { icon: "bug", name: "Test Automation" },
    { icon: "shield", name: "App Security" },
    { icon: "terminal", name: "Linux Systems" },
  ],
  lecturers: [
    {
      id: "lecturer-1",
      name: "Prof. Sarah Jenkins",
      department: "DEPARTMENT OF COMPUTER SCIENCE",
      bio: "Prof. Sarah Jenkins leads the course with a focus on enterprise software architecture, release engineering, and reliability practices for large-scale academic platforms.",
      office: "Innovation Hub, Room 402",
      email: "sarah.jenkins@akadverse.edu",
      imageUrl:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=320&q=80",
    },
  ],
  modules: [
    {
      id: "module-1",
      title: "Module 1",
      weeks: [
        {
          weekNumber: 1,
          weekLabel: "WEEK 01",
          title: "Introduction to Software Design Patterns",
          description:
            "Foundations of the course covering why architectural patterns matter in large-scale systems and revisiting SOLID principles.",
          focusSummary:
            "Understanding design quality, modular decomposition, and the patterns that support maintainable systems.",
          keyTopics: [
            "Creational Patterns",
            "Structural Patterns",
            "SOLID Principles",
          ],
          notes: [
            {
              id: "w1-note-1",
              name: "Intro Pattern Notes",
              fileType: "PDF",
              size: "2.1MB",
            },
            {
              id: "w1-note-2",
              name: "SOLID Overview",
              fileType: "PDF",
              size: "1.4MB",
            },
          ],
          links: [
            {
              name: "Martin Fowler on Microservices",
              url: "https://martinfowler.com/articles/microservices.html",
            },
            {
              name: "Refactoring Guru Design Patterns",
              url: "https://refactoring.guru/design-patterns",
            },
          ],
        },
        {
          weekNumber: 2,
          weekLabel: "WEEK 02",
          title: "Microservices Architecture & Event-Driven Systems",
          description:
            "Transitioning from monoliths to service-oriented systems while managing contracts, communication, and state.",
          focusSummary:
            "Understanding asynchronous communication with message brokers and service discovery patterns.",
          keyTopics: ["API Gateways", "Kafka/RabbitMQ", "Service Discovery"],
          notes: [
            {
              id: "w2-note-1",
              name: "Microservice Events",
              fileType: "PDF",
              size: "2.7MB",
            },
          ],
          links: [
            {
              name: "Azure Event-Driven Architecture Guide",
              url: "https://learn.microsoft.com/azure/architecture/guide/architecture-styles/event-driven",
            },
          ],
        },
        {
          weekNumber: 3,
          weekLabel: "WEEK 03",
          title: "Domain-Driven Design",
          description:
            "Aligning software design with business domains using bounded contexts, aggregates, and shared language.",
          focusSummary:
            "Breaking complex requirements into manageable sub-domains and clear interface boundaries.",
          keyTopics: [
            "Bounded Contexts",
            "Entities & Value Objects",
            "Aggregates",
          ],
          notes: [
            {
              id: "w3-note-1",
              name: "DDD Foundations",
              fileType: "PDF",
              size: "2.0MB",
            },
          ],
          links: [
            {
              name: "DDD Reference",
              url: "https://martinfowler.com/bliki/DomainDrivenDesign.html",
            },
          ],
        },
      ],
    },
    {
      id: "module-2",
      title: "Module 2",
      weeks: [
        {
          weekNumber: 4,
          weekLabel: "WEEK 04",
          title: "Project Milestone 1: System Proposal",
          description:
            "Submission of the technical proposal for the semester-long group project with defense sessions scheduled for Friday.",
          focusSummary:
            "Presenting a cohesive architectural plan that addresses scalability, security, and the selected technology stack.",
          keyTopics: ["Architecture Diagram", "Technology Stack", "Timeline"],
          deadline: "Friday, 11:59 PM",
          notes: [
            {
              id: "w4-note-1",
              name: "Proposal Template",
              fileType: "DOC",
              size: "920KB",
            },
            {
              id: "w4-note-2",
              name: "Defense Rubric",
              fileType: "PDF",
              size: "1.8MB",
            },
            {
              id: "w4-note-3",
              name: "Architecture Checklist",
              fileType: "PDF",
              size: "2.3MB",
            },
          ],
          links: [
            {
              name: "Proposal Writing Guide",
              url: "https://owl.purdue.edu/owl/general_writing/common_writing_assignments/research_papers/index.html",
            },
            {
              name: "Azure Architecture Patterns",
              url: "https://learn.microsoft.com/azure/architecture/patterns/",
            },
          ],
        },
        {
          weekNumber: 5,
          weekLabel: "WEEK 05",
          title: "Cloud-Native Delivery & DevOps",
          description:
            "Implementing CI/CD pipelines and exploring container orchestration using Kubernetes and Docker.",
          focusSummary:
            "Automating the deployment lifecycle and understanding infrastructure as code principles.",
          keyTopics: ["GitHub Actions", "Kubernetes Helm", "Terraform"],
          notes: [
            {
              id: "w5-note-1",
              name: "DevOps Playbook",
              fileType: "PDF",
              size: "2.6MB",
            },
          ],
          links: [
            {
              name: "Kubernetes Documentation",
              url: "https://kubernetes.io/docs/home/",
            },
          ],
        },
        {
          weekNumber: 6,
          weekLabel: "WEEK 06",
          title: "Observability, Monitoring & Incident Response",
          description:
            "Building dashboards, setting SLOs, and responding to production incidents using structured playbooks.",
          focusSummary:
            "Designing meaningful alerting strategies and reducing MTTR with incident review loops.",
          keyTopics: ["SLO/SLI", "Tracing", "Incident Postmortems"],
          notes: [
            {
              id: "w6-note-1",
              name: "Observability Starter Kit",
              fileType: "ZIP",
              size: "5.2MB",
            },
          ],
          links: [
            {
              name: "Google SRE Workbook",
              url: "https://sre.google/books/",
            },
          ],
        },
      ],
    },
  ],
  students: [
    {
      id: "1",
      name: "Harry Asiwaju",
      email: "h.asiwaju@stu.cu.edu.ng",
      enrollmentId: "23CJ033467",
      joinedAt: "Aug 24, 2024",
      program: "Software Engineering",
      initials: "HA",
      accentClass: "bg-blue-100 text-blue-800",
    },
    {
      id: "2",
      name: "Kasper Muller",
      email: "k.muller@stu.cu.edu.ng",
      enrollmentId: "23CJ033468",
      joinedAt: "Aug 22, 2024",
      program: "Computer Science",
      initials: "KM",
      accentClass: "bg-orange-100 text-orange-800",
      carryover: true,
    },
    {
      id: "3",
      name: "Juno Liao",
      email: "j.liao@stu.cu.edu.ng",
      enrollmentId: "23CJ033469",
      joinedAt: "Aug 25, 2024",
      program: "Computer Science",
      initials: "JL",
      accentClass: "bg-indigo-100 text-indigo-800",
    },
    {
      id: "4",
      name: "Soren Borg",
      email: "s.borg@stu.cu.edu.ng",
      enrollmentId: "23CJ033470",
      joinedAt: "Sep 01, 2024",
      program: "Information Systems",
      initials: "SB",
      accentClass: "bg-rose-100 text-rose-700",
    },
    {
      id: "5",
      name: "Adaeze Nnaji",
      email: "a.nnaji@stu.cu.edu.ng",
      enrollmentId: "23CJ033471",
      joinedAt: "Sep 03, 2024",
      program: "Software Engineering",
      initials: "AN",
      accentClass: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "6",
      name: "David Kone",
      email: "d.kone@stu.cu.edu.ng",
      enrollmentId: "23CJ033472",
      joinedAt: "Sep 05, 2024",
      program: "Computer Engineering",
      initials: "DK",
      accentClass: "bg-sky-100 text-sky-800",
      carryover: true,
    },
    {
      id: "7",
      name: "Mariam Yusuf",
      email: "m.yusuf@stu.cu.edu.ng",
      enrollmentId: "23CJ033473",
      joinedAt: "Sep 07, 2024",
      program: "Data Science",
      initials: "MY",
      accentClass: "bg-fuchsia-100 text-fuchsia-800",
    },
    {
      id: "8",
      name: "Leo Martins",
      email: "l.martins@stu.cu.edu.ng",
      enrollmentId: "23CJ033474",
      joinedAt: "Sep 08, 2024",
      program: "Software Engineering",
      initials: "LM",
      accentClass: "bg-cyan-100 text-cyan-800",
    },
    {
      id: "9",
      name: "Nora Bello",
      email: "n.bello@stu.cu.edu.ng",
      enrollmentId: "23CJ033475",
      joinedAt: "Sep 10, 2024",
      program: "Information Technology",
      initials: "NB",
      accentClass: "bg-violet-100 text-violet-800",
      carryover: true,
    },
    {
      id: "10",
      name: "Ethan Park",
      email: "e.park@stu.cu.edu.ng",
      enrollmentId: "23CJ033476",
      joinedAt: "Sep 11, 2024",
      program: "Cybersecurity",
      initials: "EP",
      accentClass: "bg-amber-100 text-amber-800",
    },
    {
      id: "11",
      name: "Tomiwa Ajayi",
      email: "t.ajayi@stu.cu.edu.ng",
      enrollmentId: "23CJ033477",
      joinedAt: "Sep 14, 2024",
      program: "Software Engineering",
      initials: "TA",
      accentClass: "bg-lime-100 text-lime-800",
    },
    {
      id: "12",
      name: "Grace Okoro",
      email: "g.okoro@stu.cu.edu.ng",
      enrollmentId: "23CJ033478",
      joinedAt: "Sep 16, 2024",
      program: "Computer Science",
      initials: "GO",
      accentClass: "bg-teal-100 text-teal-800",
    },
  ],
};

export const SHARED_COURSE_WORKSPACES: Record<string, SharedCourseWorkspace> = {
  [ADVANCED_SOFTWARE_ENGINEERING_WORKSPACE.slug]:
    ADVANCED_SOFTWARE_ENGINEERING_WORKSPACE,
};

export function resolveSharedCourseSlug(courseSlug: string) {
  if (SHARED_COURSE_WORKSPACES[courseSlug]) {
    return courseSlug;
  }

  const matchedCourse = Object.values(SHARED_COURSE_WORKSPACES).find((course) =>
    course.aliases.includes(courseSlug),
  );

  return matchedCourse?.slug ?? null;
}

export function getSharedCourseWorkspaceBase(courseSlug: string) {
  const resolvedSlug = resolveSharedCourseSlug(courseSlug);
  return resolvedSlug ? SHARED_COURSE_WORKSPACES[resolvedSlug] : null;
}

export function getSharedCourseWeeks(course: SharedCourseWorkspace) {
  return course.modules.flatMap((module) => module.weeks);
}

export function getSharedCourseStats(course: SharedCourseWorkspace) {
  const totalStudents = course.students.length;
  const totalPrograms = new Set(course.students.map((student) => student.program))
    .size;
  const totalCarryovers = course.students.filter(
    (student) => student.carryover,
  ).length;

  return {
    totalStudents,
    totalPrograms,
    totalCarryovers,
  };
}

export function getPreferredFacultyCourseSlug(_user?: {
  email?: string;
  role?: string;
}) {
  return DEFAULT_SHARED_COURSE_SLUG;
}

function sanitizeStoredNote(note: SharedCourseNote): SharedCourseNote {
  if (note.assetId) {
    return {
      ...note,
      fileUrl: undefined,
    };
  }

  if (note.fileUrl?.startsWith("data:")) {
    return {
      ...note,
      fileUrl: undefined,
    };
  }

  return note;
}

export function sanitizeCourseWorkspaceForStorage(
  course: SharedCourseWorkspace,
): SharedCourseWorkspace {
  return {
    ...course,
    modules: course.modules.map((module) => ({
      ...module,
      weeks: module.weeks.map((week) => ({
        ...week,
        notes: week.notes.map(sanitizeStoredNote),
      })),
    })),
  };
}
