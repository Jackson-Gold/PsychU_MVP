import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";
import {
  demoCase,
  demoConsentVersions,
  demoNotifications,
  demoStudentProfile,
  demoUploadedDocuments
} from "@/lib/demo-data";

export default function StudentDashboardPage() {
  return (
    <AppShell active="/student">
      <section className="panel" aria-labelledby="student-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Student Portal</p>
            <h1 id="student-title">Welcome back, {demoStudentProfile.preferredName}</h1>
          </div>
          <StatusBadge value={demoCase.status} />
        </div>

        <div className="metric-grid">
          <MetricCard label="Case status" value={demoCase.status.replaceAll("_", " ")} detail={demoCase.nextStep ?? "Draft in progress"} />
          <MetricCard label="Documents" value={demoUploadedDocuments.length} detail="Private until you share a packet" />
          <MetricCard label="Notifications" value={demoNotifications.length} detail="Review and next-step updates" />
        </div>
      </section>

      <section className="grid-two">
        <article className="panel">
          <p className="eyebrow">Next Action</p>
          <h2>Review your case details</h2>
          <p>
            Continue the screening workflow, verify consent, check uploaded documentation, and confirm that the
            case is ready for PsychU clinician review.
          </p>
          <Link className="button button-primary" href="/student/case">
            Open screening case
          </Link>
        </article>

        <article className="panel">
          <p className="eyebrow">Sharing Control</p>
          <h2>You decide what leaves PsychU</h2>
          <p>
            Your reviewed packet is not automatically sent to the university. You can grant portal access or export
            a reviewed PDF after clinician approval.
          </p>
          <Link className="button button-secondary" href="/student/share">
            Manage sharing
          </Link>
        </article>
      </section>

      <section className="panel" aria-labelledby="consents-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Legal Gates</p>
            <h2 id="consents-title">Counsel-approved documents before launch</h2>
          </div>
        </div>
        <ul className="clean-list">
          {demoConsentVersions.map((consent) => (
            <li key={consent.id}>
              <strong>
                {consent.title} <StatusBadge value={consent.version} tone="warn" />
              </strong>
              <span>{consent.body}</span>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
