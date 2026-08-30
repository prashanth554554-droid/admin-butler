import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/cards";
import { PromptGrid } from "@/components/site/PromptGrid";
import { Button } from "@/components/ui/button";
import { PROMPT_TYPE_LABELS } from "@/lib/content";

export const Route = createFileRoute("/prompts/")({
  head: () => ({
    meta: [
      { title: "All AI Prompts — Prompt Studio AI" },
      {
        name: "description",
        content:
          "Browse the full library of AI video and AI image prompts, filtered by type, difficulty and popularity.",
      },
      { property: "og:title", content: "All AI Prompts — Prompt Studio AI" },
      {
        property: "og:description",
        content: "The full Prompt Studio AI library of AI video and image prompts.",
      },
    ],
  }),
  component: AllPrompts,
});

const TYPES = Object.keys(PROMPT_TYPE_LABELS);

function AllPrompts() {
  const [type, setType] = useState<string | null>(null);
  const [sort, setSort] = useState<"latest" | "popular">("latest");

  return (
    <>
      <PageHeader
        eyebrow="Prompt library"
        title="Every prompt in the studio"
        description="Copy-ready prompts for AI video and AI image tools, with negative prompts and step-by-step guides."
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={type === null ? "default" : "secondary"}
            onClick={() => setType(null)}
          >
            All types
          </Button>
          {TYPES.map((value) => (
            <Button
              key={value}
              size="sm"
              variant={type === value ? "default" : "secondary"}
              onClick={() => setType(value)}
            >
              {PROMPT_TYPE_LABELS[value]}
            </Button>
          ))}
          <div className="ml-auto flex gap-2">
            <Button
              size="sm"
              variant={sort === "latest" ? "default" : "secondary"}
              onClick={() => setSort("latest")}
            >
              Latest
            </Button>
            <Button
              size="sm"
              variant={sort === "popular" ? "default" : "secondary"}
              onClick={() => setSort("popular")}
            >
              Popular
            </Button>
          </div>
        </div>
        <PromptGrid types={type ? [type] : undefined} sort={sort} />
      </div>
    </>
  );
}
