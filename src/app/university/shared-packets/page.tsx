import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { TriagePacketCard } from "@/components/triage-packet-card";
import { requireRoles } from "@/lib/auth";
import { mapShareGrant, mapTriagePacket } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redactPacketForUniversity } from "@/lib/workflows";

export default async function UniversitySharedPacketsPage() {
  const context = await requireRoles(["university_staff", "university_admin", "psychu_admin"]);
  const supabase = await createSupabaseServerClient();

  const orgIds = [
    ...new Set(
      context.memberships
        .filter((membership) => ["university_staff", "university_admin"].includes(membership.role))
        .map((membership) => membership.organizationId)
    )
  ];

  const nowIso = new Date().toISOString();
  const { data: grantRows } = orgIds.length
    ? await supabase
        .from("share_grants")
        .select("*")
        .in("organization_id", orgIds)
        .eq("status", "active")
        .order("created_at", { ascending: false })
    : { data: [] };

  const grants = (grantRows ?? [])
    .map(mapShareGrant)
    .filter((grant) => !grant.expiresAt || grant.expiresAt > nowIso);

  const packetIds = [...new Set(grants.map((grant) => grant.packetId))];
  const { data: packetRows } = packetIds.length
    ? await supabase.from("triage_packets").select("*").in("id", packetIds)
    : { data: [] };

  const packetsById = new Map(
    (packetRows ?? []).map((row) => {
      const packet = redactPacketForUniversity(mapTriagePacket(row));
      return [packet.id, packet];
    })
  );

  const releases = grants
    .map((grant) => ({ grant, packet: packetsById.get(grant.packetId) }))
    .filter((release): release is { grant: (typeof grants)[number]; packet: NonNullable<ReturnType<typeof mapTriagePacket>> } =>
      Boolean(release.packet)
    );

  return (
    <AppShell active="/university/shared-packets">
      <section className="panel" aria-labelledby="shared-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Shared Packets</p>
            <h1 id="shared-title">Student-approved releases</h1>
          </div>
          <StatusBadge value={`${releases.length} active`} tone="info" />
        </div>
        <p>
          You can only view packets a student has explicitly released to your organization. Access is role-checked,
          tenant-scoped, expirable, revocable by the student, and audited.
        </p>
      </section>

      {releases.length ? (
        <>
          <section className="panel" aria-labelledby="shared-list-title">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Portal Access</p>
                <h2 id="shared-list-title">Available packets</h2>
              </div>
            </div>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Case reference</th>
                    <th>Packet</th>
                    <th>Shared</th>
                    <th>Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {releases.map(({ grant, packet }) => (
                    <tr key={grant.id}>
                      <td className="compact-id">{packet.caseId}</td>
                      <td>v{packet.version}</td>
                      <td>{new Date(grant.createdAt).toLocaleDateString()}</td>
                      <td>{grant.expiresAt ? new Date(grant.expiresAt).toLocaleDateString() : "No expiry"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {releases.map(({ grant, packet }) => (
            <TriagePacketCard key={grant.id} packet={packet} audience="university" />
          ))}
        </>
      ) : (
        <section className="panel">
          <div className="empty-state">
            <strong>No packets have been shared with you yet</strong>
            <span>
              When a student releases a clinician-reviewed packet to your accessibility office, it will appear here.
            </span>
          </div>
        </section>
      )}
    </AppShell>
  );
}
