import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Copy,
  Download,
  History,
  PenLine,
  Pencil,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  ChipToggle,
  Labelled,
  PageHeading,
  WsInput,
  WsSelect,
  WsTextarea,
} from "@/components/workspace";
import { useAuth } from "@/lib/auth-provider";
import { TARGET_ROLES, loadReports, type ResumeReport } from "@/lib/resume-reports";

export const Route = createFileRoute("/cover-letter")({
  head: () => ({
    meta: [
      { title: "Cover Letter Generator — ApexHire" },
      {
        name: "description",
        content:
          "Create a personalized cover letter from your resume, target role, company and job description.",
      },
      { property: "og:title", content: "Cover Letter Generator — ApexHire" },
      {
        property: "og:description",
        content: "Tailored, role-specific cover letters built from your resume and the job description.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoverLetterPage,
});

const TONES = ["Professional", "Confident", "Friendly", "Concise", "Enthusiastic"];

function CoverLetterPage() {
  return (
    <AppShell>
      <CoverLetterContent />
    </AppShell>
  );
}

function CoverLetterContent() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ResumeReport[]>([]);
  const [resumeId, setResumeId] = useState("");
  const [role, setRole] = useState<string>(TARGET_ROLES[0]);
  const [company, setCompany] = useState("");
  const [jd, setJd] = useState("");
  const [extra, setExtra] = useState("");
  const [skills, setSkills] = useState("");
  const [tone, setTone] = useState(TONES[0]);

  useEffect(() => {
    if (user) setReports(loadReports(user.username));
  }, [user]);

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Job applications"
        icon={PenLine}
        title="Cover Letter Generator"
        subtitle="Create a personalized cover letter for the job you're applying for."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Form */}
        <section className="animate-fade-up space-y-5">
          <div className="surface-card space-y-4 p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <p className="text-sm font-semibold">Application details</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Labelled label="Resume">
                <WsSelect value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
                  <option value="">Select resume</option>
                  {reports.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </WsSelect>
              </Labelled>

              <Labelled label="Target role">
                <WsSelect value={role} onChange={(e) => setRole(e.target.value)}>
                  {TARGET_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </WsSelect>
              </Labelled>
            </div>

            <Labelled label="Company name">
              <WsInput
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe"
              />
            </Labelled>

            <Labelled label="Job description" hint="paste the full posting">
              <WsTextarea
                rows={8}
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the job description here…"
              />
            </Labelled>
          </div>

          <div className="surface-card space-y-4 p-5 sm:p-6">
            <p className="text-sm font-semibold">Personalisation</p>

            <Labelled label="Additional information" hint="optional">
              <WsTextarea
                rows={4}
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder="Anything you'd like emphasised — achievements, motivation, relocation…"
              />
            </Labelled>

            <Labelled label="Specific skills to emphasize" hint="optional">
              <WsInput
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, TypeScript, system design"
              />
            </Labelled>

            <Labelled label="Tone / style">
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <ChipToggle key={t} active={tone === t} onClick={() => setTone(t)}>
                    {t}
                  </ChipToggle>
                ))}
              </div>
            </Labelled>
          </div>

          <button
            type="button"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated active:scale-[0.99]"
          >
            <Sparkles className="size-4" /> Generate Cover Letter
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Your selected resume, target role, company and job description will be used to write the
            letter.
          </p>
        </section>

        {/* Output preview */}
        <section className="animate-fade-up space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="surface-card flex min-h-[420px] flex-col overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Generated cover letter</p>
              <div className="flex items-center gap-1.5">
                {[
                  { icon: Pencil, label: "Edit" },
                  { icon: Copy, label: "Copy" },
                  { icon: Download, label: "Download" },
                  { icon: RefreshCw, label: "Regenerate" },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    aria-label={label}
                    title={label}
                    disabled
                    className="grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-all duration-300 hover:text-foreground disabled:opacity-50"
                  >
                    <Icon className="size-4" />
                  </button>
                ))}
              </div>
            </div>
            <div className="grid flex-1 place-items-center px-6 py-10 text-center">
              <div className="max-w-sm">
                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
                  <PenLine className="size-5" />
                </span>
                <p className="mt-4 text-sm font-semibold">Your cover letter will appear here</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Fill in the details on the left and generate a tailored letter you can edit, copy
                  or download.
                </p>
              </div>
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center gap-2">
              <History className="size-4 text-primary" />
              <p className="text-sm font-semibold">Cover letter history</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Generated letters will be saved here so you can revisit and reuse them.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
