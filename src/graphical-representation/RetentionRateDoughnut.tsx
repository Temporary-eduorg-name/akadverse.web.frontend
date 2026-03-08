"use client";

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

interface RetentionRateDoughnutProps {
  percentage: number;
}

export default function RetentionRateDoughnut({ percentage }: RetentionRateDoughnutProps) {
  const data = [
    { name: "Retained", value: percentage },
    { name: "Churned", value: Math.max(0, 100 - percentage) },
  ];

  const COLORS = ["#3b82f6", "#ef4444"];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
        Customer Retention Rate
      </h2>

      <div className="flex items-center justify-between">
        <div className="w-2/3">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-1/3 text-center">
          <p className="text-4xl font-bold text-blue-500">{percentage.toFixed(2)}%</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">Retention</p>
        </div>
      </div>
    </div>
  );
}
