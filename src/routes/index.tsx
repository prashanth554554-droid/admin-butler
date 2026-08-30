import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Film, Search, Sparkles, TrendingUp, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CardGridSkeleton,
  CategoryCard,
  EmptyState,
  PostCard,
  PromptCard,
  SectionHeading,
} from "@/components/site/cards";
import { categoriesQuery, postsQuery, promptsQuery } from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prompt Studio AI — AI Prompts, Tutorials & Video Studio" },
      {
        name: "description",
        content:
          "Discover ready-to-use AI prompts, cinematic video ideas, AI image prompts and step-by-step tutorials. Then create your own AI video in the studio.",
      },
      { property: "og:title", content: "Prompt Studio AI — AI Prompts & Video Studio" },
      {
        property: "og:description",
        content:
          "Ready-to-use AI video and image prompts, cinematic ideas and tutorials, plus a built-in AI video studio.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [term, setTerm] = useState("");
  const navigate = useNavigate();

  const trending = useQuery(promptsQuery({ sort: "popular", limit: 6 }));
  const featured = useQuery(promptsQuery({ featured: true, limit: 6 }));
  const tutorials = useQuery(postsQuery({ limit: 6 }));
  const categories = useQuery(categoriesQuery());

  return (
    <>
      <section className="halo border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 text-brand" /> Create Amazing AI Images and Videos With
              Powerful Prompts
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.08] sm:text-6xl">
              Create Amazing <span className="text-gradient">AI Videos</span> With Powerful Prompts
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Discover ready-to-use AI prompts, cinematic video ideas, AI image prompts and
              step-by-step tutorials.
            </p>

            <form
              className="mx-auto mt-8 flex max-w-xl flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                if (term.trim()) navigate({ to: "/search", search: { q: term.trim() } });
              }}
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Search AI prompts, tutorials and video ideas..."
                  aria-label="Search AI prompts, tutorials and video ideas"
                  className="h-12 rounded-xl bg-surface pl-10"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 bg-gradient-brand text-brand-foreground">
                Search
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild variant="secondary" size="lg">
                <Link to="/prompts">
                  <Wand2 className="mr-2 size-4" /> Explore Prompts
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-gradient-brand text-brand-foreground">
                <Link to="/add-prompt">
                  <Film className="mr-2 size-4" /> Add a Prompt
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Trending now"
          title="Most copied prompts this week"
          description="The prompts creators keep coming back to."
          action={
            <Button asChild variant="ghost">
              <Link to="/trending">
                <TrendingUp className="mr-2 size-4" /> See all trending
              </Link>
            </Button>
          }
        />
        {trending.isLoading ? (
          <CardGridSkeleton />
        ) : trending.data?.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trending.data.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        ) : (
          <EmptyState title="No prompts published yet" />
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <SectionHeading
          eyebrow="Categories"
          title="Browse by creative category"
          description="From cinematic flythroughs to birthday reels and logo animations."
        />
        {categories.isLoading ? (
          <CardGridSkeleton count={8} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(categories.data ?? []).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <SectionHeading
          eyebrow="Featured prompts"
          title="Hand-picked prompts worth stealing"
          action={
            <Button asChild variant="ghost">
              <Link to="/prompts">
                All prompts <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          }
        />
        {featured.isLoading ? (
          <CardGridSkeleton />
        ) : featured.data?.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.data.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        ) : (
          <EmptyState title="No featured prompts yet" />
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <SectionHeading
          eyebrow="Latest tutorials"
          title="Learn the workflow behind every result"
          action={
            <Button asChild variant="ghost">
              <Link to="/tutorials">
                All tutorials <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          }
        />
        {tutorials.isLoading ? (
          <CardGridSkeleton />
        ) : tutorials.data?.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tutorials.data.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState title="No tutorials published yet" />
        )}
      </div>
    </>
  );
}
