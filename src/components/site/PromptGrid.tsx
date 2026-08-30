import { useQuery } from "@tanstack/react-query";
import { CardGridSkeleton, EmptyState, ErrorState, PromptCard } from "@/components/site/cards";
import { promptsQuery } from "@/lib/content";

type Props = Parameters<typeof promptsQuery>[0];

export function PromptGrid(props: Props) {
  const query = useQuery(promptsQuery(props));

  if (query.isLoading) return <CardGridSkeleton />;
  if (query.isError) return <ErrorState message={(query.error as Error).message} />;
  if (!query.data?.length)
    return (
      <EmptyState
        title="Nothing here yet"
        description="New prompts are added regularly — check back soon."
      />
    );

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {query.data.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
}
