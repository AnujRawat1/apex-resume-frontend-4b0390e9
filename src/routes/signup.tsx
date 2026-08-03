import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, MailCheck } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";
import { Field } from "@/components/field";
import { Spinner } from "@/components/spinner";
import { useAuth } from "@/lib/auth-provider";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — ApexHire" },
      { name: "description", content: "Sign up for ApexHire and start analyzing your resume." },
      { property: "og:title", content: "Create your account — ApexHire" },
      {
        property: "og:description",
        content: "Sign up for ApexHire and start analyzing your resume.",
      },
    ],
  }),
  component: SignupPage,
});

const initial = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

// Temporary until the email service is wired up.
const DEMO_CODE = "123456";

function SignupPage() {
  const { signup, user, ready } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"details" | "verify">("details");
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [codeError, setCodeError] = useState("");
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (ready && user) navigate({ to: "/dashboard", replace: true });
  }, [ready, user, navigate]);

  useEffect(() => {
    if (step === "verify") inputsRef.current[0]?.focus();
  }, [step]);

  const set = (key: keyof typeof initial) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setFormError("");
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (values.fullName.trim().length < 2) next["fullName"] = "Enter your full name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
      next["email"] = "Enter a valid email address";
    if (values.password.length < 6) next["password"] = "Password must be at least 6 characters";
    if (values.confirmPassword !== values.password)
      next["confirmPassword"] = "Passwords do not match";
    return next;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setCode(["", "", "", "", "", ""]);
    setCodeError("");
    setStep("verify");
    toast.success("Verification code sent", {
      description: `We sent a 6-digit code to ${values.email.trim()}.`,
    });
  };

  const setDigit = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    setCodeError("");
    if (!digits) {
      setCode((prev) => prev.map((d, i) => (i === index ? "" : d)));
      return;
    }
    setCode((prev) => {
      const next = [...prev];
      for (let i = 0; i < digits.length && index + i < 6; i++) next[index + i] = digits[i]!;
      return next;
    });
    const focusIndex = Math.min(index + digits.length, 5);
    inputsRef.current[focusIndex]?.focus();
  };

  const handleKeyDown = (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = code.join("");
    if (entered.length !== 6) {
      setCodeError("Enter the full 6-digit code");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    if (entered !== DEMO_CODE) {
      setLoading(false);
      setCodeError("That code is incorrect. Please try again.");
      toast.error("Invalid verification code");
      return;
    }

    const username = values.email.trim().split("@")[0]!.replace(/[^a-zA-Z0-9_]/g, "");
    const res = await signup({
      fullName: values.fullName.trim(),
      username,
      email: values.email.trim(),
      password: values.password,
    });
    setLoading(false);

    if (!res.ok) {
      setFormError(res.error ?? "Something went wrong");
      toast.error(res.error ?? "Sign up failed");
      setStep("details");
      return;
    }
    toast.success("Email verified — account created", { description: "Welcome to ApexHire." });
    navigate({ to: "/dashboard" });
  };

  return (
    <AuthLayout
      side="right"
      title={step === "details" ? "Create your account" : "Verify your email"}
      subtitle={
        step === "details"
          ? "Join ApexHire and get interview-ready faster."
          : `Enter the 6-digit code we sent to ${values.email.trim()}.`
      }
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      {step === "details" ? (
        <form onSubmit={handleSendCode} className="animate-fade-up space-y-4" noValidate>
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
            label="Email"
            name="email"
            type="email"
            placeholder="you@gmail.com"
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
            {loading ? "Sending code…" : "Send verification code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="animate-fade-up space-y-5" noValidate>
          <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
            <MailCheck className="size-4 shrink-0 text-primary" />
            <span className="truncate">Code sent to {values.email.trim()}</span>
          </div>

          <div className="flex justify-between gap-2">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
                value={digit}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={handleKeyDown(i)}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                aria-label={`Digit ${i + 1}`}
                className={`h-14 w-full rounded-xl border bg-card text-center font-display text-xl font-semibold outline-none transition-all duration-300 focus:border-primary focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_16%,transparent)] ${
                  codeError ? "border-destructive" : "border-border hover:border-primary/50"
                }`}
              />
            ))}
          </div>
          {codeError && (
            <p className="animate-fade-up text-xs font-medium text-destructive">{codeError}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary text-[15px] font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading && <Spinner />}
            {loading ? "Verifying…" : "Verify & create account"}
          </button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => setStep("details")}
              className="inline-flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" /> Edit details
            </button>
            <button
              type="button"
              onClick={() =>
                toast.success("Code resent", { description: "Use 123456 while email is mocked." })
              }
              className="font-medium text-primary transition-opacity hover:opacity-80"
            >
              Resend code
            </button>
          </div>

          <p className="rounded-xl bg-secondary px-4 py-3 text-center text-xs text-muted-foreground">
            Email delivery isn't live yet — use the demo code{" "}
            <span className="font-semibold text-foreground">123456</span>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
