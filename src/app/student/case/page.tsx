import { AppShell } from "@/components/app-shell";
import { QuestionnaireForm } from "@/components/questionnaire-form";
import { StatusBadge } from "@/components/status-badge";
import { requireRoles } from "@/lib/auth";
import {
  mapAssessmentModule,
  mapAssessmentResponse,
  mapCase,
  mapScore,
  mapStudentProfile
} from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function StudentCasePage() {
  const context = await requireRoles(["student"]);
  const supabase = await createSupabaseServerClient();

  const [{ data: caseRow }, { data: profileRow }, { data: moduleRows }] = await Promise.all([
    supabase
      .from("cases")
      .select("*")
      .eq("student_user_id", context.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", context.user.id)
      .maybeSingle(),
    supabase
      .from("assessment_modules")
      .select("*")
      .eq("status", "active")
      .order("created_at")
  ]);

  if (!caseRow) {
    return (
      <AppShell active="/student/case">
        <section className="panel">
          <p className="eyebrow">Student Questionnaires</p>
          <h1>No assigned case yet</h1>
          <p>Ask a PsychU administrator to create and assign a screening case for this account.</p>
        </section>
      </AppShell>
    );
  }

  const caseRecord = mapCase(caseRow);
  const profile = profileRow ? mapStudentProfile(profileRow) : null;
  const modules = (moduleRows ?? []).map(mapAssessmentModule);

  const [{ data: responseRows }, { data: scoreRows }, { data: documentRows }] = await Promise.all([
    supabase.from("assessment_responses").select("*").eq("case_id", caseRecord.id),
    supabase.from("scores").select("*").eq("case_id", caseRecord.id).order("created_at"),
    supabase.from("uploaded_documents").select("*").eq("case_id", caseRecord.id).order("created_at")
  ]);

  const responses = (responseRows ?? []).map(mapAssessmentResponse);
  const scores = (scoreRows ?? []).map(mapScore);

  return (
    <AppShell active="/student/case">
      <section className="panel" aria-labelledby="case-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Your active screening case</p>
            <h1 id="case-title">Screening and intake</h1>
            <p className="section-intro">{caseRecord.nextStep ?? "Complete your assigned questionnaires."}</p>
          </div>
          <StatusBadge value={caseRecord.status} />
        </div>

        <div className="grid-two">
          <div>
            <h2>Student profile</h2>
            <ul className="clean-list">
              <li>
                <strong>Name</strong>
                <span>{profile?.preferredName ?? context.user.fullName}</span>
              </li>
              <li>
                <strong>Program</strong>
                <span>
                  {profile?.yearInSchool ?? "Not provided"}
                  {profile?.major ? `, ${profile.major}` : ""}
                </span>
              </li>
              <li>
                <strong>Case reference</strong>
                <span className="compact-id">{caseRecord.id}</span>
              </li>
            </ul>
          </div>
          <div>
            <h2>Uploaded documents</h2>
            {documentRows?.length ? (
              <ul className="clean-list">
                {documentRows.map((document) => (
                  <li key={document.id}>
                    <strong>{document.file_name}</strong>
                    <span>{String(document.category).replaceAll("_", " ")}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No documents have been uploaded yet.</p>
            )}
          </div>
        </div>
      </section>

      <QuestionnaireForm caseId={caseRecord.id} modules={modules} responses={responses} />

      <section className="panel" aria-labelledby="submission-summary-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Submission Summary</p>
            <h2 id="submission-summary-title">Saved questionnaire totals</h2>
          </div>
          <StatusBadge value={`${responses.length} modules`} tone="info" />
        </div>
        <p className="legal-copy">
          Totals are shown for transparency, but severity and clinical meaning must be interpreted by your assigned
          clinician in context.
        </p>
        {scores.length ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Questionnaire</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score) => (
                <tr key={score.id}>
                  <td>{score.label}</td>
                  <td>
                    {score.value}
                    {score.maxValue ? ` / ${score.maxValue}` : ""}
                  </td>
                  <td>{score.severity === "review_required" ? "Clinician review required" : "Available to clinician"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No questionnaire totals are available until you submit the forms.</p>
        )}
      </section>
    </AppShell>
  );
}
