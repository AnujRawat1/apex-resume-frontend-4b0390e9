import { createFileRoute } from "@tanstack/react-router";
import { FileSearch } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/resume-analyzer")({
  head: () => ({
    meta: [
      { title: "Resume Analyzer — Apex Resume" },
      { name: "description", content: "Score your resume on structure, keywords and impact." },
      { property: "og:title", content: "Resume Analyzer — Apex Resume" },
      { property: "og:description", content: "Score your resume on structure, keywords and impact." },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      title="Resume Analyzer"
      description="Upload a resume and get a structured score across formatting, keywords, impact statements and ATS readiness."
      icon={FileSearch}
    />
  ),
});
