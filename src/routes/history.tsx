import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — ApexHire" },
      { name: "description", content: "Revisit every resume analysis and interview session." },
      { property: "og:title", content: "History — ApexHire" },
      { property: "og:description", content: "Revisit every analysis and interview session." },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      title="History"
      description="A timeline of every resume analysis, job description breakdown and interview session you've run."
      icon={Clock}
    />
  ),
});
