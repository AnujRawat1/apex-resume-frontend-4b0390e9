import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, Monitor, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/auth-provider";
import { useTheme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Apex Resume" },
      { name: "description", content: "Manage your Apex Resume profile, theme and session." },
      { property: "og:title", content: "Settings — Apex Resume" },
      { property: "og:description", content: "Manage your profile, theme and session." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppShell>
      <SettingsContent />
    </AppShell>
  );
}

function SettingsContent() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate({ to: "/login" });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Personalise your workspace. More options arrive in later phases.
        </p>
      </header>

      <section className="surface-card p-6">
        <h2 className="text-base font-semibold">Appearance</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your theme preference is saved on this device.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {(
            [
              { key: "light", label: "Light", icon: Sun },
              { key: "dark", label: "Dark", icon: Moon },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setTheme(opt.key)}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft",
                theme === opt.key
                  ? "border-primary bg-secondary"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              <opt.icon className="size-5 text-primary" />
              <span className="text-sm font-medium">{opt.label} mode</span>
            </button>
          ))}
        </div>
      </section>

      <section className="surface-card p-6">
        <h2 className="text-base font-semibold">Profile</h2>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            { label: "Full name", value: user?.fullName },
            { label: "Username", value: user?.username },
            { label: "Email", value: user?.email },
            { label: "Plan", value: "Free · Phase 1" },
          ].map((row) => (
            <div key={row.label} className="rounded-xl bg-secondary px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">{row.label}</dt>
              <dd className="mt-1 truncate text-sm font-medium">{row.value ?? "—"}</dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          onClick={() => toast("Profile editing arrives with the backend integration.")}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft"
        >
          <Monitor className="size-4" /> Edit profile
        </button>
      </section>

      <section className="surface-card p-6">
        <h2 className="text-base font-semibold">Session</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Log out of Apex Resume on this device.
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-destructive px-5 text-sm font-semibold text-destructive-foreground transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0"
        >
          <LogOut className="size-4" /> Log out
        </button>
      </section>
    </div>
  );
}
