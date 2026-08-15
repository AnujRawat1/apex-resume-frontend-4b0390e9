import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-provider";

type Search = { code?: string };

export const Route = createFileRoute("/oauth/callback")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    ...(typeof search["code"] === "string" ? { code: search["code"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Signing you in — ApexHire" },
      { name: "description", content: "Completing your ApexHire sign-in." },
      { property: "og:title", content: "Signing you in — ApexHire" },
      { property: "og:description", content: "Completing your ApexHire sign-in." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OAuthCallbackPage,
});

function OAuthCallbackPage() {
  const { code } = Route.useSearch();
  const { completeOAuth } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!code) {
      setError("No sign-in code was provided.");
      return;
    }

    void (async () => {
      const res = await completeOAuth(code);
      if (!res.ok) {
        setError(res.error ?? "Sign-in failed. Please try again.");
        return;
      }
      toast.success("Signed in", { duration: 1800 });
      navigate({ to: "/dashboard", replace: true });
    })();
  }, [code, completeOAuth, navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="surface-card w-full max-w-sm p-8 text-center">
        {error ? (
          <>
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
              <ShieldAlert className="size-6" />
            </span>
            <h1 className="mt-5 text-lg font-semibold">Couldn't sign you in</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Link
              to="/login"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-gradient-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft"
            >
              Back to login
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto size-8 animate-spin text-primary" />
            <h1 className="mt-5 text-lg font-semibold">Signing you in…</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Finishing your secure sign-in with ApexHire.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
