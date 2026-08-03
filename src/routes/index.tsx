import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, FileSearch, MessageSquareText, ScrollText } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ApexHire — Get interview-ready with AI" },
      {
        name: "description",
        content:
          "Analyze your resume, decode job descriptions and rehearse AI interviews in one premium workspace.",
      },
      { property: "og:title", content: "ApexHire — Get interview-ready with AI" },
      {
        property: "og:description",
        content: "Analyze resumes, decode job descriptions and rehearse AI interviews.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    title: "Resume Analyzer",
    description: "ATS-aware scoring across structure, keywords and measurable impact.",
    icon: FileSearch,
  },
  {
    title: "JD Analyzer",
    description: "Turn any job description into a checklist of skills you need to show.",
    icon: ScrollText,
  },
  {
    title: "AI Interview",
    description: "Role-specific mock interviews with instant, structured feedback.",
    icon: MessageSquareText,
  },
  {
    title: "History",
    description: "Every analysis and session, saved and searchable in one timeline.",
    icon: Clock,
  },
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="aurora left-[-12%] top-[-12%] size-[460px] bg-primary animate-float" />
      <div className="aurora right-[-10%] top-[18%] size-[400px] bg-primary-glow animate-float" />

      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/login"
              className="inline-flex h-10 items-center rounded-xl border border-border bg-card px-4 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="hidden h-10 items-center rounded-xl bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated sm:inline-flex"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="animate-fade-up py-20 text-center sm:py-28">
          <p className="inline-flex items-center rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
            Phase 1 · Authentication & workspace
          </p>
          <h1 className="mx-auto mt-7 max-w-3xl text-4xl font-semibold leading-[1.08] sm:text-6xl">
            Your resume, <span className="text-gradient">sharpened by AI</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            ApexHire scores your resume against real job descriptions and rehearses the interview
            with you — all in one calm, focused workspace.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              to="/signup"
              className="group inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-primary px-6 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated active:translate-y-0"
            >
              Create free account
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/login"
              className="inline-flex h-12 items-center rounded-xl border border-border bg-card px-6 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft active:translate-y-0"
            >
              Log in
            </Link>
          </div>
        </section>

        <section className="grid gap-4 pb-24 sm:grid-cols-2 xl:grid-cols-4">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="surface-card hover-lift group p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary transition-colors duration-300 group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                <feature.icon className="size-5" />
              </span>
              <h2 className="mt-4 text-base font-semibold">{feature.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </article>
          ))}
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 px-4 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <Logo />
          <p>© {new Date().getFullYear()} ApexHire</p>
        </div>
      </footer>
    </div>
  );
}
