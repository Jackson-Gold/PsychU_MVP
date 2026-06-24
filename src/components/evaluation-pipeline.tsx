import type { CaseStatus } from "@/lib/domain";

type Stage = {
  key: string;
  label: string;
  caption: string;
};

const STAGES: Stage[] = [
  { key: "intake", label: "Intake", caption: "Profile & consent" },
  { key: "screening", label: "Screening", caption: "PHQ-9, GAD-7 & intake" },
  { key: "scheduling", label: "Scheduling", caption: "Match a psychometrist" },
  { key: "testing", label: "Virtual testing", caption: "Psychometrist-led session" },
  { key: "scoring", label: "Scoring", caption: "Automated, normed scoring" },
  { key: "ai_draft", label: "AI draft", caption: "AI scribe assembles the report" },
  { key: "signoff", label: "NP sign-off", caption: "Neuropsychologist review" },
  { key: "report", label: "Report", caption: "Shared on your terms" }
];

// Maps the existing case status to the active pipeline stage (purely presentational).
const STATUS_TO_INDEX: Record<CaseStatus, number> = {
  draft: 1,
  needs_info: 1,
  submitted: 4,
  urgent_flagged: 6,
  under_review: 6,
  packet_ready: 7,
  shared: 8,
  closed: 8
};

const STATUS_NOTE: Record<CaseStatus, string> = {
  draft: "Complete your screening questionnaires to advance to scheduling.",
  needs_info: "Your neuropsychologist requested more information before testing can be scheduled.",
  submitted: "Your responses are scored and queued for neuropsychologist review.",
  urgent_flagged: "A safety response was flagged for prompt neuropsychologist follow-up.",
  under_review: "A neuropsychologist is reviewing your scores and the drafted report.",
  packet_ready: "Your report is signed and ready — choose whether to share it.",
  shared: "Your signed report has been released to your selected recipient.",
  closed: "This evaluation is complete."
};

export function EvaluationPipeline({
  status,
  audience = "student"
}: {
  status: CaseStatus;
  audience?: "student" | "clinician";
}) {
  const activeIndex = STATUS_TO_INDEX[status];
  const note = STATUS_NOTE[status];
  const heading = audience === "clinician" ? "Evaluation pipeline" : "Your evaluation journey";

  return (
    <section className="panel eval-pipeline" aria-label="Evaluation pipeline">
      <div className="eval-pipeline-head">
        <p className="eyebrow">Synaptec pipeline</p>
        <h2>{heading}</h2>
        <p className="section-intro">{note}</p>
      </div>
      <ol className="eval-track" role="list">
        {STAGES.map((stage, index) => {
          const state = index < activeIndex ? "done" : index === activeIndex ? "current" : "upcoming";
          return (
            <li className={`eval-step eval-step-${state}`} key={stage.key}>
              <span className="eval-step-dot" aria-hidden="true">
                {state === "done" ? "✓" : index + 1}
              </span>
              <span className="eval-step-label">{stage.label}</span>
              <span className="eval-step-caption">{stage.caption}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
