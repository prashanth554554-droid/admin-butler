const GATEWAY = "https://ai.gateway.lovable.dev/v1/videos";

export type ProviderJob = {
  jobId: string | null;
  status: "queued" | "processing" | "completed" | "failed";
  videoUrl: string | null;
  error: string | null;
};

type Adapter = {
  start(input: StartInput, apiKey: string): Promise<ProviderJob>;
  status(jobId: string, apiKey: string): Promise<ProviderJob>;
};

export type StartInput = {
  prompt: string;
  model: string;
  aspectRatio: string;
  duration: number;
  imageUrl?: string | null;
};

function pickUrl(payload: Record<string, unknown>): string | null {
  const candidates = [
    payload["video_url"],
    payload["url"],
    (payload["video"] as Record<string, unknown> | undefined)?.["url"],
    (payload["output"] as Record<string, unknown> | undefined)?.["url"],
    Array.isArray(payload["data"])
      ? ((payload["data"] as Record<string, unknown>[])[0]?.["url"] as unknown)
      : undefined,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.length > 0) return candidate;
  }
  return null;
}

function normaliseStatus(raw: unknown, videoUrl: string | null): ProviderJob["status"] {
  const value = typeof raw === "string" ? raw.toLowerCase() : "";
  if (["succeeded", "completed", "complete", "done", "ready"].includes(value)) return "completed";
  if (["failed", "error", "cancelled", "canceled"].includes(value)) return "failed";
  if (["queued", "pending", "created", "submitted"].includes(value)) return "queued";
  if (value) return "processing";
  return videoUrl ? "completed" : "processing";
}

/** Lovable AI Gateway (Google Veo family) adapter. */
const lovableVeo: Adapter = {
  async start(input, apiKey) {
    const res = await fetch(GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: input.model,
        prompt: input.prompt,
        aspect_ratio: input.aspectRatio,
        duration_seconds: input.duration,
        ...(input.imageUrl ? { image_url: input.imageUrl } : {}),
      }),
    });
    const text = await res.text();
    if (!res.ok) {
      return {
        jobId: null,
        status: "failed",
        videoUrl: null,
        error:
          res.status === 429
            ? "Rate limit reached. Please try again in a moment."
            : res.status === 402
              ? "AI credits exhausted for this workspace."
              : `Provider error (${res.status}): ${text.slice(0, 200)}`,
      };
    }
    const payload = JSON.parse(text || "{}") as Record<string, unknown>;
    const videoUrl = pickUrl(payload);
    return {
      jobId: (payload["id"] as string) ?? null,
      status: normaliseStatus(payload["status"], videoUrl),
      videoUrl,
      error: null,
    };
  },

  async status(jobId, apiKey) {
    const res = await fetch(`${GATEWAY}/${encodeURIComponent(jobId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const text = await res.text();
    if (!res.ok) {
      return {
        jobId,
        status: "processing",
        videoUrl: null,
        error: `Status check failed (${res.status})`,
      };
    }
    const payload = JSON.parse(text || "{}") as Record<string, unknown>;
    const videoUrl = pickUrl(payload);
    const errorField = payload["error"];
    return {
      jobId,
      status: normaliseStatus(payload["status"], videoUrl),
      videoUrl,
      error:
        typeof errorField === "string"
          ? errorField
          : errorField && typeof errorField === "object"
            ? String((errorField as Record<string, unknown>)["message"] ?? "")
            : null,
    };
  },
};

/** Registry — add new providers here without touching the frontend. */
export const adapters: Record<string, Adapter> = {
  "veo-lite": lovableVeo,
  "veo-fast": lovableVeo,
  veo: lovableVeo,
};

export function getApiKey(providerSlug: string): string | null {
  if (providerSlug.startsWith("veo")) return process.env["LOVABLE_API_KEY"] ?? null;
  return null;
}
