import {
  Braces,
  Cloud,
  Cpu,
  Database,
  MonitorPlay,
  Network,
  Palette,
  Shield,
  Sparkles,
} from "lucide-react";

export type LearningCourse = {
  id: string;
  code: string;
  slug: string;
  title: string;
  description: string;
  progress: number;
  completedModules: number;
  totalModules: number;
  lastActivity: string;
  activitySortValue: number;
  icon: React.ElementType;
  progressColor: string;
  accentTextClass: string;
  accentBgClass: string;
};

export const MY_LEARNING_COURSES: LearningCourse[] = [
  {
    id: "csc-301",
    code: "CSC 301",
    slug: "advanced-software-engineering",
    title: "Advanced Software Engineering",
    description:
      "Master CI/CD pipelines and enterprise system design principles for scale.",
    progress: 65,
    completedModules: 13,
    totalModules: 20,
    lastActivity: "2 hours ago",
    activitySortValue: 2,
    icon: MonitorPlay,
    progressColor: "#3d63dd",
    accentTextClass: "text-blue-600",
    accentBgClass: "bg-blue-50",
  },
  {
    id: "csc-303",
    code: "CSC 303",
    slug: "cloud-infrastructure",
    title: "Cloud Infrastructure",
    description:
      "Scaling applications using AWS, Azure, and Google Cloud Platform.",
    progress: 65,
    completedModules: 14,
    totalModules: 16,
    lastActivity: "3 days ago",
    activitySortValue: 72,
    icon: Cloud,
    progressColor: "#2f5ccf",
    accentTextClass: "text-indigo-600",
    accentBgClass: "bg-indigo-50",
  },
  {
    id: "csc-315",
    code: "CSC 315",
    slug: "cybersecurity-basics",
    title: "Cybersecurity Basics",
    description:
      "Fundamental concepts of network security, crypto, and ethical hacking.",
    progress: 100,
    completedModules: 3,
    totalModules: 12,
    lastActivity: "Yesterday",
    activitySortValue: 24,
    icon: Shield,
    progressColor: "#ef476f",
    accentTextClass: "text-pink-600",
    accentBgClass: "bg-pink-50",
  },
  {
    id: "csc-401",
    code: "CSC 401",
    slug: "full-stack-development",
    title: "Full Stack Development",
    description:
      "Build modern responsive apps with React, Node.js, and MongoDB.",
    progress: 75,
    completedModules: 8,
    totalModules: 20,
    lastActivity: "4 days ago",
    activitySortValue: 96,
    icon: Braces,
    progressColor: "#7083ef",
    accentTextClass: "text-violet-600",
    accentBgClass: "bg-violet-50",
  },
  {
    id: "csc-203",
    code: "CSC 203",
    slug: "computer-graphics",
    title: "Computer Graphics",
    description:
      "3D rendering pipelines, shaders, and geometry processing basics.",
    progress: 45,
    completedModules: 2,
    totalModules: 18,
    lastActivity: "5 days ago",
    activitySortValue: 120,
    icon: Palette,
    progressColor: "#e49a2f",
    accentTextClass: "text-amber-600",
    accentBgClass: "bg-amber-50",
  },
  {
    id: "csc-304",
    code: "CSC 304",
    slug: "database-systems",
    title: "Database Systems",
    description:
      "Relational algebra, SQL optimization, and NoSQL architecture.",
    progress: 100,
    completedModules: 7,
    totalModules: 14,
    lastActivity: "Oct 24, 2024",
    activitySortValue: 999,
    icon: Database,
    progressColor: "#1fb881",
    accentTextClass: "text-green-600",
    accentBgClass: "bg-green-50",
  },
  {
    id: "csc-302",
    code: "CSC 302",
    slug: "deep-learning-ai-ethics",
    title: "Artificial Intelligence",
    description:
      "Search algorithms, logic programming, and machine learning foundations.",
    progress: 67,
    completedModules: 12,
    totalModules: 15,
    lastActivity: "Yesterday",
    activitySortValue: 24,
    icon: Sparkles,
    progressColor: "#7d56f1",
    accentTextClass: "text-purple-600",
    accentBgClass: "bg-purple-50",
  },
  {
    id: "csc-305",
    code: "CSC 305",
    slug: "computer-networks",
    title: "Computer Networks",
    description:
      "TCP/IP stack, routing protocols, and network performance analysis.",
    progress: 100,
    completedModules: 4,
    totalModules: 12,
    lastActivity: "Oct 20, 2024",
    activitySortValue: 1005,
    icon: Network,
    progressColor: "#ea6b11",
    accentTextClass: "text-orange-600",
    accentBgClass: "bg-orange-50",
  },
  {
    id: "csc-306",
    code: "CSC 306",
    slug: "operating-systems",
    title: "Operating Systems",
    description:
      "Processes, scheduling, memory management, and concurrency control.",
    progress: 45,
    completedModules: 6,
    totalModules: 16,
    lastActivity: "Oct 15, 2024",
    activitySortValue: 1012,
    icon: Cpu,
    progressColor: "#6c2bd9",
    accentTextClass: "text-fuchsia-700",
    accentBgClass: "bg-fuchsia-50",
  },
];
