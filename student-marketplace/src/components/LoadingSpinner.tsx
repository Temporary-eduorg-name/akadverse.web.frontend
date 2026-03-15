interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
}

export default function LoadingSpinner({ size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className={`animate-spin rounded-full border-b-2 border-zinc-900 dark:border-white ${sizeClasses[size]}`}></div>
    </div>
  );
}
