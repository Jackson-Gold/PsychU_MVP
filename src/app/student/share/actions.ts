"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRoles } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ShareActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const shareSchema = z.object({
  packet_id: z.string().uuid(),
  expires_in_days: z.coerce.number().int().min(0).max(365)
});

const revokeSchema = z.object({
  grant_id: z.string().uuid()
});

export async function shareWithUniversity(
  _previousState: ShareActionState,
  formData: FormData
): Promise<ShareActionState> {
  const context = await requireRoles(["student"]);
  const input = shareSchema.safeParse({
    packet_id: formData.get("packet_id"),
    expires_in_days: formData.get("expires_in_days") ?? "0"
  });

  if (!input.success) {
    return { status: "error", message: "We could not read the sharing request. Refresh and try again." };
  }

  const supabase = await createSupabaseServerClient();

  const { data: packet } = await supabase
    .from("triage_packets")
    .select("id, case_id")
    .eq("id", input.data.packet_id)
    .maybeSingle();

  if (!packet) {
    return { status: "error", message: "This reviewed packet is no longer available." };
  }

  const { data: caseRow } = await supabase
    .from("cases")
    .select("id, organization_id, student_user_id")
    .eq("id", packet.case_id)
    .maybeSingle();

  if (!caseRow || caseRow.student_user_id !== context.user.id) {
    return { status: "error", message: "You can only share packets from your own case." };
  }

  const { data: activeGrants } = await supabase
    .from("share_grants")
    .select("id")
    .eq("packet_id", packet.id)
    .eq("status", "active");

  if (activeGrants?.length) {
    return { status: "success", message: "This packet is already shared with your university accessibility office." };
  }

  const expiresAt =
    input.data.expires_in_days > 0
      ? new Date(Date.now() + input.data.expires_in_days * 24 * 60 * 60 * 1000).toISOString()
      : null;

  const { error } = await supabase.from("share_grants").insert({
    packet_id: packet.id,
    student_user_id: context.user.id,
    organization_id: caseRow.organization_id,
    recipient_user_id: null,
    status: "active",
    expires_at: expiresAt
  });

  if (error) {
    return { status: "error", message: `We could not share the packet. ${error.message}` };
  }

  revalidatePath("/student/share");
  revalidatePath("/student");
  revalidatePath("/university/shared-packets");

  return {
    status: "success",
    message: "Your reviewed packet is now shared with your university accessibility office."
  };
}

export async function revokeShare(
  _previousState: ShareActionState,
  formData: FormData
): Promise<ShareActionState> {
  const context = await requireRoles(["student"]);
  const input = revokeSchema.safeParse({ grant_id: formData.get("grant_id") });

  if (!input.success) {
    return { status: "error", message: "We could not read the revoke request. Refresh and try again." };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("share_grants")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("id", input.data.grant_id)
    .eq("student_user_id", context.user.id);

  if (error) {
    return { status: "error", message: `We could not revoke access. ${error.message}` };
  }

  revalidatePath("/student/share");
  revalidatePath("/student");
  revalidatePath("/university/shared-packets");

  return { status: "success", message: "University access to this packet has been revoked." };
}
