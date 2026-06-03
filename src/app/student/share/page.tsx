import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { requireRoles } from "@/lib/auth";
import { mapCase } from "@/lib/data";
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
    ? await supabase.from("triage_packets").select("*").eq("case_id", caseRecord.id).order("version", { ascending: false })
    : { data: [] };
  const packet = packetRows?.[0];
  const { data: grantRows } = packet
    ? await supabase.from("share_grants").select("*").eq("packet_id", packet.id).order("created_at", { ascending: false })
    : { data: [] };

  return (
    <AppShell active="/student/share">
      <section className="panel" aria-labelledby="share-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Student-Controlled Sharing</p>
            <h1 id="share-title">Release only what you approve</h1>
          </div>
          <StatusBadge value={grantRows?.[0]?.status ?? "not shared"} />
        </div>
        <p>
          Your questionnaire responses and clinician notes are not automatically sent to a university. Sharing
          becomes available after a clinician approves a reviewed packet.
        </p>
      </section>

      {packet ? (
        <section className="panel" aria-labelledby="packet-title">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Reviewed Packet</p>
              <h2 id="packet-title">Triage packet v{packet.version}</h2>
            </div>
            <StatusBadge value={caseRecord?.status ?? "packet ready"} />
          </div>
          <p>{packet.student_summary}</p>
          <p className="legal-copy">{packet.legal_disclaimer}</p>
          <p className="field-help">
            Portal grant and PDF export controls remain part of the next sharing implementation pass.
          </p>
        </section>
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
