import { createFileRoute } from "@tanstack/react-router";
import { PenLine } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/cover-letter")({
  head: () => ({
    meta: [
      { title: "Cover Letter Generator — ApexHire" },
      {
        name: "description",
        content: "Generate tailored cover letters for any job description in seconds.",
      },
      { property: "og:title", content: "Cover Letter Generator — ApexHire" },
      {
        property: "og:description",
        content: "Tailored, role-specific cover letters generated in seconds.",
      },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      title="Cover Letter Generator"
      description="Turn your resume and a job description into a tailored, recruiter-ready cover letter in one click."
      icon={PenLine}
    />
  ),
});
