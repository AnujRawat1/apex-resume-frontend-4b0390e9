import { createFileRoute } from "@tanstack/react-router";
import { MessageSquareText } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/ai-interview")({
  head: () => ({
    meta: [
      { title: "AI Interview — Apex Resume" },
      { name: "description", content: "Practise role-specific interview questions with AI feedback." },
      { property: "og:title", content: "AI Interview — Apex Resume" },
      { property: "og:description", content: "Practise interview questions with instant AI feedback." },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      title="AI Interview"
      description="Run a mock interview tailored to your target role and receive instant, structured feedback on every answer."
      icon={MessageSquareText}
    />
  ),
});
