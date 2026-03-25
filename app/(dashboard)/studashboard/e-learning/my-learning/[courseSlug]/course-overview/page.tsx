export default function CourseOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Course Description */}
      <section>
        <div className="flex items-start gap-3 mb-4">
          <span className="text-2xl">📚</span>
          <h2 className="text-2xl font-bold text-gray-900">Course Description</h2>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          CS402: Advanced Software Engineering provides an in-depth exploration of contemporary software development paradigms. This course focuses on mastering high-level architectural patterns, building resilient and scalable distributed systems, and implementing advanced agile delivery pipelines.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Students will engage with complex real-world scenarios, learning to balance technical debt, performance optimization, and security considerations in a professional engineering environment. The curriculum emphasizes the transition from writing code to engineering scalable software solutions.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Course Objectives */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">🎯</span>
              <h2 className="text-2xl font-bold text-gray-900">Course Objectives</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Design and implement microservices and serverless architectures.',
                'Evaluate software quality through advanced metrics and audits.',
                'Master CI/CD pipelines and automated testing frameworks.',
                'Apply Design Thinking and Agile methodologies to large-scale projects.',
              ].map((objective, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-2xl text-blue-600 flex-shrink-0">✓</span>
                  <p className="text-gray-700 text-sm">{objective}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar - Key Information */}
        <aside className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Key Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase font-semibold text-gray-600 mb-1">Credits</p>
                <p className="text-lg font-bold text-gray-900">6 Units</p>
              </div>
              <div>
                <p className="text-xs uppercase font-semibold text-gray-600 mb-1">Level</p>
                <p className="text-lg font-bold text-gray-900">300 Level</p>
              </div>
              <div>
                <p className="text-xs uppercase font-semibold text-gray-600 mb-1">Semester</p>
                <p className="text-lg font-bold text-gray-900">Alpha</p>
              </div>
              <div>
                <p className="text-xs uppercase font-semibold text-gray-600 mb-1">Prerequisites</p>
                <p className="text-sm font-semibold text-blue-600">CS301</p>
              </div>
            </div>
          </div>

          {/* Lead Lecturer */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Lead Lecturer</h3>
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-blue-200 rounded-full flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm">Prof. Sarah Jenkins</p>
                <p className="text-xs text-gray-600">PhD, Software Engineering</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
