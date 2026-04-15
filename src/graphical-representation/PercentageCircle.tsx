"use client";

interface PercentageCircleProps {
  value: number;
  label: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
}

export default function PercentageCircle({
  value,
  label,
  color = "#1d4ed8",
  size = 180,
  strokeWidth = 14,
}: PercentageCircleProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-semibold text-zinc-900 mb-4">{label}</h2>
      <div className="flex items-center justify-center">
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            className="fill-zinc-900"
            style={{ fontSize: "28px", fontWeight: 700 }}
          >
            {clampedValue.toFixed(1)}%
          </text>
        </svg>
      </div>
    </div>
  );
}
