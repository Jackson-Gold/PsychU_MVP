import type { AiPriority, CaseStatus, RiskSeverity, ShareStatus } from "@/lib/domain";

type BadgeTone = "neutral" | "good" | "warn" | "danger" | "info";

const statusTone: Record<CaseStatus, BadgeTone> = {
  draft: "neutral",
  submitted: "info",
  urgent_flagged: "danger",
  under_review: "warn",
  needs_info: "warn",
  packet_ready: "good",
  shared: "good",
  closed: "neutral"
};

const priorityTone: Record<AiPriority, BadgeTone> = {
  low: "neutral",
  routine: "info",
  elevated: "warn",
  urgent: "danger"
};

const riskTone: Record<RiskSeverity, BadgeTone> = {
  info: "info",
  moderate: "warn",
  high: "danger",
  critical: "danger"
};

const shareTone: Record<ShareStatus, BadgeTone> = {
  active: "good",
  revoked: "neutral",
  expired: "warn"
};

type StatusBadgeProps = {
  value: CaseStatus | AiPriority | RiskSeverity | ShareStatus | string;
  tone?: BadgeTone;
};

export function StatusBadge({ value, tone }: StatusBadgeProps) {
  const resolvedTone =
    tone ??
    statusTone[value as CaseStatus] ??
    priorityTone[value as AiPriority] ??
    riskTone[value as RiskSeverity] ??
    shareTone[value as ShareStatus] ??
    "neutral";

  return <span className={`badge badge-${resolvedTone}`}>{formatLabel(value)}</span>;
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}
