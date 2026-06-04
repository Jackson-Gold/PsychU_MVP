import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ClinicianReviewForm } from "@/components/clinician-review-form";
import { StatusBadge } from "@/components/status-badge";
import { requireRoles } from "@/lib/auth";
import {
  formatAnswer,
  mapAssessmentModule,
  mapAssessmentResponse,
  mapCase,
  mapClinicianReview,
  mapRiskFlag,
  mapScore,
  mapStudentProfile
} from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ClinicianCasePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClinicianCasePage({ params }: ClinicianCasePageProps) {
  await requireRoles(["psychu_clinician", "psychu_admin"]);
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: caseRow } = await supabase.from("cases").select("*").eq("id", id).maybeSingle();
  if (!caseRow) notFound();

  const caseRecord = mapCase(caseRow);
  const [
    { data: profileRow },
    { data: moduleRows },
    { data: responseRows },
    { data: scoreRows },
    { data: riskRows },
    { data: documentRows },
    { data: reviewRows }
  ] = await Promise.all([
    supabase.from("student_profiles").select("*").eq("user_id", caseRecord.studentUserId).maybeSingle(),
    supabase.from("assessment_modules").select("*").order("created_at"),
    supabase.from("assessment_responses").select("*").eq("case_id", id).order("completed_at"),
    supabase.from("scores").select("*").eq("case_id", id).order("created_at"),
    supabase.from("risk_flags").select("*").eq("case_id", id).order("created_at", { ascending: false }),
    supabase.from("uploaded_documents").select("*").eq("case_id", id).order("created_at"),
    supabase.from("clinician_reviews").select("*").eq("case_id", id).order("updated_at", { ascending: false })
  ]);

  const profile = profileRow ? mapStudentProfile(profileRow) : null;
  const modules = (moduleRows ?? []).map(mapAssessmentModule);
  const responses = (responseRows ?? []).map(mapAssessmentResponse);
  const scores = (scoreRows ?? []).map(mapScore);
  const riskFlags = (riskRows ?? []).map(mapRiskFlag);
  const review = reviewRows?.[0] ? mapClinicianReview(reviewRows[0]) : null;
  const moduleById = new Map(modules.map((module) => [module.id, module]));

  return (
    <AppShell active="/clinician/queue">
      <section className="panel" aria-labelledby="review-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Clinician Review</p>
            <h1 id="review-title">{profile?.preferredName ?? "Student"}&apos;s case</h1>
            <p className="section-intro">{caseRecord.nextStep ?? "Review the submitted information and choose a next step."}</p>
          </div>
          <StatusBadge value={caseRecord.status} />
        </div>

        <div className="grid-two">
          <article>
            <h2>Case summary</h2>
            <p>{caseRecord.currentSummary}</p>
            <ul className="clean-list">
              <li>
                <strong>Submitted</strong>
                <span>{caseRecord.submittedAt ? new Date(caseRecord.submittedAt).toLocaleString() : "Not recorded"}</span>
              </li>
              <li>
                <strong>Student program</strong>
                <span>{profile ? `${profile.yearInSchool}${profile.major ? `, ${profile.major}` : ""}` : "Not provided"}</span>
              </li>
            </ul>
          </article>
          <article>
            <h2>Documents</h2>
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
              <p>No documents have been uploaded.</p>
            )}
          </article>
        </div>
      </section>

      <section className="grid-two">
        <article className="panel">
          <p className="eyebrow">Scores</p>
          <h2>Questionnaire results</h2>
          {scores.length ? (
            <ul className="clean-list">
              {scores.map((score) => (
                <li key={score.id}>
                  <strong>
                    {score.label}{" "}
                    <StatusBadge
                      value={score.severity}
                      tone={["moderately_severe", "severe", "significant"].includes(score.severity) ? "warn" : "info"}
                    />
                  </strong>
                  <span>
                    {score.value}
                    {score.maxValue ? ` / ${score.maxValue}` : ""}. {score.summary}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No scores are available yet.</p>
          )}
        </article>

        <article className="panel">
          <p className="eyebrow">Risk Protocol</p>
          <h2>Safety flags</h2>
          {riskFlags.length ? (
            <ul className="clean-list">
              {riskFlags.map((flag) => (
                <li key={flag.id}>
                  <strong>
                    <StatusBadge value={flag.severity} /> {flag.source.replaceAll("_", " ")}
                  </strong>
                  <span>{flag.message}</span>
                  <span>{flag.resolvedAt ? `Resolved ${new Date(flag.resolvedAt).toLocaleString()}` : "Unresolved"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No deterministic safety flag is present.</p>
          )}
        </article>
      </section>

      <section className="panel" aria-labelledby="responses-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Submitted Answers</p>
            <h2 id="responses-title">Questionnaire responses</h2>
          </div>
          <StatusBadge value={`${responses.length} modules`} tone="info" />
        </div>

        <div className="response-stack">
          {responses.map((response) => {
            const assessmentModule = moduleById.get(response.moduleId);
            return (
              <details className="response-module" key={response.id}>
                <summary>
                  <strong>{assessmentModule?.title ?? response.moduleId}</strong>
                  <span>{new Date(response.completedAt).toLocaleString()}</span>
                </summary>
                <dl className="answer-list">
                  {assessmentModule?.questions.map((question) => (
                    <div key={question.id}>
                      <dt>{question.label}</dt>
                      <dd>{formatAnswer(response.answers[question.id])}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            );
          })}
        </div>
      </section>

      <section className="panel" aria-labelledby="review-actions-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Reviewer Decision</p>
            <h2 id="review-actions-title">Notes, outcome, and status</h2>
          </div>
          <StatusBadge value={review?.outcome ?? "draft"} tone="good" />
        </div>
        <ClinicianReviewForm caseRecord={caseRecord} review={review} />
      </section>
    </AppShell>
  );
}
