import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth-layout";
import { Field } from "@/components/field";
import { Spinner } from "@/components/spinner";
import { useAuth } from "@/lib/auth-provider";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — Apex Resume" },
      { name: "description", content: "Sign up for Apex Resume and start analyzing your resume." },
      { property: "og:title", content: "Create your account — Apex Resume" },
      {
        property: "og:description",
        content: "Sign up for Apex Resume and start analyzing your resume.",
      },
    ],
  }),
  component: SignupPage,
});

const initial = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function SignupPage() {
  const { signup, user, ready } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: "/dashboard", replace: true });
  }, [ready, user, navigate]);

  const set = (key: keyof typeof initial) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setFormError("");
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (values.fullName.trim().length < 2) next["fullName"] = "Enter your full name";
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(values.username.trim()))
      next["username"] = "3–20 characters, letters, numbers or underscore";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
      next["email"] = "Enter a valid email address";
    if (values.password.length < 6) next["password"] = "Password must be at least 6 characters";
    if (values.confirmPassword !== values.password)
      next["confirmPassword"] = "Passwords do not match";
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    const res = await signup({
      fullName: values.fullName.trim(),
      username: values.username.trim(),
      email: values.email.trim(),
      password: values.password,
    });
    setLoading(false);

    if (!res.ok) {
      setFormError(res.error ?? "Something went wrong");
      toast.error(res.error ?? "Sign up failed");
      return;
    }
    toast.success("Account created", { description: "Welcome to Apex Resume." });
    navigate({ to: "/dashboard" });
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Apex Resume and get interview-ready faster."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError && (
          <div className="animate-fade-up rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {formError}
          </div>
        )}

        <Field
          label="Full name"
          name="fullName"
          placeholder="Ada Lovelace"
          autoComplete="name"
          value={values.fullName}
          onChange={set("fullName")}
          error={errors["fullName"]}
        />
        <Field
          label="Username"
          name="username"
          placeholder="ada_l"
          autoComplete="username"
          value={values.username}
          onChange={set("username")}
          error={errors["username"]}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={values.email}
          onChange={set("email")}
          error={errors["email"]}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={values.password}
            onChange={set("password")}
            error={errors["password"]}
          />
          <Field
            label="Confirm password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={set("confirmPassword")}
            error={errors["confirmPassword"]}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary text-[15px] font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading && <Spinner />}
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
