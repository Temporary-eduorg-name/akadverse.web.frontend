"use client";

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

interface ROIDoughnutProps {
    data: { name: string; value: number }[];
}

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

export default function ROIDoughnut({ data }: ROIDoughnutProps) {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-zinc-900 mb-6">ROI</h2>

            <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={130}
                        label
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => value && `${Number(value).toFixed(2)}%`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
