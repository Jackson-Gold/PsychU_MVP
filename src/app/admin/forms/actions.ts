"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assessmentCatalog } from "@/lib/assessment-catalog";
import { requireRoles } from "@/lib/auth";
import {
  caseStatuses,
  riskSeverities,
  roles,
  triageOutcomes
} from "@/lib/domain";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const uuidSchema = z.string().uuid();
const optionalUuidSchema = z.union([z.string().uuid(), z.literal("")]);

export async function syncAssessmentCatalog(): Promise<void> {
  const context = await requireRoles(["psychu_admin"]);
  const supabase = await createSupabaseServerClient();

  const payload = assessmentCatalog.map((module) => ({
    id: module.id,
    slug: module.slug,
    title: module.title,
    version: module.version,
    status: module.status,
    license_status: module.licenseStatus,
    domains: module.domains,
    description: module.description ?? "",
    attribution: module.attribution ?? "",
    estimated_minutes: module.estimatedMinutes ?? null,
    scoring_strategy: module.scoringStrategy,
    scoring_config: module.scoringConfig ?? {},
    questions: module.questions
  }));

  const { error } = await supabase
    .from("assessment_modules")
    .upsert(payload, { onConflict: "slug,version" });

  if (error) throw new Error(`Assessment catalog sync failed. ${error.message}`);

  const { error: retireError } = await supabase
    .from("assessment_modules")
    .update({ status: "retired" })
    .in("slug", [
      "attention-executive-function-custom",
      "mood-anxiety-safety-custom",
      "academic-history-documentation-custom"
    ]);

  if (retireError) throw new Error(`Legacy module retirement failed. ${retireError.message}`);

  await writeAuditLog(context.user.id, "assessment_catalog.synced", "assessment_module", null, {
    module_count: payload.length
  });

  revalidateAdminPaths();
}

export async function updateUserProfile(
  formData: FormData
): Promise<void> {
  const input = z
    .object({
      user_id: uuidSchema,
      full_name: z.string().min(1).max(200)
    })
    .safeParse(Object.fromEntries(formData));

  if (!input.success) return;

  await runAdminUpdate({
    action: "user_profile.updated",
    targetType: "user_profile",
    targetId: input.data.user_id,
    metadata: { full_name: input.data.full_name },
    update: async (supabase) =>
      supabase
        .from("user_profiles")
        .update({ full_name: input.data.full_name })
        .eq("user_id", input.data.user_id)
  });
}

export async function updateMembership(
  formData: FormData
): Promise<void> {
  const input = z
    .object({
      membership_id: uuidSchema,
      role: z.enum(roles)
    })
    .safeParse(Object.fromEntries(formData));

  if (!input.success) return;

  await runAdminUpdate({
    action: "membership.role_updated",
    targetType: "membership",
    targetId: input.data.membership_id,
    metadata: { role: input.data.role },
    update: async (supabase) =>
      supabase
        .from("memberships")
        .update({ role: input.data.role })
        .eq("id", input.data.membership_id)
  });
}

export async function updateCase(
  formData: FormData
): Promise<void> {
  const input = z
    .object({
      case_id: uuidSchema,
      status: z.enum(caseStatuses),
      assigned_clinician_user_id: optionalUuidSchema,
      current_summary: z.string().max(12000),
      next_step: z.string().max(4000)
    })
    .safeParse(Object.fromEntries(formData));

  if (!input.success) return;

  await runAdminUpdate({
    action: "case.admin_updated",
    targetType: "case",
    targetId: input.data.case_id,
    metadata: {
      status: input.data.status,
      assigned_clinician_user_id: input.data.assigned_clinician_user_id || null
    },
    update: async (supabase) =>
      supabase
        .from("cases")
        .update({
          status: input.data.status,
          assigned_clinician_user_id: input.data.assigned_clinician_user_id || null,
          current_summary: input.data.current_summary,
          next_step: input.data.next_step || null
        })
        .eq("id", input.data.case_id)
  });
}

export async function updateAssessmentModule(
  formData: FormData
): Promise<void> {
  const baseInput = z
    .object({
      module_id: uuidSchema,
      title: z.string().min(1).max(300),
      status: z.enum(["draft", "active", "retired"]),
      license_status: z.enum(["custom", "public_domain_verified", "licensed_pending", "licensed_verified"]),
      questions: z.string(),
      scoring_config: z.string()
    })
    .safeParse(Object.fromEntries(formData));

  if (!baseInput.success) return;

  const questions = parseJson(baseInput.data.questions);
  const scoringConfig = parseJson(baseInput.data.scoring_config);
  if (!questions.success || !Array.isArray(questions.value) || !scoringConfig.success) {
    throw new Error("Questions or scoring configuration is not valid JSON.");
  }

  await runAdminUpdate({
    action: "assessment_module.updated",
    targetType: "assessment_module",
    targetId: baseInput.data.module_id,
    metadata: {
      title: baseInput.data.title,
      status: baseInput.data.status,
      license_status: baseInput.data.license_status
    },
    update: async (supabase) =>
      supabase
        .from("assessment_modules")
        .update({
          title: baseInput.data.title,
          status: baseInput.data.status,
          license_status: baseInput.data.license_status,
          questions: questions.value,
          scoring_config: scoringConfig.value
        })
        .eq("id", baseInput.data.module_id)
  });
}

