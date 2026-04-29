import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { TriagePacketCard } from "@/components/triage-packet-card";
import { demoOrganizations, demoPacket, demoShareGrant } from "@/lib/demo-data";

export default function StudentSharePage() {
  const university = demoOrganizations.find((organization) => organization.id === demoShareGrant.organizationId);

  return (
    <AppShell active="/student">
      <section className="panel" aria-labelledby="share-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Student-Controlled Sharing</p>
            <h1 id="share-title">Release only what you approve</h1>
          </div>
          <StatusBadge value={demoShareGrant.status} />
        </div>
        <p>
          The secure portal share is active for {university?.name}. Every view is audited. PDF export is available
          only for clinician-approved packets and includes the non-diagnostic disclaimer.
        </p>
        <div className="hero-actions">
          <button className="button button-primary" type="button">
            Grant portal access
          </button>
          <button className="button button-secondary" type="button">
            Export reviewed PDF
          </button>
          <button className="button button-danger" type="button">
            Revoke share
          </button>
        </div>
      </section>

      <TriagePacketCard packet={demoPacket} audience="student" />
    </AppShell>
  );
}
