import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/cards";
import { PromptGrid } from "@/components/site/PromptGrid";

export const Route = createFileRoute("/prompts/ai-image")({
  head: () => ({
    meta: [
      { title: "AI Image Prompts — Portraits, Characters & Editorial | Prompt Studio AI" },
      {
        name: "description",
        content:
          "Detailed AI image prompts for portraits, characters, celebrations and editorial photography, with negative prompts.",
      },
      { property: "og:title", content: "AI Image Prompts — Prompt Studio AI" },
      {
        property: "og:description",
        content: "Portrait, character, celebration and editorial prompts for AI image tools.",
      },
    ],
  }),
  component: ImagePrompts,
});

function ImagePrompts() {
  return (
    <>
      <PageHeader
        eyebrow="AI image prompts"
        title="Frames worth animating"
        description="Precise image prompts for portraits, characters and celebration scenes — the strongest starting point for video."
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <PromptGrid kind="image" />
      </div>
    </>
  );
}
