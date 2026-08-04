import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import authIllustration from "@/assets/auth-illustration.png";

const HIGHLIGHTS = [
  "AI resume scoring against any job description",
  "Mock interviews with instant, structured feedback",
  "A career mentor and cover letters, always on call",
];

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  side = "right",
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  /** Which column the form card sits in on large screens. */
  side?: "left" | "right";
}) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      <div className="aurora left-[-10%] top-[-10%] size-[460px] bg-primary" />
      <div className="aurora right-[-8%] top-[30%] size-[420px] bg-primary-glow" />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Logo />
        <ThemeToggle />
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-4 pb-12 pt-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <section
          className={cn(
            "hidden lg:block",
            side === "left" ? "lg:order-2 animate-slide-in-right" : "lg:order-1 animate-slide-in-left",
          )}
        >
          <p className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
            ApexHire · AI hiring workspace
          </p>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.05]">
            Land the interview with a <span className="text-gradient">sharper resume</span>.
          </h1>
          <div className="relative mt-8">
            <img
              src={authIllustration}
              alt="Illustration of an AI-scored resume with charts and feedback bubbles"
              width={1024}
              height={1024}
              loading="lazy"
              className="mx-auto w-full max-w-sm animate-float drop-shadow-xl"
            />
          </div>
          <ul className="mt-4 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gradient-primary" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section
          key={side}
          className={cn(
            "mx-auto w-full max-w-md",
            side === "left" ? "lg:order-1 animate-slide-in-left" : "lg:order-2 animate-slide-in-right",
          )}
        >
          <div className="glass-panel p-6 sm:p-8 shadow-elevated">
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
