"use client";

interface CustomerRetentionRateProps {
  percentage: number;
}

export default function CustomerRetentionRate({ percentage }: CustomerRetentionRateProps) {
  const getColorClass = () => {
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Customer Retention Rate</h2>
      
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className={`text-5xl font-bold ${getColorClass()}`}>
            {percentage.toFixed(1)}%
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            {percentage >= 80 && "Excellent"}
            {percentage >= 60 && percentage < 80 && "Good"}
            {percentage < 60 && "Needs Improvement"}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6 bg-zinc-200 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            percentage >= 80
              ? "bg-green-500"
              : percentage >= 60
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
