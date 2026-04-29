import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  AI_TRIAGE_PROVIDER: z.enum(["mock", "openai", "azure_openai"]).default("mock"),
  AI_TRIAGE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  PSYCHU_SUPPORT_EMAIL: z.string().email().default("support@psychu.test"),
  PSYCHU_SECURITY_EMAIL: z.string().email().default("security@psychu.test")
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  AI_TRIAGE_PROVIDER: process.env.AI_TRIAGE_PROVIDER,
  AI_TRIAGE_API_KEY: process.env.AI_TRIAGE_API_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  PSYCHU_SUPPORT_EMAIL: process.env.PSYCHU_SUPPORT_EMAIL,
  PSYCHU_SECURITY_EMAIL: process.env.PSYCHU_SECURITY_EMAIL
});

export function isSupabaseConfigured(): boolean {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
