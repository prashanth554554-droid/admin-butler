import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const startSchema = z.object({
  generationId: z.string().uuid(),
});

const statusSchema = z.object({
  generationId: z.string().uuid(),
});

export const startVideoGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => startSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { adapters, getApiKey } = await import("./video.server");
    const supabase = context.supabase;

    const { data: generation, error } = await supabase
      .from("video_generations")
      .select("*")
      .eq("id", data.generationId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!generation) throw new Error("Generation not found");

    const { data: provider } = await supabase
      .from("ai_providers")
      .select("*")
      .eq("slug", generation.provider)
      .maybeSingle();

    const adapter = adapters[generation.provider];
    const apiKey = getApiKey(generation.provider);

    if (!provider?.enabled || !adapter || !apiKey) {
      await supabase
        .from("video_generations")
        .update({ status: "failed", error_message: "This provider is not connected yet." })
        .eq("id", generation.id);
      return { status: "failed" as const, error: "This provider is not connected yet." };
    }

    const job = await adapter.start(
      {
        prompt: generation.prompt,
        model: generation.model ?? provider.model ?? "google/veo-3.1-lite",
        aspectRatio: generation.aspect_ratio ?? "16:9",
        duration: generation.duration ?? 5,
        imageUrl: generation.input_image_url,
      },
      apiKey,
    );

    await supabase
      .from("video_generations")
      .update({
        status: job.status === "queued" ? "processing" : job.status,
        provider_job_id: job.jobId,
        generated_video_url: job.videoUrl,
        error_message: job.error,
      })
      .eq("id", generation.id);

    return { status: job.status, error: job.error, videoUrl: job.videoUrl };
  });

export const checkVideoStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => statusSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { adapters, getApiKey } = await import("./video.server");
    const supabase = context.supabase;

    const { data: generation } = await supabase
      .from("video_generations")
      .select("*")
      .eq("id", data.generationId)
      .maybeSingle();
    if (!generation) throw new Error("Generation not found");
    if (generation.status === "completed" || generation.status === "failed") {
      return {
        status: generation.status,
        videoUrl: generation.generated_video_url,
        error: generation.error_message,
      };
    }
    if (!generation.provider_job_id) {
      return { status: generation.status, videoUrl: null, error: generation.error_message };
    }

    const adapter = adapters[generation.provider];
    const apiKey = getApiKey(generation.provider);
    if (!adapter || !apiKey) {
      return { status: generation.status, videoUrl: null, error: "Provider not connected" };
    }

    const job = await adapter.status(generation.provider_job_id, apiKey);
    await supabase
      .from("video_generations")
      .update({
        status: job.status,
        generated_video_url: job.videoUrl ?? generation.generated_video_url,
        error_message: job.error,
      })
      .eq("id", generation.id);

    return { status: job.status, videoUrl: job.videoUrl, error: job.error };
  });

/** Grants admin to the caller only while no admin exists yet (first-run setup). */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) {
      return { granted: false, reason: "An admin already exists for this site." };
    }
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) return { granted: false, reason: error.message };
    return { granted: true, reason: null };
  });
