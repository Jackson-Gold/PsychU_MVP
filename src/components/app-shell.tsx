import Link from "next/link";
import { DemoModeNotice } from "@/components/demo-mode-notice";
import { SynaptecMark } from "@/components/synaptec-mark";
import { TakeAssessmentCta } from "@/components/take-assessment-cta";
import { signOut } from "@/app/auth/actions";
import { getAuthContext, landingPageForRoles } from "@/lib/auth";
import { roleLabel, type Role } from "@/lib/domain";

type AppShellProps = {
  children: React.ReactNode;
  active?: string;
};

export async function AppShell({ children, active }: AppShellProps) {
  const context = await getAuthContext();
  const navItems = navigationForRoles(context?.roles ?? []);
  const homeHref = context ? landingPageForRoles(context.roles) : "/";

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="site-header">
        <Link className="brand-lockup" href={homeHref} aria-label="Synaptec home">
          <SynaptecMark size={58} className="brand-mark-svg" />
          <span>
            <span className="eyebrow">Neuropsych evaluations</span>
            <strong className="brand-wordmark">synaptec</strong>
          </span>
        </Link>
        <div className="header-actions">
          {context ? (
            <TakeAssessmentCta size="sm" className="header-cta" />
          ) : (
            <TakeAssessmentCta size="sm" className="header-cta" href="/student/case" label="Get Started" />
          )}
          <nav aria-label="Primary navigation">
            <ul className="nav-list">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    className={active === item.href ? "nav-link nav-link-active" : "nav-link"}
                    href={item.href}
                    aria-current={active === item.href ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {context ? (
            <div className="account-menu">
              <span className="account-copy">
                <strong>{context.user.fullName}</strong>
                <small>{roleLabel(context.roles[0])}</small>
              </span>
              <form action={signOut}>
                <button className="nav-link nav-button" type="submit">
                  Sign out
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </header>
      <DemoModeNotice />
      <main id="main-content" className="main-content">
        {children}
      </main>
    </div>
  );
}

function navigationForRoles(roles: Role[]) {
  const items: { href: string; label: string }[] = [];

  if (roles.includes("student")) {
    items.push(
      { href: "/student", label: "Home" },
      { href: "/student/case", label: "Questionnaires" },
      { href: "/student/share", label: "Sharing" }
    );
  }

  if (roles.includes("psychu_clinician") || roles.includes("psychu_admin")) {
    items.push({ href: "/clinician/queue", label: "Review queue" });
  }

  if (roles.includes("psychu_admin")) {
    items.push({ href: "/admin/forms", label: "Admin tools" });
  }

  if (roles.includes("university_admin")) {
    items.push(
      { href: "/university/shared-packets", label: "Shared packets" },
      { href: "/university/invites", label: "Invites" }
    );
  } else if (roles.includes("university_staff")) {
    items.push({ href: "/university/shared-packets", label: "Shared packets" });
  }

  if (roles.length) {
    items.push({ href: "/notifications", label: "Notifications" });
  } else {
    items.push({ href: "/", label: "Overview" }, { href: "/auth", label: "Sign in" });
  }

  return items;
}
