export type FacultyCourseTab = {
  id: string;
  label: string;
  href: string;
};

export type FacultyStudentRecord = {
  id: string;
  name: string;
  email: string;
  enrollmentId: string;
  joinedAt: string;
  program: string;
  initials: string;
  accentClass: string;
};

export type FacultyCourseMeta = {
  title: string;
  code: string;
  summary: string;
  department: string;
  credits: number;
  section: string;
  totalPrograms: number;
  totalCarryovers: number;
  totalStudents: number;
  weeklyFocus: {
    title: string;
    subtitle: string;
    acceptedFormats: string;
    maxUploadMb: number;
    defaultLinks: Array<{ label: string; url: string; type: string }>;
    aiTools: Array<{
      id: string;
      title: string;
      description: string;
      routeTool: string;
    }>;
  };
  overview: {
    description: string[];
    keyDetails: Array<{ label: string; value: string }>;
    objectives: string[];
  };
  learningOutcomes: Array<{
    title: string;
    description: string;
    metric: string;
  }>;
  syllabusUnits: Array<{
    week: string;
    title: string;
    topics: string[];
  }>;
  students: FacultyStudentRecord[];
};

export const FACULTY_COURSE_TABS: FacultyCourseTab[] = [
  { id: "course-overview", label: "Course Overview", href: "course-overview" },
  { id: "student-overview", label: "Student Overview", href: "student-overview" },
  { id: "learning-outcome", label: "Learning Outcome", href: "learning-outcome" },
  { id: "syllabus", label: "Syllabus", href: "syllabus" },
  { id: "weekly-focus", label: "Weekly Focus", href: "weekly-focus" },
];

