import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { ApiError, authApi, tokenStore, type ApiUser, type Tokens } from "@/lib/api-client";

export type ApexUser = {
  id?: string;
  fullName: string;
  username: string;
  email: string;
};

type Result = { ok: boolean; error?: string };

type AuthContextValue = {
  user: ApexUser | null;
  ready: boolean;
  /** Offline demo mode is active when the backend can't be reached. */
  offline: boolean;
  login: (email: string, password: string) => Promise<Result>;
  /** Step 1 of signup — backend emails a 6-digit verification code. */
  signup: (data: { fullName: string; email: string; password: string }) => Promise<Result>;
  /** Step 2 of signup — exchanges the code for tokens and signs the user in. */
  verifyEmail: (email: string, code: string) => Promise<Result>;
  resendCode: (email: string) => Promise<Result>;
  /** Completes an OAuth redirect by exchanging the temporary code. */
  completeOAuth: (code: string) => Promise<Result>;
  logout: () => void;
};

const SESSION_KEY = "apex-session";
const PENDING_KEY = "apex-pending-signup";

// Local fallback account, used only when the backend is unreachable so the
// UI stays explorable. Never used when the API responds.
const DEMO_USER = {
  fullName: "Demo User",
  username: "user",
  email: "user@apexresume.app",
  password: "Pass",
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toApexUser(api: ApiUser): ApexUser {
  const username = (api.email.split("@")[0] ?? api.name).replace(/[^a-zA-Z0-9_.-]/g, "");
  return { id: api.id, fullName: api.name, username, email: api.email };
}

function isOffline(error: unknown) {
  return error instanceof ApiError && error.status === 0;
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApexUser | null>(null);
  const [ready, setReady] = useState(false);
  const [offline, setOffline] = useState(false);

  const persist = useCallback((next: ApexUser) => {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    setUser(next);
  }, []);

  const adoptTokens = useCallback(
    async (tokens: Tokens) => {
      tokenStore.set(tokens);
      const me = await authApi.me();
      const next = toApexUser(me);
      persist(next);
      setOffline(false);
      return next;
    },
    [persist],
  );

  // Restore session on boot: cached user first (instant UI), then revalidate.
  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      try {
        const raw = window.localStorage.getItem(SESSION_KEY);
        if (raw) setUser(JSON.parse(raw));
      } catch {
        /* ignore corrupted session */
      }

      if (tokenStore.get()) {
        try {
          const me = await authApi.me();
          if (!cancelled) persist(toApexUser(me));
        } catch (error) {
          if (cancelled) return;
          if (isOffline(error)) {
            setOffline(true);
          } else {
            tokenStore.clear();
            window.localStorage.removeItem(SESSION_KEY);
            setUser(null);
          }
        }
      }
      if (!cancelled) setReady(true);
    };

    void boot();
    return () => {
      cancelled = true;
    };
  }, [persist]);

  const login: AuthContextValue["login"] = async (email, password) => {
    const identifier = email.trim();
    try {
      const tokens = await authApi.login({ email: identifier, password });
      await adoptTokens(tokens);
      return { ok: true };
    } catch (error) {
      if (isOffline(error)) {
        setOffline(true);
        const match =
          (identifier.toLowerCase() === DEMO_USER.username ||
            identifier.toLowerCase() === DEMO_USER.email) &&
          password === DEMO_USER.password;
        if (match) {
          persist({
            fullName: DEMO_USER.fullName,
            username: DEMO_USER.username,
            email: DEMO_USER.email,
          });
          return { ok: true };
        }
        return { ok: false, error: "Server unreachable — use the demo credentials to preview." };
      }
      return { ok: false, error: errorMessage(error, "Invalid email or password") };
    }
  };

  const signup: AuthContextValue["signup"] = async ({ fullName, email, password }) => {
    try {
      await authApi.signUp({ name: fullName.trim(), email: email.trim(), password });
      window.sessionStorage.setItem(PENDING_KEY, email.trim());
      return { ok: true };
    } catch (error) {
      if (isOffline(error)) setOffline(true);
      return { ok: false, error: errorMessage(error, "Sign up failed") };
    }
  };

  const verifyEmail: AuthContextValue["verifyEmail"] = async (email, code) => {
    try {
      const tokens = await authApi.verifyEmail({ email: email.trim(), code });
      await adoptTokens(tokens);
      window.sessionStorage.removeItem(PENDING_KEY);
      return { ok: true };
    } catch (error) {
      if (isOffline(error)) setOffline(true);
      return { ok: false, error: errorMessage(error, "That verification code is invalid.") };
    }
  };

  const resendCode: AuthContextValue["resendCode"] = async (email) => {
    try {
      await authApi.resendVerification(email.trim());
      return { ok: true };
    } catch (error) {
      return { ok: false, error: errorMessage(error, "Couldn't resend the code") };
    }
  };

  const completeOAuth: AuthContextValue["completeOAuth"] = async (code) => {
    try {
      const tokens = await authApi.exchangeOAuthCode(code);
      await adoptTokens(tokens);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: errorMessage(error, "Sign-in link expired. Please try again.") };
    }
  };

  const logout = () => {
    const tokens = tokenStore.get();
    if (tokens) void authApi.logout(tokens.refreshToken).catch(() => undefined);
    tokenStore.clear();
    window.localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, ready, offline, login, signup, verifyEmail, resendCode, completeOAuth, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
