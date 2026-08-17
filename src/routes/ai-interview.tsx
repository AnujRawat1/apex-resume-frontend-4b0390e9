import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Briefcase,
  Gauge,
  ListChecks,
  MessageSquareText,
  Mic,
  Play,
  Timer,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ChipToggle, Labelled, PageHeading, WsSelect, WsTextarea } from "@/components/workspace";
import { EXPERIENCE_LEVELS, TARGET_ROLES } from "@/lib/resume-reports";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ai-interview")({
  head: () => ({
    meta: [
      { title: "AI Interview Practice — ApexHire" },
      {
        name: "description",
        content:
          "Practice realistic technical, HR and behavioral interviews with an AI interviewer tailored to your role and experience.",
      },
      { property: "og:title", content: "AI Interview Practice — ApexHire" },
      {
        property: "og:description",
        content: "Realistic mock interviews with an AI interviewer, tuned to your role and level.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AiInterviewPage,
});

const TYPES = [
  { value: "Technical Interview", detail: "Role-specific problem solving" },
  { value: "HR Interview", detail: "Motivation, fit and expectations" },
  { value: "Behavioral Interview", detail: "STAR stories and teamwork" },
  { value: "Mixed Interview", detail: "A blend of all three" },
];

const FOCUS = [
  "Java / Spring Boot",
  "Data Structures & Algorithms",
  "System Design",
  "AWS",
  "React",
  "Python",
  "General Backend",
  "Behavioral",
];

const DIFFICULTY = ["Easy", "Medium", "Hard"];
const COUNTS = [5, 8, 10, 15, 20];

function AiInterviewPage() {
  return (
    <AppShell>
      <InterviewContent />
    </AppShell>
  );
}

function InterviewContent() {
  const [type, setType] = useState(TYPES[0]!.value);
  const [role, setRole] = useState<string>(TARGET_ROLES[0]);
  const [level, setLevel] = useState<string>(EXPERIENCE_LEVELS[0]);
  const [focus, setFocus] = useState(FOCUS[0]!);
  const [difficulty, setDifficulty] = useState(DIFFICULTY[1]!);
  const [count, setCount] = useState(8);
  const [useResume, setUseResume] = useState(true);
  const [jd, setJd] = useState("");

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Interview practice"
        icon={MessageSquareText}
        title="AI Interview"
        subtitle="Practice realistic interviews with an AI interviewer."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="animate-fade-up space-y-5">
          {/* Interview type */}
          <div className="surface-card space-y-4 p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <MessageSquareText className="size-4 text-primary" />
              <p className="text-sm font-semibold">Interview type</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  aria-pressed={type === t.value}
                  className={cn(
                    "rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.99]",
                    type === t.value
                      ? "border-primary/50 bg-primary/10 shadow-soft"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <p className="text-sm font-semibold">{t.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t.detail}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Configuration */}
          <div className="surface-card space-y-4 p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Briefcase className="size-4 text-primary" />
              <p className="text-sm font-semibold">Session configuration</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Labelled label="Role">
                <WsSelect value={role} onChange={(e) => setRole(e.target.value)}>
                  {TARGET_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </WsSelect>
              </Labelled>

              <Labelled label="Experience level">
                <WsSelect value={level} onChange={(e) => setLevel(e.target.value)}>
                  {EXPERIENCE_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </WsSelect>
              </Labelled>
            </div>

            <Labelled label="Interview focus / topic">
              <div className="flex flex-wrap gap-2">
                {FOCUS.map((f) => (
                  <ChipToggle key={f} active={focus === f} onClick={() => setFocus(f)}>
                    {f}
                  </ChipToggle>
                ))}
              </div>
            </Labelled>

            <div className="grid gap-4 sm:grid-cols-2">
              <Labelled label="Difficulty">
                <div className="flex gap-2">
                  {DIFFICULTY.map((d) => (
                    <ChipToggle
                      key={d}
                      active={difficulty === d}
                      onClick={() => setDifficulty(d)}
                      className="flex-1 py-2 text-center"
                    >
                      {d}
                    </ChipToggle>
                  ))}
                </div>
              </Labelled>

              <Labelled label="Number of questions" hint={`${count} questions`}>
                <div className="flex gap-2">
                  {COUNTS.map((c) => (
                    <ChipToggle
                      key={c}
                      active={count === c}
                      onClick={() => setCount(c)}
                      className="flex-1 py-2 text-center"
                    >
                      {c}
                    </ChipToggle>
                  ))}
                </div>
              </Labelled>
            </div>
          </div>

          {/* Personalisation */}
          <div className="surface-card space-y-4 p-5 sm:p-6">
            <p className="text-sm font-semibold">Personalisation</p>

            <button
              type="button"
              onClick={() => setUseResume((v) => !v)}
              aria-pressed={useResume}
              className={cn(
                "flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3.5 text-left transition-all duration-300",
                useResume ? "border-primary/50 bg-primary/10" : "border-border bg-card hover:border-primary/40",
              )}
            >
              <span>
                <span className="block text-sm font-semibold">Use my resume</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Questions will be personalised from your uploaded resume.
                </span>
              </span>
              <span
                className={cn(
                  "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300",
                  useResume ? "bg-gradient-primary" : "bg-secondary",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 size-5 rounded-full bg-card shadow-soft transition-transform duration-300",
                    useResume ? "translate-x-[22px]" : "translate-x-0.5",
                  )}
                />
              </span>
            </button>

            <Labelled label="Target job description" hint="optional">
              <WsTextarea
                rows={6}
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste a job description for a job-specific interview…"
              />
            </Labelled>
          </div>
        </section>

        {/* Summary */}
        <aside className="animate-fade-up space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="surface-card p-5">
            <div className="flex items-center gap-2">
              <ListChecks className="size-4 text-primary" />
              <p className="text-sm font-semibold">Your session</p>
            </div>
            <dl className="mt-4 space-y-3 text-xs">
              {[
                ["Type", type],
                ["Role", role],
                ["Level", level],
                ["Focus", focus],
                ["Difficulty", difficulty],
                ["Questions", String(count)],
                ["Resume context", useResume ? "On" : "Off"],
                ["Job description", jd.trim() ? "Provided" : "None"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="max-w-[60%] text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>

            <button
              type="button"
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated active:scale-[0.99]"
            >
              <Play className="size-4" /> Start Interview
            </button>
            <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
              This configuration will be used to create your personalised AI interview session.
            </p>
          </div>

          <div className="surface-card space-y-3 p-5">
            <p className="text-sm font-semibold">What to expect</p>
            {[
              { icon: Mic, text: "One question at a time, like a real interviewer" },
              { icon: Timer, text: "Timed answers with follow-up questions" },
              { icon: Gauge, text: "Scored feedback at the end of the session" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-border bg-card text-primary">
                  <Icon className="size-4" />
                </span>
                <p className="text-xs leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
