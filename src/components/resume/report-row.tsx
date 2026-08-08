import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CalendarClock } from "lucide-react";
import type { ResumeReport } from "@/lib/resume-reports";
import { cn } from "@/lib/utils";

function tone(score: number) {
  return score >= 80
    ? "text-[color:var(--success)]"
    : score >= 60
      ? "text-primary"
      : "text-destructive";
}

export function ReportRow({ report }: { report: ResumeReport }) {
  const date = new Date(report.analyzedAt);
  return (
    <Link
      to="/resume-report/$id"
      params={{ id: report.id }}
      className="group surface-card flex flex-col gap-4 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold">{report.title}</h3>
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-secondary px-2.5 py-1 font-medium">
            {report.targetRole}
          </span>
          <span className="rounded-full bg-secondary px-2.5 py-1 font-medium">
            {report.experienceLevel}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="size-3.5" />
            {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-5">
        <Stat label="ATS" value={report.analysis.atsScore} />
        <Stat label="Job match" value={report.analysis.jobMatchScore} />
        <Stat label="Overall" value={report.analysis.overallScore} />
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="text-center">
      <p className={cn("font-display text-lg font-semibold", value === null ? "text-muted-foreground" : tone(value))}>
        {value ?? "—"}
      </p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
