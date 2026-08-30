import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Copy, Eye, ExternalLink, Gauge, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, SectionHeading } from "@/components/site/cards";
import { PromptBox } from "@/components/site/PromptBox";
import { PromptGrid } from "@/components/site/PromptGrid";
import { bumpPromptCopyCount, PROMPT_TYPE_LABELS, promptQuery } from "@/lib/content";

export const Route = createFileRoute("/prompt/$slug")({
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ");
    const title = `${name} — AI prompt | Prompt Studio AI`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `Copy the full image prompt, video prompt and negative prompt for ${name}, plus a step-by-step guide.`,
        },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: `Ready-to-use AI prompt: ${name}. Includes negative prompt and step-by-step guide.`,
        },
      ],
    };
  },
  component: PromptDetail,
});

function PromptDetail() {
  const { slug } = Route.useParams();
  const query = useQuery(promptQuery(slug));

  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-20 sm:px-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (!query.data?.prompt) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState
          title="Prompt not found"
          description="This prompt may be unpublished or the link is out of date."
        />
      </div>
    );
  }

  const { prompt, steps, tools } = query.data;

  return (
    <>
      <div className="halo border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-brand/15 text-brand">
              {PROMPT_TYPE_LABELS[prompt.prompt_type] ?? prompt.prompt_type}
            </Badge>
            {prompt.categories ? (
              <Link to="/category/$slug" params={{ slug: prompt.categories.slug }}>
                <Badge variant="secondary">{prompt.categories.name}</Badge>
              </Link>
            ) : null}
            <Badge variant="outline" className="capitalize">
              <Gauge className="mr-1 size-3" /> {prompt.difficulty}
            </Badge>
            {prompt.estimated_time ? (
              <Badge variant="outline">
                <Clock className="mr-1 size-3" /> {prompt.estimated_time}
              </Badge>
            ) : null}
            <Badge variant="outline">
              <Eye className="mr-1 size-3" /> {prompt.views.toLocaleString()}
            </Badge>
            <Badge variant="outline">
              <Copy className="mr-1 size-3" /> {prompt.copy_count.toLocaleString()} copies
            </Badge>
          </div>
          <h1 className="mt-5 text-3xl font-semibold sm:text-5xl">{prompt.title}</h1>
          {prompt.short_description ? (
            <p className="mt-4 max-w-2xl text-base text-muted-foreground">
              {prompt.short_description}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            {(prompt.tool_links ?? []).map((link) => (
              <Button
                key={link.url}
                asChild
                variant="secondary"
                className="bg-surface-2"
              >
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.label || "Open tool"} <ExternalLink className="ml-1.5 size-3.5" />
                </a>
              </Button>
            ))}
            <Button asChild className="bg-gradient-brand text-brand-foreground">
              <Link to="/add-prompt">Add your own prompt</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {prompt.example_video_url ? (
          <video
            src={prompt.example_video_url}
            controls
            playsInline
            className="mb-10 w-full rounded-2xl border border-border bg-black"
          />
        ) : prompt.featured_image_url ? (
          <img
            src={prompt.featured_image_url}
            alt={prompt.title}
            className="mb-10 w-full rounded-2xl border border-border object-cover"
          />
        ) : null}

        {tools.length ? (
          <div className="mb-10 rounded-2xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Wrench className="size-4" /> AI tools used
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {tools.map((tool) => (
                <Badge key={tool.id} variant="secondary">
                  {tool.tool_name}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        {(["image", "video"] as const).map((kind) => {
          const active = kind === "image" ? prompt.is_image : prompt.is_video;
          const fallback = kind === "image" ? prompt.image_prompt : prompt.video_prompt;
          const saved =
            kind === "image"
              ? (prompt.image_prompts ?? []).map((entry) => ({
                  text: entry.prompt,
                  media: entry.image_url,
                }))
              : (prompt.video_prompts ?? []).map((entry) => ({
                  text: entry.prompt,
                  media: entry.video_url,
                }));
          const list = saved.length
            ? saved
            : prompt.prompt_blocks?.length
              ? prompt.prompt_blocks.map((text) => ({ text, media: "" }))
              : fallback
                ? [{ text: fallback, media: "" }]
                : [];
          if ((!active && !fallback && !saved.length) || !list.length) return null;
          return (
            <div key={kind} className="mb-10 space-y-5">
              <SectionHeading title={kind === "image" ? "Image prompts" : "Video prompts"} />
              {list.map((entry, index) => (
                <div key={`${kind}-${index}`} className="space-y-3">
                  {entry.text ? (
                    <PromptBox
                      label={
                        list.length > 1
                          ? `${kind === "image" ? "Image" : "Video"} Prompt ${index + 1}`
                          : kind === "image"
                            ? "Image Prompt"
                            : "Video Prompt"
                      }
                      text={entry.text}
                      onCopied={() => void bumpPromptCopyCount(prompt.id, prompt.copy_count)}
                    />
                  ) : null}
                  {entry.media ? (
                    kind === "image" ? (
                      <img
                        src={entry.media}
                        alt={`${prompt.title} — related image ${index + 1}`}
                        loading="lazy"
                        className="w-full rounded-2xl border border-border object-cover"
                      />
                    ) : (
                      <video
                        src={entry.media}
                        controls
                        playsInline
                        className="w-full rounded-2xl border border-border bg-black"
                      />
                    )
                  ) : null}
                </div>
              ))}
            </div>
          );
        })}

        {prompt.negative_prompt ? (
          <PromptBox label="Negative Prompt" text={prompt.negative_prompt} />
        ) : null}

        {steps.length ? (
          <div className="mt-16">
            <SectionHeading title="Step by step guide" />
            <ol className="space-y-4">
              {steps.map((step) => (
                <li key={step.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-start gap-4">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-brand text-sm font-semibold text-brand-foreground">
                      {step.step_number}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold">{step.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                      {step.image_url ? (
                        <img
                          src={step.image_url}
                          alt={step.title ?? "Step illustration"}
                          loading="lazy"
                          className="mt-3 rounded-xl border border-border"
                        />
                      ) : null}
                      {step.video_url ? (
                        <video
                          src={step.video_url}
                          controls
                          className="mt-3 w-full rounded-xl border border-border bg-black"
                        />
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {prompt.category_id ? (
          <div className="mt-16">
            <SectionHeading title="Related prompts" />
            <PromptGrid categoryId={prompt.category_id} limit={3} />
          </div>
        ) : null}
      </div>
    </>
  );
}
