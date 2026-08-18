import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Compass,
  FileText,
  GraduationCap,
  Send,
  Sparkles,
  Target,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Labelled, PageHeading, WsInput, WsSelect } from "@/components/workspace";
import { useAuth } from "@/lib/auth-provider";
import { TARGET_ROLES, loadReports, type ResumeReport } from "@/lib/resume-reports";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/career-mentor")({
  head: () => ({
    meta: [
      { title: "AI Career Mentor — ApexHire" },
      {
        name: "description",
        content:
          "Chat with your personal AI career advisor for guidance on resumes, interviews, skills, jobs and career decisions.",
      },
      { property: "og:title", content: "AI Career Mentor — ApexHire" },
      {
        property: "og:description",
        content: "Personalised career guidance on resumes, interviews, skills and job search.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CareerMentorPage,
});

const TOPICS = [
  "Improve my resume",
  "Prepare for an interview",
  "Career roadmap",
  "Skills I should learn",
  "Job search advice",
];

type Message = { id: number; role: "user" | "mentor"; text: string };

function CareerMentorPage() {
  return (
    <AppShell>
      <MentorContent />
    </AppShell>
  );
}

function MentorContent() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ResumeReport[]>([]);
  const [resumeId, setResumeId] = useState("");
  const [role, setRole] = useState<string>(TARGET_ROLES[0]);
  const [goal, setGoal] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) setReports(loadReports(user.username));
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const firstName = useMemo(
    () => (user?.fullName || user?.username || "there").split(" ")[0],
    [user],
  );

  const send = (text: string) => {
    const value = text.trim();
    if (!value) return;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", text: value },
      {
        id: Date.now() + 1,
        role: "mentor",
        text: "This is a preview of the mentor workspace — live AI responses are being wired up next. Your resume, target role and career goal will be sent along as context.",
      },
    ]);
  };

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Career guidance"
        icon={Compass}
        title="AI Career Mentor"
        subtitle="Your personal AI career advisor"
        description="Get guidance on resumes, interviews, skills, jobs and career decisions."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Conversation */}
        <section className="surface-card animate-fade-up flex min-h-[60vh] flex-col overflow-hidden lg:h-[calc(100vh-16rem)] lg:max-h-[720px]">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
              <GraduationCap className="size-4" />
            </span>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Career Mentor</p>
              <p className="truncate text-xs text-muted-foreground">
                Context: {resumeId ? "resume attached" : "no resume"} · {role}
              </p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
            {messages.length === 0 ? (
              <div className="animate-fade-up mx-auto max-w-md py-6 text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
                  <GraduationCap className="size-5" />
                </span>
                <p className="mt-4 text-base font-semibold">Hi {firstName}, where should we start?</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Ask anything about your career, or pick one of the suggested topics below.
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "animate-fade-up max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      m.role === "user"
                        ? "bg-gradient-primary text-primary-foreground shadow-soft"
                        : "border border-border bg-secondary/50 text-foreground",
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-border px-4 py-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => send(topic)}
                  className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground active:scale-95"
                >
                  {topic}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-end gap-2"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                placeholder="Ask your career mentor anything…"
                aria-label="Message"
                className="max-h-40 min-h-[48px] flex-1 resize-y rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/70 focus:border-primary focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_16%,transparent)]"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send message"
                className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated active:scale-95 disabled:pointer-events-none disabled:opacity-50"
              >
                <Send className="size-[18px]" />
              </button>
            </form>
          </div>
        </section>

        {/* Context */}
        <aside className="animate-fade-up space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="surface-card space-y-4 p-5">
            <div className="flex items-center gap-2">
              <Target className="size-4 text-primary" />
              <p className="text-sm font-semibold">Mentor context</p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Anything you add here is used to personalise the mentor&apos;s advice.
            </p>

            <Labelled label="Resume" hint="optional">
              <WsSelect value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
                <option value="">No resume selected</option>
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

            <Labelled label="Career goal" hint="optional">
              <WsInput
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Senior backend role in 12 months"
              />
            </Labelled>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <p className="text-sm font-semibold">What the mentor can do</p>
            </div>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
              {[
                "Review resume content and positioning",
                "Build a skill roadmap for your target role",
                "Coach you through interview preparation",
                "Sharpen your job search strategy",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gradient-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
