import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
};

export type Prompt = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  prompt_type: string;
  image_prompt: string | null;
  video_prompt: string | null;
  negative_prompt: string | null;
  tool_name: string | null;
  difficulty: string;
  estimated_time: string | null;
  featured_image_url: string | null;
  example_video_url: string | null;
  prompt_blocks: string[] | null;
  tool_links: { label: string; url: string }[] | null;
  image_prompts: { prompt: string; image_url: string }[] | null;
  video_prompts: { prompt: string; video_url: string }[] | null;

  is_video: boolean;
  is_image: boolean;
  category_id: string | null;
  author_id: string | null;
  status: string;
  featured: boolean;
  views: number;
  copy_count: number;
  created_at: string;
  categories?: { name: string; slug: string } | null;
};

export async function deletePrompt(id: string) {
  const { error } = await supabase.from("prompts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}


export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image_url: string | null;
  featured_video_url: string | null;
  content_type: string;
  tools: string[];
  category_id: string | null;
  status: string;
  featured: boolean;
  views: number;
  published_at: string | null;
  created_at: string;
  categories?: { name: string; slug: string } | null;
};

const PROMPT_FIELDS = "*, categories(name, slug)";
const POST_FIELDS = "*, categories(name, slug)";

export const VIDEO_TYPES = ["ai_video", "cinematic", "reels", "advertisement", "animation"];
export const IMAGE_TYPES = ["ai_image", "character", "birthday", "wedding"];

export const PROMPT_TYPE_LABELS: Record<string, string> = {
  ai_image: "AI Image",
  ai_video: "AI Video",
  cinematic: "Cinematic",
  character: "Character",
  birthday: "Birthday",
  wedding: "Wedding",
  reels: "Reels",
  advertisement: "Advertisement",
  animation: "Animation",
};

async function unwrap<T>(promise: PromiseLike<{ data: T | null; error: { message: string } | null }>) {
  const { data, error } = await promise;
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
}

export const categoriesQuery = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: () => unwrap<Category[]>(supabase.from("categories").select("*").order("name")),
  });

export const categoryQuery = (slug: string) =>
  queryOptions({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as Category | null;
    },
  });

type PromptFilters = {
  types?: string[] | undefined;
  kind?: ("video" | "image") | undefined;
  categoryId?: string | undefined;
  categorySlug?: string | undefined;
  featured?: boolean | undefined;
  difficulty?: string | undefined;
  sort?: ("latest" | "popular") | undefined;
  limit?: number | undefined;
  search?: string | undefined;
};

export const promptsQuery = (filters: PromptFilters = {}) =>
  queryOptions({
    queryKey: ["prompts", filters],
    queryFn: async () => {
      let q = supabase.from("prompts").select(PROMPT_FIELDS).eq("status", "published");
      if (filters.types?.length) q = q.in("prompt_type", filters.types);
      if (filters.kind === "video") q = q.eq("is_video", true);
      if (filters.kind === "image") q = q.eq("is_image", true);
      if (filters.categoryId) q = q.eq("category_id", filters.categoryId);
      if (filters.featured) q = q.eq("featured", true);
      if (filters.difficulty) q = q.eq("difficulty", filters.difficulty);
      if (filters.search) {
        const term = `%${filters.search}%`;
        q = q.or(
          `title.ilike.${term},short_description.ilike.${term},image_prompt.ilike.${term},video_prompt.ilike.${term},tool_name.ilike.${term}`,
        );
      }
      q =
        filters.sort === "popular"
          ? q.order("views", { ascending: false })
          : q.order("created_at", { ascending: false });
      if (filters.limit) q = q.limit(filters.limit);
      return unwrap<Prompt[]>(
        q as unknown as PromiseLike<{ data: Prompt[] | null; error: { message: string } | null }>,
      );
    },
  });

export const promptQuery = (slug: string) =>
  queryOptions({
    queryKey: ["prompt", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prompts")
        .select(PROMPT_FIELDS)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return null;
      const prompt = data as Prompt;
      const [steps, tools] = await Promise.all([
        supabase
          .from("prompt_steps")
          .select("*")
          .eq("prompt_id", prompt.id)
          .order("step_number"),
        supabase.from("prompt_tools").select("*").eq("prompt_id", prompt.id),
      ]);
      return {
        prompt,
        steps: (steps.data ?? []) as {
          id: string;
          step_number: number;
          title: string | null;
          description: string | null;
          image_url: string | null;
          video_url: string | null;
        }[],
        tools: (tools.data ?? []) as { id: string; tool_name: string; tool_url: string | null }[],
      };
    },
  });

type PostFilters = {
  contentType?: string | undefined;
  categoryId?: string | undefined;
  featured?: boolean | undefined;
  sort?: ("latest" | "popular") | undefined;
  limit?: number | undefined;
  search?: string | undefined;
};

export const postsQuery = (filters: PostFilters = {}) =>
  queryOptions({
    queryKey: ["posts", filters],
    queryFn: async () => {
      let q = supabase.from("posts").select(POST_FIELDS).eq("status", "published");
      if (filters.contentType) q = q.eq("content_type", filters.contentType);
      if (filters.categoryId) q = q.eq("category_id", filters.categoryId);
      if (filters.featured) q = q.eq("featured", true);
      if (filters.search) {
        const term = `%${filters.search}%`;
        q = q.or(`title.ilike.${term},excerpt.ilike.${term},content.ilike.${term}`);
      }
      q =
        filters.sort === "popular"
          ? q.order("views", { ascending: false })
          : q.order("published_at", { ascending: false, nullsFirst: false });
      if (filters.limit) q = q.limit(filters.limit);
      return unwrap<Post[]>(q);
    },
  });

export const postQuery = (slug: string) =>
  queryOptions({
    queryKey: ["post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(POST_FIELDS)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as Post | null;
    },
  });

export const providersQuery = () =>
  queryOptions({
    queryKey: ["ai_providers"],
    queryFn: () =>
      unwrap<
        { id: string; name: string; slug: string; model: string | null; enabled: boolean; description: string | null }[]
      >(supabase.from("ai_providers").select("*").order("created_at")),
  });

export async function bumpPromptCopyCount(id: string, current: number) {
  await supabase.from("prompts").update({ copy_count: current + 1 }).eq("id", id);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
