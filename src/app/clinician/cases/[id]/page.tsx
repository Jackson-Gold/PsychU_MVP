import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { TriagePacketCard } from "@/components/triage-packet-card";
import {
  demoAiRun,
  demoCase,
  demoClinicianReview,
  demoPacket,
  demoRiskFlags,
  demoScores,
  demoStudentProfile,
  demoUploadedDocuments
} from "@/lib/demo-data";

type ClinicianCasePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClinicianCasePage({ params }: ClinicianCasePageProps) {
  const { id } = await params;
  if (id !== demoCase.id) notFound();

  return (
    <AppShell active="/clinician/queue">
      <section className="panel" aria-labelledby="review-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Clinician Review</p>
            <h1 id="review-title">{demoStudentProfile.preferredName}&apos;s case</h1>
          </div>
          <StatusBadge value={demoCase.status} />
        </div>

        <div className="grid-two">
          <article>
            <h2>Case summary</h2>
            <p>{demoCase.currentSummary}</p>
            <ul className="clean-list">
              <li>
                <strong>Assigned reviewer</strong>
                <span>{demoClinicianReview.reviewerUserId}</span>
              </li>
              <li>
                <strong>Submitted</strong>
                <span>{demoCase.submittedAt}</span>
              </li>
            </ul>
          </article>
          <article>
            <h2>Advisory AI triage</h2>
            <StatusBadge value={demoAiRun.output.priority} />
            <p>{demoAiRun.output.rationale}</p>
            <p className="legal-copy">
              AI output is advisory only. Deterministic safety rules and licensed clinician judgment override it.
            </p>
          </article>
        </div>
      </section>

      <section className="grid-two">
        <article className="panel">
          <p className="eyebrow">Scores</p>
          <h2>Screening results</h2>
          <ul className="clean-list">
            {demoScores.map((score) => (
              <li key={score.id}>
                <strong>
                  {score.label} <StatusBadge value={score.severity} tone={score.severity === "significant" ? "warn" : "info"} />
                </strong>
                <span>{score.summary}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <p className="eyebrow">Risk Protocol</p>
          <h2>Safety flags</h2>
          {demoRiskFlags.length ? (
            <ul className="clean-list">
              {demoRiskFlags.map((flag) => (
                <li key={flag.id}>
                  <strong>
                    <StatusBadge value={flag.severity} /> {flag.source.replaceAll("_", " ")}
                  </strong>
                  <span>{flag.message}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No deterministic crisis flag is present in this demo case.</p>
          )}
        </article>
      </section>

      <section className="panel" aria-labelledby="review-actions-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Reviewer Decision</p>
            <h2 id="review-actions-title">Approve packet or request more information</h2>
          </div>
          <StatusBadge value={demoClinicianReview.outcome} tone="good" />
        </div>
        <div className="grid-two">
          <div>
            <h3>Reviewer notes</h3>
            <p>{demoClinicianReview.reviewerNotes}</p>
          </div>
          <div>
            <h3>Documents reviewed</h3>
            <ul className="clean-list">
              {demoUploadedDocuments.map((document) => (
                <li key={document.id}>
                  <strong>{document.fileName}</strong>
                  <span>{document.category.replaceAll("_", " ")}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="hero-actions">
          <button className="button button-primary" type="button">
            Approve packet
          </button>
          <button className="button button-secondary" type="button">
            Request more documents
          </button>
          <Link className="button button-secondary" href="/student/share">
            View student sharing
          </Link>
        </div>
      </section>

      <TriagePacketCard packet={demoPacket} audience="clinician" />
    </AppShell>
  );
}
