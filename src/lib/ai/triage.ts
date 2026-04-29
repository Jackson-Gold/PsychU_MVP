import { createHash } from "node:crypto";
import {
  type AITriageOutput,
  type AITriageRun,
  type PsychuCase,
  type RiskFlag,
  type Score
} from "@/lib/domain";
import { validateAiTriageOutput } from "@/lib/workflows";

export type AITriageInput = {
  caseRecord: Pick<PsychuCase, "id" | "currentSummary" | "status">;
  scores: Score[];
  riskFlags: RiskFlag[];
  documentsCount: number;
};

export type AITriageAdapter = {
  provider: AITriageRun["provider"];
  model: string;
  suggest(input: AITriageInput): Promise<AITriageOutput>;
};

export function createAITriageAdapter(provider = process.env.AI_TRIAGE_PROVIDER): AITriageAdapter {
  if (!provider || provider === "mock") return mockTriageAdapter;

  return {
    provider: provider === "azure_openai" ? "azure_openai" : "openai",
    model: "configured-provider",
    async suggest() {
      throw new Error(
        "External AI triage is not configured in this MVP scaffold. Wire this adapter only after privacy, BAA/DPA, and validation review."
      );
    }
  };
}

export const mockTriageAdapter: AITriageAdapter = {
  provider: "mock",
  model: "rules-plus-template-v1",
  async suggest(input) {
    const hasCriticalRisk = input.riskFlags.some(
      (flag) => flag.severity === "critical" || flag.severity === "high"
    );
    const maxScore = Math.max(0, ...input.scores.map((score) => score.value));
    const missingInformation = input.documentsCount === 0 ? ["No supporting documents uploaded yet."] : [];
    const priority = hasCriticalRisk ? "urgent" : maxScore >= 3 ? "elevated" : "routine";

    return validateAiTriageOutput({
      priority,
      rationale: hasCriticalRisk
        ? "Deterministic safety flags are present, so the reviewer should inspect this case before routine submissions."
        : "Screening scores and available documentation suggest this case can proceed through standard clinician review.",
      missing_information: missingInformation,
      recommended_reviewer_actions: [
        "Confirm deterministic scores against narrative intake.",
        "Check whether documentation supports the student's reported functional impairment.",
        "Approve, request documents, or route to external evaluation as clinically appropriate."
      ],
      confidence: hasCriticalRisk ? 0.72 : 0.62,
      safety_caveats: [
        "AI output is advisory only.",
        "Crisis and safety handling must follow deterministic protocol and clinician judgment."
      ]
    });
  }
};

export async function runAITriage(input: AITriageInput, now = new Date().toISOString()): Promise<AITriageRun> {
  const adapter = createAITriageAdapter();
  const output = await adapter.suggest(input);

  return {
    id: `ai_${input.caseRecord.id}`,
    caseId: input.caseRecord.id,
    provider: adapter.provider,
    model: adapter.model,
    inputHash: createHash("sha256").update(JSON.stringify(input)).digest("hex"),
    output,
    createdAt: now
  };
}
