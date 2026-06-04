import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import {
  demoAssessmentModules,
  demoCase,
  demoInvites,
  demoOrganizations,
  demoPacket,
  demoShareGrant
} from "@/lib/demo-data";

export default function HomePage() {
  return (
    <AppShell active="/">
      <section className="hero">
        <div className="hero-card">
          <p className="eyebrow">Production-minded pilot MVP</p>
          <h1>Screen. Review. Share.</h1>
          <p>
            PsychU modernizes accessibility testing intake for college students: accessible screening, human
            clinician triage, secure packet approval, and student-controlled release to university teams.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/student">
              Start student flow
            </Link>
            <Link className="button button-secondary" href="/clinician/queue">
              Open review queue
            </Link>
          </div>
        </div>
        <aside className="hero-readiness" aria-labelledby="pilot-readiness-title">
          <div className="readiness-header">
            <p className="eyebrow">Pilot Readiness</p>
            <h2 id="pilot-readiness-title">Built for the first 1-3 schools</h2>
          </div>
          <div className="readiness-stats">
            <article>
              <span>Pilot schools</span>
              <strong>{demoOrganizations.filter((org) => org.type === "university").length}</strong>
              <small>B2B tenant model</small>
            </article>
            <article>
              <span>Screeners</span>
              <strong>{demoAssessmentModules.length}</strong>
              <small>MVP questionnaire catalog</small>
            </article>
            <article>
              <span>Retention</span>
              <strong>7y</strong>
              <small>Configurable default</small>
            </article>
          </div>
          <ol className="readiness-flow" aria-label="MVP workflow">
            <li>
              <span>01</span>
              Student completes intake and safety-aware screening.
            </li>
            <li>
              <span>02</span>
              PsychU clinician reviews scores, docs, and AI suggestion.
            </li>
            <li>
              <span>03</span>
              Student releases a reviewed packet when ready.
            </li>
          </ol>
        </aside>
      </section>

      <section className="panel" aria-labelledby="mvp-map-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">End-to-End Workflow</p>
            <h2 id="mvp-map-title">A launchable path through the pilot</h2>
          </div>
          <StatusBadge value={demoCase.status} />
        </div>
        <div className="grid-three">
          <article className="workflow-step">
            <strong>1. Student intake</strong>
            <span>Invite, consent, profile, documentation, core neuropsych screening, and safety checks.</span>
          </article>
          <article className="workflow-step">
            <strong>2. PsychU review</strong>
            <span>Clinicians see scores, files, deterministic flags, and advisory AI triage before approval.</span>
          </article>
          <article className="workflow-step">
            <strong>3. Student sharing</strong>
            <span>Packet v{demoPacket.version} is released through the secure portal only when the student approves.</span>
          </article>
        </div>
      </section>

      <section className="panel" aria-labelledby="controls-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Control Surface</p>
            <h2 id="controls-title">What is already represented</h2>
          </div>
          <StatusBadge value={demoShareGrant.status} />
        </div>
        <table className="data-table">
          <caption className="sr-only">MVP control surfaces and demo state</caption>
          <thead>
            <tr>
              <th>Area</th>
              <th>Demo state</th>
              <th>Route</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>University invites</td>
              <td>{demoInvites.length} pending invitations</td>
              <td>
                <Link href="/university/invites">Manage invites</Link>
              </td>
            </tr>
            <tr>
              <td>Clinician review</td>
              <td>Case assigned to PsychU clinician</td>
              <td>
                <Link href="/clinician/queue">Open assigned queue</Link>
              </td>
            </tr>
            <tr>
              <td>Assessment catalog</td>
              <td>Intake, PHQ-9, and GAD-7 with license review flags</td>
              <td>
                <Link href="/admin/forms">Admin forms</Link>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </AppShell>
  );
}
