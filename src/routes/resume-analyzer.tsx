import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ReportRow } from "@/components/resume/report-row";
import { useAuth } from "@/lib/auth-provider";
import { extractPdfText } from "@/lib/pdf-text";
import { analyzeResume } from "@/lib/resume-analysis.functions";
import {
  EXPERIENCE_LEVELS,
  TARGET_ROLES,
  formatBytes,
  loadReports,
  saveReport,
  saveResumeFile,
  type ExperienceLevel,
  type ResumeReport,
  type TargetRole,
} from "@/lib/resume-reports";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/resume-analyzer")({
  head: () => ({
    meta: [
      { title: "AI Resume Review & ATS Score — ApexHire" },
      {
        name: "description",
        content:
          "Get an AI review of your resume: ATS scoring, skill gaps and personalized feedback that make your applications stronger.",
      },
      { property: "og:title", content: "AI Resume Review & ATS Score — ApexHire" },
      {
        property: "og:description",
        content: "AI resume scoring across ATS, skills, keywords and job-description alignment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResumeAnalyzerPage,
});

const STEPS = ["Analyzing structure", "Scoring ATS compatibility", "Matching skills & keywords", "Writing recommendations"];

function ResumeAnalyzerPage() {
  return (
    <AppShell>
      <AnalyzerContent />
    </AppShell>
  );
}

function AnalyzerContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [reading, setReading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [role, setRole] = useState<TargetRole>(TARGET_ROLES[0]);
  const [level, setLevel] = useState<ExperienceLevel>(EXPERIENCE_LEVELS[0]);
  const [title, setTitle] = useState("");
  const [jd, setJd] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [reports, setReports] = useState<ResumeReport[]>([]);

  useEffect(() => {
    if (user) setReports(loadReports(user.username));
  }, [user]);

  useEffect(() => {
    if (!analyzing) return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % STEPS.length), 1800);
    return () => window.clearInterval(id);
  }, [analyzing]);

  useEffect(() => {
    if (!file) {
      setFileUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const acceptFile = useCallback(async (next: File) => {
    if (next.type !== "application/pdf" && !next.name.toLowerCase().endsWith(".pdf")) {
      toast.error("PDF only", { description: "Please upload your resume as a PDF file." });
      return;
    }
    if (next.size > 10 * 1024 * 1024) {
      toast.error("File too large", { description: "Keep the resume under 10 MB." });
      return;
    }
    setReading(true);
    setFile(null);
    setResumeText("");
    try {
      const text = await extractPdfText(next);
      if (text.replace(/\s/g, "").length < 100) {
        toast.error("Couldn't read this PDF", {
          description: "It looks scanned or image-only. Upload a text-based PDF.",
        });
        return;
      }
      setFile(next);
      setResumeText(text);
      setTitle((t) => t || next.name.replace(/\.pdf$/i, ""));
      toast.success("Resume uploaded", { description: next.name });
    } catch {
      toast.error("Upload failed", { description: "We couldn't read that PDF. Try another file." });
    } finally {
      setReading(false);
    }
  }, []);

  const reset = () => {
    setFile(null);
    setResumeText("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const runAnalysis = async () => {
    if (!file || !user) return;
    setAnalyzing(true);
    setStep(0);
    try {
      const analysis = await analyzeResume({
        data: {
          resumeText,
          targetRole: role,
          experienceLevel: level,
          ...(title.trim() ? { resumeTitle: title.trim() } : {}),
          ...(jd.trim() ? { jobDescription: jd.trim() } : {}),
        },
      });

      const now = new Date().toISOString();
      const report: ResumeReport = {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        title: title.trim() || file.name.replace(/\.pdf$/i, ""),
        fileName: file.name,
        fileSize: file.size,
        targetRole: role,
        experienceLevel: level,
        jobDescription: jd.trim() || null,
        resumeText,
        analysis,
        createdAt: now,
        analyzedAt: now,
      };

      await saveResumeFile(report.id, file);
      saveReport(user.username, report);
      toast.success("Analysis ready", { description: "Report saved to your history." });
      navigate({ to: "/resume-report/$id", params: { id: report.id } });
    } catch (error) {
      toast.error("Analysis failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
      setAnalyzing(false);
    }
  };

  const recent = useMemo(() => reports.slice(0, 5), [reports]);

  if (analyzing) return <AnalyzingState step={step} />;

  const selectClass =
    "h-11 w-full rounded-xl border border-border bg-card px-3.5 text-sm outline-none transition-all focus:border-primary focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_16%,transparent)]";

  const dropHandlers = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files?.[0];
      if (f) void acceptFile(f);
    },
  };

  return (
    <div className="space-y-10">
      <header className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="size-3.5" /> AI resume review
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Get an AI review of your resume
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          ATS-optimized scoring with personalized feedback on your skills, sections and content — so
          every application has a stronger shot at the interview.
        </p>
      </header>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void acceptFile(f);
        }}
      />

      {!file ? (
        /* ── State A — nothing uploaded: full-width, compact upload ── */
        <section className="animate-fade-up mx-auto w-full max-w-5xl">
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload resume PDF"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            {...dropHandlers}
            className={cn(
              "surface-card flex cursor-pointer flex-col items-center gap-4 border-2 border-dashed px-6 py-8 text-center transition-all duration-300 sm:flex-row sm:justify-between sm:gap-6 sm:px-8 sm:text-left",
              dragging
                ? "border-primary bg-primary/5"
                : "border-border/80 hover:border-primary/50 hover:bg-secondary/30",
            )}
          >
            {reading ? (
              <div className="mx-auto flex items-center gap-3">
                <Loader2 className="size-5 animate-spin text-primary" />
                <p className="text-sm font-medium">Reading your PDF…</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
                    <Upload className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-base font-semibold">Drop your resume here</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PDF only · up to 10 MB · text-based resumes score best
                    </p>
                  </div>
                </div>
                <span className="inline-flex h-11 shrink-0 items-center rounded-xl bg-gradient-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated">
                  Choose PDF
                </span>
              </>
            )}
          </div>

          <ul className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["ATS compatibility", "See how parsers read your resume before a recruiter does."],
              ["Skill & keyword gaps", "Spot the terms your target role expects but you're missing."],
              ["Actionable rewrites", "Prioritized fixes you can apply in minutes."],
            ].map(([title, copy]) => (
              <li key={title} className="surface-card p-4">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{copy}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        /* ── State B — uploaded: 50 / 50 workspace ── */
        <div className="animate-fade-up grid gap-6 lg:grid-cols-2">
          {/* Left — large resume preview */}
          <section className="surface-card order-2 flex min-h-0 flex-col overflow-hidden lg:order-1 lg:sticky lg:top-24 lg:h-[calc(100vh-9rem)]">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <FileText className="size-4 shrink-0 text-primary" />
              <p className="truncate text-sm font-medium">{file.name}</p>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                {formatBytes(file.size)}
              </span>
            </div>
            <PdfViewer
              source={file}
              fallbackText={resumeText}
              className="min-h-[60vh] flex-1 lg:min-h-0"
            />
          </section>

          {/* Right — configuration + analyze */}
          <div className="order-1 space-y-5 lg:order-2 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:pr-1">
            <section className="surface-card p-4 sm:p-5">
              <div className="animate-pop-in flex items-center gap-3 rounded-xl border border-[color:var(--success)]/35 bg-[color:var(--success)]/8 p-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-card shadow-soft">
                  <CheckCircle2 className="size-5 text-[color:var(--success)]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{file.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatBytes(file.size)} ·{" "}
                    {resumeText.split(/\s+/).length.toLocaleString()} words
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    aria-label="Replace resume"
                    className="grid size-9 place-items-center rounded-lg border border-border bg-card transition-colors hover:bg-secondary"
                  >
                    <RefreshCw className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    aria-label="Remove resume"
                    className="grid size-9 place-items-center rounded-lg border border-border bg-card text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </section>

            <section className="animate-fade-up surface-card p-4 sm:p-5">
              <h2 className="text-base font-semibold">Analysis configuration</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Calibrate the scoring to the role you're targeting.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-xs font-medium">Target role</span>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as TargetRole)}
                    className={selectClass}
                  >
                    {TARGET_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-xs font-medium">Experience level</span>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as ExperienceLevel)}
                    className={selectClass}
                  >
                    {EXPERIENCE_LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5 sm:col-span-2">
                  <span className="text-xs font-medium">
                    Resume title <span className="text-muted-foreground">(optional)</span>
                  </span>
                  <input
                    value={title}
                    maxLength={120}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Backend resume — Series B startups"
                    className={selectClass}
                  />
                </label>

                <label className="space-y-1.5 sm:col-span-2">
                  <span className="text-xs font-medium">
                    Job description <span className="text-muted-foreground">(optional)</span>
                  </span>
                  <textarea
                    value={jd}
                    maxLength={20000}
                    onChange={(e) => setJd(e.target.value)}
                    rows={4}
                    placeholder="Paste the JD to unlock the job match score…"
                    className="w-full resize-y rounded-xl border border-border bg-card p-3.5 text-sm leading-relaxed outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_16%,transparent)]"
                  />
                  <span className="block text-[11px] text-muted-foreground">
                    {jd.trim()
                      ? `${jd.trim().length} characters — job match score enabled`
                      : "No JD — job match score will be skipped"}
                  </span>
                </label>
              </div>

              <button
                type="button"
                onClick={() => void runAnalysis()}
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <Sparkles className="size-4" /> Analyze Resume
              </button>
            </section>
          </div>
        </div>
      )}

      {/* Recent reports */}
      <section>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Recent reports</h2>
          <Link
            to="/resume-reports"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            View all reports <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {recent.length === 0 ? (
            <div className="surface-card p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No analyses yet — upload a resume above to create your first report.
              </p>
            </div>
          ) : (
            recent.map((r) => <ReportRow key={r.id} report={r} />)
          )}
        </div>
      </section>
    </div>
  );
}


function AnalyzingState({ step }: { step: number }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
      <span className="relative grid size-20 place-items-center rounded-3xl bg-gradient-primary text-primary-foreground shadow-elevated">
        <Sparkles className="size-8 animate-pulse" />
      </span>
      <h1 className="mt-8 text-2xl font-semibold">Analyzing your resume</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This usually takes 10-30 seconds. Hang tight.
      </p>
      <ul className="mt-8 w-full space-y-3 text-left">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all duration-500",
              i === step
                ? "border-primary/40 bg-primary/5 text-foreground"
                : "border-border text-muted-foreground",
            )}
          >
            {i === step ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <span className="size-1.5 rounded-full bg-muted-foreground/50" />
            )}
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
