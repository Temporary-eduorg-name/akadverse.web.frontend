"use client";

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

interface ConversionRateDoughnutProps {
  percentage: number;
}

export default function ConversionRateDoughnut({ percentage }: ConversionRateDoughnutProps) {
  const data = [
    { name: "Converted", value: percentage },
    { name: "Not Converted", value: Math.max(0, 100 - percentage) },
  ];

  const COLORS = ["#10b981", "#ef4444"];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-semibold text-zinc-900 mb-4">
        Conversion Rate
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
              <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-1/3 text-center">
          <p className="text-4xl font-bold text-green-500">{percentage.toFixed(2)}%</p>
          <p className="text-sm text-zinc-600 mt-2">Success Rate</p>
        </div>
      </div>
    </div>
  );
}
