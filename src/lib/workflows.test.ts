import { describe, expect, it } from "vitest";
import {
  demoAssessmentModules,
  demoAssessmentResponses,
  demoMemberships,
  demoPacket,
  demoShareGrant
} from "@/lib/demo-data";
import {
  buildTriagePacket,
  canAccessClinicianQueue,
  canTransitionCase,
  canViewSharedPacket,
  derivePacketNextSteps,
  detectRiskFlags,
  redactPacketForUniversity,
  scoreAssessment,
  submittedStatusForFlags,
  validateAiTriageOutput
} from "@/lib/workflows";
import {
  demoCase,
  demoClinicianReview,
  demoScores,
  demoUploadedDocuments
} from "@/lib/demo-data";
import type { ClinicianReview, RiskFlag } from "@/lib/domain";

describe("screening workflows", () => {
  it("scores the PHQ-9 sum with the supplied severity ranges", () => {
    const assessmentModule = demoAssessmentModules[0];
    const response = demoAssessmentResponses[0];
    const score = scoreAssessment(assessmentModule, response, "2026-04-29T00:00:00.000Z");

    expect(score.value).toBe(9);
    expect(score.maxValue).toBe(27);
    expect(score.severity).toBe("mild");
  });

  it("detects a PHQ-9 question 9 safety flag and marks submitted cases urgent", () => {
    const assessmentModule = demoAssessmentModules.find((item) => item.slug === "phq-9");
    expect(assessmentModule).toBeDefined();

    const riskResponse = {
      ...demoAssessmentResponses[0],
      answers: {
        ...demoAssessmentResponses[0].answers,
        phq9_9: 1
      }
    };

    const flags = detectRiskFlags([assessmentModule!], [riskResponse], "2026-04-29T00:00:00.000Z");

    expect(flags).toHaveLength(1);
    expect(flags[0].severity).toBe("high");
    expect(submittedStatusForFlags(flags)).toBe("urgent_flagged");
  });

  it("prevents reopening closed cases through forward transition helper", () => {
    expect(canTransitionCase("closed", "under_review")).toBe(false);
    expect(canTransitionCase("packet_ready", "shared")).toBe(true);
  });

  it("validates AI output schema before storage", () => {
    expect(() =>
      validateAiTriageOutput({
        priority: "elevated",
        rationale: "The output contains a valid clinical-review rationale.",
        missing_information: [],
        recommended_reviewer_actions: ["Review documentation."],
        confidence: 0.5,
        safety_caveats: ["Advisory only."]
      })
    ).not.toThrow();

    expect(() => validateAiTriageOutput({ priority: "auto_diagnose" })).toThrow();
  });

  it("allows active share access only to scoped university staff", () => {
    const universityStaff = demoMemberships.filter((membership) => membership.userId === "user_accessibility_admin");
    const studentMembership = demoMemberships.filter((membership) => membership.userId === "user_student_maya");

    expect(
      canViewSharedPacket({
        shareGrant: demoShareGrant,
        viewerMemberships: universityStaff,
        viewerUserId: "user_accessibility_admin",
        now: "2026-05-01T00:00:00.000Z"
      })
    ).toBe(true);

    expect(
      canViewSharedPacket({
        shareGrant: demoShareGrant,
        viewerMemberships: studentMembership,
        viewerUserId: "user_student_maya",
        now: "2026-05-01T00:00:00.000Z"
      })
    ).toBe(false);
  });

  it("recognizes Synaptec clinician queue access", () => {
    const clinicianMemberships = demoMemberships.filter((membership) => membership.userId === "user_clinician_rivera");
    expect(canAccessClinicianQueue(clinicianMemberships)).toBe(true);
    expect(demoPacket.legalDisclaimer).toContain("not a diagnosis");
  });

  it("builds a triage packet from review, scores, and documents", () => {
    const criticalFlag: RiskFlag = {
      id: "risk_critical",
      caseId: demoCase.id,
      source: "deterministic_screening",
      severity: "critical",
      message: "Critical safety concern requires follow-up.",
      createdAt: "2026-04-29T00:00:00.000Z"
    };
    const resolvedFlag: RiskFlag = { ...criticalFlag, id: "risk_resolved", resolvedAt: "2026-04-29T01:00:00.000Z" };

    const packet = buildTriagePacket({
      caseRecord: demoCase,
      review: demoClinicianReview,
      scores: demoScores,
      riskFlags: [criticalFlag, resolvedFlag],
      documents: demoUploadedDocuments,
      now: "2026-04-29T02:00:00.000Z"
    });

    expect(packet.caseId).toBe(demoCase.id);
    expect(packet.version).toBe(1);
    expect(packet.studentSummary).toBe(demoClinicianReview.studentFacingSummary);
    expect(packet.documentList).toHaveLength(demoUploadedDocuments.length);
    expect(packet.riskFlags.map((flag) => flag.id)).toEqual(["risk_critical"]);
    expect(packet.legalDisclaimer).toContain("not a diagnosis");
  });

  it("derives next steps from the review outcome", () => {
    const reviewWithDocs: ClinicianReview = {
      ...demoClinicianReview,
      outcome: "request_more_docs",
      requestedDocuments: ["Updated psychoeducational evaluation"]
    };
    const steps = derivePacketNextSteps(reviewWithDocs);
    expect(steps[0]).toContain("Upload the requested documentation");
    expect(steps).toContain("Requested document: Updated psychoeducational evaluation");
  });

  it("redacts critical flag detail in the university-facing packet", () => {
    const criticalFlag: RiskFlag = {
      id: "risk_critical",
      caseId: demoCase.id,
      source: "deterministic_screening",
      severity: "critical",
      message: "Sensitive raw safety detail.",
      createdAt: "2026-04-29T00:00:00.000Z"
    };
    const packet = buildTriagePacket({
      caseRecord: demoCase,
      review: demoClinicianReview,
      scores: demoScores,
      riskFlags: [criticalFlag],
      documents: [],
      now: "2026-04-29T02:00:00.000Z"
    });

    const redacted = redactPacketForUniversity(packet);
    expect(redacted.riskFlags[0].message).not.toContain("Sensitive raw safety detail");
    expect(redacted.riskFlags[0].message).toContain("Contact Synaptec");
  });
});
