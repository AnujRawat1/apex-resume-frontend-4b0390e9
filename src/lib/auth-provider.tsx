import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ApexUser = {
  fullName: string;
  username: string;
  email: string;
};

type AuthContextValue = {
  user: ApexUser | null;
  ready: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (user: ApexUser & { password: string }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

const SESSION_KEY = "apex-session";
const ACCOUNTS_KEY = "apex-accounts";

// Temporary frontend-only credentials until the backend is integrated.
const DEMO_USER = {
  fullName: "Demo User",
  username: "user",
  email: "user@apexresume.app",
  password: "Pass",
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readAccounts(): Array<ApexUser & { password: string }> {
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApexUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore corrupted session */
    }
    setReady(true);
  }, []);

  const persist = (next: ApexUser) => {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    setUser(next);
  };

  const login: AuthContextValue["login"] = async (username, password) => {
    await wait(700);
    const accounts = [DEMO_USER, ...readAccounts()];
    const match = accounts.find(
      (a) =>
        (a.username.toLowerCase() === username.trim().toLowerCase() ||
          a.email.toLowerCase() === username.trim().toLowerCase()) &&
        a.password === password,
    );
    if (!match) return { ok: false, error: "Invalid Username or Password" };
    persist({ fullName: match.fullName, username: match.username, email: match.email });
    return { ok: true };
  };

  const signup: AuthContextValue["signup"] = async (data) => {
    await wait(700);
    const accounts = readAccounts();
    const taken = [DEMO_USER, ...accounts].some(
      (a) => a.username.toLowerCase() === data.username.trim().toLowerCase(),
    );
    if (taken) return { ok: false, error: "That username is already taken" };
    const next = [...accounts, data];
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next));
    persist({ fullName: data.fullName, username: data.username, email: data.email });
    return { ok: true };
  };

  const logout = () => {
    window.localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
