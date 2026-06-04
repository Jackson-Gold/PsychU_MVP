import type { createSupabaseServerClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export type ConsentRecord = {
  id: string;
  key: string;
  title: string;
  version: string;
  body: string;
};

/**
 * Returns the required consent versions a student has not yet accepted. An
 * empty array means the student has accepted everything currently required.
 */
export async function getPendingConsents(
  supabase: SupabaseServerClient,
  userId: string
): Promise<ConsentRecord[]> {
  const [{ data: requiredRows }, { data: acceptedRows }] = await Promise.all([
    supabase.from("consent_versions").select("id, key, title, version, body").eq("required", true),
    supabase.from("student_consents").select("consent_version_id").eq("user_id", userId)
  ]);

  const acceptedIds = new Set((acceptedRows ?? []).map((row) => String(row.consent_version_id)));

  return (requiredRows ?? [])
    .map((row) => ({
      id: String(row.id),
      key: String(row.key),
      title: String(row.title),
      version: String(row.version),
      body: String(row.body)
    }))
    .filter((consent) => !acceptedIds.has(consent.id));
}
