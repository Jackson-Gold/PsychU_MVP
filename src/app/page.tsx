import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { demoAssessmentModules, demoOrganizations } from "@/lib/demo-data";

const credibilityChips = [
  "FERPA-first architecture",
  "Postgres row-level security",
  "Immutable audit logs",
  "PHQ-9 & GAD-7 scoring",
  "988-aware safety flags",
  "Student-controlled release"
];

const capabilities = ["Screen", "Triage", "Approve", "Share"];

export default function HomePage() {
  const universityCount = demoOrganizations.filter((org) => org.type === "university").length;
  const screenerCount = demoAssessmentModules.length;

  return (
    <AppShell active="/">
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-grid" aria-hidden="true" />
        <div className="landing-hero-copy">
          <span className="hero-chip">
            <span className="hero-chip-dot" aria-hidden="true" />
            Accessibility screening, modernized
          </span>
          <h1 id="landing-title">
            The modern standard for student <span className="hero-accent">accessibility screening</span>
          </h1>
          <p className="hero-lede">
            PsychU turns scattered intake paperwork into a secure, clinician-governed pipeline: safety-aware
            screening, human triage with advisory AI, and student-controlled release to university teams.
          </p>
          <div className="hero-actions">
            <Link className="button button-glow" href="/student">
              Start student flow
            </Link>
            <Link className="button button-ghost" href="/clinician/queue">
              Open review queue
            </Link>
          </div>
          <ul className="hero-pills" aria-label="Platform capabilities">
            {capabilities.map((capability, index) => (
              <li key={capability}>
                <span className="hero-pill-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {capability}
              </li>
            ))}
          </ul>
        </div>

        <div className="landing-hero-visual" aria-hidden="true">
          <div className="hero-orb" />
          <div className="hero-prism">
            <span className="prism-shard" />
            <span className="prism-shard" />
            <span className="prism-shard" />
            <span className="prism-shard" />
            <span className="prism-shard" />
          </div>
          <div className="hero-node hero-node-1">Screening</div>
          <div className="hero-node hero-node-2">Clinician</div>
          <div className="hero-node hero-node-3">Packet</div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Engineering principles">
        <p className="trust-label">Engineered for trust</p>
        <ul>
          {credibilityChips.map((chip) => (
            <li key={chip}>{chip}</li>
          ))}
        </ul>
      </section>

      <section className="feature-grid" aria-labelledby="capabilities-title">
        <h2 id="capabilities-title" className="sr-only">
          Platform capabilities
        </h2>
        <article className="feature-card">
          <span className="feature-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" strokeLinejoin="round" />
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h3>Safety-aware screening</h3>
          <p>
            Adaptive, frictionless questionnaires score PHQ-9 and GAD-7 deterministically and raise 988-aware
            safety flags the instant a critical item is endorsed.
          </p>
        </article>
        <article className="feature-card">
          <span className="feature-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <circle cx="12" cy="8" r="3.2" />
              <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" strokeLinecap="round" />
            </svg>
          </span>
          <h3>Human triage, advisory AI</h3>
          <p>
            Clinicians review scores, documents, and deterministic flags alongside an advisory AI suggestion that
            never acts on its own. Every decision stays human-led.
          </p>
        </article>
        <article className="feature-card">
          <span className="feature-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <rect x="4" y="4" width="16" height="16" rx="4" />
              <path d="M8 12l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h3>Student-controlled release</h3>
          <p>
            A reviewed triage packet is released only when the student approves it — through the secure portal,
            revocable at any time, with every share written to the audit trail.
          </p>
        </article>
      </section>

      <section className="panel platform-panel" aria-labelledby="pipeline-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">End-to-end pipeline</p>
            <h2 id="pipeline-title">From first questionnaire to a packet they control</h2>
            <p className="section-intro">
              A launchable path designed for the first cohort of pilot schools — secure by default at every hop.
            </p>
          </div>
        </div>
        <ol className="pipeline">
          <li>
            <span className="pipeline-index">01</span>
            <div>
              <strong>Student intake &amp; screening</strong>
              <span>Invite, consent, profile, document upload, and safety-aware neuropsych screening.</span>
            </div>
          </li>
          <li>
            <span className="pipeline-index">02</span>
            <div>
              <strong>PsychU clinician review</strong>
              <span>Scores, files, deterministic flags, and advisory AI triage before any approval.</span>
            </div>
          </li>
          <li>
            <span className="pipeline-index">03</span>
            <div>
              <strong>Student-controlled sharing</strong>
              <span>The reviewed packet reaches university teams only when the student releases it.</span>
            </div>
          </li>
        </ol>
      </section>

      <section className="platform-grid" aria-labelledby="explore-title">
        <h2 id="explore-title" className="sr-only">
          Explore the platform
        </h2>
        <Link className="platform-tile" href="/student">
          <span className="platform-tile-meta">Students</span>
          <strong>Complete screening</strong>
          <span className="platform-tile-copy">Frictionless, mobile-first questionnaires with instant scoring.</span>
          <span className="platform-tile-go" aria-hidden="true">→</span>
        </Link>
        <Link className="platform-tile" href="/clinician/queue">
          <span className="platform-tile-meta">Clinicians</span>
          <strong>Review queue</strong>
          <span className="platform-tile-copy">Triage assigned cases with scores, flags, and advisory AI.</span>
          <span className="platform-tile-go" aria-hidden="true">→</span>
        </Link>
        <Link className="platform-tile" href="/university/shared-packets">
          <span className="platform-tile-meta">Universities</span>
          <strong>Shared packets</strong>
          <span className="platform-tile-copy">Receive only what {universityCount}+ pilot students choose to release.</span>
          <span className="platform-tile-go" aria-hidden="true">→</span>
        </Link>
        <Link className="platform-tile" href="/admin/forms">
          <span className="platform-tile-meta">PsychU admin</span>
          <strong>Control center</strong>
          <span className="platform-tile-copy">Manage {screenerCount} screeners, roles, cases, and audit trail.</span>
          <span className="platform-tile-go" aria-hidden="true">→</span>
        </Link>
      </section>
    </AppShell>
  );
}
