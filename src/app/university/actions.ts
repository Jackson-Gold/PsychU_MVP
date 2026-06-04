"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRoles } from "@/lib/auth";
import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type InviteActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["student", "university_staff", "university_admin"]),
  organization_id: z.string().uuid(),
  note: z.string().max(500).optional()
});

const INVITE_TTL_DAYS = 14;

export async function createInvite(
  _previousState: InviteActionState,
  formData: FormData
): Promise<InviteActionState> {
  const context = await requireRoles(["university_admin", "psychu_admin"]);
  const input = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
    organization_id: formData.get("organization_id"),
    note: formData.get("note") ?? undefined
  });

  if (!input.success) {
    return { status: "error", message: "Enter a valid email address and role for the invite." };
  }

  const isOrgAdmin = context.memberships.some(
    (membership) =>
      membership.organizationId === input.data.organization_id && membership.role === "university_admin"
  );
  const isPsychuAdmin = context.roles.includes("psychu_admin");

  if (!isOrgAdmin && !isPsychuAdmin) {
    return { status: "error", message: "You do not have permission to invite people to this organization." };
  }

  const supabase = await createSupabaseServerClient();
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: invite, error } = await supabase
    .from("invites")
    .insert({
      email: input.data.email,
      organization_id: input.data.organization_id,
      invited_by_user_id: context.user.id,
      role: input.data.role,
      status: "pending",
      expires_at: expiresAt
    })
    .select("id")
    .maybeSingle();

  if (error || !invite) {
    return { status: "error", message: `The invite could not be created. ${error?.message ?? ""}` };
  }

  await supabase.from("audit_logs").insert({
    actor_user_id: context.user.id,
    organization_id: input.data.organization_id,
    action: "invite.created",
    target_type: "invite",
    target_id: invite.id,
    metadata: { email: input.data.email, role: input.data.role, note: input.data.note ?? null }
  });

  let emailMessage = " Email delivery is disabled until a service-role key is configured.";
  const adminClient = createSupabaseAdminClient();
  if (adminClient) {
    const { error: emailError } = await adminClient.auth.admin.inviteUserByEmail(input.data.email, {
      redirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback`
    });
    emailMessage = emailError
      ? ` Invite recorded, but the email could not be sent: ${emailError.message}`
      : " A magic-link invitation email has been sent.";
  }

  revalidatePath("/university/invites");

  return {
    status: "success",
    message: `Invite for ${input.data.email} created.${emailMessage}`
  };
}
