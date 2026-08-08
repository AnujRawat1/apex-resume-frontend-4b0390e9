import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ReportRow } from "@/components/resume/report-row";
import { useAuth } from "@/lib/auth-provider";
import {
  EXPERIENCE_LEVELS,
  TARGET_ROLES,
  loadReports,
  type ResumeReport,
} from "@/lib/resume-reports";

export const Route = createFileRoute("/resume-reports")({
  head: () => ({
    meta: [
      { title: "All Resume Reports — ApexHire" },
      {
        name: "description",
        content: "Browse, search and filter every resume analysis report you've generated.",
      },
      { property: "og:title", content: "All Resume Reports — ApexHire" },
      {
        property: "og:description",
        content: "Search, filter and revisit your full resume analysis history.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <ReportsContent />
    </AppShell>
  ),
});

const PER_PAGE = 10;
type Sort = "newest" | "oldest" | "score-high" | "score-low";

function ReportsContent() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ResumeReport[]>([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [level, setLevel] = useState("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (user) setReports(loadReports(user.username));
  }, [user]);

  useEffect(() => setPage(1), [query, role, level, sort]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = reports.filter((r) => {
      if (role !== "all" && r.targetRole !== role) return false;
      if (level !== "all" && r.experienceLevel !== level) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.fileName.toLowerCase().includes(q) ||
        r.targetRole.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sort === "newest") return +new Date(b.analyzedAt) - +new Date(a.analyzedAt);
      if (sort === "oldest") return +new Date(a.analyzedAt) - +new Date(b.analyzedAt);
      if (sort === "score-high") return b.analysis.overallScore - a.analysis.overallScore;
      return a.analysis.overallScore - b.analysis.overallScore;
    });
  }, [reports, query, role, level, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const selectClass =
    "h-11 rounded-xl border border-border bg-card px-3 text-sm outline-none transition-all focus:border-primary focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_16%,transparent)]";

  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/resume-analyzer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to analyzer
        </Link>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">All reports</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {filtered.length} of {reports.length} report{reports.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="surface-card grid gap-3 p-4 lg:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, file or role…"
            aria-label="Search reports"
            className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_16%,transparent)]"
          />
        </div>
        <select aria-label="Filter by role" value={role} onChange={(e) => setRole(e.target.value)} className={selectClass}>
          <option value="all">All roles</option>
          {TARGET_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select aria-label="Filter by level" value={level} onChange={(e) => setLevel(e.target.value)} className={selectClass}>
          <option value="all">All levels</option>
          {EXPERIENCE_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <select aria-label="Sort reports" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={selectClass}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="score-high">Highest score</option>
          <option value="score-low">Lowest score</option>
        </select>
      </div>

      <div className="space-y-3">
        {slice.length === 0 ? (
          <div className="surface-card p-10 text-center">
            <p className="text-sm text-muted-foreground">No reports match your filters.</p>
          </div>
        ) : (
          slice.map((r) => <ReportRow key={r.id} report={r} />)
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage(current - 1)}
            disabled={current === 1}
            aria-label="Previous page"
            className="grid size-10 place-items-center rounded-xl border border-border bg-card transition-colors hover:bg-secondary disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              aria-current={p === current ? "page" : undefined}
              className={
                p === current
                  ? "h-10 min-w-10 rounded-xl bg-gradient-primary px-3 text-sm font-semibold text-primary-foreground shadow-soft"
                  : "h-10 min-w-10 rounded-xl border border-border bg-card px-3 text-sm font-medium transition-colors hover:bg-secondary"
              }
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage(current + 1)}
            disabled={current === pages}
            aria-label="Next page"
            className="grid size-10 place-items-center rounded-xl border border-border bg-card transition-colors hover:bg-secondary disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
