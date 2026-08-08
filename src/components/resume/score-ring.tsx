import { cn } from "@/lib/utils";

export function ScoreRing({
  value,
  label,
  size = 96,
  className,
}: {
  value: number | null;
  label: string;
  size?: number;
  className?: string;
}) {
  const pct = value ?? 0;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const tone = value === null ? "var(--muted-foreground)" : pct >= 80 ? "var(--success)" : pct >= 60 ? "var(--primary)" : "var(--destructive)";

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            stroke="color-mix(in oklab, var(--border) 100%, transparent)"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            stroke={tone}
            strokeDasharray={c}
            strokeDashoffset={c - (c * pct) / 100}
            style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-display text-xl font-semibold" style={{ color: tone }}>
            {value === null ? "—" : value}
          </span>
        </div>
      </div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

export function ScoreBar({ value, label }: { value: number; label: string }) {
  const tone = value >= 80 ? "var(--success)" : value >= 60 ? "var(--primary)" : "var(--destructive)";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-semibold" style={{ color: tone }}>
          {value}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            background: tone,
            transition: "width 900ms cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>
    </div>
  );
}
