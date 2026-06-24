import {
  type AITriageRun,
  type AssessmentResponse,
  type ClinicianReview,
  type ConsentVersion,
  type Invite,
  type Membership,
  type Notification,
  type Organization,
  type PsychuCase,
  type ShareGrant,
  type StudentProfile,
  type TriagePacket,
  type UploadedDocument,
  type User
} from "@/lib/domain";
import { assessmentCatalog } from "@/lib/assessment-catalog";
import {
  buildTriagePacket,
  detectRiskFlags,
  scoreAssessment,
  submittedStatusForFlags
} from "@/lib/workflows";

const now = "2026-04-29T01:00:00.000Z";

export const demoOrganizations: Organization[] = [
  {
    id: "org_psychu",
    name: "Synaptec",
    slug: "psychu",
    type: "psychu",
    retentionYears: 7,
    createdAt: now
  },
  {
    id: "org_penn_access",
    name: "Penn Accessibility Pilot",
    slug: "penn-accessibility-pilot",
    type: "university",
    retentionYears: 7,
    createdAt: now
  }
];

export const demoUsers: User[] = [
  {
    id: "user_student_maya",
    email: "maya.student@upenn.edu",
    fullName: "Maya Chen",
    createdAt: now
  },
  {
    id: "user_clinician_rivera",
    email: "dr.rivera@psychu.test",
    fullName: "Dr. Elena Rivera",
    createdAt: now
  },
  {
    id: "user_accessibility_admin",
    email: "accessibility@upenn.edu",
    fullName: "Jordan Brooks",
    createdAt: now
  },
  {
    id: "user_psychu_admin",
    email: "admin@example.com",
    fullName: "Avery Morgan",
    createdAt: now
  }
];

export const demoMemberships: Membership[] = [
  {
    id: "mem_student_maya",
    userId: "user_student_maya",
    organizationId: "org_penn_access",
    role: "student",
    createdAt: now
  },
  {
    id: "mem_clinician_rivera",
    userId: "user_clinician_rivera",
    organizationId: "org_psychu",
    role: "psychu_clinician",
    createdAt: now
  },
  {
    id: "mem_staff_jordan",
    userId: "user_accessibility_admin",
    organizationId: "org_penn_access",
    role: "university_admin",
    createdAt: now
  },
  {
    id: "mem_admin_avery",
    userId: "user_psychu_admin",
    organizationId: "org_psychu",
    role: "psychu_admin",
    createdAt: now
  }
];

export const demoInvites: Invite[] = [
  {
    id: "invite_student_001",
    email: "new.student@upenn.edu",
    organizationId: "org_penn_access",
    invitedByUserId: "user_accessibility_admin",
    role: "student",
    status: "pending",
    expiresAt: "2026-05-13T01:00:00.000Z",
    createdAt: now
  },
  {
    id: "invite_staff_001",
    email: "case.manager@upenn.edu",
    organizationId: "org_penn_access",
    invitedByUserId: "user_accessibility_admin",
    role: "university_staff",
    status: "pending",
    expiresAt: "2026-05-13T01:00:00.000Z",
    createdAt: now
  }
];

export const demoConsentVersions: ConsentVersion[] = [
  {
    id: "consent_student_v1",
    key: "student_consent",
    title: "Student Screening Consent",
    version: "1.0-draft",
    required: true,
    effectiveAt: now,
    body:
      "Draft legal placeholder: students consent to screening intake, document upload, clinician review, and non-diagnostic triage. Replace with counsel-approved copy before production use."
  },
  {
    id: "consent_release_v1",
    key: "release_of_information",
    title: "Release of Information",
    version: "1.0-draft",
    required: true,
    effectiveAt: now,
    body:
      "Draft legal placeholder: students choose whether to release a reviewed packet to university staff. No automatic university disclosure occurs."
  }
];

export const demoStudentProfile: StudentProfile = {
  id: "profile_maya",
  userId: "user_student_maya",
  organizationId: "org_penn_access",
  preferredName: "Maya",
  dateOfBirth: "2005-03-17",
  yearInSchool: "Sophomore",
  major: "Biology",
  priorAccommodations: ["Extended time in high school", "Reduced-distraction testing room"],
  accessibilityNeeds: ["Difficulty sustaining attention during long exams", "Slow reading under time pressure"],
  createdAt: now,
  updatedAt: now
};

export const demoAssessmentModules = assessmentCatalog;

export const demoCase: PsychuCase = {
  id: "case_maya_001",
  studentUserId: "user_student_maya",
  organizationId: "org_penn_access",
  status: "under_review",
  submittedAt: "2026-04-28T19:35:00.000Z",
  assignedClinicianUserId: "user_clinician_rivera",
  currentSummary:
    "Student reports longstanding attention, pace, and timed-testing challenges with prior high school accommodations.",
  nextStep: "Synaptec clinician review in progress.",
  createdAt: "2026-04-28T18:55:00.000Z",
  updatedAt: now
};

