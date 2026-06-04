import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { TriagePacketCard } from "@/components/triage-packet-card";
import { ShareControls } from "@/app/student/share/share-controls";
import { requireRoles } from "@/lib/auth";
import { mapCase, mapShareGrant, mapTriagePacket } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function StudentSharePage() {
  const context = await requireRoles(["student"]);
  const supabase = await createSupabaseServerClient();

  const { data: caseRow } = await supabase
    .from("cases")
    .select("*")
    .eq("student_user_id", context.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const caseRecord = caseRow ? mapCase(caseRow) : null;

  const { data: packetRows } = caseRecord
    ? await supabase
        .from("triage_packets")
        .select("*")
        .eq("case_id", caseRecord.id)
        .order("version", { ascending: false })
    : { data: [] };

  const packet = packetRows?.[0] ? mapTriagePacket(packetRows[0]) : null;

  const { data: grantRows } = packet
    ? await supabase
        .from("share_grants")
        .select("*")
        .eq("packet_id", packet.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const grants = (grantRows ?? []).map(mapShareGrant);
  const activeGrant = grants.find((grant) => grant.status === "active") ?? null;

  const { data: orgRow } = caseRecord
    ? await supabase
        .from("organizations")
        .select("name")
        .eq("id", caseRecord.organizationId)
        .maybeSingle()
    : { data: null };
  const universityName = orgRow?.name ?? "your university accessibility office";

  return (
    <AppShell active="/student/share">
      <section className="panel" aria-labelledby="share-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Student-Controlled Sharing</p>
            <h1 id="share-title">Release only what you approve</h1>
          </div>
          <StatusBadge value={activeGrant ? "active" : "not shared"} />
        </div>
        <p>
          Your questionnaire responses and clinician notes are never sent to a university automatically. Sharing
          becomes available after a clinician approves a reviewed packet, and you can revoke access at any time.
        </p>
      </section>

      {packet ? (
        <>
          <TriagePacketCard packet={packet} audience="student" />

          <section className="panel" aria-labelledby="share-controls-title">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Sharing Controls</p>
                <h2 id="share-controls-title">
                  {activeGrant ? "Manage university access" : "Share this reviewed packet"}
                </h2>
              </div>
              {activeGrant?.expiresAt ? (
                <StatusBadge value={`expires ${new Date(activeGrant.expiresAt).toLocaleDateString()}`} tone="info" />
              ) : null}
            </div>
            <ShareControls
              packetId={packet.id}
              activeGrantId={activeGrant?.id ?? null}
              universityName={universityName}
            />
          </section>
        </>
      ) : (
        <section className="panel">
          <p className="eyebrow">Not Ready Yet</p>
          <h2>No reviewed packet is available</h2>
          <p>
            Complete your questionnaires and wait for your assigned clinician to finish review before sharing.
          </p>
        </section>
      )}
    </AppShell>
  );
}
