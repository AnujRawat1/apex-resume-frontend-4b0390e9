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
      { title: "Resume Analyzer — ApexHire" },
      {
        name: "description",
        content: "Upload your resume PDF and get an AI-powered ATS, skills and job-match analysis.",
      },
      { property: "og:title", content: "Resume Analyzer — ApexHire" },
      {
        property: "og:description",
        content: "AI resume scoring across ATS, skills, keywords and job-description alignment.",
      },
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
  const [resumeText, setResumeText] = useState("");
  const [reading, setReading] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
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
    setConfigOpen(false);
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

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-semibold sm:text-4xl">Resume Analyzer</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Upload your resume, pick a target role, and get an AI breakdown across ATS compatibility,
          skills, keywords, experience and job-description alignment.
        </p>
      </header>

      {/* Upload */}
      <section className="surface-card p-5 sm:p-7">
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
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload resume PDF"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files?.[0];
              if (f) void acceptFile(f);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all duration-300",
              dragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-border hover:border-primary/50 hover:bg-secondary/40",
            )}
          >
            {reading ? (
              <>
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="mt-4 text-sm font-medium">Reading your PDF…</p>
              </>
            ) : (
              <>
                <span className="grid size-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
                  <Upload className="size-6" />
                </span>
                <p className="mt-4 text-base font-semibold">Drag & drop your resume here</p>
                <p className="mt-1 text-sm text-muted-foreground">PDF only · up to 10 MB</p>
                <span className="mt-5 inline-flex h-11 items-center rounded-xl bg-gradient-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated">
                  Browse files
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="animate-pop-in flex flex-col gap-4 rounded-2xl border border-[color:var(--success)]/35 bg-[color:var(--success)]/8 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-card shadow-soft">
                <FileText className="size-5 text-primary" />
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-2 truncate text-sm font-semibold">
                  {file.name}
                  <CheckCircle2 className="size-4 shrink-0 text-[color:var(--success)]" />
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatBytes(file.size)} · {resumeText.split(/\s+/).length.toLocaleString()} words
                  extracted
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-secondary"
              >
                <RefreshCw className="size-4" /> Replace
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Remove resume"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <Trash2 className="size-4" /> Remove
              </button>
            </div>
          </div>
        )}

        {!configOpen && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              disabled={!file}
              onClick={() => setConfigOpen(true)}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-primary px-6 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
            >
              <Sparkles className="size-4" /> Analyze Resume
            </button>
          </div>
        )}
      </section>

      {/* Configuration */}
      {configOpen && file && (
        <section className="animate-fade-up surface-card p-5 sm:p-7">
          <h2 className="text-lg font-semibold">Analysis configuration</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell the AI who you're targeting so the scoring is calibrated.
          </p>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm font-medium">Target role</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as TargetRole)}
                className="h-12 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none transition-all focus:border-primary focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_16%,transparent)]"
              >
                {TARGET_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium">Experience level</span>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as ExperienceLevel)}
                className="h-12 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none transition-all focus:border-primary focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_16%,transparent)]"
              >
                {EXPERIENCE_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 lg:col-span-2">
              <span className="text-sm font-medium">
                Resume title <span className="text-muted-foreground">(optional)</span>
              </span>
              <input
                value={title}
                maxLength={120}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Backend resume — Series B startups"
                className="h-12 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_16%,transparent)]"
              />
            </label>

            <label className="space-y-1.5 lg:col-span-2">
              <span className="text-sm font-medium">
                Target job description <span className="text-muted-foreground">(optional)</span>
              </span>
              <textarea
                value={jd}
                maxLength={20000}
                onChange={(e) => setJd(e.target.value)}
                rows={8}
                placeholder="Paste the complete job description to unlock the job match score…"
                className="w-full resize-y rounded-xl border border-border bg-card p-4 text-sm leading-relaxed outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_16%,transparent)]"
              />
              <span className="block text-xs text-muted-foreground">
                {jd.trim() ? `${jd.trim().length} characters — job match score enabled` : "No JD — job match score will be skipped"}
              </span>
            </label>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => setConfigOpen(false)}
              className="inline-flex h-12 items-center rounded-xl border border-border bg-card px-5 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => void runAnalysis()}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-primary px-6 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <Sparkles className="size-4" /> Analyze Resume
            </button>
          </div>
        </section>
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
