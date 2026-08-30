import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CardGridSkeleton,
  CategoryCard,
  EmptyState,
  PageHeader,
  PostCard,
  PromptCard,
  SectionHeading,
} from "@/components/site/cards";
import { categoriesQuery, postsQuery, promptsQuery, PROMPT_TYPE_LABELS } from "@/lib/content";

const searchSchema = z.object({
  q: z.string().optional(),
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Search AI prompts & tutorials — Prompt Studio AI" },
      {
        name: "description",
        content:
          "Search the Prompt Studio AI library across prompts, tutorials, categories and AI tools.",
      },
      { property: "og:title", content: "Search — Prompt Studio AI" },
      {
        property: "og:description",
        content: "Find the exact AI prompt or tutorial you need.",
      },
    ],
  }),
  component: SearchPage,
});

const CONTENT_TYPES = [
  { value: "all", label: "Everything" },
  { value: "prompts", label: "Prompts" },
  { value: "tutorials", label: "Tutorials" },
  { value: "categories", label: "Categories" },
];

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [term, setTerm] = useState(q ?? "");
  const [contentType, setContentType] = useState("all");
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [sort, setSort] = useState<"latest" | "popular">("latest");

  const query = q?.trim() ?? "";
  const prompts = useQuery({
    ...promptsQuery({
      search: query,
      difficulty: difficulty ?? undefined,
      types: type ? [type] : undefined,
      sort,
    }),
    enabled: query.length > 0 && (contentType === "all" || contentType === "prompts"),
  });
  const posts = useQuery({
    ...postsQuery({ search: query, sort }),
    enabled: query.length > 0 && (contentType === "all" || contentType === "tutorials"),
  });
  const categories = useQuery({
    ...categoriesQuery(),
    enabled: query.length > 0 && (contentType === "all" || contentType === "categories"),
  });

  const matchedCategories = (categories.data ?? []).filter((c) =>
    `${c.name} ${c.description ?? ""}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        eyebrow="Search"
        title={query ? `Results for “${query}”` : "Search the library"}
        description="Search across prompt text, tutorials, categories and AI tools."
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/search", search: { q: term.trim() } });
          }}
        >
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search AI prompts, tutorials and video ideas..."
              aria-label="Search"
              className="h-12 rounded-xl bg-surface pl-10"
            />
          </div>
          <Button type="submit" className="h-12 bg-gradient-brand text-brand-foreground">
            Search
          </Button>
        </form>

        <div className="mt-6 flex flex-wrap gap-2">
          {CONTENT_TYPES.map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant={contentType === option.value ? "default" : "secondary"}
              onClick={() => setContentType(option.value)}
            >
              {option.label}
            </Button>
          ))}
          <span className="mx-1 hidden h-8 w-px bg-border sm:block" />
          {["beginner", "intermediate", "advanced"].map((level) => (
            <Button
              key={level}
              size="sm"
              variant={difficulty === level ? "default" : "secondary"}
              className="capitalize"
              onClick={() => setDifficulty(difficulty === level ? null : level)}
            >
              {level}
            </Button>
          ))}
          <span className="mx-1 hidden h-8 w-px bg-border sm:block" />
          {Object.entries(PROMPT_TYPE_LABELS)
            .slice(0, 5)
            .map(([value, label]) => (
              <Button
                key={value}
                size="sm"
                variant={type === value ? "default" : "secondary"}
                onClick={() => setType(type === value ? null : value)}
              >
                {label}
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

        {!query ? (
          <div className="mt-12">
            <EmptyState
              title="Start typing to search"
              description="Try “cinematic”, “birthday”, “reels” or a tool name."
            />
          </div>
        ) : (
          <div className="mt-12 space-y-16">
            {contentType === "all" || contentType === "prompts" ? (
              <section>
                <SectionHeading title={`Prompts (${prompts.data?.length ?? 0})`} />
                {prompts.isLoading ? (
                  <CardGridSkeleton count={3} />
                ) : prompts.data?.length ? (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {prompts.data.map((prompt) => (
                      <PromptCard key={prompt.id} prompt={prompt} />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No prompts matched" />
                )}
              </section>
            ) : null}

            {contentType === "all" || contentType === "tutorials" ? (
              <section>
                <SectionHeading title={`Tutorials (${posts.data?.length ?? 0})`} />
                {posts.isLoading ? (
                  <CardGridSkeleton count={3} />
                ) : posts.data?.length ? (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {posts.data.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No tutorials matched" />
                )}
              </section>
            ) : null}

            {contentType === "all" || contentType === "categories" ? (
              <section>
                <SectionHeading title={`Categories (${matchedCategories.length})`} />
                {matchedCategories.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {matchedCategories.map((category) => (
                      <CategoryCard key={category.id} category={category} />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No categories matched" />
                )}
              </section>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}
