import Link from "next/link";
import { DemoModeNotice } from "@/components/demo-mode-notice";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/student", label: "Student" },
  { href: "/clinician/queue", label: "Clinician" },
  { href: "/university/invites", label: "University" },
  { href: "/admin/forms", label: "Admin" }
];

type AppShellProps = {
  children: React.ReactNode;
  active?: string;
};

export function AppShell({ children, active }: AppShellProps) {
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
