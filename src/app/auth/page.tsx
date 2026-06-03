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
      <div className="auth-grid">
        <LoginForm />
        <MagicLinkForm />
      </div>
    </AppShell>
  );
}
