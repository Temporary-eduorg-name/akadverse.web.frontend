export default function LearningOutcomesPage() {
  const outcomes = [
    {
      icon: "A",
      title: "Understand advanced SDLC models",
      description: "Master Material, Agile, and DevOps methodologies in-depth.",
    },
    {
      icon: "📊",
      title: "Analyze architectural patterns",
      description:
        "Evaluate microservices, serverless, and monolithic architectures for scalability.",
    },
    {
      icon: "🔒",
      title: "Implement secure protocols",
      description:
        "Apply authentication and encryption. Implement lifecycle management.",
    },
    {
      icon: "⚡",
      title: "Optimize system performance",
      description:
        "Identify bottlenecks and implement caching and database tuning strategies.",
    },
  ];

  const competencies = [
    { name: "System Design", icon: "🏗️" },
    { name: "Agile Methodology", icon: "🔄" },
    { name: "Refactoring", icon: "⚙️" },
    { name: "Cloud Infrastructure", icon: "☁️" },
    { name: "SQL & NoSQL", icon: "💾" },
    { name: "Test Automation", icon: "✅" },
    { name: "App Security", icon: "🔐" },
    { name: "Linux Systems", icon: "🐧" },
  ];

  return (
    <div className="space-y-10">
      {/* Learning Outcomes Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Learning Outcome
        </h2>
        <p className="text-gray-600 mb-6">
          What you will achieve by the end of this course.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outcomes.map((outcome, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:border-blue-400 hover:shadow-[0_4px_12px_rgba(59,130,246,0.1)] transition-all"
            >
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-blue-600 text-white font-bold rounded-lg">
                {outcome.icon}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 text-sm mb-1">
                  {outcome.title}
                </h3>
                <p className="text-gray-600 text-xs">{outcome.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Competencies Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">✓</span>
          <h2 className="text-2xl font-bold text-gray-900">Key Competencies</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {competencies.map((comp, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <span className="text-3xl">{comp.icon}</span>
              <p className="text-sm font-semibold text-center text-gray-900">
                {comp.name}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
