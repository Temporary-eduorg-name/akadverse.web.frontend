export default function LecturerOverviewPage() {
  const lecturers = [
    {
      name: "Dr. Jane Smith",
      title: "Senior Professor",
      bio: "Dr. Jane Smith is a Senior Professor with over 15 years of experience in distributed systems and software architecture. She previously led engineering teams at top-tier tech firms before joining academia to focus on the evolution of microservices and formal verification methods in software engineering.",
      office: "Science Building, Room 402",
      email: "jane.smith@university.edu",
    },
    {
      name: "Prof. Robert Miller",
      title: "Professor",
      bio: "Prof. Robert Miller specializes in cloud computing and infrastructure scalability. With a background in high-performance computing, his research focuses on optimizing container orchestration and sustainable data center operations.",
      office: "Science Building, Room 415",
      email: "robert.miller@university.edu",
    },
    {
      name: "Dr. Sarah Chen",
      title: "Assistant Professor",
      bio: "Dr. Sarah Chen is an expert in Human-Computer Interaction and Agile project management. Her work investigates how collaborative software tools can be designed to improve developer productivity and team dynamics in remote environments.",
      office: "Tech Annex, Room 102",
      email: "sarah.chen@university.edu",
    },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Lecturer Overview</h2>

      <div className="space-y-5">
        {lecturers.map((lecturer, i) => (
          <div
            key={i}
            className="flex gap-6 p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-[0_8px_16px_rgba(16,24,40,0.08)] transition-all"
          >
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase font-bold tracking-wider text-blue-600 mb-1">
                DEPARTMENT OF COMPUTER SCIENCE
              </p>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {lecturer.name}
              </h3>
              <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                {lecturer.bio}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <span>📍</span>
                  <span>Office: {lecturer.office}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>✉️</span>
                  <span>{lecturer.email}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
