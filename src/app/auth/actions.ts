"use server";

import { z } from "zod";
import { env, isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const emailSchema = z.string().email();

export type MagicLinkState = {
  status: "idle" | "success" | "error";
  message: string;
};

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
