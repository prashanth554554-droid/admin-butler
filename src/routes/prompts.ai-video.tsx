import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/cards";
import { PromptGrid } from "@/components/site/PromptGrid";

export const Route = createFileRoute("/prompts/ai-video")({
  head: () => ({
    meta: [
      { title: "AI Video Prompts — Cinematic, Reels & Ads | Prompt Studio AI" },
      {
        name: "description",
        content:
          "Copy-ready AI video prompts for cinematic shots, Instagram reels, product ads and animation, with negative prompts included.",
      },
      { property: "og:title", content: "AI Video Prompts — Prompt Studio AI" },
      {
        property: "og:description",
        content: "Cinematic, reels, advertisement and animation prompts for AI video tools.",
      },
    ],
  }),
  component: VideoPrompts,
});

function VideoPrompts() {
  return (
    <>
      <PageHeader
        eyebrow="AI video prompts"
        title="Prompts that move"
        description="Cinematic flythroughs, reels, product spots and animation prompts written for modern AI video models."
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <PromptGrid kind="video" />
      </div>
    </>
  );
}
