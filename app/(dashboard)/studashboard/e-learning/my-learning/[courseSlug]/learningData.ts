export type LearningOutcomeItem = {
  icon: "git" | "blocks" | "shield" | "gauge";
  title: string;
  description: string;
};

export type CompetencyItem = {
  icon:
    | "layers"
    | "users"
    | "wrench"
    | "cloud"
    | "database"
    | "bug"
    | "shield"
    | "terminal";
  name: string;
};

export type LecturerProfile = {
  id: string;
  name: string;
  department: string;
  bio: string;
  office: string;
  email: string;
  imageUrl?: string;
};

export type WeeklyNote = {
  id: string;
  name: string;
  fileType: string;
  size: string;
  fileUrl?: string;
};

export type WeekItem = {
  weekNumber: number;
  weekLabel: string;
  title: string;
  description: string;
  focusSummary: string;
  keyTopics: string[];
  deadline?: string;
  notes: WeeklyNote[];
  links: Array<{ name: string; url: string }>;
};

export type ModuleItem = {
  id: string;
  title: string;
  weeks: WeekItem[];
};

export type CourseLearningContent = {
  outcomes: LearningOutcomeItem[];
  competencies: CompetencyItem[];
  lecturers: LecturerProfile[];
  modules: ModuleItem[];
};

export const DEFAULT_LECTURER_IMAGE =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=320&q=80";

const BASE_CONTENT: CourseLearningContent = {
  outcomes: [
    {
      icon: "git",
      title: "Understand advanced SDLC models",
      description:
        "Master Waterfall, Agile, and DevOps methodologies in depth for enterprise projects.",
    },
    {
      icon: "blocks",
      title: "Analyze architectural patterns",
      description:
        "Evaluate microservices, serverless, and monolithic architectures for scalability.",
    },
    {
      icon: "shield",
      title: "Implement secure protocols",
      description:
        "Apply industry-standard security practices throughout the development lifecycle.",
    },
    {
      icon: "gauge",
      title: "Optimize system performance",
      description:
        "Identify bottlenecks and implement caching and database tuning strategies.",
    },
  ],
  competencies: [
    { icon: "layers", name: "System Design" },
    { icon: "users", name: "Agile Methodology" },
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
      name: "Dr. Jane Smith",
      department: "DEPARTMENT OF COMPUTER SCIENCE",
      bio: "Dr. Jane Smith is a Senior Professor with over 15 years of experience in distributed systems and software architecture. She previously led engineering teams at top-tier technology firms before joining academia to focus on the evolution of microservices and formal verification methods in software engineering.",
      office: "Science Building, Room 402",
      email: "jane.smith@university.edu",
      imageUrl:
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=320&q=80",
    },
    {
      id: "lecturer-2",
      name: "Dr. Sarah Chen",
      department: "DEPARTMENT OF COMPUTER SCIENCE",
      bio: "Dr. Sarah Chen is an expert in Human-Computer Interaction and Agile project management. Her work investigates how collaborative software tools can be designed to improve developer productivity and team dynamics in remote environments.",
      office: "Tech Annex, Room 102",
      email: "sarah.chen@university.edu",
      imageUrl:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=320&q=80",
    },
    {
      id: "lecturer-3",
      name: "Prof. David Okafor",
      department: "DEPARTMENT OF COMPUTER SCIENCE",
      bio: "Prof. David Okafor focuses on secure software delivery pipelines and reliability engineering for cloud-native systems. His recent publications address observability and chaos testing in large-scale learning platforms.",
      office: "Innovation Hub, Room 210",
      email: "david.okafor@university.edu",
      imageUrl:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=320&q=80",
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
            "Foundation of the course covering why architectural patterns matter in large-scale systems and revisiting SOLID principles.",
          focusSummary:
            "Understanding asynchronous communication using message brokers and managing state across distributed services.",
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
              fileUrl: "/sample-notes/week1-intro-patterns.pdf",
            },
            {
              id: "w1-note-2",
              name: "SOLID Overview",
              fileType: "PDF",
              size: "1.4MB",
              fileUrl: "/sample-notes/week1-solid-overview.pdf",
            },
          ],
          links: [
            {
              name: "Online Article (Web)",
              url: "https://martinfowler.com/articles/microservices.html",
            },
            {
              name: "External Resources Online",
              url: "https://refactoring.guru/design-patterns",
            },
          ],
        },
        {
          weekNumber: 2,
          weekLabel: "WEEK 02",
          title: "Microservices Architecture & Event-Driven Systems",
          description:
            "Transitioning from Monoliths to Microservices. Exploring communication protocols, data consistency, and event sourcing.",
          focusSummary:
            "Understanding asynchronous communication using message brokers and managing state across distributed services.",
          keyTopics: ["API Gateways", "Kafka/RabbitMQ", "Service Discovery"],
          notes: [
            {
              id: "w2-note-1",
              name: "Microservice Events",
              fileType: "PDF",
              size: "2.7MB",
              fileUrl: "/sample-notes/week2-microservices-events.pdf",
            },
          ],
          links: [
            {
              name: "Event-Driven Guide",
              url: "https://learn.microsoft.com/azure/architecture/guide/architecture-styles/event-driven",
            },
          ],
        },
        {
          weekNumber: 3,
          weekLabel: "WEEK 03",
          title: "Domain-Driven Design (DDD)",
          description:
            "Mastering the art of aligning software design with business domains using bounded contexts and ubiquitous language.",
          focusSummary:
            "Breaking down complex business requirements into manageable sub-domains and defining clear interface boundaries between aggregates.",
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
              fileUrl: "/sample-notes/week3-ddd-foundations.pdf",
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
            "Submission of the technical proposal for the semester-long group project. Defense sessions scheduled for Friday.",
          focusSummary:
            "Presenting a cohesive architectural plan that addresses scalability, security, and the selected technology stack for the group project.",
          keyTopics: ["Architecture Diagram", "Technology Stack", "Timeline"],
          deadline: "Friday, 11:59 PM",
          notes: [
            {
              id: "w4-note-1",
              name: "Proposal Template",
              fileType: "DOC",
              size: "920KB",
              fileUrl: "/sample-notes/week4-proposal-template.docx",
            },
            {
              id: "w4-note-2",
              name: "Defense Rubric",
              fileType: "PDF",
              size: "1.8MB",
              fileUrl: "/sample-notes/week4-defense-rubric.pdf",
            },
            {
              id: "w4-note-3",
              name: "Architecture Checklist",
              fileType: "PDF",
              size: "2.3MB",
              fileUrl: "/sample-notes/week4-architecture-checklist.pdf",
            },
          ],
          links: [
            {
              name: "Proposal Writing Guide",
              url: "https://owl.purdue.edu/owl/general_writing/common_writing_assignments/research_papers/index.html",
            },
            {
              name: "Architecture Patterns",
              url: "https://learn.microsoft.com/azure/architecture/patterns/",
            },
          ],
        },
        {
          weekNumber: 5,
          weekLabel: "WEEK 05 (UPCOMING)",
          title: "Cloud-Native Delivery & DevOps",
          description:
            "Implementing CI/CD pipelines and exploring container orchestration using Kubernetes and Docker.",
          focusSummary:
            "Automating the deployment lifecycle and understanding infrastructure as code (IaC) principles.",
          keyTopics: ["GitHub Actions", "Kubernetes Helm", "Terraform"],
          notes: [
            {
              id: "w5-note-1",
              name: "DevOps Playbook",
              fileType: "PDF",
              size: "2.6MB",
              fileUrl: "/sample-notes/week5-devops-playbook.pdf",
            },
          ],
          links: [
            {
              name: "Kubernetes Docs",
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
              name: "Reliability Handbook",
              url: "https://sre.google/books/",
            },
          ],
        },
      ],
    },
  ],
};

