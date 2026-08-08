import { createServerFn } from "@tanstack/react-start";
import { AnalyzeInput } from "./resume-analysis.schema";

export const analyzeResume = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AnalyzeInput.parse(input))
  .handler(async ({ data }) => {
    const { runResumeAnalysis } = await import("./resume-analysis.server");
    return runResumeAnalysis(data);
  });
