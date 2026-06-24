import { cache } from "react";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import type { Membership, Role, User } from "@/lib/domain";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthContext = {
  user: User;
  memberships: Membership[];
  roles: Role[];
};

export const getAuthContext = cache(async (): Promise<AuthContext | null> => {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: memberships }, { data: profile }] = await Promise.all([
    supabase
      .from("memberships")
      .select("id,user_id,organization_id,role,created_at")
      .eq("user_id", user.id),
    supabase
      .from("user_profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle()
  ]);

  const mappedMemberships: Membership[] = (memberships ?? []).map((membership) => ({
    id: membership.id,
    userId: membership.user_id,
    organizationId: membership.organization_id,
    role: membership.role as Role,
    createdAt: membership.created_at
  }));

  return {
    user: {
      id: user.id,
      email: user.email ?? "",
      fullName:
        profile?.full_name ||
        String(user.user_metadata?.full_name ?? "") ||
        user.email?.split("@")[0] ||
        "Synaptec user",
      createdAt: user.created_at
    },
    memberships: mappedMemberships,
    roles: [...new Set(mappedMemberships.map((membership) => membership.role))]
  };
});

export async function requireRoles(allowedRoles: Role[]): Promise<AuthContext> {
  const context = await getAuthContext();

  if (!context) {
    redirect("/auth");
  }

  if (!context.roles.some((role) => allowedRoles.includes(role))) {
    redirect(landingPageForRoles(context.roles));
  }

  return context;
}

export function landingPageForRoles(roles: Role[]): string {
  if (roles.includes("psychu_admin")) return "/admin/forms";
  if (roles.includes("psychu_clinician")) return "/clinician/queue";
  if (roles.includes("student")) return "/student";
  if (roles.includes("university_admin")) return "/university/invites";
  if (roles.includes("university_staff")) return "/university/shared-packets";
  return "/";
}