export const FACULTY_COURSES: Record<string, FacultyCourseMeta> = {
  "advanced-software-engineering": {
    title: "Advanced Software Engineering",
    code: "CS402",
    summary:
      "A faculty delivery workspace for content publishing, student oversight, and AI-assisted teaching support.",
    department: "COMPUTER SCIENCE DEPARTMENT",
    credits: 6,
    section: "A-01",
    totalPrograms: 7,
    totalCarryovers: 24,
    totalStudents: 124,
    weeklyFocus: {
      title: "Weekly Focus: Week 4",
      subtitle: "Advanced Thermodynamics & Heat Transfer",
      acceptedFormats: "PDF, JPG or PNG up to 10MB",
      maxUploadMb: 10,
      defaultLinks: [
        {
          label: "Online Article (Web)",
          url: "https://example.com/article",
          type: "Reference",
        },
      ],
      aiTools: [
        {
          id: "assignment-generator",
          title: "Assignment Generator",
          description:
            "An assignment generator is a tool that automatically creates structured assignments or questions based on user input.",
          routeTool: "assignment-generator",
        },
        {
          id: "sample-question-generator",
          title: "Sample Question generator",
          description:
            "A sample question generator is a tool that automatically creates practice questions based on a topic or subject, helping users test their understanding and prepare effectively.",
          routeTool: "sample-question-generator",
        },
      ],
    },
    overview: {
      description: [
        "CS402 equips faculty with a structured delivery framework for advanced software engineering concepts, spanning architecture, code quality, testing strategy, systems thinking, and release operations.",
        "This teaching space is designed to support course planning, student monitoring, content publishing, and weekly instructional focus so lecturers can manage both the academic and operational sides of the course in one place.",
      ],
      keyDetails: [
        { label: "Credits", value: "6 Units" },
        { label: "Level", value: "400 Level" },
        { label: "Semester", value: "Rain Semester" },
        { label: "Section", value: "A-01" },
        { label: "Contact Hours", value: "3 Lectures / Week" },
      ],
      objectives: [
        "Design maintainable large-scale software systems using layered and service-oriented architectures.",
        "Guide students through agile planning, issue decomposition, sprint delivery, and release retrospectives.",
        "Teach advanced testing, observability, and reliability concepts for production software.",
        "Evaluate student outputs across technical depth, collaboration quality, and solution tradeoffs.",
      ],
    },
    learningOutcomes: [
      {
        title: "Architectural Reasoning",
        description:
          "Students should be able to justify software architecture decisions using scalability, reliability, and maintainability criteria.",
        metric: "82% target mastery",
      },
      {
        title: "Engineering Workflow",
        description:
          "Students should demonstrate practical use of version control, CI pipelines, code review, and release planning.",
        metric: "90% project completion",
      },
      {
        title: "Quality Assurance",
        description:
          "Students should build testable services and measure correctness with automated test strategies and defect analysis.",
        metric: "75% quality benchmark",
      },
      {
        title: "Team Collaboration",
        description:
          "Students should communicate design choices clearly and contribute to peer-based software delivery practices.",
        metric: "Peer review average 4.2/5",
      },
    ],
    syllabusUnits: [
      {
        week: "Week 1",
        title: "Modern Software Engineering Foundations",
        topics: ["Software process evolution", "Requirements framing", "Quality attributes"],
      },
      {
        week: "Week 2",
        title: "Architecture and System Decomposition",
        topics: ["Monoliths vs microservices", "Domain boundaries", "Service contracts"],
      },
      {
        week: "Week 3",
        title: "Advanced Agile Delivery",
        topics: ["Sprint planning", "Backlog shaping", "Risk management"],
      },
      {
        week: "Week 4",
        title: "Performance, Thermal Models, and Systems Transfer",
        topics: ["Heat transfer analogies in systems", "Latency budgets", "Capacity planning"],
      },
      {
        week: "Week 5",
        title: "Testing, Observability, and Release Confidence",
        topics: ["Unit and integration testing", "Tracing and metrics", "Release gates"],
      },
    ],
    students: [
      { id: "1", name: "Harry Asiwaju", email: "h.arnault@stu.cu.edu.ng", enrollmentId: "23CJ033467", joinedAt: "Aug 24, 2024", program: "Software Engineering", initials: "HA", accentClass: "bg-blue-100 text-blue-800" },
      { id: "2", name: "Kasper Muller", email: "K.muller@stu.cu.edu.ng", enrollmentId: "23CJ033468", joinedAt: "Aug 22, 2024", program: "Computer Science", initials: "KM", accentClass: "bg-orange-100 text-orange-800" },
      { id: "3", name: "Juno Liao", email: "J.liao@stu.cu.edu.ng", enrollmentId: "23CJ033469", joinedAt: "Aug 25, 2024", program: "Computer Science", initials: "JL", accentClass: "bg-indigo-100 text-indigo-800" },
      { id: "4", name: "Soren Borg", email: "S.borg@stu.cu.edu.ng", enrollmentId: "23CJ033470", joinedAt: "Sep 01, 2024", program: "Information Systems", initials: "SB", accentClass: "bg-rose-100 text-rose-700" },
      { id: "5", name: "Adaeze Nnaji", email: "A.nnaji@stu.cu.edu.ng", enrollmentId: "23CJ033471", joinedAt: "Sep 03, 2024", program: "Software Engineering", initials: "AN", accentClass: "bg-emerald-100 text-emerald-800" },
      { id: "6", name: "David Kone", email: "D.kone@stu.cu.edu.ng", enrollmentId: "23CJ033472", joinedAt: "Sep 05, 2024", program: "Computer Engineering", initials: "DK", accentClass: "bg-sky-100 text-sky-800" },
      { id: "7", name: "Mariam Yusuf", email: "M.yusuf@stu.cu.edu.ng", enrollmentId: "23CJ033473", joinedAt: "Sep 07, 2024", program: "Data Science", initials: "MY", accentClass: "bg-fuchsia-100 text-fuchsia-800" },
      { id: "8", name: "Leo Martins", email: "L.martins@stu.cu.edu.ng", enrollmentId: "23CJ033474", joinedAt: "Sep 08, 2024", program: "Software Engineering", initials: "LM", accentClass: "bg-cyan-100 text-cyan-800" },
      { id: "9", name: "Nora Bello", email: "N.bello@stu.cu.edu.ng", enrollmentId: "23CJ033475", joinedAt: "Sep 10, 2024", program: "Information Technology", initials: "NB", accentClass: "bg-violet-100 text-violet-800" },
      { id: "10", name: "Ethan Park", email: "E.park@stu.cu.edu.ng", enrollmentId: "23CJ033476", joinedAt: "Sep 11, 2024", program: "Cybersecurity", initials: "EP", accentClass: "bg-amber-100 text-amber-800" },
      { id: "11", name: "Tomiwa Ajayi", email: "T.ajayi@stu.cu.edu.ng", enrollmentId: "23CJ033477", joinedAt: "Sep 14, 2024", program: "Software Engineering", initials: "TA", accentClass: "bg-lime-100 text-lime-800" },
      { id: "12", name: "Grace Okoro", email: "G.okoro@stu.cu.edu.ng", enrollmentId: "23CJ033478", joinedAt: "Sep 16, 2024", program: "Computer Science", initials: "GO", accentClass: "bg-teal-100 text-teal-800" },
    ],
  },
};

export function getFacultyCourse(courseSlug: string) {
  return FACULTY_COURSES[courseSlug];
}
