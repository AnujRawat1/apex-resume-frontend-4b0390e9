import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  ListChecks,
  Sparkles,
  Target,
} from "lucide-react";
import type { ResumeReport } from "@/lib/resume-reports";
import { ScoreBar, ScoreRing } from "@/components/resume/score-ring";
import { cn } from "@/lib/utils";

function Panel({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface-card p-5", className)}>
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="size-4 text-primary" />
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Chips({ items, tone }: { items: string[]; tone: "danger" | "muted" }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">Nothing flagged — nice.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium",
            tone === "danger"
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-border bg-secondary text-muted-foreground",
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function AnalysisPanel({ report }: { report: ResumeReport }) {
  const a = report.analysis;

  return (
    <div className="space-y-5">
      <section className="surface-card p-5">
        <div className="flex flex-wrap items-center justify-around gap-4">
          <ScoreRing value={a.overallScore} label="Overall score" size={104} />
          <ScoreRing value={a.atsScore} label="ATS score" />
          <ScoreRing value={a.jobMatchScore} label="Job match" />
        </div>
        {a.summary && (
          <p className="mt-5 rounded-xl bg-secondary/60 p-4 text-sm leading-relaxed text-muted-foreground">
            {a.summary}
          </p>
        )}
      </section>

      {a.sections.length > 0 && (
        <Panel title="Section breakdown" icon={Target}>
          <div className="grid gap-3 sm:grid-cols-2">
            {a.sections.map((s) => (
              <ScoreBar key={s.key} value={s.score} label={s.title || s.key} />
            ))}
          </div>
          <div className="mt-5 space-y-4">
            {a.sections.map((s) => (
              <div key={`d-${s.key}`} className="rounded-xl border border-border/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold">{s.title || s.key}</h4>
                  <span className="text-xs font-semibold text-primary">{s.score}/100</span>
                </div>
                {s.summary && (
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.summary}</p>
                )}
                {s.points.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {s.points.map((p, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Strengths" icon={CheckCircle2}>
          <ul className="space-y-2.5">
            {a.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[color:var(--success)]" />
                {s}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Weaknesses" icon={AlertTriangle}>
          <ul className="space-y-2.5">
            {a.weaknesses.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                {s}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Missing skills" icon={Target}>
          <Chips items={a.missingSkills} tone="danger" />
        </Panel>
        <Panel title="Missing keywords" icon={ListChecks}>
          <Chips items={a.missingKeywords} tone="muted" />
        </Panel>
      </div>

      <Panel title="AI recommendations" icon={Sparkles}>
        <div className="space-y-3">
          {a.recommendations.map((r, i) => (
            <div key={i} className="rounded-xl border border-border/70 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-semibold">{r.title}</h4>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    r.priority === "high"
                      ? "bg-destructive/12 text-destructive"
                      : r.priority === "medium"
                        ? "bg-primary/12 text-primary"
                        : "bg-secondary text-muted-foreground",
                  )}
                >
                  {r.priority}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{r.detail}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Suggested improvements" icon={Lightbulb}>
        <ol className="space-y-2.5">
          {a.improvements.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm text-muted-foreground">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/12 text-[11px] font-semibold text-primary">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}
