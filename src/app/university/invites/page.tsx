import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";
import { demoInvites, demoOrganizations } from "@/lib/demo-data";

export default function UniversityInvitesPage() {
  const university = demoOrganizations.find((organization) => organization.type === "university");

  return (
    <AppShell active="/university/invites">
      <section className="panel" aria-labelledby="invites-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">University Portal</p>
            <h1 id="invites-title">Invite students and staff</h1>
          </div>
          <StatusBadge value={university?.slug ?? "pilot"} tone="info" />
        </div>

        <div className="metric-grid">
          <MetricCard label="Tenant" value={university?.name ?? "Pilot university"} detail="FERPA-first B2B posture" />
          <MetricCard label="Pending invites" value={demoInvites.length} detail="Magic-link access model" />
          <MetricCard label="Retention" value={`${university?.retentionYears ?? 7}y`} detail="Tenant-configurable default" />
        </div>
      </section>

      <section className="panel" aria-labelledby="create-invite-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Access Control</p>
            <h2 id="create-invite-title">Create a magic-link invite</h2>
          </div>
        </div>
        <form className="grid-three">
          <div className="field-row">
            <label htmlFor="invite-email">Email address</label>
            <input id="invite-email" type="email" placeholder="student@university.edu" />
          </div>
          <div className="field-row">
            <label htmlFor="invite-role">Role</label>
            <select id="invite-role" defaultValue="student">
              <option value="student">Student</option>
              <option value="university_staff">University staff</option>
              <option value="university_admin">University admin</option>
            </select>
          </div>
          <div className="field-row">
            <label htmlFor="invite-note">Internal note</label>
            <input id="invite-note" type="text" placeholder="Pilot cohort or reason" />
          </div>
          <button className="button button-primary" type="button" disabled title="Invite sending is not enabled in this MVP">
            Invite sending not enabled
          </button>
        </form>
        <p className="field-help">
          This university invite form is a visual preview. It is disabled so it cannot appear to send an invitation
          when no invite action is connected.
        </p>
      </section>

      <section className="panel" aria-labelledby="pending-invites-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Audit Trail Ready</p>
            <h2 id="pending-invites-title">Pending invitations</h2>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Expires</th>
            </tr>
          </thead>
          <tbody>
            {demoInvites.map((invite) => (
              <tr key={invite.id}>
                <td>{invite.email}</td>
                <td>{invite.role.replaceAll("_", " ")}</td>
                <td>
                  <StatusBadge value={invite.status} tone="warn" />
                </td>
                <td>{invite.expiresAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AppShell>
  );
}
