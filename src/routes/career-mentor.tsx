import { createFileRoute } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/career-mentor")({
  head: () => ({
    meta: [
      { title: "AI Career Mentor — ApexHire" },
      {
        name: "description",
        content: "Get personalised career guidance, skill roadmaps and next-step advice from AI.",
      },
      { property: "og:title", content: "AI Career Mentor — ApexHire" },
      {
        property: "og:description",
        content: "Personalised career guidance and skill roadmaps powered by AI.",
      },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      title="AI Career Mentor"
      description="Ask career questions, map out skill gaps and get a personalised roadmap toward your target role."
      icon={Compass}
    />
  ),
});
