import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";
import { requireRoles } from "@/lib/auth";
import { mapCase, mapStudentProfile } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function StudentDashboardPage() {
  const context = await requireRoles(["student"]);
  const supabase = await createSupabaseServerClient();

  const [{ data: caseRow }, { data: profileRow }, { count: documentCount }, { count: notificationCount }] =
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
        .select("*", { count: "exact", head: true })
    ]);

  const caseRecord = caseRow ? mapCase(caseRow) : null;
  const profile = profileRow ? mapStudentProfile(profileRow) : null;

  return (
    <AppShell active="/student">
      <section className="panel" aria-labelledby="student-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Student Portal</p>
            <h1 id="student-title">Welcome back, {profile?.preferredName ?? context.user.fullName}</h1>
          </div>
          <StatusBadge value={caseRecord?.status ?? "no case"} />
        </div>

        <div className="metric-grid">
          <MetricCard
            label="Case status"
            value={(caseRecord?.status ?? "not started").replaceAll("_", " ")}
            detail={caseRecord?.nextStep ?? "Ask PsychU to assign a case"}
          />
          <MetricCard label="Documents" value={documentCount ?? 0} detail="Private until you share a reviewed packet" />
          <MetricCard label="Notifications" value={notificationCount ?? 0} detail="Review and next-step updates" />
        </div>
      </section>

      <section className="grid-two">
        <article className="panel">
          <p className="eyebrow">Next Action</p>
          <h2>Complete your questionnaires</h2>
          <p>
            Fill out the NeuropsychU intake, PHQ-9, and GAD-7. Your submitted answers go to your assigned clinician.
          </p>
          <Link className="button button-primary" href="/student/case">
            Open questionnaires
          </Link>
        </article>

        <article className="panel">
          <p className="eyebrow">Sharing Control</p>
          <h2>You decide what leaves PsychU</h2>
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