export function getCourseLearningContent(
  _courseSlug: string,
): CourseLearningContent {
  return BASE_CONTENT;
}

export function getAllCourseWeeks(courseSlug: string): WeekItem[] {
  const content = getCourseLearningContent(courseSlug);
  return content.modules.flatMap((module) => module.weeks);
}

export function getWeekByNumber(
  courseSlug: string,
  weekNumber: number,
): WeekItem | null {
  return (
    getAllCourseWeeks(courseSlug).find(
      (week) => week.weekNumber === weekNumber,
    ) ?? null
  );
}

export function normalizeLecturerPayload(data: unknown): LecturerProfile[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.reduce<LecturerProfile[]>((acc, item, index) => {
    if (!item || typeof item !== "object") {
      return acc;
    }

    const record = item as Record<string, unknown>;
    const firstName =
      typeof record.firstName === "string" ? record.firstName : "";
    const lastName = typeof record.lastName === "string" ? record.lastName : "";
    const combinedName = `${firstName} ${lastName}`.trim();
    const name =
      (typeof record.name === "string" && record.name.trim()) ||
      combinedName ||
      `Lecturer ${index + 1}`;

    const email =
      (typeof record.email === "string" && record.email) ||
      `lecturer${index + 1}@university.edu`;

    const imageUrl =
      (typeof record.imageUrl === "string" && record.imageUrl) ||
      (typeof record.profileImage === "string" && record.profileImage) ||
      undefined;

    acc.push({
      id: (typeof record.id === "string" && record.id) || `${email}-${index}`,
      name,
      department:
        (typeof record.department === "string" && record.department) ||
        "DEPARTMENT OF COMPUTER SCIENCE",
      bio:
        (typeof record.bio === "string" && record.bio) ||
        "Profile details will appear here once provided by the lecturer.",
      office:
        (typeof record.office === "string" && record.office) ||
        "Office details pending",
      email,
      ...(imageUrl ? { imageUrl } : {}),
    });

    return acc;
  }, []);
}
