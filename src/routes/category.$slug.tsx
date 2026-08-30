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
import { categoryQuery, postsQuery } from "@/lib/content";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ");
    const title = `${name} AI prompts & tutorials — Prompt Studio AI`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `Explore ${name} AI prompts and step-by-step tutorials on Prompt Studio AI.`,
        },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: `Every ${name} prompt and tutorial in the Prompt Studio AI library.`,
        },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const category = useQuery(categoryQuery(slug));
  const posts = useQuery({
    ...postsQuery({ categoryId: category.data?.id }),
    enabled: Boolean(category.data?.id),
  });

  if (category.isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <CardGridSkeleton />
      </div>
    );
  }

  if (!category.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState title="Category not found" description="This category may have been removed." />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Category"
        title={category.data.name}
        description={category.data.description ?? undefined}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionHeading title="Prompts" />
        <PromptGrid categoryId={category.data.id} />

        <div className="mt-16">
          <SectionHeading title="Tutorials" />
          {posts.isLoading ? (
            <CardGridSkeleton count={3} />
          ) : posts.data?.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.data.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <EmptyState title="No tutorials in this category yet" />
          )}
        </div>
      </div>
    </>
  );
}
