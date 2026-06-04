import type { createSupabaseServerClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export const CASE_DOCUMENTS_BUCKET = "case-documents";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

/**
 * Returns a map of storage path -> short-lived signed download URL for case
 * documents the current user is allowed to read. Paths that cannot be signed
 * (missing object, no access) are simply omitted.
 */
export async function createDocumentSignedUrls(
  supabase: SupabaseServerClient,
  paths: string[]
): Promise<Map<string, string>> {
  const urls = new Map<string, string>();
  const uniquePaths = [...new Set(paths.filter(Boolean))];
  if (!uniquePaths.length) return urls;

  const { data, error } = await supabase.storage
    .from(CASE_DOCUMENTS_BUCKET)
    .createSignedUrls(uniquePaths, SIGNED_URL_TTL_SECONDS);

  if (error || !data) return urls;

  for (const item of data) {
    if (item.path && item.signedUrl) {
      urls.set(item.path, item.signedUrl);
    }
  }

  return urls;
}
