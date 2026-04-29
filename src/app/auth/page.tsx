import { AppShell } from "@/components/app-shell";
import { MagicLinkForm } from "@/app/auth/magic-link-form";

export default function AuthPage() {
  return (
    <AppShell>
      <MagicLinkForm />
    </AppShell>
  );
}
