import { createServerFn } from "@tanstack/react-start";
import { AnalyzeInput, runResumeAnalysis } from "./resume-analysis.server";

export const analyzeResume = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AnalyzeInput.parse(input))
  .handler(async ({ data }) => runResumeAnalysis(data));
