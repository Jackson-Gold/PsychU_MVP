import { AdminSaveButton } from "@/components/admin-save-button";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";
import {
  syncAssessmentCatalog,
  updateAssessmentModule,
  updateAssessmentResponse,
  updateCase,
  updateClinicianReview,
  updateMembership,
  updateRiskFlag,
  updateScore,
  updateUserProfile
} from "@/app/admin/forms/actions";
import { requireRoles } from "@/lib/auth";
import {
  caseStatuses,
  riskSeverities,
  roles,
  triageOutcomes
} from "@/lib/domain";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminFormsPage() {
  await requireRoles(["psychu_admin"]);
  const supabase = await createSupabaseServerClient();

  const [
    { data: users },
    { data: memberships },
    { data: cases },
    { data: modules },
    { data: responses },
    { data: scores },
    { data: riskFlags },
    { data: reviews },
    { data: auditLogs }
  ] = await Promise.all([
    supabase.from("user_profiles").select("*").order("created_at"),
    supabase.from("memberships").select("*").order("created_at"),
    supabase.from("cases").select("*").order("updated_at", { ascending: false }),
    supabase.from("assessment_modules").select("*").order("created_at"),
    supabase.from("assessment_responses").select("*").order("completed_at", { ascending: false }),
    supabase.from("scores").select("*").order("created_at", { ascending: false }),
    supabase.from("risk_flags").select("*").order("created_at", { ascending: false }),
    supabase.from("clinician_reviews").select("*").order("updated_at", { ascending: false }),
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100)
  ]);

  const userById = new Map((users ?? []).map((user) => [user.user_id, user]));
  const clinicianIds = new Set(
    (memberships ?? [])
      .filter((membership) => membership.role === "psychu_clinician")
      .map((membership) => membership.user_id)
  );

  return (
    <AppShell active="/admin/forms">
      <section className="panel" aria-labelledby="admin-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">PsychU Admin</p>
            <h1 id="admin-title">MVP control center</h1>
          </div>
          <StatusBadge value="audit logged" tone="good" />
        </div>
        <p>
          Admins can manually correct the MVP records below. Every save creates an audit event. Audit logs are
          intentionally read-only.
        </p>
        <div className="metric-grid">
          <MetricCard label="Users" value={users?.length ?? 0} detail="Public user profiles" />
          <MetricCard label="Cases" value={cases?.length ?? 0} detail="All student cases" />
          <MetricCard label="Audit events" value={auditLogs?.length ?? 0} detail="Most recent 100 events" />
        </div>
        <form action={syncAssessmentCatalog}>
          <button className="button button-secondary" type="submit">
            Sync supplied questionnaire catalog
          </button>
        </form>
      </section>

      <AdminSection eyebrow="Access Control" title="Users and roles">
        <div className="admin-card-grid">
          {(users ?? []).map((user) => (
            <article className="admin-card" key={user.user_id}>
              <form action={updateUserProfile}>
                <input type="hidden" name="user_id" value={user.user_id} />
                <div className="field-row">
                  <label htmlFor={`user-name-${user.user_id}`}>Full name</label>
                  <input id={`user-name-${user.user_id}`} name="full_name" defaultValue={user.full_name} required />
                </div>
                <p className="field-help">{user.email}</p>
                <AdminSaveButton label="Save name" />
              </form>
              {(memberships ?? [])
                .filter((membership) => membership.user_id === user.user_id)
                .map((membership) => (
                  <form action={updateMembership} key={membership.id}>
                    <input type="hidden" name="membership_id" value={membership.id} />
                    <div className="field-row">
                      <label htmlFor={`role-${membership.id}`}>Role</label>
                      <select id={`role-${membership.id}`} name="role" defaultValue={membership.role}>
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <AdminSaveButton label="Save role" />
                  </form>
                ))}
            </article>
          ))}
        </div>
      </AdminSection>

      <AdminSection eyebrow="Workflow" title="Cases and clinician assignments">
        <div className="admin-card-grid">
          {(cases ?? []).map((caseRecord) => (
            <form className="admin-card" action={updateCase} key={caseRecord.id}>
              <input type="hidden" name="case_id" value={caseRecord.id} />
              <strong>{userById.get(caseRecord.student_user_id)?.full_name ?? caseRecord.student_user_id}</strong>
              <div className="field-row">
                <label htmlFor={`case-status-${caseRecord.id}`}>Status</label>
                <select id={`case-status-${caseRecord.id}`} name="status" defaultValue={caseRecord.status}>
                  {caseStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-row">
                <label htmlFor={`case-clinician-${caseRecord.id}`}>Assigned clinician</label>
                <select
                  id={`case-clinician-${caseRecord.id}`}
                  name="assigned_clinician_user_id"
                  defaultValue={caseRecord.assigned_clinician_user_id ?? ""}
                >
                  <option value="">Unassigned</option>
                  {[...clinicianIds].map((clinicianId) => (
                    <option key={clinicianId} value={clinicianId}>
                      {userById.get(clinicianId)?.full_name ?? clinicianId}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-row">
                <label htmlFor={`case-summary-${caseRecord.id}`}>Summary</label>
                <textarea id={`case-summary-${caseRecord.id}`} name="current_summary" rows={4} defaultValue={caseRecord.current_summary} />
              </div>
              <div className="field-row">
                <label htmlFor={`case-next-${caseRecord.id}`}>Next step</label>
                <textarea id={`case-next-${caseRecord.id}`} name="next_step" rows={3} defaultValue={caseRecord.next_step ?? ""} />
              </div>
              <AdminSaveButton />
            </form>
          ))}
        </div>
      </AdminSection>

      <AdminSection eyebrow="Questionnaires" title="Definitions and scoring configuration">
        <p className="legal-copy">
          PHQ-9 and GAD-7 remain marked as pending final permitted-use verification before real student launch.
        </p>
        <div className="admin-stack">
          {(modules ?? []).map((module) => (
            <form className="admin-card" action={updateAssessmentModule} key={module.id}>
              <input type="hidden" name="module_id" value={module.id} />
              <div className="grid-three">
                <div className="field-row">
                  <label htmlFor={`module-title-${module.id}`}>Title</label>
                  <input id={`module-title-${module.id}`} name="title" defaultValue={module.title} required />
                </div>
                <div className="field-row">
                  <label htmlFor={`module-status-${module.id}`}>Status</label>
                  <select id={`module-status-${module.id}`} name="status" defaultValue={module.status}>
                    <option value="draft">draft</option>
                    <option value="active">active</option>
                    <option value="retired">retired</option>
                  </select>
                </div>
                <div className="field-row">
                  <label htmlFor={`module-license-${module.id}`}>License status</label>
                  <select id={`module-license-${module.id}`} name="license_status" defaultValue={module.license_status}>
                    <option value="custom">custom</option>
                    <option value="public_domain_verified">public domain verified</option>
                    <option value="licensed_pending">licensed pending</option>
                    <option value="licensed_verified">licensed verified</option>
                  </select>
                </div>
              </div>
              <div className="grid-two">
                <div className="field-row">
                  <label htmlFor={`module-questions-${module.id}`}>Questions JSON</label>
                  <textarea
                    className="code-field"
                    id={`module-questions-${module.id}`}
                    name="questions"
                    rows={12}
                    defaultValue={JSON.stringify(module.questions, null, 2)}
                  />
                </div>
                <div className="field-row">
                  <label htmlFor={`module-scoring-${module.id}`}>Scoring configuration JSON</label>
                  <textarea
                    className="code-field"
                    id={`module-scoring-${module.id}`}
                    name="scoring_config"
                    rows={12}
                    defaultValue={JSON.stringify(module.scoring_config ?? {}, null, 2)}
                  />
                </div>
              </div>
              <AdminSaveButton />
            </form>
          ))}
        </div>
      </AdminSection>

      <AdminSection eyebrow="Submitted Data" title="Responses and calculated scores">
        <div className="admin-stack">
          {(responses ?? []).map((response) => (
            <form className="admin-card" action={updateAssessmentResponse} key={response.id}>
              <input type="hidden" name="response_id" value={response.id} />
              <strong>Response {response.id}</strong>
              <p className="field-help">Case {response.case_id} · Module {response.module_id}</p>
              <div className="field-row">
                <label htmlFor={`response-answers-${response.id}`}>Answers JSON</label>
                <textarea
                  className="code-field"
                  id={`response-answers-${response.id}`}
                  name="answers"
                  rows={10}
                  defaultValue={JSON.stringify(response.answers, null, 2)}
                />
              </div>
              <AdminSaveButton />
            </form>
          ))}
          {(scores ?? []).map((score) => (
            <form className="admin-card" action={updateScore} key={score.id}>
              <input type="hidden" name="score_id" value={score.id} />
              <strong>{score.label}</strong>
              <div className="grid-three">
                <div className="field-row">
                  <label htmlFor={`score-value-${score.id}`}>Value</label>
                  <input id={`score-value-${score.id}`} name="value" type="number" step="0.01" min="0" defaultValue={score.value} />
                </div>
                <div className="field-row">
                  <label htmlFor={`score-max-${score.id}`}>Maximum</label>
                  <input id={`score-max-${score.id}`} name="max_value" type="number" step="0.01" min="0" defaultValue={score.max_value ?? 0} />
                </div>
                <div className="field-row">
                  <label htmlFor={`score-severity-${score.id}`}>Severity</label>
                  <select id={`score-severity-${score.id}`} name="severity" defaultValue={score.severity}>
                    {["minimal", "mild", "moderate", "moderately_severe", "significant", "severe", "review_required"].map(
                      (severity) => (
                        <option key={severity} value={severity}>
                          {severity.replaceAll("_", " ")}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
              <div className="field-row">
                <label htmlFor={`score-interpretation-${score.id}`}>Interpretation</label>
                <textarea id={`score-interpretation-${score.id}`} name="interpretation" rows={2} defaultValue={score.interpretation ?? ""} />
              </div>
              <div className="field-row">
                <label htmlFor={`score-summary-${score.id}`}>Summary</label>
                <textarea id={`score-summary-${score.id}`} name="summary" rows={3} defaultValue={score.summary} />
              </div>
              <AdminSaveButton />
            </form>
          ))}
        </div>
      </AdminSection>

      <AdminSection eyebrow="Clinical Controls" title="Risk flags and clinician notes">
        <div className="admin-stack">
          {(riskFlags ?? []).map((flag) => (
            <form className="admin-card" action={updateRiskFlag} key={flag.id}>
              <input type="hidden" name="risk_flag_id" value={flag.id} />
              <strong>Risk flag {flag.id}</strong>
              <div className="grid-two">
                <div className="field-row">
                  <label htmlFor={`risk-severity-${flag.id}`}>Severity</label>
                  <select id={`risk-severity-${flag.id}`} name="severity" defaultValue={flag.severity}>
                    {riskSeverities.map((severity) => (
                      <option key={severity} value={severity}>
                        {severity}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field-row">
                  <label htmlFor={`risk-resolved-${flag.id}`}>Resolved</label>
                  <select id={`risk-resolved-${flag.id}`} name="resolved" defaultValue={flag.resolved_at ? "true" : "false"}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>
              <div className="field-row">
                <label htmlFor={`risk-message-${flag.id}`}>Message</label>
                <textarea id={`risk-message-${flag.id}`} name="message" rows={4} defaultValue={flag.message} />
              </div>
              <AdminSaveButton />
            </form>
          ))}
          {(reviews ?? []).map((review) => (
            <form className="admin-card" action={updateClinicianReview} key={review.id}>
              <input type="hidden" name="review_id" value={review.id} />
              <strong>Clinician review {review.id}</strong>
              <div className="grid-two">
                <div className="field-row">
                  <label htmlFor={`review-status-${review.id}`}>Status</label>
                  <select id={`review-status-${review.id}`} name="status" defaultValue={review.status}>
                    <option value="draft">draft</option>
                    <option value="approved">approved</option>
                  </select>
                </div>
                <div className="field-row">
                  <label htmlFor={`review-outcome-${review.id}`}>Outcome</label>
                  <select id={`review-outcome-${review.id}`} name="outcome" defaultValue={review.outcome}>
                    {triageOutcomes.map((outcome) => (
                      <option key={outcome} value={outcome}>
                        {outcome.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field-row">
                <label htmlFor={`review-notes-${review.id}`}>Reviewer notes</label>
                <textarea id={`review-notes-${review.id}`} name="reviewer_notes" rows={4} defaultValue={review.reviewer_notes} />
              </div>
              <div className="field-row">
                <label htmlFor={`review-summary-${review.id}`}>Student-facing summary</label>
                <textarea
                  id={`review-summary-${review.id}`}
                  name="student_facing_summary"
                  rows={4}
                  defaultValue={review.student_facing_summary}
                />
              </div>
              <AdminSaveButton />
            </form>
          ))}
        </div>
      </AdminSection>

      <AdminSection eyebrow="Audit Trail" title="Recent admin and workflow events">
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>Target</th>
              <th>Actor</th>
              <th>Metadata</th>
            </tr>
          </thead>
          <tbody>
            {(auditLogs ?? []).map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.created_at).toLocaleString()}</td>
                <td>{log.action}</td>
                <td>
                  {log.target_type} {log.target_id}
                </td>
                <td>{userById.get(log.actor_user_id)?.full_name ?? log.actor_user_id ?? "system"}</td>
                <td>
                  <code>{JSON.stringify(log.metadata)}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminSection>
    </AppShell>
  );
}
function AdminSection({
  eyebrow,
  title,
  children
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  const id = title.toLowerCase().replaceAll(" ", "-");

  return (
    <section className="panel" aria-labelledby={id}>
      <div className="panel-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={id}>{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}
