import { AppShell } from "@/components/app-shell";
import { MagicLinkForm } from "@/app/auth/magic-link-form";
import { LoginForm } from "@/app/auth/login-form";
import { getAuthContext, landingPageForRoles } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthPage() {
  const context = await getAuthContext();
  if (context) redirect(landingPageForRoles(context.roles));

  return (
    <AppShell>
      <div className="auth-layout">
        <aside className="auth-welcome">
          <p className="eyebrow">Secure role-based access</p>
          <h1>One place for every step of the screening process.</h1>
          <p>
            Students complete assigned questionnaires, clinicians review submitted cases, and administrators manage
            the pilot from one connected workspace.
          </p>
          <ul className="check-list">
            <li>Private, assignment-scoped student records</li>
            <li>Immediate safety-aware screening behavior</li>
            <li>Audit-logged administrative controls</li>
          </ul>
        </aside>
        <div className="auth-access">
          <LoginForm />
          <details className="panel auth-secondary">
            <summary>
              <span>
                <strong>Use a magic link instead</strong>
                <small>For invited university accounts</small>
              </span>
              <span className="summary-chevron" aria-hidden="true">
                +
              </span>
            </summary>
            <MagicLinkForm />
          </details>
        </div>
      </div>
    </AppShell>
  );
}
