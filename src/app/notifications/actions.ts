"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthContext } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const markReadSchema = z.object({ notification_id: z.string().uuid() });

export async function markNotificationRead(formData: FormData): Promise<void> {
  const context = await getAuthContext();
  if (!context) return;

  const input = markReadSchema.safeParse({ notification_id: formData.get("notification_id") });
  if (!input.success) return;

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", input.data.notification_id)
    .eq("user_id", context.user.id)
    .is("read_at", null);

  revalidatePath("/notifications");
}

export async function markAllNotificationsRead(): Promise<void> {
  const context = await getAuthContext();
  if (!context) return;

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", context.user.id)
    .is("read_at", null);

  revalidatePath("/notifications");
}
