import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";
import { TakeAssessmentCta } from "@/components/take-assessment-cta";
import { requireRoles } from "@/lib/auth";
import { mapCase, mapStudentProfile } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function StudentDashboardPage() {
  const context = await requireRoles(["student"]);
  const supabase = await createSupabaseServerClient();

  const [
    { data: caseRow },
    { data: profileRow },
    { count: documentCount },
    { count: notificationCount },
    { count: moduleCount }
  ] =
    await Promise.all([
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
        .from("uploaded_documents")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("notifications")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("assessment_modules")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
    ]);

  const caseRecord = caseRow ? mapCase(caseRow) : null;
  const profile = profileRow ? mapStudentProfile(profileRow) : null;
  const { count: responseCount } = caseRecord
    ? await supabase
        .from("assessment_responses")
        .select("*", { count: "exact", head: true })
        .eq("case_id", caseRecord.id)
    : { count: 0 };
  const completedCount = responseCount ?? 0;
  const totalCount = moduleCount ?? 0;

  return (
    <AppShell active="/student">
      <section className="panel" aria-labelledby="student-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Student Portal</p>
            <h1 id="student-title">Welcome back, {profile?.preferredName ?? context.user.fullName}</h1>
            <p className="section-intro">{caseRecord?.nextStep ?? "Ask Synaptec to assign a screening case."}</p>
          </div>
          <StatusBadge value={caseRecord?.status ?? "no case"} />
        </div>

        <div className="metric-grid">
          <MetricCard
            label="Questionnaires"
            value={`${completedCount}/${totalCount}`}
            detail={completedCount === totalCount && totalCount > 0 ? "All forms submitted" : "Complete at your own pace"}
          />
          <MetricCard label="Documents" value={documentCount ?? 0} detail="Private until you share a reviewed packet" />
          <MetricCard
            label="Notifications"
            value={notificationCount ?? 0}
            detail="Review and next-step updates"
            href="/notifications"
          />
        </div>
      </section>

      <section className="grid-two">
        <article className="panel action-card">
          <p className="eyebrow">Next Action</p>
          <h2>{completedCount ? "Continue your questionnaires" : "Start your questionnaires"}</h2>
          <p>
            Save each form separately. Your case moves to neuropsychologist review after the Synaptec intake, PHQ-9, and
            GAD-7 are submitted.
          </p>
          <TakeAssessmentCta
            label={completedCount ? "Continue your assessment" : "Take an Assessment"}
          />
        </article>

        <article className="panel action-card">
          <p className="eyebrow">Sharing Control</p>
          <h2>You decide what leaves Synaptec</h2>
          <p>
            Your reviewed packet is not automatically sent to the university. You can grant portal access after
            clinician approval.
          </p>
          <Link className="button button-secondary" href="/student/share">
            Manage sharing
          </Link>
        </article>
      </section>
    </AppShell>
  );
}
