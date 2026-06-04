"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRoles } from "@/lib/auth";
import { mapRiskFlag, mapScore } from "@/lib/data";
import { caseStatuses, nonDiagnosticDisclaimer, triageOutcomes } from "@/lib/domain";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { derivePacketNextSteps } from "@/lib/workflows";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

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
    ? await supabase
        .from("clinician_reviews")
        .update(reviewPayload)
        .eq("id", input.data.review_id)
        .select("id")
        .maybeSingle()
    : await supabase.from("clinician_reviews").insert(reviewPayload).select("id").maybeSingle();

  if (reviewResult.error || !reviewResult.data?.id) {
    return {
      status: "error",
      message: `Review could not be saved. ${reviewResult.error?.message ?? "No review record was returned."}`
    };
  }

  const reviewId = String(reviewResult.data.id);

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
    .select("organization_id, student_user_id")
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

  let packetMessage = "";
  if (input.data.case_status === "packet_ready") {
    const packetResult = await generateTriagePacket(supabase, {
      caseId: input.data.case_id,
      reviewId,
      approvedByUserId: context.user.id,
      studentSummary: input.data.student_facing_summary,
      outcome: input.data.outcome,
      requestedDocuments
    });

    if (packetResult.error) {
      packetMessage = ` The case is approved, but the packet could not be generated: ${packetResult.error}`;
    } else {
      packetMessage = ` A reviewed packet (v${packetResult.version}) is now available for the student to share.`;
      if (caseRecord?.student_user_id) {
        await supabase.from("notifications").insert({
          user_id: caseRecord.student_user_id,
          type: "case_status",
          title: "Your reviewed packet is ready",
          body: "A PsychU clinician approved your triage packet. Review it and decide whether to share it with your university."
        });
      }
    }
  }

  revalidatePath("/clinician/queue");
  revalidatePath(`/clinician/cases/${input.data.case_id}`);
  revalidatePath("/student");
  revalidatePath("/student/case");
  revalidatePath("/student/share");

  return { status: "success", message: `Clinician review and case status were saved.${packetMessage}` };
}

async function generateTriagePacket(
  supabase: SupabaseServerClient,
  input: {
    caseId: string;
    reviewId: string;
    approvedByUserId: string;
    studentSummary: string;
    outcome: (typeof triageOutcomes)[number];
    requestedDocuments: string[];
  }
): Promise<{ version: number; error?: undefined } | { version?: undefined; error: string }> {
  const [{ data: scoreRows }, { data: riskRows }, { data: documentRows }, { data: packetRows }] = await Promise.all([
    supabase.from("scores").select("*").eq("case_id", input.caseId),
    supabase.from("risk_flags").select("*").eq("case_id", input.caseId).is("resolved_at", null),
    supabase.from("uploaded_documents").select("id,file_name,category,created_at").eq("case_id", input.caseId),
    supabase
      .from("triage_packets")
      .select("version")
      .eq("case_id", input.caseId)
      .order("version", { ascending: false })
      .limit(1)
  ]);

  const scores = (scoreRows ?? []).map(mapScore);
  const riskFlags = (riskRows ?? []).map(mapRiskFlag);
  const documentList = (documentRows ?? []).map((document) => ({
    id: String(document.id),
    fileName: String(document.file_name),
    category: String(document.category),
    createdAt: String(document.created_at)
  }));
  const version = (Number(packetRows?.[0]?.version) || 0) + 1;

  const recommendedNextSteps = derivePacketNextSteps({
    id: input.reviewId,
    caseId: input.caseId,
    reviewerUserId: input.approvedByUserId,
    status: "approved",
    outcome: input.outcome,
    reviewerNotes: "",
    studentFacingSummary: input.studentSummary,
    requestedDocuments: input.requestedDocuments,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const { error } = await supabase.from("triage_packets").insert({
    case_id: input.caseId,
    review_id: input.reviewId,
    version,
    approved_by_user_id: input.approvedByUserId,
    student_summary: input.studentSummary,
    university_summary: input.studentSummary,
    scores,
    risk_flags: riskFlags,
    document_list: documentList,
    recommended_next_steps: recommendedNextSteps,
    legal_disclaimer: nonDiagnosticDisclaimer
  });

  if (error) return { error: error.message };
  return { version };
}

