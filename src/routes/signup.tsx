import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Lock, Mail, MailCheck, User } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthButton } from "@/components/auth/auth-button";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { OtpInput } from "@/components/auth/otp-input";
import { PasswordChecklist, isStrongPassword } from "@/components/auth/password-checklist";
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

const initial = { fullName: "", email: "", password: "", confirmPassword: "" };

const RESEND_SECONDS = 25;


function SignupPage() {
  const { signup, user, ready } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"details" | "verify">("details");
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [codeError, setCodeError] = useState("");
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (ready && user) navigate({ to: "/dashboard", replace: true });
  }, [ready, user, navigate]);

  useEffect(() => {
    if (step !== "verify" || seconds <= 0) return;
    const id = window.setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [step, seconds]);

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
    if (!isStrongPassword(values.password))
      next["password"] = "Password does not meet all requirements";
    if (!values.confirmPassword) next["confirmPassword"] = "Confirm your password";
    else if (values.confirmPassword !== values.password)
      next["confirmPassword"] = "Passwords do not match";
    return next;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    const res = await signup({
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      password: values.password,
    });
    setLoading(false);

    if (!res.ok) {
      setFormError(res.error ?? "Sign up failed");
      toast.error(res.error ?? "Sign up failed", { duration: 2600 });
      return;
    }

    setCode(Array(6).fill(""));
    setCodeError("");
    setSeconds(RESEND_SECONDS);
    setStep("verify");
    toast.success("Verification code sent", { duration: 2200 });
  };

  const handleVerify = useCallback(
    async (entered: string) => {
      if (loading) return;
      setLoading(true);
      const res = await verifyEmail(values.email.trim(), entered.trim());
      setLoading(false);

      if (!res.ok) {
        setCodeError(res.error ?? "That verification code is invalid.");
        setCode(Array(6).fill(""));
        toast.error("Invalid verification code", { duration: 2200 });
        return;
      }

      toast.success("Account created", { duration: 1800 });
      navigate({ to: "/dashboard" });
    },
    [loading, navigate, verifyEmail, values],
  );


  const mmss = `00:${String(seconds).padStart(2, "0")}`;

  return (
    <AuthLayout
      side="right"
      title={step === "details" ? "Create your account" : "Verify your email"}
      subtitle={
        step === "details"
          ? "Join ApexHire and get interview-ready faster."
          : `Enter the 6-character code we sent to ${values.email.trim()}.`
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
            <div
              role="alert"
              className="animate-fade-up rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
            >
              {formError}
            </div>
          )}

          <AuthInput
            label="Full name"
            name="fullName"
            icon={<User />}
            placeholder="Ada Lovelace"
            autoComplete="name"
            disabled={loading}
            value={values.fullName}
            onChange={set("fullName")}
            error={errors["fullName"]}
          />
          <AuthInput
            label="Email"
            name="email"
            type="email"
            icon={<Mail />}
            placeholder="you@gmail.com"
            autoComplete="email"
            disabled={loading}
            value={values.email}
            onChange={set("email")}
            error={errors["email"]}
          />
          <div className="space-y-2">
            <AuthInput
              label="Password"
              name="password"
              type="password"
              icon={<Lock />}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={loading}
              value={values.password}
              onChange={set("password")}
              error={errors["password"]}
            />
            <PasswordChecklist value={values.password} />
          </div>
          <AuthInput
            label="Confirm password"
            name="confirmPassword"
            type="password"
            icon={<Lock />}
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={loading}
            value={values.confirmPassword}
            onChange={set("confirmPassword")}
            error={errors["confirmPassword"]}
          />

          <AuthButton type="submit" loading={loading} loadingText="Sending code…">
            Create account
          </AuthButton>

          <OAuthButtons disabled={loading} />
        </form>
      ) : (
        <div className="animate-fade-up space-y-5">
          <div className="flex items-center gap-3 rounded-2xl bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
            <MailCheck className="size-4 shrink-0 text-primary" />
            <span className="truncate">Code sent to {values.email.trim()}</span>
          </div>

          <OtpInput
            value={code}
            onChange={(next) => {
              setCode(next);
              setCodeError("");
            }}
            onComplete={handleVerify}
            disabled={loading}
            error={!!codeError}
          />

          {codeError && (
            <p role="alert" className="animate-fade-up text-xs font-medium text-destructive">
              {codeError}
            </p>
          )}

          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            {loading && <span className="animate-pulse">Verifying…</span>}
            {!loading && "The code submits automatically."}
          </p>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => setStep("details")}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-md font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            >
              <ArrowLeft className="size-4" /> Edit details
            </button>
            {seconds > 0 ? (
              <span className="text-muted-foreground">Resend in {mmss}</span>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setSeconds(RESEND_SECONDS);
                  setCode(Array(6).fill(""));
                  setCodeError("");
                  toast.success("Code resent", { duration: 2000 });
                }}
                className="rounded-md font-medium text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              >
                Resend code
              </button>
            )}
          </div>

          <p className="rounded-2xl bg-secondary/60 px-4 py-3 text-center text-xs text-muted-foreground">
            Email delivery isn't live yet — use demo code{" "}
            <span className="font-semibold text-foreground">123456</span>
          </p>
        </div>
      )}
    </AuthLayout>
  );
}
