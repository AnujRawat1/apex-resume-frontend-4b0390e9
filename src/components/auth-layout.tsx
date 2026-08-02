import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const HIGHLIGHTS = [
  "AI resume scoring against any job description",
  "Mock interviews with instant, structured feedback",
  "Track every application in one clean history",
];

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div className="aurora left-[-10%] top-[-10%] size-[420px] bg-primary" />
      <div className="aurora right-[-8%] top-[30%] size-[380px] bg-primary-glow" />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Logo />
        <ThemeToggle />
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-4 pb-12 pt-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <section className="hidden animate-fade-up lg:block">
          <p className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
            Phase 1 · Apex Resume
          </p>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.05]">
            Land the interview with a <span className="text-gradient">sharper resume</span>.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            One workspace to analyze your resume, decode job descriptions, and rehearse interviews
            with AI feedback.
          </p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gradient-primary" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto w-full max-w-md animate-fade-up">
          <div className="surface-card p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">{title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </div>
          <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>
        </section>
      </div>
    </div>
  );
}
