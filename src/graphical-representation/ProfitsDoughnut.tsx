// "use client";

// import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

// interface ProfitsDoughnutProps {
//   data: { name: string; value: number }[];
// }

// const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

// export default function ProfitsDoughnut({ data }: ProfitsDoughnutProps) {
//   return (
//     <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
//       <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">Total Profits</h2>

//       <ResponsiveContainer width="100%" height={400}>
//         <PieChart>
//           <Pie
//             data={data}
//             dataKey="value"
//             nameKey="name"
//             cx="50%"
//             cy="50%"
//             innerRadius={80}
//             outerRadius={130}
//             label
//           >
//             {data.map((_, index) => (
//               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//             ))}
//           </Pie>
//           <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
//           <Legend />
//         </PieChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }
