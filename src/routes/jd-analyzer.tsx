import { createFileRoute } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/jd-analyzer")({
  head: () => ({
    meta: [
      { title: "JD Analyzer — Apex Resume" },
      { name: "description", content: "Extract must-have skills and keywords from a job description." },
      { property: "og:title", content: "JD Analyzer — Apex Resume" },
      { property: "og:description", content: "Extract must-have skills from any job description." },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      title="JD Analyzer"
      description="Paste a job description to surface required skills, responsibilities and the keywords your resume is missing."
      icon={ScrollText}
    />
  ),
});
