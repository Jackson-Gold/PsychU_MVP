import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";
import { requireRoles } from "@/lib/auth";
import { mapCase, mapScore } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ClinicianQueuePage() {
  const context = await requireRoles(["psychu_clinician", "psychu_admin"]);
  const supabase = await createSupabaseServerClient();
  const isAdmin = context.roles.includes("psychu_admin");

  let casesQuery = supabase
    .from("cases")
    .select("*")
    .neq("status", "draft")
    .order("submitted_at", { ascending: false });

  if (!isAdmin) {
    casesQuery = casesQuery.eq("assigned_clinician_user_id", context.user.id);
  }

  const { data: caseRows } = await casesQuery;
  const cases = (caseRows ?? []).map(mapCase);
  const caseIds = cases.map((caseRecord) => caseRecord.id);
  const studentIds = cases.map((caseRecord) => caseRecord.studentUserId);

  const [{ data: profileRows }, { data: scoreRows }, { data: riskRows }, { data: responseRows }] = await Promise.all([
    studentIds.length
      ? supabase.from("student_profiles").select("user_id,preferred_name").in("user_id", studentIds)
      : Promise.resolve({ data: [] }),
    caseIds.length
      ? supabase.from("scores").select("*").in("case_id", caseIds)
      : Promise.resolve({ data: [] }),
    caseIds.length
      ? supabase.from("risk_flags").select("case_id,severity,resolved_at").in("case_id", caseIds)
      : Promise.resolve({ data: [] }),
    caseIds.length
      ? supabase.from("assessment_responses").select("case_id").in("case_id", caseIds)
      : Promise.resolve({ data: [] })
  ]);

  const profiles = new Map((profileRows ?? []).map((profile) => [profile.user_id, profile.preferred_name]));
  const scores = (scoreRows ?? []).map(mapScore);
  const urgentCount = (riskRows ?? []).filter(
    (flag) => !flag.resolved_at && ["high", "critical"].includes(flag.severity)
  ).length;
  const maxScore = scores.length ? Math.max(...scores.map((score) => score.value)) : 0;

  return (
    <AppShell active="/clinician/queue">
      <section className="panel" aria-labelledby="queue-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">PsychU Clinician Portal</p>
            <h1 id="queue-title">{isAdmin ? "All submitted cases" : "Your assigned review queue"}</h1>
          </div>
          <StatusBadge value={isAdmin ? "admin view" : "assignment scoped"} tone="info" />
        </div>

        <div className="metric-grid">
          <MetricCard label="Open cases" value={cases.length} detail="Submitted cases visible to this account" />
          <MetricCard label="Urgent flags" value={urgentCount} detail="Unresolved deterministic safety flags" />
          <MetricCard label="Highest total" value={maxScore} detail="Across visible scored questionnaires" />
        </div>
      </section>

      <section className="panel" aria-labelledby="queue-table-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Cases</p>
            <h2 id="queue-table-title">Needs clinician review</h2>
          </div>
        </div>
        {cases.length ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Status</th>
                <th>Questionnaires</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((caseRecord) => (
                <tr key={caseRecord.id}>
                  <td>
                    <strong>{profiles.get(caseRecord.studentUserId) ?? "Student"}</strong>
                    <br />
                    {caseRecord.currentSummary}
                  </td>
                  <td>
                    <StatusBadge value={caseRecord.status} />
                  </td>
                  <td>{(responseRows ?? []).filter((response) => response.case_id === caseRecord.id).length} submitted</td>
                  <td>{caseRecord.submittedAt ? new Date(caseRecord.submittedAt).toLocaleString() : "Not recorded"}</td>
                  <td>
                    <Link className="button button-primary" href={`/clinician/cases/${caseRecord.id}`}>
                      Review case
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No submitted cases are currently assigned to this account.</p>
        )}
      </section>
    </AppShell>
  );
}
