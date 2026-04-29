import { describe, expect, it } from "vitest";
import {
  demoAssessmentModules,
  demoAssessmentResponses,
  demoMemberships,
  demoPacket,
  demoShareGrant
} from "@/lib/demo-data";
import {
  canAccessClinicianQueue,
  canTransitionCase,
  canViewSharedPacket,
  detectRiskFlags,
  scoreAssessment,
  submittedStatusForFlags,
  validateAiTriageOutput
} from "@/lib/workflows";

describe("screening workflows", () => {
  it("scores average-scale modules with meaningful severity", () => {
    const assessmentModule = demoAssessmentModules[0];
    const response = demoAssessmentResponses[0];
    const score = scoreAssessment(assessmentModule, response, "2026-04-29T00:00:00.000Z");

    expect(score.value).toBe(3.33);
    expect(score.severity).toBe("significant");
  });

  it("detects deterministic safety flags and marks submitted cases urgent", () => {
    const assessmentModule = demoAssessmentModules.find((item) => item.slug === "mood-anxiety-safety-custom");
    expect(assessmentModule).toBeDefined();

    const riskResponse = {
      ...demoAssessmentResponses[1],
      answers: {
        ...demoAssessmentResponses[1].answers,
        safety_self_harm: true
      }
    };

    const flags = detectRiskFlags(demoAssessmentModules, [riskResponse], "2026-04-29T00:00:00.000Z");

    expect(flags).toHaveLength(1);
    expect(flags[0].severity).toBe("critical");
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

  it("recognizes PsychU clinician queue access", () => {
    const clinicianMemberships = demoMemberships.filter((membership) => membership.userId === "user_clinician_rivera");
    expect(canAccessClinicianQueue(clinicianMemberships)).toBe(true);
    expect(demoPacket.legalDisclaimer).toContain("not a diagnosis");
  });
});
