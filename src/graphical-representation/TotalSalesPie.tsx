"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

interface TotalSalesPieProps {
  monthlySalesData: { name: string; sales: number }[];
  annualSalesData: { name: string; sales: number }[];
  period?: "monthly" | "annual";
  onPeriodChange?: (period: "monthly" | "annual") => void;
  months?: string[];
  selectedMonth?: string;
  onMonthChange?: (month: string) => void;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

export default function TotalSalesPie({
  monthlySalesData,
  annualSalesData,
  period,
  onPeriodChange,
  months,
  selectedMonth,
  onMonthChange,
}: TotalSalesPieProps) {
  const [localPeriod, setLocalPeriod] = useState<"monthly" | "annual">("monthly");
  const activePeriod = period || localPeriod;
  const data = activePeriod === "monthly" ? monthlySalesData : annualSalesData;

  const handlePeriodChange = (nextPeriod: "monthly" | "annual") => {
    if (onPeriodChange) {
      onPeriodChange(nextPeriod);
      return;
    }
    setLocalPeriod(nextPeriod);
  };
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-zinc-900">Total Sales</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handlePeriodChange("monthly")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activePeriod === "monthly"
                ? "bg-blue-500 text-white"
                : "bg-zinc-200 text-zinc-900"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => handlePeriodChange("annual")}
            className={`px-4 py-2 rounded-md transition-colors ${
              activePeriod === "annual"
                ? "bg-blue-500 text-white"
                : "bg-zinc-200 text-zinc-900"
            }`}
          >
            Annual
          </button>
        </div>
      </div>

      {activePeriod === "monthly" && months && months.length > 0 && (
        <div className="mb-4">
          <select
            value={selectedMonth}
            onChange={(event) => onMonthChange?.(event.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-white text-zinc-900"
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      )}

      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            dataKey="sales"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label={(entry) => entry.name}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${Number(value).toLocaleString()}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
