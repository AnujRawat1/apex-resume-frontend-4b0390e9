import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { FullPageSpinner } from "@/components/spinner";
import { useAuth } from "@/lib/auth-provider";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !user) navigate({ to: "/login", replace: true });
  }, [ready, user, navigate]);

  if (!ready || !user) return <FullPageSpinner />;

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[image:var(--gradient-surface)]" />
      <Navbar />
      <main className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div key={typeof window === "undefined" ? "ssr" : undefined} className="animate-fade-up">
          {children}
        </div>
      </main>
    </div>
  );
}