export async function updateAssessmentResponse(
  formData: FormData
): Promise<void> {
  const input = z
    .object({
      response_id: uuidSchema,
      answers: z.string()
    })
    .safeParse(Object.fromEntries(formData));

  if (!input.success) return;
  const answers = parseJson(input.data.answers);
  if (!answers.success || Array.isArray(answers.value) || typeof answers.value !== "object") {
    throw new Error("Answers must be a valid JSON object.");
  }

  await runAdminUpdate({
    action: "assessment_response.admin_updated",
    targetType: "assessment_response",
    targetId: input.data.response_id,
    metadata: {},
    update: async (supabase) =>
      supabase
        .from("assessment_responses")
        .update({ answers: answers.value, completed_at: new Date().toISOString() })
        .eq("id", input.data.response_id)
  });
}

export async function updateScore(
  formData: FormData
): Promise<void> {
  const input = z
    .object({
      score_id: uuidSchema,
      value: z.coerce.number().min(0),
      max_value: z.coerce.number().min(0),
      severity: z.enum([
        "minimal",
        "mild",
        "moderate",
        "moderately_severe",
        "significant",
        "severe",
        "review_required"
      ]),
      interpretation: z.string().max(4000),
      summary: z.string().max(12000)
    })
    .safeParse(Object.fromEntries(formData));

  if (!input.success) return;

  await runAdminUpdate({
    action: "score.admin_updated",
    targetType: "score",
    targetId: input.data.score_id,
    metadata: { value: input.data.value, severity: input.data.severity },
    update: async (supabase) =>
      supabase
        .from("scores")
        .update({
          value: input.data.value,
          max_value: input.data.max_value,
          severity: input.data.severity,
          interpretation: input.data.interpretation,
          summary: input.data.summary
        })
        .eq("id", input.data.score_id)
  });
}

export async function updateRiskFlag(
  formData: FormData
): Promise<void> {
  const input = z
    .object({
      risk_flag_id: uuidSchema,
      severity: z.enum(riskSeverities),
      message: z.string().min(1).max(12000),
      resolved: z.enum(["true", "false"])
    })
    .safeParse(Object.fromEntries(formData));

  if (!input.success) return;

  await runAdminUpdate({
    action: "risk_flag.admin_updated",
    targetType: "risk_flag",
    targetId: input.data.risk_flag_id,
    metadata: { severity: input.data.severity, resolved: input.data.resolved === "true" },
    update: async (supabase) =>
      supabase
        .from("risk_flags")
        .update({
          severity: input.data.severity,
          message: input.data.message,
          resolved_at: input.data.resolved === "true" ? new Date().toISOString() : null
        })
        .eq("id", input.data.risk_flag_id)
  });
}

export async function updateClinicianReview(
  formData: FormData
): Promise<void> {
  const input = z
    .object({
      review_id: uuidSchema,
      status: z.enum(["draft", "approved"]),
      outcome: z.enum(triageOutcomes),
      reviewer_notes: z.string().max(12000),
      student_facing_summary: z.string().max(12000)
    })
    .safeParse(Object.fromEntries(formData));

  if (!input.success) return;

  await runAdminUpdate({
    action: "clinician_review.admin_updated",
    targetType: "clinician_review",
    targetId: input.data.review_id,
    metadata: { status: input.data.status, outcome: input.data.outcome },
    update: async (supabase) =>
      supabase
        .from("clinician_reviews")
        .update({
          status: input.data.status,
          outcome: input.data.outcome,
          reviewer_notes: input.data.reviewer_notes,
          student_facing_summary: input.data.student_facing_summary
        })
        .eq("id", input.data.review_id)
  });
}

type AdminUpdateInput = {
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, string | number | boolean | null>;
  update: (
    supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
  ) => PromiseLike<{ error: { message: string } | null }>;
};

async function runAdminUpdate(input: AdminUpdateInput): Promise<void> {
  const context = await requireRoles(["psychu_admin"]);
  const supabase = await createSupabaseServerClient();
  const result = await input.update(supabase);

  if (result.error) {
    throw new Error(`Admin update failed. ${result.error.message}`);
  }

  await writeAuditLog(context.user.id, input.action, input.targetType, input.targetId, input.metadata);
  revalidateAdminPaths();
}

async function writeAuditLog(
  actorUserId: string,
  action: string,
  targetType: string,
  targetId: string | null,
  metadata: Record<string, string | number | boolean | null>
) {
  const supabase = await createSupabaseServerClient();
  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", actorUserId)
    .eq("role", "psychu_admin")
    .maybeSingle();

  await supabase.from("audit_logs").insert({
    actor_user_id: actorUserId,
    organization_id: membership?.organization_id ?? null,
    action,
    target_type: targetType,
    target_id: targetId,
    metadata
  });
}

function parseJson(value: string): { success: true; value: unknown } | { success: false } {
  try {
    return { success: true, value: JSON.parse(value) };
  } catch {
    return { success: false };
  }
}

function revalidateAdminPaths() {
  revalidatePath("/admin/forms");
  revalidatePath("/student");
  revalidatePath("/student/case");
  revalidatePath("/clinician/queue");
}
