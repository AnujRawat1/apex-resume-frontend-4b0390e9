import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export function ModulePlaceholder({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
          <Icon className="size-6" />
        </span>
        <h1 className="mt-6 text-3xl font-semibold sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
        <p className="mt-6 inline-flex rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
          Coming in a later phase
        </p>
        <div className="mt-8">
          <Link
            to="/dashboard"
            className="inline-flex h-11 items-center rounded-xl border border-border bg-card px-5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
