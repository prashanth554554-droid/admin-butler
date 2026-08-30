import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CardGridSkeleton, EmptyState, ErrorState, PageHeader, PostCard } from "@/components/site/cards";
import { postsQuery } from "@/lib/content";

export const Route = createFileRoute("/tutorials")({
  head: () => ({
    meta: [
      { title: "AI Tutorials & Guides — Prompt Studio AI" },
      {
        name: "description",
        content:
          "Step-by-step AI tutorials and guides covering cinematic video workflows, prompt structure, character consistency and more.",
      },
      { property: "og:title", content: "AI Tutorials & Guides — Prompt Studio AI" },
      {
        property: "og:description",
        content: "Practical, step-by-step tutorials for AI video and image creation.",
      },
    ],
  }),
  component: Tutorials,
});

function Tutorials() {
  const query = useQuery(postsQuery({}));

  return (
    <>
      <PageHeader
        eyebrow="Tutorials"
        title="Learn the craft behind the prompt"
        description="Repeatable workflows for cinematic AI video, consistent characters, reels and commercial work."
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {query.isLoading ? (
          <CardGridSkeleton />
        ) : query.isError ? (
          <ErrorState message={(query.error as Error).message} />
        ) : query.data?.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {query.data.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState title="No tutorials yet" />
        )}
      </div>
    </>
  );
}
