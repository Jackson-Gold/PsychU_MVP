import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";
import {
  demoAiRun,
  demoCase,
  demoRiskFlags,
  demoScores,
  demoStudentProfile,
  demoUploadedDocuments
} from "@/lib/demo-data";

export default function ClinicianQueuePage() {
  const highestScore = Math.max(...demoScores.map((score) => score.value));

  return (
    <AppShell active="/clinician/queue">
      <section className="panel" aria-labelledby="queue-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">PsychU Clinician Portal</p>
            <h1 id="queue-title">Review queue</h1>
          </div>
          <StatusBadge value={demoAiRun.output.priority} />
        </div>

        <div className="metric-grid">
          <MetricCard label="Open cases" value="1" detail="Pilot seeded state" />
          <MetricCard label="Urgent flags" value={demoRiskFlags.length} detail="Deterministic safety rules" />
          <MetricCard label="Max score" value={highestScore} detail="Screening average out of 4" />
        </div>
      </section>

      <section className="panel" aria-labelledby="queue-table-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Cases</p>
            <h2 id="queue-table-title">Needs clinician review</h2>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Status</th>
              <th>AI suggestion</th>
              <th>Docs</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>{demoStudentProfile.preferredName}</strong>
                <br />
                {demoCase.currentSummary}
              </td>
              <td>
                <StatusBadge value={demoCase.status} />
              </td>
              <td>
                <StatusBadge value={demoAiRun.output.priority} />
                <br />
                {demoAiRun.output.rationale}
              </td>
              <td>{demoUploadedDocuments.length} uploaded</td>
              <td>
                <Link className="button button-primary" href={`/clinician/cases/${demoCase.id}`}>
                  Review case
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </AppShell>
  );
}
