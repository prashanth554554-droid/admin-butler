import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton, EmptyState, PostCard, SectionHeading } from "@/components/site/cards";
import { postQuery, postsQuery } from "@/lib/content";

export const Route = createFileRoute("/tutorial/$slug")({
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ");
    const title = `${name} — AI tutorial | Prompt Studio AI`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `A step-by-step AI tutorial: ${name}. Learn the exact prompts, tools and workflow.`,
        },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: `Step-by-step AI creation tutorial: ${name}.`,
        },
      ],
    };
  },
  component: TutorialDetail,
});

function TutorialDetail() {
  const { slug } = Route.useParams();
  const query = useQuery(postQuery(slug));
  const related = useQuery({
    ...postsQuery({ categoryId: query.data?.category_id ?? undefined, limit: 3 }),
    enabled: Boolean(query.data?.category_id),
  });

  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-20 sm:px-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!query.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState title="Tutorial not found" description="This tutorial may be unpublished." />
      </div>
    );
  }

  const post = query.data;

  return (
    <>
      <div className="halo border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            {post.categories ? (
              <Link to="/category/$slug" params={{ slug: post.categories.slug }}>
                <Badge className="bg-brand/15 text-brand">{post.categories.name}</Badge>
              </Link>
            ) : null}
            <Badge variant="outline" className="capitalize">
              {post.content_type}
            </Badge>
            {post.published_at ? (
              <span className="text-xs text-muted-foreground">
                {new Date(post.published_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            ) : null}
          </div>
          <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">{post.title}</h1>
          {post.excerpt ? (
            <p className="mt-4 text-base text-muted-foreground">{post.excerpt}</p>
          ) : null}
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {post.featured_video_url ? (
          <video
            src={post.featured_video_url}
            controls
            playsInline
            className="mb-10 w-full rounded-2xl border border-border bg-black"
          />
        ) : post.featured_image_url ? (
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="mb-10 w-full rounded-2xl border border-border"
          />
        ) : null}

        {post.tools?.length ? (
          <div className="mb-8 flex flex-wrap gap-2">
            {post.tools.map((tool) => (
              <Badge key={tool} variant="secondary">
                {tool}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
          {(post.content ?? "").split(/\n{2,}/).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>

      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <SectionHeading title="Related tutorials" />
        {related.isLoading ? (
          <CardGridSkeleton count={3} />
        ) : related.data?.filter((p) => p.id !== post.id).length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.data
              .filter((p) => p.id !== post.id)
              .map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
          </div>
        ) : (
          <EmptyState title="No related tutorials yet" />
        )}
      </div>
    </>
  );
}
