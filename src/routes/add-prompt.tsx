import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Image as ImageIcon, Loader2, Plus, Trash2, Upload, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/site/cards";
import { slugify } from "@/lib/content";
import { uploadOwnInput } from "@/lib/storage";
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
          "Add a prompt title, then save as many image prompts and video prompts as you need, each with its own related image or video link.",
      },
      { property: "og:title", content: "Add a Prompt — Prompt Studio AI" },
      {
        property: "og:description",
        content: "Save multiple AI image prompts and video prompts, each with related media.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AddPrompt,
});

type ImageEntry = { prompt: string; image_url: string };
type VideoEntry = { prompt: string; video_url: string };

function AddPrompt() {
  const { prompt: initialPrompt, edit: editSlug } = Route.useSearch();
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [isImage, setIsImage] = useState(true);
  const [isVideo, setIsVideo] = useState(false);
  const [imageEntries, setImageEntries] = useState<ImageEntry[]>([
    { prompt: initialPrompt ?? "", image_url: "" },
  ]);
  const [videoEntries, setVideoEntries] = useState<VideoEntry[]>([{ prompt: "", video_url: "" }]);
  const [busy, setBusy] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(Boolean(editSlug));

  // Edit mode: load the existing prompt and prefill the form.
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
      const images = (data.image_prompts as ImageEntry[] | null) ?? [];
      const videos = (data.video_prompts as VideoEntry[] | null) ?? [];
      setEditingId(data.id);
      setTitle(data.title);
      setIsImage(data.is_image || images.length > 0);
      setIsVideo(data.is_video || videos.length > 0);
      setImageEntries(
        images.length
          ? images
          : [{ prompt: data.image_prompt ?? "", image_url: data.featured_image_url ?? "" }],
      );
      setVideoEntries(
        videos.length ? videos : [{ prompt: data.video_prompt ?? "", video_url: "" }],
      );
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

  const setImageEntry = (index: number, patch: Partial<ImageEntry>) =>
    setImageEntries((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const setVideoEntry = (index: number, patch: Partial<VideoEntry>) =>
    setVideoEntries((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const upload = async (index: number, file: File | undefined) => {
    if (!file) return;
    setUploadingIndex(index);
    try {
      const url = await uploadOwnInput(file);
      setImageEntry(index, { image_url: url });
      toast.success("Image uploaded");
      // Keep storage under its budget by trimming the oldest files automatically.
      void runStorageCleanup({}).catch(() => undefined);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploadingIndex(null);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      toast.error("Add a prompt title");
      return;
    }
    if (!isImage && !isVideo) {
      toast.error("Select Image Prompt, Video Prompt, or both");
      return;
    }

    const cleanImages = isImage
      ? imageEntries
          .map((e) => ({ prompt: e.prompt.trim(), image_url: e.image_url.trim() }))
          .filter((e) => e.prompt || e.image_url)
      : [];
    const cleanVideos = isVideo
      ? videoEntries
          .map((e) => ({ prompt: e.prompt.trim(), video_url: e.video_url.trim() }))
          .filter((e) => e.prompt || e.video_url)
      : [];

    if (!cleanImages.length && !cleanVideos.length) {
      toast.error("Write at least one prompt");
      return;
    }

    setBusy(true);
    try {
      const slug = editingId
        ? editSlug!
        : `${slugify(title)}-${crypto.randomUUID().slice(0, 6)}`;
      const payload = {
        title: title.trim(),
        slug,
        prompt_type: isVideo ? "ai_video" : "ai_image",
        is_video: isVideo,
        is_image: isImage,
        image_prompts: cleanImages,
        video_prompts: cleanVideos,
        image_prompt: cleanImages.map((e) => e.prompt).filter(Boolean).join("\n\n") || null,
        video_prompt: cleanVideos.map((e) => e.prompt).filter(Boolean).join("\n\n") || null,
        featured_image_url: cleanImages.find((e) => e.image_url)?.image_url ?? null,
        status: "published",
        author_id: user!.id,
      };
      const { error } = editingId
        ? await supabase.from("prompts").update(payload).eq("id", editingId)
        : await supabase.from("prompts").insert(payload);
      if (error) throw new Error(error.message);
      toast.success(editingId ? "Prompt updated" : "Prompt saved");
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
            ? "Update the title, prompts and related media, then save your changes."
            : "Give your prompt a title, then add as many image prompts and video prompts as you need."
        }
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <form onSubmit={submit} className="space-y-8 rounded-3xl border border-border bg-card p-5 sm:p-7">
          <div className="space-y-2">
            <Label htmlFor="title">Prompt Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter prompt title"
              className="bg-surface"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm">
              <Checkbox
                checked={isImage}
                onCheckedChange={(v) => setIsImage(v === true)}
                aria-label="Image Prompt"
              />
              <ImageIcon className="size-4 text-muted-foreground" /> Image Prompt
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm">
              <Checkbox
                checked={isVideo}
                onCheckedChange={(v) => setIsVideo(v === true)}
                aria-label="Video Prompt"
              />
              <Video className="size-4 text-muted-foreground" /> Video Prompt
            </label>
          </div>

          {isImage ? (
            <section className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Image prompts
              </h2>
              {imageEntries.map((entry, index) => (
                <div key={index} className="space-y-3 rounded-2xl border border-border bg-surface/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Image Prompt #{index + 1}</span>
                    {imageEntries.length > 1 ? (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Remove image prompt ${index + 1}`}
                        onClick={() => setImageEntries((prev) => prev.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                  <Textarea
                    rows={5}
                    value={entry.prompt}
                    onChange={(e) => setImageEntry(index, { prompt: e.target.value })}
                    placeholder="Describe the image: subject, lighting, lens, mood..."
                    aria-label={`Image prompt ${index + 1}`}
                    className="bg-surface"
                  />
                  <div className="space-y-2">
                    <Label htmlFor={`image-url-${index}`}>Related Image</Label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Input
                        id={`image-url-${index}`}
                        value={entry.image_url}
                        onChange={(e) => setImageEntry(index, { image_url: e.target.value })}
                        placeholder="Image URL"
                        className="bg-surface"
                      />
                      <input
                        id={`image-file-${index}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => void upload(index, e.target.files?.[0])}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        className="shrink-0"
                        disabled={uploadingIndex === index}
                        onClick={() => document.getElementById(`image-file-${index}`)?.click()}
                      >
                        {uploadingIndex === index ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <Upload className="mr-2 size-4" />
                        )}
                        Upload Image
                      </Button>
                    </div>
                    {entry.image_url ? (
                      <img
                        src={entry.image_url}
                        alt={`Related image for image prompt ${index + 1}`}
                        loading="lazy"
                        className="mt-2 max-h-48 rounded-xl border border-border object-cover"
                      />
                    ) : null}
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setImageEntries((prev) => [...prev, { prompt: "", image_url: "" }])}
              >
                <Plus className="mr-1.5 size-4" /> Add Another Image Prompt
              </Button>
            </section>
          ) : null}

          {isVideo ? (
            <section className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Video prompts
              </h2>
              {videoEntries.map((entry, index) => (
                <div key={index} className="space-y-3 rounded-2xl border border-border bg-surface/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Video Prompt #{index + 1}</span>
                    {videoEntries.length > 1 ? (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Remove video prompt ${index + 1}`}
                        onClick={() => setVideoEntries((prev) => prev.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                  <Textarea
                    rows={5}
                    value={entry.prompt}
                    onChange={(e) => setVideoEntry(index, { prompt: e.target.value })}
                    placeholder="Describe the shot, motion, camera, pacing..."
                    aria-label={`Video prompt ${index + 1}`}
                    className="bg-surface"
                  />
                  <div className="space-y-2">
                    <Label htmlFor={`video-url-${index}`}>Related Video</Label>
                    <Input
                      id={`video-url-${index}`}
                      value={entry.video_url}
                      onChange={(e) => setVideoEntry(index, { video_url: e.target.value })}
                      placeholder="Video URL"
                      className="bg-surface"
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setVideoEntries((prev) => [...prev, { prompt: "", video_url: "" }])}
              >
                <Plus className="mr-1.5 size-4" /> Add Another Video Prompt
              </Button>
            </section>
          ) : null}

          <Button type="submit" size="lg" disabled={busy || loadingExisting} className="w-full bg-gradient-brand text-brand-foreground">
            {busy || loadingExisting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {editSlug ? "Update Prompt" : "Save Prompt"}
          </Button>
        </form>
      </div>
    </>
  );
}
