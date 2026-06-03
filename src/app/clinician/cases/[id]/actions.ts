"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRoles } from "@/lib/auth";
import { caseStatuses, triageOutcomes } from "@/lib/domain";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ClinicianReviewState = {
  status: "idle" | "success" | "error";
  message: string;
};

const reviewSchema = z.object({
  case_id: z.string().uuid(),
  review_id: z.string().uuid().optional().or(z.literal("")),
  case_status: z.enum(caseStatuses),
  outcome: z.enum(triageOutcomes),
  reviewer_notes: z.string().max(12000),
  student_facing_summary: z.string().max(12000),
  requested_documents: z.string().max(4000)
});

export async function saveClinicianReview(
  _previousState: ClinicianReviewState,
  formData: FormData
): Promise<ClinicianReviewState> {
  const context = await requireRoles(["psychu_clinician", "psychu_admin"]);
  const input = reviewSchema.safeParse({
    case_id: formData.get("case_id"),
    review_id: formData.get("review_id"),
    case_status: formData.get("case_status"),
    outcome: formData.get("outcome"),
    reviewer_notes: formData.get("reviewer_notes") ?? "",
    student_facing_summary: formData.get("student_facing_summary") ?? "",
    requested_documents: formData.get("requested_documents") ?? ""
  });

  if (!input.success) {
    return { status: "error", message: "Review fields are invalid. Check the selected status and text lengths." };
  }

  const supabase = await createSupabaseServerClient();
  const requestedDocuments = input.data.requested_documents
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const reviewPayload = {
    case_id: input.data.case_id,
    reviewer_user_id: context.user.id,
    status: input.data.case_status === "packet_ready" ? "approved" : "draft",
    outcome: input.data.outcome,
    reviewer_notes: input.data.reviewer_notes,
    student_facing_summary: input.data.student_facing_summary,
    requested_documents: requestedDocuments
  };

  const reviewResult = input.data.review_id
    ? await supabase.from("clinician_reviews").update(reviewPayload).eq("id", input.data.review_id)
    : await supabase.from("clinician_reviews").insert(reviewPayload);

  if (reviewResult.error) {
    return { status: "error", message: `Review could not be saved. ${reviewResult.error.message}` };
  }

  const { data: caseRecord, error: caseError } = await supabase
    .from("cases")
    .update({
      status: input.data.case_status,
      next_step:
        input.data.case_status === "needs_info"
          ? "Upload requested information for clinician review."
          : input.data.case_status === "packet_ready"
            ? "Review your clinician-approved packet and decide whether to share it."
            : "PsychU clinician review is in progress."
    })
    .eq("id", input.data.case_id)
    .select("organization_id")
    .maybeSingle();

  if (caseError) {
    return { status: "error", message: `Review saved, but case status could not be updated. ${caseError.message}` };
  }

  await supabase.from("audit_logs").insert({
    actor_user_id: context.user.id,
    organization_id: caseRecord?.organization_id ?? null,
    action: "clinician_review.saved",
    target_type: "case",
    target_id: input.data.case_id,
    metadata: {
      status: input.data.case_status,
      outcome: input.data.outcome
    }
  });

  revalidatePath("/clinician/queue");
  revalidatePath(`/clinician/cases/${input.data.case_id}`);
  revalidatePath("/student");
  revalidatePath("/student/case");

  return { status: "success", message: "Clinician review and case status were saved." };
}

