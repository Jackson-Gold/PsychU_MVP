import Link from "next/link";
import { DemoModeNotice } from "@/components/demo-mode-notice";
import { signOut } from "@/app/auth/actions";
import { getAuthContext } from "@/lib/auth";
import type { Role } from "@/lib/domain";

type AppShellProps = {
  children: React.ReactNode;
  active?: string;
};

export async function AppShell({ children, active }: AppShellProps) {
  const context = await getAuthContext();
  const navItems = navigationForRoles(context?.roles ?? []);

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="site-header">
        <Link className="brand-lockup" href="/" aria-label="PsychU MVP home">
          <span className="brand-mark" aria-hidden="true">
            PU
          </span>
          <span>
            <span className="eyebrow">PsychU</span>
            <strong>Screening MVP</strong>
          </span>
        </Link>
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
            {context ? (
              <li>
                <form action={signOut}>
                  <button className="nav-link nav-button" type="submit">
                    Sign out
                  </button>
                </form>
              </li>
            ) : null}
          </ul>
        </nav>
      </header>
      <DemoModeNotice />
      <main id="main-content" className="main-content">
        {children}
      </main>
    </div>
  );
}

function navigationForRoles(roles: Role[]) {
  const items = [{ href: "/", label: "Overview" }];

  if (roles.includes("student")) {
    items.push(
      { href: "/student", label: "Student" },
      { href: "/student/case", label: "Questionnaires" },
      { href: "/student/share", label: "Sharing" }
    );
  }

  if (roles.includes("psychu_clinician") || roles.includes("psychu_admin")) {
    items.push({ href: "/clinician/queue", label: "Clinician" });
  }

  if (roles.includes("psychu_admin")) {
    items.push({ href: "/admin/forms", label: "Admin" });
  }

  if (roles.includes("university_admin")) {
    items.push({ href: "/university/invites", label: "University" });
  } else if (roles.includes("university_staff")) {
    items.push({ href: "/university/shared-packets", label: "University" });
  }

  if (!roles.length) {
    items.push({ href: "/auth", label: "Sign in" });
  }

  return items;
}
