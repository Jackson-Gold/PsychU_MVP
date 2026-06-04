import type {
  AssessmentModule,
  AssessmentQuestion,
  AssessmentResponse,
  AuditLog,
  CaseStatus,
  ClinicianReview,
  Membership,
  Notification,
  PsychuCase,
  RiskFlag,
  Role,
  Score,
  ScoreRange,
  ScoreSeverity,
  ShareStatus,
  StudentProfile,
  TriageOutcome,
  TriagePacket,
  User
} from "@/lib/domain";

type AnswerValue = string | number | boolean | string[];

export function mapAssessmentModule(row: Record<string, unknown>): AssessmentModule {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    version: String(row.version),
    status: row.status as AssessmentModule["status"],
    licenseStatus: row.license_status as AssessmentModule["licenseStatus"],
    domains: (row.domains ?? []) as string[],
    description: String(row.description ?? ""),
    attribution: String(row.attribution ?? ""),
    estimatedMinutes: row.estimated_minutes ? Number(row.estimated_minutes) : undefined,
    scoringStrategy: row.scoring_strategy as AssessmentModule["scoringStrategy"],
    scoringConfig: isRecord(row.scoring_config)
      ? {
          label: String(row.scoring_config.label ?? ""),
          maxValue: Number(row.scoring_config.maxValue ?? 0),
          ranges: ((row.scoring_config.ranges ?? []) as ScoreRange[])
        }
      : undefined,
    questions: (row.questions ?? []) as AssessmentQuestion[],
    createdAt: String(row.created_at)
  };
}

export function mapAssessmentResponse(row: Record<string, unknown>): AssessmentResponse {
  return {
    id: String(row.id),
    caseId: String(row.case_id),
    moduleId: String(row.module_id),
    moduleVersion: String(row.module_version),
    answers: (row.answers ?? {}) as Record<string, AnswerValue>,
    completedAt: String(row.completed_at)
  };
}

export function mapScore(row: Record<string, unknown>): Score {
  return {
    id: String(row.id),
    caseId: String(row.case_id),
    moduleId: String(row.module_id),
    label: String(row.label),
    value: Number(row.value),
    maxValue: row.max_value === null || row.max_value === undefined ? undefined : Number(row.max_value),
    severity: row.severity as ScoreSeverity,
    interpretation: row.interpretation ? String(row.interpretation) : undefined,
    summary: String(row.summary),
    createdAt: String(row.created_at)
  };
}

export function mapCase(row: Record<string, unknown>): PsychuCase {
  return {
    id: String(row.id),
    studentUserId: String(row.student_user_id),
    organizationId: String(row.organization_id),
    status: row.status as CaseStatus,
    submittedAt: row.submitted_at ? String(row.submitted_at) : undefined,
    assignedClinicianUserId: row.assigned_clinician_user_id
      ? String(row.assigned_clinician_user_id)
      : undefined,
    currentSummary: String(row.current_summary ?? ""),
    nextStep: row.next_step ? String(row.next_step) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

export function mapStudentProfile(row: Record<string, unknown>): StudentProfile {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    organizationId: String(row.organization_id),
    preferredName: String(row.preferred_name),
    dateOfBirth: String(row.date_of_birth),
    yearInSchool: String(row.year_in_school),
    major: String(row.major ?? ""),
    priorAccommodations: (row.prior_accommodations ?? []) as string[],
    accessibilityNeeds: (row.accessibility_needs ?? []) as string[],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

export function mapRiskFlag(row: Record<string, unknown>): RiskFlag {
  return {
    id: String(row.id),
    caseId: String(row.case_id),
    source: row.source as RiskFlag["source"],
    severity: row.severity as RiskFlag["severity"],
    message: String(row.message),
    resolvedAt: row.resolved_at ? String(row.resolved_at) : undefined,
    createdAt: String(row.created_at)
  };
}

export function mapUser(row: Record<string, unknown>): User {
  return {
    id: String(row.user_id),
    email: String(row.email),
    fullName: String(row.full_name ?? ""),
    createdAt: String(row.created_at)
  };
}

export function mapMembership(row: Record<string, unknown>): Membership {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    organizationId: String(row.organization_id),
    role: row.role as Role,
    createdAt: String(row.created_at)
  };
}

export function mapClinicianReview(row: Record<string, unknown>): ClinicianReview {
  return {
    id: String(row.id),
    caseId: String(row.case_id),
    reviewerUserId: String(row.reviewer_user_id),
    status: row.status as ClinicianReview["status"],
    outcome: row.outcome as TriageOutcome,
    reviewerNotes: String(row.reviewer_notes ?? ""),
    studentFacingSummary: String(row.student_facing_summary ?? ""),
    requestedDocuments: (row.requested_documents ?? []) as string[],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

export function mapAuditLog(row: Record<string, unknown>): AuditLog {
  return {
    id: String(row.id),
    actorUserId: String(row.actor_user_id ?? ""),
    organizationId: String(row.organization_id ?? ""),
    action: String(row.action),
    targetType: String(row.target_type),
    targetId: String(row.target_id ?? ""),
    metadata: (row.metadata ?? {}) as AuditLog["metadata"],
    createdAt: String(row.created_at)
  };
}

export function mapTriagePacket(row: Record<string, unknown>): TriagePacket {
  return {
    id: String(row.id),
    caseId: String(row.case_id),
    reviewId: String(row.review_id),
    version: Number(row.version ?? 1),
    approvedByUserId: String(row.approved_by_user_id ?? ""),
    studentSummary: String(row.student_summary ?? ""),
    universitySummary: String(row.university_summary ?? ""),
    scores: (row.scores ?? []) as TriagePacket["scores"],
    riskFlags: (row.risk_flags ?? []) as TriagePacket["riskFlags"],
    documentList: (row.document_list ?? []) as TriagePacket["documentList"],
    recommendedNextSteps: (row.recommended_next_steps ?? []) as string[],
    legalDisclaimer: String(row.legal_disclaimer ?? ""),
    createdAt: String(row.created_at)
  };
}

export function mapShareGrant(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    packetId: String(row.packet_id),
    studentUserId: String(row.student_user_id),
    organizationId: String(row.organization_id),
    recipientUserId: row.recipient_user_id ? String(row.recipient_user_id) : undefined,
    status: row.status as ShareStatus,
    expiresAt: row.expires_at ? String(row.expires_at) : undefined,
    createdAt: String(row.created_at),
    revokedAt: row.revoked_at ? String(row.revoked_at) : undefined
  };
}

export function mapNotification(row: Record<string, unknown>): Notification {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    type: row.type as Notification["type"],
    title: String(row.title),
    body: String(row.body),
    readAt: row.read_at ? String(row.read_at) : undefined,
    createdAt: String(row.created_at)
  };
}

export function formatAnswer(value: AnswerValue | undefined): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === undefined || value === "") return "No response";
  return String(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

