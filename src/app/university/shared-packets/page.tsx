import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { TriagePacketCard } from "@/components/triage-packet-card";
import { demoPacket, demoShareGrant, demoStudentProfile } from "@/lib/demo-data";
import { redactPacketForUniversity } from "@/lib/workflows";

export default function UniversitySharedPacketsPage() {
  const packet = redactPacketForUniversity(demoPacket);

  return (
    <AppShell active="/university/invites">
      <section className="panel" aria-labelledby="shared-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Shared Packets</p>
            <h1 id="shared-title">Student-approved releases</h1>
          </div>
          <StatusBadge value={demoShareGrant.status} />
        </div>
        <p>
          University staff can only view packets released by the student. Portal access is role-checked,
          tenant-scoped, expirable, revocable, and audited.
        </p>
      </section>

      <section className="panel" aria-labelledby="shared-list-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Portal Access</p>
            <h2 id="shared-list-title">Available packet</h2>
          </div>
          <StatusBadge value={demoStudentProfile.preferredName} tone="info" />
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Packet</th>
              <th>Share status</th>
              <th>Expires</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{demoStudentProfile.preferredName}</td>
              <td>{packet.id}</td>
              <td>
                <StatusBadge value={demoShareGrant.status} />
              </td>
              <td>{demoShareGrant.expiresAt}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <TriagePacketCard packet={packet} audience="university" />
    </AppShell>
  );
}
