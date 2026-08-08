import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  resumeText: z.string().min(30, "Resume text is too short to analyze"),
  targetRole: z.string().min(2).max(80),
  experienceLevel: z.string().min(2).max(60),
  resumeTitle: z.string().max(120).optional(),
  jobDescription: z.string().max(20000).optional(),
});

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

function buildPrompt(data: z.infer<typeof Input>) {
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
  "jobMatchScore": number | null,   // null when no job description was provided
  "summary": string,                // 2-3 sentence verdict
  "sections": [                     // one object per key: ${SECTIONS.join(", ")}
    { "key": string, "title": string, "score": number, "summary": string, "points": [string] }
  ],
  "strengths": [string],            // 4-6 items
  "weaknesses": [string],           // 4-6 items
  "missingSkills": [string],        // skills expected for the role but absent
  "missingKeywords": [string],      // ATS keywords absent, from the JD when provided
  "recommendations": [ { "title": string, "detail": string, "priority": "high"|"medium"|"low" } ],
  "improvements": [string]          // concrete rewrite suggestions, 5-8 items
}`;
}

export const analyzeResume = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured for this project.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Lovable-API-Key": apiKey,
      },
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
    const content = json.choices?.[0]?.message?.content ?? "";
    const cleaned = content
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("The AI returned an unreadable analysis.");
      parsed = JSON.parse(cleaned.slice(start, end + 1));
    }

    return parsed as Record<string, unknown>;
  });
