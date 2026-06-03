"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { landingPageForRoles } from "@/lib/auth";
import type { Role } from "@/lib/domain";
import { env, isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const emailSchema = z.string().email();

export type MagicLinkState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type PasswordLoginState = MagicLinkState;

const passwordLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function signInWithPassword(
  _previousState: PasswordLoginState,
  formData: FormData
): Promise<PasswordLoginState> {
  const credentials = passwordLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!credentials.success) {
    return {
      status: "error",
      message: "Enter a valid email address and password."
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message: "Supabase is not configured, so password sign-in is unavailable."
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(credentials.data);

  if (error) {
    return {
      status: "error",
      message: "Sign-in failed. Check the credentials or confirm that the demo seed has been applied."
    };
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("memberships")
    .select("role");

  if (membershipError || !memberships?.length) {
    await supabase.auth.signOut();
    return {
      status: "error",
      message: "This account does not have a PsychU role. Contact an administrator."
    };
  }

  redirect(landingPageForRoles(memberships.map((membership) => membership.role as Role)));
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect("/auth");
}

export async function sendMagicLink(
  _previousState: MagicLinkState,
  formData: FormData
): Promise<MagicLinkState> {
  const email = emailSchema.safeParse(formData.get("email"));
  if (!email.success) {
    return {
      status: "error",
      message: "Enter a valid university or PsychU email address."
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "success",
      message: "Demo mode: magic link would be sent after Supabase is configured."
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: {
      emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback`
    }
  });

  if (error) {
    return {
      status: "error",
      message: "We could not send a magic link. Check the invite status or contact PsychU support."
    };
  }

  return {
    status: "success",
    message: "Check your email for a secure PsychU sign-in link."
  };
}
