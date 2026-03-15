"use client";

interface CustomerConversionRateProps {
  percentage: number;
}

export default function CustomerConversionRate({ percentage }: CustomerConversionRateProps) {
  const getColorClass = () => {
    if (percentage >= 5) return "text-green-500";
    if (percentage >= 2) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Customer Conversion Rate</h2>
      
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className={`text-5xl font-bold ${getColorClass()}`}>
            {percentage.toFixed(2)}%
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            {percentage >= 5 && "Excellent"}
            {percentage >= 2 && percentage < 5 && "Average"}
            {percentage < 2 && "Below Average"}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6 bg-zinc-200 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            percentage >= 5
              ? "bg-green-500"
              : percentage >= 2
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
          style={{ width: `${Math.min((percentage / 10) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}
