import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";
import { InviteForm } from "@/app/university/invite-form";
import { requireRoles } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function UniversityInvitesPage() {
  const context = await requireRoles(["university_admin", "psychu_admin"]);
  const supabase = await createSupabaseServerClient();

  const adminMembership = context.memberships.find((membership) => membership.role === "university_admin");

  let organizationId = adminMembership?.organizationId ?? null;

  if (!organizationId) {
    const { data: universityOrg } = await supabase
      .from("organizations")
      .select("id")
      .eq("type", "university")
      .order("created_at")
      .limit(1)
      .maybeSingle();
    organizationId = universityOrg?.id ?? null;
  }

  const { data: orgRow } = organizationId
    ? await supabase.from("organizations").select("name, slug, retention_years").eq("id", organizationId).maybeSingle()
    : { data: null };

  const { data: inviteRows } = organizationId
    ? await supabase
        .from("invites")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
    : { data: [] };

  const invites = inviteRows ?? [];
  const pendingCount = invites.filter((invite) => invite.status === "pending").length;

  return (
    <AppShell active="/university/invites">
      <section className="panel" aria-labelledby="invites-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">University Portal</p>
            <h1 id="invites-title">Invite students and staff</h1>
          </div>
          <StatusBadge value={orgRow?.slug ?? "pilot"} tone="info" />
        </div>

        <div className="metric-grid">
          <MetricCard label="Tenant" value={orgRow?.name ?? "Pilot university"} detail="FERPA-first B2B posture" />
          <MetricCard label="Pending invites" value={pendingCount} detail="Magic-link access model" />
          <MetricCard
            label="Retention"
            value={`${orgRow?.retention_years ?? 7}y`}
            detail="Tenant-configurable default"
          />
        </div>
      </section>

      <section className="panel" aria-labelledby="create-invite-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Access Control</p>
            <h2 id="create-invite-title">Create a magic-link invite</h2>
          </div>
        </div>
        {organizationId ? (
          <InviteForm organizationId={organizationId} />
        ) : (
          <div className="empty-state">
            <strong>No university organization is available</strong>
            <span>Ask a PsychU administrator to attach your account to a university tenant.</span>
          </div>
        )}
      </section>

      <section className="panel" aria-labelledby="pending-invites-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Audit Trail Ready</p>
            <h2 id="pending-invites-title">Invitations</h2>
          </div>
        </div>
        {invites.length ? (
          <div className="table-scroll">
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
                {invites.map((invite) => (
                  <tr key={String(invite.id)}>
                    <td>{String(invite.email)}</td>
                    <td>{String(invite.role).replaceAll("_", " ")}</td>
                    <td>
                      <StatusBadge
                        value={String(invite.status)}
                        tone={invite.status === "pending" ? "warn" : invite.status === "accepted" ? "good" : "neutral"}
                      />
                    </td>
                    <td>{new Date(String(invite.expires_at)).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <strong>No invitations yet</strong>
            <span>Invitations you create will appear here with their status and expiry.</span>
          </div>
        )}
      </section>
    </AppShell>
  );
}
