interface ProgressBarProps {
  value: number;
  label?: string;
}

export function ProgressBar({ value, label = "Uploading..." }: ProgressBarProps) {
  const progress = Math.min(100, Math.max(0, value));

  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{Math.round(progress)}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-border-subtle">
        <div
          className={`h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-[width] duration-200 ease-out ${
            progress < 100 ? "motion-safe:animate-pulse" : ""
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
