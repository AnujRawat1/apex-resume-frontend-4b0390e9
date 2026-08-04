import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Mail, Lock } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthButton } from "@/components/auth/auth-button";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { useAuth } from "@/lib/auth-provider";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — ApexHire" },
      { name: "description", content: "Sign in to your ApexHire workspace." },
      { property: "og:title", content: "Log in — ApexHire" },
      { property: "og:description", content: "Sign in to your ApexHire workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, user, ready } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: "/dashboard", replace: true });
  }, [ready, user, navigate]);

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const next: Record<string, string> = {};
    const email = values.email.trim();
    if (!email) next["email"] = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email !== "user")
      next["email"] = "Enter a valid email address";
    if (!values.password) next["password"] = "Password is required";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    const res = await login(email, values.password);
    setLoading(false);

    if (!res.ok) {
      setFormError(res.error ?? "Something went wrong");
      toast.error("Invalid email or password", { duration: 2200 });
      return;
    }
    if (remember) window.localStorage.setItem("apex-remember", email);
    toast.success("Welcome back", { duration: 1800 });
    navigate({ to: "/dashboard" });
  };

  return (
    <AuthLayout
      side="left"
      title="Welcome back"
      subtitle="Log in to continue building your Apex profile."
      footer={
        <>
          New here?{" "}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="animate-fade-up space-y-5" noValidate>
        {formError && (
          <div
            role="alert"
            className="animate-fade-up rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
          >
            {formError}
          </div>
        )}

        <AuthInput
          label="Email"
          name="email"
          type="email"
          icon={<Mail />}
          placeholder="you@company.com"
          autoComplete="username"
          disabled={loading}
          value={values.email}
          onChange={set("email")}
          error={errors["email"]}
        />
        <AuthInput
          label="Password"
          name="password"
          type="password"
          icon={<Lock />}
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={loading}
          value={values.password}
          onChange={set("password")}
          error={errors["password"]}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <label className="inline-flex cursor-pointer select-none items-center gap-2 text-muted-foreground">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="size-4 rounded border-border accent-[var(--primary)]"
            />
            Remember me
          </label>
          <button
            type="button"
            onClick={() => toast.info("Password reset arrives in a later phase.", { duration: 2200 })}
            className="rounded-md font-medium text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Forgot password?
          </button>
        </div>

        <AuthButton type="submit" loading={loading} loadingText="Signing in…">
          Log in
        </AuthButton>

        <OAuthButtons disabled={loading} />

        <p className="rounded-2xl bg-secondary/60 px-4 py-3 text-center text-xs text-muted-foreground">
          Demo credentials — <span className="font-semibold text-foreground">user</span> /{" "}
          <span className="font-semibold text-foreground">Pass</span>
        </p>
      </form>
    </AuthLayout>
  );
}
