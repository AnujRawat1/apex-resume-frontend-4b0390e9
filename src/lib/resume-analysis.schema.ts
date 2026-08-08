import { z } from "zod";

export const AnalyzeInput = z.object({
  resumeText: z.string().min(30, "Resume text is too short to analyze"),
  targetRole: z.string().min(2).max(80),
  experienceLevel: z.string().min(2).max(60),
  resumeTitle: z.string().max(120).optional(),
  jobDescription: z.string().max(20000).optional(),
});

export type AnalyzeInputType = z.infer<typeof AnalyzeInput>;

const num = z.coerce
  .number()
  .transform((n) => Math.max(0, Math.min(100, Math.round(n))));

export const AnalysisSchema = z.object({
  overallScore: num,
  atsScore: num,
  jobMatchScore: num.nullable().default(null),
  summary: z.string().default(""),
  sections: z
    .array(
      z.object({
        key: z.string(),
        title: z.string(),
        score: num,
        summary: z.string().default(""),
        points: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  missingSkills: z.array(z.string()).default([]),
  missingKeywords: z.array(z.string()).default([]),
  recommendations: z
    .array(
      z.object({
        title: z.string(),
        detail: z.string().default(""),
        priority: z.enum(["high", "medium", "low"]).default("medium"),
      }),
    )
    .default([]),
  improvements: z.array(z.string()).default([]),
});

export type AnalysisPayload = z.infer<typeof AnalysisSchema>;
