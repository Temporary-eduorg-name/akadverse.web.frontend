"use client";

interface TotalProfitsNumberProps {
  amount: number;
}

export default function TotalProfitsNumber({ amount }: TotalProfitsNumberProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Total Profits</h2>
      
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-green-500">
            ₦{amount.toLocaleString("en-NG", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            {amount > 0 ? "Profitable" : "Loss"}
          </p>
        </div>
      </div>
    </div>
  );
}
