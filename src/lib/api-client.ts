/**
 * ApexHire backend client.
 *
 * Talks to the Spring backend documented in API_DOCUMENTATION.md.
 * Base URL is configurable through VITE_API_BASE_URL and defaults to the
 * local backend (http://localhost:8080).
 */

export const API_BASE_URL: string =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:8080";

const ACCESS_KEY = "apex-access-token";
const REFRESH_KEY = "apex-refresh-token";

export type Tokens = { accessToken: string; refreshToken: string };

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  roles?: string[];
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const tokenStore = {
  get(): Tokens | null {
    try {
      const accessToken = window.localStorage.getItem(ACCESS_KEY);
      const refreshToken = window.localStorage.getItem(REFRESH_KEY);
      return accessToken && refreshToken ? { accessToken, refreshToken } : null;
    } catch {
      return null;
    }
  },
  set(tokens: Tokens) {
    window.localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    window.localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  },
  clear() {
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function messageFrom(body: unknown, fallback: string): string {
  if (typeof body === "string" && body.trim()) return body;
  if (body && typeof body === "object") {
    const obj = body as Record<string, unknown>;
    for (const key of ["message", "error", "detail"]) {
      if (typeof obj[key] === "string" && obj[key]) return obj[key] as string;
    }
    const first = Object.values(obj).find((v) => typeof v === "string");
    if (typeof first === "string") return first;
  }
  return fallback;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
  retryOn401?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = false, retryOn401 = true } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const tokens = tokenStore.get();
    if (tokens) headers["Authorization"] = `Bearer ${tokens.accessToken}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new ApiError("Can't reach the ApexHire server. Is the backend running?", 0);
  }

  if (res.status === 401 && auth && retryOn401) {
    const refreshed = await tryRefresh();
    if (refreshed) return apiRequest<T>(path, { ...options, retryOn401: false });
  }

  const parsed = await parseBody(res);
  if (!res.ok) throw new ApiError(messageFrom(parsed, `Request failed (${res.status})`), res.status);
  return parsed as T;
}

async function tryRefresh(): Promise<boolean> {
  const tokens = tokenStore.get();
  if (!tokens) return false;
  try {
    const next = await apiRequest<Tokens>("/api/auth/refresh", {
      method: "POST",
      body: { refreshToken: tokens.refreshToken },
    });
    tokenStore.set(next);
    return true;
  } catch {
    tokenStore.clear();
    return false;
  }
}

export const authApi = {
  signUp: (data: { name: string; email: string; password: string }) =>
    apiRequest<unknown>("/api/auth/sign-up", { method: "POST", body: data }),

  verifyEmail: (data: { email: string; code: string }) =>
    apiRequest<Tokens>("/api/auth/verify-email", { method: "POST", body: data }),

  resendVerification: (email: string) =>
    apiRequest<unknown>("/api/auth/resend-verification", { method: "POST", body: { email } }),

  login: (data: { email: string; password: string }) =>
    apiRequest<Tokens>("/api/auth/login", { method: "POST", body: data }),

  logout: (refreshToken: string) =>
    apiRequest<unknown>("/api/auth/logout", { method: "POST", body: { refreshToken } }),

  exchangeOAuthCode: (code: string) =>
    apiRequest<Tokens>("/api/auth/oauth/exchange", { method: "POST", body: { code } }),

  me: () => apiRequest<ApiUser>("/api/users/me", { auth: true }),
};

export const oauthUrl = (provider: "google" | "github") =>
  `${API_BASE_URL}/oauth2/authorization/${provider}`;
