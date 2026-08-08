import { z } from "zod";

export const AnalyzeInput = z.object({
  resumeText: z.string().min(30, "Resume text is too short to analyze"),
  targetRole: z.string().min(2).max(80),
  experienceLevel: z.string().min(2).max(60),
  resumeTitle: z.string().max(120).optional(),
  jobDescription: z.string().max(20000).optional(),
});

export type AnalyzeInputType = z.infer<typeof AnalyzeInput>;

const num = z.coerce.number().pipe(z.number()).transform((n) => Math.max(0, Math.min(100, Math.round(n))));

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

const SECTIONS = [
  "skills",
  "keywords",
  "experience",
  "education",
  "projects",
  "content",
  "formatting",
] as const;

const SYSTEM = `You are a senior technical recruiter and ATS specialist.
Analyse the candidate's resume against the target role and experience level.
Be specific, cite evidence from the resume, and never invent facts.
Return ONLY valid JSON matching the requested shape. Scores are integers 0-100.`;

function buildPrompt(data: AnalyzeInputType) {
  return `TARGET ROLE: ${data.targetRole}
EXPERIENCE LEVEL: ${data.experienceLevel}
${data.jobDescription ? `TARGET JOB DESCRIPTION:\n"""\n${data.jobDescription.slice(0, 12000)}\n"""` : "TARGET JOB DESCRIPTION: none provided"}

RESUME TEXT:
"""
${data.resumeText.slice(0, 24000)}
"""

Return JSON with exactly this shape:
{
  "overallScore": number,
  "atsScore": number,
  "jobMatchScore": number | null,
  "summary": string,
  "sections": [ { "key": string, "title": string, "score": number, "summary": string, "points": [string] } ],
  "strengths": [string],
  "weaknesses": [string],
  "missingSkills": [string],
  "missingKeywords": [string],
  "recommendations": [ { "title": string, "detail": string, "priority": "high"|"medium"|"low" } ],
  "improvements": [string]
}

Include exactly one section object for each of these keys: ${SECTIONS.join(", ")}.
Give 4-6 strengths, 4-6 weaknesses, 4-6 recommendations and 5-8 improvements.
Set "jobMatchScore" to null when no job description was provided.`;
}

export async function runResumeAnalysis(data: AnalyzeInputType): Promise<AnalysisPayload> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured for this project.");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", "Lovable-API-Key": apiKey },
    body: JSON.stringify({
      model: "google/gemini-3.6-flash",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: buildPrompt(data) },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (res.status === 429) throw new Error("Too many requests right now — please retry shortly.");
  if (res.status === 402) throw new Error("AI credits exhausted. Add credits to keep analyzing.");
  if (!res.ok) throw new Error(`Analysis failed (${res.status}). Please try again.`);

  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = (json.choices?.[0]?.message?.content ?? "").trim();
  const cleaned = content.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("The AI returned an unreadable analysis.");
    parsed = JSON.parse(cleaned.slice(start, end + 1));
  }

  const result = AnalysisSchema.parse(parsed);
  if (!data.jobDescription) result.jobMatchScore = null;
  return result;
}
