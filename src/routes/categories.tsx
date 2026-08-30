import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CardGridSkeleton, CategoryCard, EmptyState, PageHeader } from "@/components/site/cards";
import { categoriesQuery } from "@/lib/content";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "AI Prompt Categories — Prompt Studio AI" },
      {
        name: "description",
        content:
          "Browse AI prompt categories: cinematic, character, birthday, wedding, reels, cartoon stories, business ads and logo animation.",
      },
      { property: "og:title", content: "AI Prompt Categories — Prompt Studio AI" },
      {
        property: "og:description",
        content: "Every creative category in the Prompt Studio AI library.",
      },
    ],
  }),
  component: Categories,
});

function Categories() {
  const query = useQuery(categoriesQuery());

  return (
    <>
      <PageHeader
        eyebrow="Categories"
        title="Find prompts by what you're making"
        description="Each category collects the prompts and tutorials built for that kind of output."
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {query.isLoading ? (
          <CardGridSkeleton count={8} />
        ) : query.data?.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {query.data.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <EmptyState title="No categories yet" />
        )}
      </div>
    </>
  );
}
