import {
  type AITriageOutput,
  aiTriageOutputSchema,
  type AssessmentModule,
  type AssessmentResponse,
  type CaseStatus,
  type ClinicianReview,
  type Membership,
  nonDiagnosticDisclaimer,
  type PsychuCase,
  type RiskFlag,
  type Score,
  type ShareGrant,
  type TriagePacket,
  type UploadedDocument
} from "@/lib/domain";

const statusOrder: CaseStatus[] = [
  "draft",
  "submitted",
  "urgent_flagged",
  "under_review",
  "needs_info",
  "packet_ready",
  "shared",
  "closed"
];

export function scoreAssessment(
  assessmentModule: AssessmentModule,
  response: AssessmentResponse,
  now = new Date().toISOString()
): Score {
  if (assessmentModule.scoringStrategy === "manual_review") {
    return {
      id: `score_${response.id}`,
      caseId: response.caseId,
      moduleId: assessmentModule.id,
      label: `${assessmentModule.title} review`,
      value: 0,
      severity: "review_required",
      summary: "Manual clinician review required for narrative responses.",
      createdAt: now
    };
  }

  const scaleValues = assessmentModule.questions
    .filter((question) => question.type === "scale_0_4")
    .map((question) => Number(response.answers[question.id] ?? 0))
    .filter((value) => Number.isFinite(value));

  const average = scaleValues.length
    ? Number((scaleValues.reduce((sum, value) => sum + value, 0) / scaleValues.length).toFixed(2))
    : 0;

  return {
    id: `score_${response.id}`,
    caseId: response.caseId,
    moduleId: assessmentModule.id,
    label: `${assessmentModule.title} average`,
    value: average,
    severity: scoreSeverity(average),
    summary: summarizeScore(assessmentModule.title, average),
    createdAt: now
  };
}

export function scoreSeverity(value: number): Score["severity"] {
  if (value >= 3) return "significant";
  if (value >= 2) return "moderate";
  if (value >= 1) return "mild";
  return "minimal";
}

export function summarizeScore(title: string, value: number): string {
  if (value >= 3) {
    return `${title} responses suggest significant current functional impact and should be prioritized for clinician review.`;
  }
  if (value >= 2) {
    return `${title} responses suggest moderate current functional impact.`;
  }
  if (value >= 1) {
    return `${title} responses suggest mild current functional impact.`;
  }
  return `${title} responses do not show elevated impact in this screening module.`;
}

export function detectRiskFlags(
  modules: AssessmentModule[],
  responses: AssessmentResponse[],
  now = new Date().toISOString()
): RiskFlag[] {
  const moduleById = new Map(modules.map((assessmentModule) => [assessmentModule.id, assessmentModule]));
  const flags: RiskFlag[] = [];

  for (const response of responses) {
    const assessmentModule = moduleById.get(response.moduleId);
    if (!assessmentModule) continue;

    for (const question of assessmentModule.questions) {
      if (!question.riskTrigger) continue;
      const answer = response.answers[question.id];
      const includesMatch =
        typeof answer === "string" &&
        question.riskTrigger.includes &&
        answer.toLowerCase().includes(question.riskTrigger.includes.toLowerCase());
      const equalsMatch =
        question.riskTrigger.equals !== undefined && answer === question.riskTrigger.equals;

      if (includesMatch || equalsMatch) {
        flags.push({
          id: `risk_${response.id}_${question.id}`,
          caseId: response.caseId,
          source: "deterministic_screening",
          severity: question.riskTrigger.severity,
          message: question.riskTrigger.message,
          createdAt: now
        });
      }
    }
  }

  return flags;
}

export function submittedStatusForFlags(flags: RiskFlag[]): CaseStatus {
  return flags.some((flag) => flag.severity === "critical" || flag.severity === "high")
    ? "urgent_flagged"
    : "submitted";
}

export function canTransitionCase(from: CaseStatus, to: CaseStatus): boolean {
  if (from === to) return true;
  if (from === "closed") return false;
  if (to === "closed") return true;
  return statusOrder.indexOf(to) >= statusOrder.indexOf(from);
}

export function validateAiTriageOutput(output: unknown): AITriageOutput {
  return aiTriageOutputSchema.parse(output);
}

export function buildTriagePacket(input: {
  caseRecord: PsychuCase;
  review: ClinicianReview;
  scores: Score[];
  riskFlags: RiskFlag[];
  documents: UploadedDocument[];
  now?: string;
}): TriagePacket {
  const now = input.now ?? new Date().toISOString();
  return {
    id: `packet_${input.review.id}`,
    caseId: input.caseRecord.id,
    reviewId: input.review.id,
    version: 1,
    approvedByUserId: input.review.reviewerUserId,
    studentSummary: input.review.studentFacingSummary,
    universitySummary: input.review.studentFacingSummary,
    scores: input.scores,
    riskFlags: input.riskFlags.filter((flag) => !flag.resolvedAt),
    documentList: input.documents.map((document) => ({
      id: document.id,
      fileName: document.fileName,
      category: document.category,
      createdAt: document.createdAt
    })),
    recommendedNextSteps: derivePacketNextSteps(input.review),
    legalDisclaimer: nonDiagnosticDisclaimer,
    createdAt: now
  };
}

export function derivePacketNextSteps(review: ClinicianReview): string[] {
  if (review.outcome === "request_more_docs") {
    return [
      "Upload the requested documentation before further review.",
      ...review.requestedDocuments.map((document) => `Requested document: ${document}`)
    ];
  }
  if (review.outcome === "refer_external_evaluation") {
    return ["Schedule an external psychoeducational evaluation with a qualified provider."];
  }
  if (review.outcome === "urgent_safety_followup") {
    return ["Use crisis resources if safety concerns are active.", "PsychU reviewer follow-up is required."];
  }
  if (review.outcome === "share_with_university") {
    return ["Share this reviewed packet with the university accessibility office if you want them to consider it."];
  }
  if (review.outcome === "schedule_psychu_review") {
    return ["Schedule a follow-up review with PsychU."];
  }
  return ["No immediate action is required based on this screening review."];
}

export function canAccessClinicianQueue(memberships: Membership[]): boolean {
  return memberships.some((membership) =>
    ["psychu_clinician", "psychu_admin"].includes(membership.role)
  );
}

export function canManageUniversityInvites(memberships: Membership[], organizationId: string): boolean {
  return memberships.some(
    (membership) =>
      membership.organizationId === organizationId &&
      ["university_admin", "psychu_admin"].includes(membership.role)
  );
}

export function canViewSharedPacket(input: {
  shareGrant: ShareGrant;
  viewerMemberships: Membership[];
  viewerUserId: string;
  now?: string;
}): boolean {
  if (input.shareGrant.status !== "active") return false;
  if (input.shareGrant.recipientUserId && input.shareGrant.recipientUserId !== input.viewerUserId) {
    return false;
  }
  if (input.shareGrant.expiresAt && new Date(input.shareGrant.expiresAt) < new Date(input.now ?? Date.now())) {
    return false;
  }
  return input.viewerMemberships.some(
    (membership) =>
      membership.organizationId === input.shareGrant.organizationId &&
      ["university_staff", "university_admin", "psychu_admin"].includes(membership.role)
  );
}

export function redactPacketForUniversity(packet: TriagePacket): TriagePacket {
  return {
    ...packet,
    riskFlags: packet.riskFlags.map((flag) => ({
      ...flag,
      message:
        flag.severity === "critical"
          ? "A high-priority safety flag was reviewed by PsychU. Contact PsychU for permitted follow-up details."
          : flag.message
    }))
  };
}
