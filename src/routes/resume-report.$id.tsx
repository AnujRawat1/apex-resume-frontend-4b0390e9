import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Download, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { AnalysisPanel } from "@/components/resume/analysis-panel";
import { PdfViewer } from "@/components/resume/pdf-viewer";
import { Spinner } from "@/components/spinner";
import { useAuth } from "@/lib/auth-provider";
import {
  deleteReport,
  formatBytes,
  getReport,
  loadResumeFile,
  type ResumeReport,
} from "@/lib/resume-reports";

export const Route = createFileRoute("/resume-report/$id")({
  head: () => ({
    meta: [
      { title: "Resume Report — ApexHire" },
      {
        name: "description",
        content: "Side-by-side resume preview and AI analysis with scores and recommendations.",
      },
      { property: "og:title", content: "Resume Report — ApexHire" },
      {
        property: "og:description",
        content: "Your AI resume report: ATS score, job match, strengths and recommendations.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <ReportContent />
    </AppShell>
  ),
});

function ReportContent() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [report, setReport] = useState<ResumeReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const found = getReport(user.username, id);
    setReport(found);
    setLoading(false);
  }, [user, id]);

  useEffect(() => {
    let url: string | null = null;
    void loadResumeFile(id).then((blob) => {
      if (blob) {
        url = URL.createObjectURL(blob);
        setPdfUrl(url);
      }
    });
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-7 text-primary" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="surface-card mx-auto max-w-md p-10 text-center">
        <h1 className="text-xl font-semibold">Report not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This report may have been deleted from this browser.
        </p>
        <Link
          to="/resume-analyzer"
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-gradient-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft"
        >
          Back to analyzer
        </Link>
      </div>
    );
  }

  const remove = () => {
    if (!user) return;
    deleteReport(user.username, report.id);
    toast.success("Report deleted");
    navigate({ to: "/resume-reports" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Link
            to="/resume-reports"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> All reports
          </Link>
          <h1 className="mt-3 truncate text-2xl font-semibold sm:text-3xl">{report.title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {report.targetRole} · {report.experienceLevel} ·{" "}
            {new Date(report.analyzedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          {pdfUrl && (
            <a
              href={pdfUrl}
              download={report.fileName}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-secondary"
            >
              <Download className="size-4" /> Resume
            </a>
          )}
          <button
            type="button"
            onClick={remove}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="size-4" /> Delete
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface-card flex min-h-0 flex-col overflow-hidden lg:h-[calc(100vh-11rem)]">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <FileText className="size-4 text-primary" />
              <p className="truncate text-sm font-medium">{report.fileName}</p>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                {formatBytes(report.fileSize)}
              </span>
            </div>
            {pdfUrl ? (
              <PdfViewer
                source={pdfUrl}
                fallbackText={report.resumeText}
                className="min-h-[60vh] flex-1 lg:min-h-0"
              />
            ) : (
              <div className="max-h-[70vh] overflow-auto whitespace-pre-wrap p-4 text-xs leading-relaxed text-muted-foreground">
                {report.resumeText}
              </div>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          <AnalysisPanel report={report} />
        </div>
      </div>
    </div>
  );
}