export const demoAssessmentResponses: AssessmentResponse[] = [
  {
    id: "response_phq9_maya",
    caseId: demoCase.id,
    moduleId: "00000000-0000-0000-0000-000000000110",
    moduleVersion: "1.0.0",
    answers: {
      phq9_1: 1,
      phq9_2: 1,
      phq9_3: 2,
      phq9_4: 2,
      phq9_5: 0,
      phq9_6: 1,
      phq9_7: 2,
      phq9_8: 0,
      phq9_9: 0,
      phq9_difficulty: "Somewhat difficult"
    },
    completedAt: "2026-04-28T19:20:00.000Z"
  },
  {
    id: "response_gad7_maya",
    caseId: demoCase.id,
    moduleId: "00000000-0000-0000-0000-000000000111",
    moduleVersion: "1.0.0",
    answers: {
      gad7_1: 2,
      gad7_2: 1,
      gad7_3: 2,
      gad7_4: 1,
      gad7_5: 0,
      gad7_6: 1,
      gad7_7: 1,
      gad7_difficulty: "Somewhat difficult"
    },
    completedAt: "2026-04-28T19:28:00.000Z"
  },
  {
    id: "response_intake_maya",
    caseId: demoCase.id,
    moduleId: "00000000-0000-0000-0000-000000000112",
    moduleVersion: "2026-05-25",
    answers: {
      referral_source: "Pilot university accessibility office",
      full_name: "Maya Chen",
      present_concerns:
        "I often need twice as long as classmates to finish exams and lose my place on long problem sets.",
      evaluation_goals: "I want to know whether updated documentation is needed for college accommodations.",
      prior_neuropsych_eval: true,
      prior_neuropsych_eval_details: "I completed an evaluation in high school and received extended time.",
      current_college_accommodations: false,
      current_college_accommodations_details: "I am seeking accommodations for timed exams."
    },
    completedAt: "2026-04-28T19:34:00.000Z"
  }
];

export const demoRiskFlags = detectRiskFlags(demoAssessmentModules, demoAssessmentResponses, now);

export const demoScores = demoAssessmentResponses.map((response) => {
  const assessmentModule = demoAssessmentModules.find((item) => item.id === response.moduleId);
  if (!assessmentModule) throw new Error(`Missing demo module ${response.moduleId}`);
  return scoreAssessment(assessmentModule, response, now);
});

export const demoSubmittedStatus = submittedStatusForFlags(demoRiskFlags);

export const demoUploadedDocuments: UploadedDocument[] = [
  {
    id: "doc_eval_001",
    caseId: demoCase.id,
    uploadedByUserId: demoCase.studentUserId,
    storagePath: "cases/case_maya_001/prior-eval-summary.pdf",
    fileName: "Prior evaluation summary.pdf",
    contentType: "application/pdf",
    sizeBytes: 430214,
    category: "prior_evaluation",
    createdAt: "2026-04-28T19:10:00.000Z"
  },
  {
    id: "doc_504_001",
    caseId: demoCase.id,
    uploadedByUserId: demoCase.studentUserId,
    storagePath: "cases/case_maya_001/high-school-504.pdf",
    fileName: "High school 504 plan.pdf",
    contentType: "application/pdf",
    sizeBytes: 228014,
    category: "iep_504",
    createdAt: "2026-04-28T19:12:00.000Z"
  }
];

export const demoAiRun: AITriageRun = {
  id: "ai_case_maya_001",
  caseId: demoCase.id,
  provider: "mock",
  model: "rules-plus-template-v1",
  inputHash: "demo-hash",
  createdAt: now,
  output: {
    priority: "elevated",
    rationale:
      "Attention and executive-function scores indicate significant functional impact, while uploaded documentation appears relevant for clinician review.",
    missing_information: ["Confirm whether documentation is recent enough for the pilot university policy."],
    recommended_reviewer_actions: [
      "Review uploaded evaluation and high school accommodation history.",
      "Decide whether updated evaluation or additional records are needed.",
      "Prepare student-facing triage guidance before any university release."
    ],
    confidence: 0.68,
    safety_caveats: [
      "No deterministic crisis flag is present in this demo case.",
      "AI suggestion is not a clinical determination."
    ]
  }
};

export const demoClinicianReview: ClinicianReview = {
  id: "review_maya_001",
  caseId: demoCase.id,
  reviewerUserId: "user_clinician_rivera",
  status: "approved",
  outcome: "share_with_university",
  reviewerNotes:
    "Screening pattern and prior documentation support sharing a triage packet with the university accessibility office. Student may still need updated formal evaluation depending on school policy.",
  studentFacingSummary:
    "Your screening responses show meaningful attention/executive-function impact in academic settings. Based on the records provided, Synaptec recommends sharing this reviewed triage packet with your university accessibility office and confirming whether updated documentation is required.",
  requestedDocuments: [],
  createdAt: "2026-04-28T22:00:00.000Z",
  updatedAt: now
};

export const demoPacket: TriagePacket = buildTriagePacket({
  caseRecord: demoCase,
  review: demoClinicianReview,
  scores: demoScores,
  riskFlags: demoRiskFlags,
  documents: demoUploadedDocuments,
  now
});

export const demoShareGrant: ShareGrant = {
  id: "share_maya_packet_001",
  packetId: demoPacket.id,
  studentUserId: demoCase.studentUserId,
  organizationId: "org_penn_access",
  recipientUserId: "user_accessibility_admin",
  status: "active",
  expiresAt: "2026-07-28T01:00:00.000Z",
  createdAt: now
};

export const demoNotifications: Notification[] = [
  {
    id: "notification_doc_request",
    userId: "user_student_maya",
    type: "case_status",
    title: "Review complete",
    body: "Your Synaptec triage packet is ready to review and share.",
    createdAt: now
  }
];
