import { z } from "zod";

export const roles = [
  "student",
  "psychu_clinician",
  "psychu_admin",
  "university_staff",
  "university_admin"
] as const;

export const caseStatuses = [
  "draft",
  "submitted",
  "urgent_flagged",
  "under_review",
  "needs_info",
  "packet_ready",
  "shared",
  "closed"
] as const;

export const triageOutcomes = [
  "request_more_docs",
  "schedule_psychu_review",
  "refer_external_evaluation",
  "share_with_university",
  "urgent_safety_followup",
  "no_current_action"
] as const;

export const aiPriorities = ["low", "routine", "elevated", "urgent"] as const;
export const riskSeverities = ["info", "moderate", "high", "critical"] as const;
export const shareStatuses = ["active", "revoked", "expired"] as const;

export type Role = (typeof roles)[number];
export type CaseStatus = (typeof caseStatuses)[number];
export type TriageOutcome = (typeof triageOutcomes)[number];
export type AiPriority = (typeof aiPriorities)[number];
export type RiskSeverity = (typeof riskSeverities)[number];
export type ShareStatus = (typeof shareStatuses)[number];

export type Organization = {
  id: string;
  name: string;
  slug: string;
  type: "psychu" | "university";
  retentionYears: number;
  createdAt: string;
};

export type User = {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
};

export type Membership = {
  id: string;
  userId: string;
  organizationId: string;
  role: Role;
  createdAt: string;
};

export type Invite = {
  id: string;
  email: string;
  organizationId: string;
  invitedByUserId: string;
  role: Role;
  status: "pending" | "accepted" | "expired" | "revoked";
  expiresAt: string;
  createdAt: string;
};

export type ConsentVersion = {
  id: string;
  key: "student_consent" | "privacy_notice" | "release_of_information";
  title: string;
  version: string;
  body: string;
  required: boolean;
  effectiveAt: string;
};

export type StudentProfile = {
  id: string;
  userId: string;
  organizationId: string;
  preferredName: string;
  dateOfBirth: string;
  yearInSchool: string;
  major: string;
  priorAccommodations: string[];
  accessibilityNeeds: string[];
  createdAt: string;
  updatedAt: string;
};

export type PsychuCase = {
  id: string;
  studentUserId: string;
  organizationId: string;
  status: CaseStatus;
  submittedAt?: string;
  assignedClinicianUserId?: string;
  currentSummary: string;
  nextStep?: string;
  createdAt: string;
  updatedAt: string;
};

export type AssessmentQuestion = {
  id: string;
  label: string;
  helpText?: string;
  type: "scale_0_4" | "boolean" | "text" | "multi_select";
  required: boolean;
  options?: string[];
  riskTrigger?: {
    equals?: string | boolean | number;
    includes?: string;
    severity: RiskSeverity;
    message: string;
  };
};

export type AssessmentModule = {
  id: string;
  slug: string;
  title: string;
  version: string;
  status: "draft" | "active" | "retired";
  licenseStatus: "custom" | "public_domain_verified" | "licensed_pending" | "licensed_verified";
  domains: string[];
  scoringStrategy: "average_scale" | "manual_review";
  questions: AssessmentQuestion[];
  createdAt: string;
};

export type AssessmentResponse = {
  id: string;
  caseId: string;
  moduleId: string;
  moduleVersion: string;
  answers: Record<string, string | number | boolean | string[]>;
  completedAt: string;
};

export type Score = {
  id: string;
  caseId: string;
  moduleId: string;
  label: string;
  value: number;
  severity: "minimal" | "mild" | "moderate" | "significant" | "review_required";
  summary: string;
  createdAt: string;
};

export type UploadedDocument = {
  id: string;
  caseId: string;
  uploadedByUserId: string;
  storagePath: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  category: "prior_evaluation" | "iep_504" | "medical_note" | "academic_record" | "other";
  createdAt: string;
};

export type RiskFlag = {
  id: string;
  caseId: string;
  source: "deterministic_screening" | "clinician" | "ai_suggestion";
  severity: RiskSeverity;
  message: string;
  resolvedAt?: string;
  createdAt: string;
};

export const aiTriageOutputSchema = z.object({
  priority: z.enum(aiPriorities),
  rationale: z.string().min(12),
  missing_information: z.array(z.string()),
  recommended_reviewer_actions: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  safety_caveats: z.array(z.string())
});

export type AITriageOutput = z.infer<typeof aiTriageOutputSchema>;

export type AITriageRun = {
  id: string;
  caseId: string;
  provider: "mock" | "openai" | "azure_openai" | "other";
  model: string;
  inputHash: string;
  output: AITriageOutput;
  createdAt: string;
};

export type ClinicianReview = {
  id: string;
  caseId: string;
  reviewerUserId: string;
  status: "draft" | "approved";
  outcome: TriageOutcome;
  reviewerNotes: string;
  studentFacingSummary: string;
  requestedDocuments: string[];
  createdAt: string;
  updatedAt: string;
};

export type TriagePacket = {
  id: string;
  caseId: string;
  reviewId: string;
  version: number;
  approvedByUserId: string;
  studentSummary: string;
  universitySummary: string;
  scores: Score[];
  riskFlags: RiskFlag[];
  documentList: Pick<UploadedDocument, "id" | "fileName" | "category" | "createdAt">[];
  recommendedNextSteps: string[];
  legalDisclaimer: string;
  createdAt: string;
};

export type ShareGrant = {
  id: string;
  packetId: string;
  studentUserId: string;
  organizationId: string;
  recipientUserId?: string;
  status: ShareStatus;
  expiresAt?: string;
  createdAt: string;
  revokedAt?: string;
};

export type AuditLog = {
  id: string;
  actorUserId: string;
  organizationId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, string | number | boolean | null>;
  createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  type: "case_status" | "document_request" | "urgent_flag" | "share_created" | "invite";
  title: string;
  body: string;
  readAt?: string;
  createdAt: string;
};

export const nonDiagnosticDisclaimer =
  "PsychU screening output is for triage and care coordination only. It is not a diagnosis, accommodation determination, or emergency response service. A licensed reviewer must approve any packet before it is shared.";

export const crisisResourceCopy =
  "If you might hurt yourself or someone else, call or text 988 now, use 988 Lifeline chat, or call 911 if there is immediate danger. PsychU is not a live crisis response service.";
