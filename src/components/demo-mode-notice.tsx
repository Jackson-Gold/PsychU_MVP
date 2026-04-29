import { isSupabaseConfigured } from "@/lib/env";

export function DemoModeNotice() {
  if (isSupabaseConfigured()) return null;

  return (
    <aside className="notice-bar" aria-label="Demo mode notice">
      <strong>Demo mode:</strong> Supabase environment variables are not configured, so pages render seeded pilot
      data. Connect Supabase to enable real auth, storage, and RLS-backed persistence.
    </aside>
  );
}
