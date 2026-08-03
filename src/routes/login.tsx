import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth-layout";
import { Field } from "@/components/field";
import { Spinner } from "@/components/spinner";
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
  const [values, setValues] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: "/dashboard", replace: true });
  }, [ready, user, navigate]);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!values.username.trim()) next["username"] = "Username is required";
    if (!values.password) next["password"] = "Password is required";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    const res = await login(values.username, values.password);
    setLoading(false);

    if (!res.ok) {
      setFormError(res.error ?? "Something went wrong");
      toast.error("Invalid Username or Password");
      return;
    }
    if (remember) window.localStorage.setItem("apex-remember", values.username.trim());
    toast.success("Welcome back!", { description: "Redirecting to your dashboard." });
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
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {formError && (
          <div className="animate-fade-up rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {formError}
          </div>
        )}

        <Field
          label="Username or email"
          name="username"
          placeholder="user"
          autoComplete="username"
          value={values.username}
          onChange={set("username")}
          error={errors["username"]}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
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
            onClick={() => toast("Password reset is coming in a later phase.")}
            className="font-medium text-primary transition-opacity hover:opacity-80"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary text-[15px] font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading && <Spinner />}
          {loading ? "Signing in…" : "Log in"}
        </button>

        <p className="rounded-xl bg-secondary px-4 py-3 text-center text-xs text-muted-foreground">
          Demo credentials — username <span className="font-semibold text-foreground">user</span>,
          password <span className="font-semibold text-foreground">Pass</span>
        </p>
      </form>
    </AuthLayout>
  );
}
