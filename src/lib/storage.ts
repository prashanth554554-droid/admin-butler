import { supabase } from "@/integrations/supabase/client";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export type Bucket = "public-images" | "videos" | "uploads";

/**
 * Uploads a file and returns a long-lived signed URL. Buckets are private, so
 * signed URLs are how media is exposed to the browser.
 */
export async function uploadFile(bucket: Bucket, file: File, prefix = ""): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${prefix ? `${prefix}/` : ""}${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data, error: signError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, TEN_YEARS);
  if (signError || !data) throw new Error(signError?.message ?? "Could not create file URL");

  const { data: user } = await supabase.auth.getUser();
  await supabase.from("media").insert({
    file_name: file.name,
    file_type: file.type,
    file_url: data.signedUrl,
    storage_path: `${bucket}/${path}`,
    uploaded_by: user.user?.id ?? null,
  });

  return data.signedUrl;
}

/** Uploads a generation input into the caller's own folder in `uploads`. */
export async function uploadOwnInput(file: File): Promise<string> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Sign in to upload files");
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${user.user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("uploads").upload(path, file);
  if (error) throw new Error(error.message);
  const { data, error: signError } = await supabase.storage
    .from("uploads")
    .createSignedUrl(path, TEN_YEARS);
  if (signError || !data) throw new Error(signError?.message ?? "Could not create file URL");
  return data.signedUrl;
}
