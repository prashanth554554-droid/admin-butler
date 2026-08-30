import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock, Copy, Eye, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OwnerActions } from "@/components/site/OwnerActions";
import {
  bumpPromptCopyCount,
  PROMPT_TYPE_LABELS,
  type Category,
  type Post,
  type Prompt,
} from "@/lib/content";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string | undefined;
  title: string;
  description?: string | undefined;
  action?: React.ReactNode | undefined;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function MediaThumb({ prompt }: { prompt: { featured_image_url: string | null; title: string } }) {
  if (prompt.featured_image_url) {
    return (
      <img
        src={prompt.featured_image_url}
        alt={prompt.title}
        loading="lazy"
        className="h-40 w-full rounded-xl object-cover"
      />
    );
  }
  return (
    <div className="grid h-40 w-full place-items-center rounded-xl bg-surface-2 halo">
      <Sparkles className="size-7 text-brand" />
    </div>
  );
}

export function PromptCard({ prompt }: { prompt: Prompt }) {
  const copyPrompt = async () => {
    const text = prompt.video_prompt || prompt.image_prompt || "";
    if (!text) {
      toast.error("This prompt has no text yet");
      return;
    }
    await navigator.clipboard.writeText(text);
    await bumpPromptCopyCount(prompt.id, prompt.copy_count);
    toast.success("Prompt copied to clipboard");
  };

  return (
    <article className="card-hover relative flex flex-col rounded-2xl border border-border bg-card p-4">
      <OwnerActions prompt={prompt} />
      <MediaThumb prompt={prompt} />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge className="bg-brand/15 text-brand">
          {PROMPT_TYPE_LABELS[prompt.prompt_type] ?? prompt.prompt_type}
        </Badge>
        {prompt.tool_name ? <Badge variant="secondary">{prompt.tool_name}</Badge> : null}
        <Badge variant="outline" className="capitalize">
          {prompt.difficulty}
        </Badge>
      </div>
      <h3 className="mt-3 text-base font-semibold leading-snug">
        <Link to="/prompt/$slug" params={{ slug: prompt.slug }} className="hover:text-brand">
          {prompt.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{prompt.short_description}</p>
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        {prompt.estimated_time ? (
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> {prompt.estimated_time}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1">
          <Eye className="size-3.5" /> {prompt.views.toLocaleString()}
        </span>
      </div>
      <div className="mt-4 flex gap-2 pt-1">
        <Button variant="secondary" size="sm" className="flex-1" onClick={copyPrompt}>
          <Copy className="mr-1.5 size-3.5" /> Copy prompt
        </Button>
        <Button asChild size="sm" className="flex-1 bg-gradient-brand text-brand-foreground">
          <Link to="/prompt/$slug" params={{ slug: prompt.slug }}>
            View prompt
          </Link>
        </Button>
      </div>
    </article>
  );
}

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="card-hover flex flex-col rounded-2xl border border-border bg-card p-4">
      <MediaThumb prompt={{ featured_image_url: post.featured_image_url, title: post.title }} />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {post.categories ? (
          <Badge className="bg-brand/15 text-brand">{post.categories.name}</Badge>
        ) : null}
        <Badge variant="outline" className="capitalize">
          {post.content_type}
        </Badge>
      </div>
      <h3 className="mt-3 text-base font-semibold leading-snug">
        <Link to="/tutorial/$slug" params={{ slug: post.slug }} className="hover:text-brand">
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
      {post.tools?.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tools.map((tool) => (
            <Badge key={tool} variant="secondary" className="text-[11px]">
              {tool}
            </Badge>
          ))}
        </div>
      ) : null}
      <div className="mt-4 flex items-center justify-between pt-1 text-xs text-muted-foreground">
        <span>
          {post.published_at ? new Date(post.published_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          }) : "Unpublished"}
        </span>
        <Link
          to="/tutorial/$slug"
          params={{ slug: post.slug }}
          className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
        >
          View tutorial <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      to="/category/$slug"
      params={{ slug: category.slug }}
      className="card-hover group flex flex-col rounded-2xl border border-border bg-card p-5"
    >
      <span className="grid size-10 place-items-center rounded-xl bg-brand/15 text-brand">
        <Sparkles className="size-5" />
      </span>
      <h3 className="mt-4 text-base font-semibold group-hover:text-brand">{category.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{category.description}</p>
    </Link>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number | undefined }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="mt-4 h-4 w-24" />
          <Skeleton className="mt-3 h-5 w-3/4" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-4 h-9 w-full" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string | undefined }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <Sparkles className="mx-auto size-6 text-brand" />
      <h3 className="mt-3 text-base font-semibold">{title}</h3>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export function ErrorState({ message }: { message?: string | undefined }) {
  return (
    <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-6 py-10 text-center">
      <h3 className="text-base font-semibold">Something went wrong</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {message ?? "We couldn't load this content. Please try again."}
      </p>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string | undefined;
  title: string;
  description?: string | undefined;
}) {
  return (
    <div className="halo border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="max-w-3xl text-3xl font-semibold sm:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
