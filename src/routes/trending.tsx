import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CardGridSkeleton,
  EmptyState,
  PageHeader,
  PostCard,
  SectionHeading,
} from "@/components/site/cards";
import { PromptGrid } from "@/components/site/PromptGrid";
import { postsQuery } from "@/lib/content";

export const Route = createFileRoute("/trending")({
  head: () => ({
    meta: [
      { title: "Trending AI Prompts & Tutorials — Prompt Studio AI" },
      {
        name: "description",
        content:
          "The most viewed and most copied AI prompts and tutorials on Prompt Studio AI right now.",
      },
      { property: "og:title", content: "Trending AI Prompts — Prompt Studio AI" },
      {
        property: "og:description",
        content: "See which AI prompts and tutorials creators are using most right now.",
      },
    ],
  }),
  component: Trending,
});

function Trending() {
  const posts = useQuery(postsQuery({ sort: "popular", limit: 6 }));

  return (
    <>
      <PageHeader
        eyebrow="Trending"
        title="What creators are using right now"
        description="Ranked by views and copies across the whole library."
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionHeading title="Trending prompts" />
        <PromptGrid sort="popular" limit={9} />

        <div className="mt-16">
          <SectionHeading title="Popular tutorials" />
          {posts.isLoading ? (
            <CardGridSkeleton count={3} />
          ) : posts.data?.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.data.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <EmptyState title="No tutorials yet" />
          )}
        </div>
      </div>
    </>
  );
}
