export const TARGET_ROLES = [
  "Frontend Engineer",
  "Backend Engineer",
  "Fullstack Engineer",
  "Mobile Engineer",
  "ML / AI Engineer",
  "Infrastructure / DevOps Engineer",
  "Data Engineer",
  "Embedded / Systems Engineer",
] as const;

export const EXPERIENCE_LEVELS = [
  "Junior (0-2 years)",
  "Mid-level (2-5 years)",
  "Senior (5-10 years)",
  "Staff+ (10+ years)",
] as const;

export type TargetRole = (typeof TARGET_ROLES)[number];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export type AnalysisSection = {
  key: string;
  title: string;
  score: number;
  summary: string;
  points: string[];
};

export type Recommendation = {
  title: string;
  detail: string;
  priority: "high" | "medium" | "low";
};

export type AnalysisResult = {
  overallScore: number;
  atsScore: number;
  jobMatchScore: number | null;
  summary: string;
  sections: AnalysisSection[];
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  missingKeywords: string[];
  recommendations: Recommendation[];
  improvements: string[];
};

export type ResumeReport = {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  targetRole: TargetRole;
  experienceLevel: ExperienceLevel;
  jobDescription: string | null;
  resumeText: string;
  analysis: AnalysisResult;
  createdAt: string;
  analyzedAt: string;
};

const key = (username: string) => `apex-resume-reports:${username}`;

export function loadReports(username: string): ResumeReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key(username));
    const list = raw ? (JSON.parse(raw) as ResumeReport[]) : [];
    return list.sort((a, b) => +new Date(b.analyzedAt) - +new Date(a.analyzedAt));
  } catch {
    return [];
  }
}

export function saveReport(username: string, report: ResumeReport) {
  const next = [report, ...loadReports(username)].slice(0, 100);
  window.localStorage.setItem(key(username), JSON.stringify(next));
}

export function deleteReport(username: string, id: string) {
  const next = loadReports(username).filter((r) => r.id !== id);
  window.localStorage.setItem(key(username), JSON.stringify(next));
  void deleteResumeFile(id);
}

export function getReport(username: string, id: string): ResumeReport | null {
  return loadReports(username).find((r) => r.id === id) ?? null;
}

/* ---------- resume file storage (IndexedDB) ---------- */

const DB_NAME = "apexhire";
const STORE = "resumes";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = window.indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveResumeFile(id: string, file: File) {
  try {
    const buffer = await file.arrayBuffer();
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(buffer, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* storage unavailable — preview simply falls back to text */
  }
}

export async function loadResumeFile(id: string): Promise<Blob | null> {
  try {
    const db = await openDb();
    const buffer = await new Promise<ArrayBuffer | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => resolve(req.result as ArrayBuffer | undefined);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return buffer ? new Blob([buffer], { type: "application/pdf" }) : null;
  } catch {
    return null;
  }
}

export async function deleteResumeFile(id: string) {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    db.close();
  } catch {
    /* ignore */
  }
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function scoreTone(score: number) {
  if (score >= 80) return "text-[color:var(--success)]";
  if (score >= 60) return "text-primary";
  return "text-destructive";
}
