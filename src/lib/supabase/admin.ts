import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Service-role Supabase client for privileged server-only operations such as
 * emailing invites. Returns null when the service-role key is not configured,
 * so callers can degrade gracefully (e.g. record the invite without emailing).
 */
export function createSupabaseAdminClient() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export function isServiceRoleConfigured(): boolean {
  return Boolean(env.SUPABASE_SERVICE_ROLE_KEY);
}
