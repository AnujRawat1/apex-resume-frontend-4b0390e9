import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, Clock, Compass, FileSearch, MessageSquareText, PenLine, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/auth-provider";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ApexHire" },
      { name: "description", content: "Your ApexHire workspace overview and quick actions." },
      { property: "og:title", content: "Dashboard — ApexHire" },
      { property: "og:description", content: "Your ApexHire workspace overview." },
    ],
  }),
  component: DashboardPage,
});

const MODULES = [
  {
    to: "/resume-analyzer" as const,
    title: "Resume Analyzer",
    description: "Score your resume on structure, keywords and impact.",
    icon: FileSearch,
  },
  {
    to: "/ai-interview" as const,
    title: "AI Interview",
    description: "Practise role-specific questions with instant feedback.",
    icon: MessageSquareText,
  },
  {
    to: "/career-mentor" as const,
    title: "AI Career Mentor",
    description: "Personalised roadmaps toward your target role.",
    icon: Compass,
  },
  {
    to: "/cover-letter" as const,
    title: "Cover Letter Generator",
    description: "Tailored cover letters for every application.",
    icon: PenLine,
  },
];

const STATS = [
  { label: "Resume score", value: "—", hint: "Run your first analysis", icon: TrendingUp },
  { label: "Analyses", value: "0", hint: "This month", icon: FileSearch },
  { label: "Interviews", value: "0", hint: "Practice sessions", icon: Brain },
];

function DashboardPage() {
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const firstName = (user?.fullName || user?.username || "there").split(" ")[0];

  return (
    <div className="space-y-10">
      <section className="surface-card overflow-hidden p-6 sm:p-9">
        <p className="text-sm font-medium text-muted-foreground">Welcome back</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
          Hey {firstName}, ready to <span className="text-gradient">level up</span>?
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Start with a resume analysis, then rehearse the interview. Everything you do here is saved
          to your history.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/resume-analyzer"
            className="inline-flex h-11 items-center rounded-xl bg-gradient-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated active:translate-y-0"
          >
            Analyze my resume
          </Link>
          <Link
            to="/ai-interview"
            className="inline-flex h-11 items-center rounded-xl border border-border bg-card px-5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft active:translate-y-0"
          >
            Start mock interview
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat.label} className="surface-card hover-lift p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className="size-4 text-primary" />
            </div>
            <p className="mt-3 font-display text-3xl font-semibold">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Quick access</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {MODULES.map((mod) => (
            <Link key={mod.to} to={mod.to} className="surface-card hover-lift group p-5">
              <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary transition-colors duration-300 group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                <mod.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{mod.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {mod.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Recent activity</h2>
        <div className="surface-card mt-4 p-10 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
            <Clock className="size-5" />
          </span>
          <p className="mt-4 text-sm font-medium">No activity yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your analyses and interview sessions will appear here.
          </p>
        </div>
      </section>
    </div>
  );
}
