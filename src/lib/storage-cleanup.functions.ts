import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Buckets that participate in automatic cleanup. */
const BUCKETS = ["public-images", "videos", "uploads"] as const;

/** Soft budget per bucket (bytes). Cleanup starts when usage goes above this. */
const BUDGET_BYTES = 400 * 1024 * 1024; // 400 MB
/** Stop deleting once usage drops to this share of the budget. */
const TARGET_RATIO = 0.75;
/** Never let a bucket drop below this many files, so the site keeps content. */
const KEEP_MINIMUM = 25;

type StorageObject = { name: string; created_at: string; metadata: { size?: number } | null };

/**
 * Frees storage automatically: when a bucket goes over budget the oldest files
 * are removed (never all of them — the newest KEEP_MINIMUM always stay) until
 * usage is comfortably back under the limit. Admin only.
 */
export const enforceStorageBudget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("is_admin");
    if (!isAdmin) return { skipped: true as const, removed: 0, freedBytes: 0 };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let removed = 0;
    let freedBytes = 0;

    for (const bucket of BUCKETS) {
      const files: StorageObject[] = [];
      // Storage list is paginated; walk folders one level deep too.
      const collect = async (prefix: string) => {
        const { data } = await supabaseAdmin.storage
          .from(bucket)
          .list(prefix, { limit: 1000, sortBy: { column: "created_at", order: "asc" } });
        for (const entry of data ?? []) {
          const item = entry as unknown as StorageObject & { id: string | null };
          const path = prefix ? `${prefix}/${item.name}` : item.name;
          if (item.id === null) await collect(path);
          else files.push({ ...item, name: path });
        }
      };
      await collect("");

      const total = files.reduce((sum, f) => sum + (f.metadata?.size ?? 0), 0);
      if (total <= BUDGET_BYTES) continue;

      const oldestFirst = [...files].sort((a, b) => a.created_at.localeCompare(b.created_at));
      const doomed: string[] = [];
      let running = total;
      for (const file of oldestFirst) {
        if (running <= BUDGET_BYTES * TARGET_RATIO) break;
        if (files.length - doomed.length <= KEEP_MINIMUM) break;
        doomed.push(file.name);
        running -= file.metadata?.size ?? 0;
      }
      if (!doomed.length) continue;

      await supabaseAdmin.storage.from(bucket).remove(doomed);
      await supabaseAdmin
        .from("media")
        .delete()
        .in(
          "storage_path",
          doomed.map((path) => `${bucket}/${path}`),
        );

      removed += doomed.length;
      freedBytes += total - running;
    }

    return { skipped: false as const, removed, freedBytes };
  });
