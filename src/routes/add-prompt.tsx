import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import {
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/site/cards";
import { categoriesQuery, slugify } from "@/lib/content";
import { uploadOwnInput } from "@/lib/storage";
import { enforceStorageBudget as runStorageCleanup } from "@/lib/storage-cleanup.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/add-prompt")({
  validateSearch: z.object({ prompt: z.string().optional(), edit: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Add a Prompt — Save AI Image & Video Prompts | Prompt Studio AI" },
      {
        name: "description",
        content:
          "Add a title, description, category, media and as many prompt blocks and tool links as you need, then publish it to the library.",
      },
      { property: "og:title", content: "Add a Prompt — Prompt Studio AI" },
      {
        property: "og:description",
        content: "Publish AI image and video prompts with media, negative prompts and tool links.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AddPrompt,
});

type ToolLink = { label: string; url: string };

function AddPrompt() {
  const { prompt: initialPrompt, edit: editSlug } = Route.useSearch();
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { data: categories = [] } = useQuery(categoriesQuery());

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [kind, setKind] = useState<"image" | "video">("image");
  const [mediaUrl, setMediaUrl] = useState("");
  const [blocks, setBlocks] = useState<string[]>([initialPrompt ?? ""]);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [toolLinks, setToolLinks] = useState<ToolLink[]>([{ label: "", url: "" }]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(Boolean(editSlug));

  // Edit mode: load the existing prompt and prefill every field.
  useEffect(() => {
    if (!editSlug) return;
    let active = true;
    void (async () => {
      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .eq("slug", editSlug)
        .maybeSingle();
      if (!active) return;
      if (error || !data) {
        toast.error(error?.message ?? "Prompt not found");
        setLoadingExisting(false);
        return;
      }
      const savedBlocks = (data.prompt_blocks as string[] | null) ?? [];
      const savedTools = (data.tool_links as ToolLink[] | null) ?? [];
      setEditingId(data.id);
      setTitle(data.title);
      setShortDescription(data.short_description ?? "");
      setCategoryId(data.category_id ?? "");
      setKind(data.is_video ? "video" : "image");
      setMediaUrl(data.example_video_url || data.featured_image_url || "");
      setBlocks(
        savedBlocks.length
          ? savedBlocks
          : [data.video_prompt || data.image_prompt || ""],
      );
      setNegativePrompt(data.negative_prompt ?? "");
      setToolLinks(savedTools.length ? savedTools : [{ label: "", url: "" }]);
      setLoadingExisting(false);
    })();
    return () => {
      active = false;
    };
  }, [editSlug]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", search: { redirect: "/add-prompt" } });
      return;
    }
    if (!isAdmin) {
      toast.error("Only the admin account can add or edit prompts");
      navigate({ to: "/" });
    }
  }, [loading, user, isAdmin, navigate]);

  const setBlock = (index: number, value: string) =>
    setBlocks((prev) => prev.map((item, i) => (i === index ? value : item)));

  const setTool = (index: number, patch: Partial<ToolLink>) =>
    setToolLinks((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadOwnInput(file);
      setMediaUrl(url);
      toast.success("Upload complete");
      // Keep storage under its budget by trimming the oldest files automatically.
      void runStorageCleanup({}).catch(() => undefined);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      toast.error("Add a prompt title");
      return;
    }
    const cleanBlocks = blocks.map((b) => b.trim()).filter(Boolean);
    if (!cleanBlocks.length) {
      toast.error("Write at least one prompt");
      return;
    }
    const cleanTools = toolLinks
      .map((t) => ({ label: t.label.trim(), url: t.url.trim() }))
      .filter((t) => t.label || t.url);

    const isVideo = kind === "video";
    const media = mediaUrl.trim();
    const joined = cleanBlocks.join("\n\n");

    setBusy(true);
    try {
      const slug = editingId ? editSlug! : `${slugify(title)}-${crypto.randomUUID().slice(0, 6)}`;
      const payload = {
        title: title.trim(),
        slug,
        short_description: shortDescription.trim() || null,
        category_id: categoryId || null,
        prompt_type: isVideo ? "ai_video" : "ai_image",
        is_video: isVideo,
        is_image: !isVideo,
        prompt_blocks: cleanBlocks,
        tool_links: cleanTools,
        tool_name: cleanTools[0]?.label ?? null,
        negative_prompt: negativePrompt.trim() || null,
        image_prompts: isVideo ? [] : cleanBlocks.map((p) => ({ prompt: p, image_url: media })),
        video_prompts: isVideo ? cleanBlocks.map((p) => ({ prompt: p, video_url: media })) : [],
        image_prompt: isVideo ? null : joined,
        video_prompt: isVideo ? joined : null,
        featured_image_url: isVideo ? null : media || null,
        example_video_url: isVideo ? media || null : null,
        status: "published",
        author_id: user!.id,
      };
      const { error } = editingId
        ? await supabase.from("prompts").update(payload).eq("id", editingId)
        : await supabase.from("prompts").insert(payload);
      if (error) throw new Error(error.message);
      toast.success(editingId ? "Prompt updated" : "Prompt published");
      navigate({ to: "/prompt/$slug", params: { slug } });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={editSlug ? "Edit prompt" : "Add prompt"}
        title={editSlug ? "Edit prompt" : "Add a prompt"}
        description={
          editSlug
            ? "Update the details, prompts, media and tool links, then save your changes."
            : "Fill in the details, add as many prompts and tool links as you need, then publish."
        }
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <form
          onSubmit={submit}
          className="space-y-7 rounded-3xl border border-border bg-card p-5 sm:p-7"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Prompt title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={140}
              placeholder="Enter prompt title"
              className="h-11 bg-surface"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="short-description">Short description (optional)</Label>
            <Input
              id="short-description"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              maxLength={200}
              placeholder="What this prompt produces"
              className="h-11 bg-surface"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category (optional)</Label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium">Prompt type</legend>
            <div className="flex flex-wrap gap-3">
              {(
                [
                  { value: "image", label: "Image prompt", Icon: ImageIcon },
                  { value: "video", label: "Video prompt", Icon: Video },
                ] as const
              ).map(({ value, label, Icon }) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                    kind === value
                      ? "border-brand bg-surface-2 text-foreground"
                      : "border-border bg-surface text-muted-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="prompt-kind"
                    className="accent-[var(--brand)]"
                    checked={kind === value}
                    onChange={() => setKind(value)}
                  />
                  <Icon className="size-4" />
                  {label}
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              This decides whether the prompt shows up under AI Image Prompts, AI Video Prompts.
            </p>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="media-url">
              {kind === "video" ? "Video" : "Image"} — upload or paste any link
            </Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="media-url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://... (image or video link)"
                className="h-11 bg-surface"
              />
              <input
                id="media-file"
                type="file"
                accept={kind === "video" ? "video/*" : "image/*"}
                className="hidden"
                onChange={(e) => void upload(e.target.files?.[0])}
              />
              <Button
                type="button"
                variant="secondary"
                className="shrink-0"
                disabled={uploading}
                onClick={() => document.getElementById("media-file")?.click()}
              >
                {uploading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 size-4" />
                )}
                Upload
              </Button>
            </div>
            {mediaUrl && kind === "image" ? (
              <img
                src={mediaUrl}
                alt="Preview of the media attached to this prompt"
                loading="lazy"
                className="mt-2 max-h-52 rounded-xl border border-border object-cover"
              />
            ) : null}
          </div>

          <section className="space-y-3">
            <h2 className="text-sm font-medium">Prompts</h2>
            {blocks.map((block, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Prompt {index + 1}
                  </span>
                  {blocks.length > 1 ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Remove prompt ${index + 1}`}
                      onClick={() => setBlocks((prev) => prev.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                </div>
                <Textarea
                  rows={5}
                  value={block}
                  onChange={(e) => setBlock(index, e.target.value)}
                  placeholder="Describe the shot, subject, lighting, lens, mood…"
                  aria-label={`Prompt ${index + 1}`}
                  className="bg-surface"
                />
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setBlocks((prev) => [...prev, ""])}
            >
              <Plus className="mr-1.5 size-4" /> Add prompt {blocks.length + 1}
            </Button>
          </section>

          <div className="space-y-2">
            <Label htmlFor="negative">Negative prompt (optional)</Label>
            <Textarea
              id="negative"
              rows={3}
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="text overlays, watermark, extra fingers"
              className="bg-surface"
            />
          </div>

          <section className="space-y-3">
            <h2 className="text-sm font-medium">Tool links</h2>
            {toolLinks.map((tool, index) => (
              <div key={index} className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={tool.label}
                  onChange={(e) => setTool(index, { label: e.target.value })}
                  placeholder="Google Flow"
                  aria-label={`Tool ${index + 1} name`}
                  className="h-11 bg-surface sm:max-w-[40%]"
                />
                <Input
                  value={tool.url}
                  onChange={(e) => setTool(index, { url: e.target.value })}
                  placeholder="https://labs.google/fx/tools/flow"
                  aria-label={`Tool ${index + 1} link`}
                  className="h-11 bg-surface"
                />
                {tool.url ? (
                  <Button asChild type="button" size="icon" variant="secondary" className="shrink-0">
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${tool.label || "tool link"}`}
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                ) : null}
                {toolLinks.length > 1 ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="shrink-0"
                    aria-label={`Remove tool link ${index + 1}`}
                    onClick={() => setToolLinks((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setToolLinks((prev) => [...prev, { label: "", url: "" }])}
            >
              <Plus className="mr-1.5 size-4" /> Add tool link
            </Button>
          </section>

          <Button
            type="submit"
            size="lg"
            disabled={busy || loadingExisting}
            className="w-full bg-gradient-brand text-brand-foreground"
          >
            {busy || loadingExisting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {editSlug ? "Update prompt" : "Publish prompt"}
          </Button>
        </form>
      </div>
    </>
  );
}
