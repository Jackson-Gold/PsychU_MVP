import Link from "next/link";
import { AppShell } from "@/components/app-shell";

const heroPills = ["Two-week turnaround", "100% virtual", "Clinician-signed report", "Built for students"];

const howItWorks = [
  {
    title: "Online forms",
    detail: "Complete a few quick, frictionless questionnaires online — at your own pace, on any device."
  },
  {
    title: "Meet with a clinician",
    detail: "Connect virtually with a clinician for your evaluation. No travel, no long clinic waitlists."
  },
  {
    title: "Get your report",
    detail:
      "Receive an evaluation report with a treatment plan and recommendations to get the supports you need for school and daily life."
  }
];

const included = [
  {
    title: "Comprehensive evaluation report",
    detail: "Outlines your strengths, weaknesses, and tailored recommendations."
  },
  {
    title: "Clinical diagnoses",
    detail:
      "Identifies disorders such as ADHD, learning disorders, executive functioning, anxiety, and depression."
  },
  {
    title: "Treatment plan",
    detail: "Medical, psychological, and academic recommendations, which may include:",
    bullets: [
      "Referrals for targeted therapies",
      "Medication assessment referrals",
      "Testing and other academic accommodations"
    ]
  }
];

const founders = [
  {
    name: "Elizabeth Amador",
    role: "CEO & Co-Founder",
    bio: "Strategic ops and mental-health innovator (Northwestern MBA / MA in Psychology)."
  },
  {
    name: "Jodi Gold, MD",
    role: "Chief Clinical Officer & Co-Founder",
    bio: "Nationally recognized, board-certified child and adolescent psychiatrist."
  },
  {
    name: "Richard Keeling, MD",
    role: "VP, Institutional Relationships & Co-Founder",
    bio: "30+ years advising U.S. universities on student health and disability resources."
  },
  {
    name: "Jackson Gold, M.S.",
    role: "Co-Founder, Chief Technology Officer & Distinguished Architect of Digital Sorcery",
    bio: "Master's-degree-wielding full-stack polymath who bends databases, pixels, and large language models to his will — and reliably converts espresso into production-grade software."
  }
];

export default function HomePage() {
  return (
    <AppShell active="/">
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-grid" aria-hidden="true" />
        <div className="landing-hero-copy">
          <span className="hero-chip">
            <span className="hero-chip-dot" aria-hidden="true" />
            Neuropsychological evaluations
          </span>
          <h1 id="landing-title">
            Neuropsychological evaluations for college and grad students with a{" "}
            <span className="hero-accent">two-week turnaround</span>.
          </h1>
          <p className="hero-lede">
            A clinical assessment that maps how a person thinks, learns, and processes — a critical step in acquiring
            the psychological and academic support you need.
          </p>
          <div className="hero-actions">
            <Link className="button button-glow button-lg" href="/student/case">
              Get Started
            </Link>
            <Link className="button button-ghost button-lg" href="#how">
              How it works
            </Link>
          </div>
          <ul className="hero-pills" aria-label="What to expect">
            {heroPills.map((pill, index) => (
              <li key={pill}>
                <span className="hero-pill-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {pill}
              </li>
            ))}
          </ul>
        </div>

        <div className="landing-hero-visual" aria-hidden="true">
          <div className="hero-stage">
            <div className="hero-orb" />
            <svg className="hero-wire" viewBox="0 0 100 100">
              <line x1="27" y1="27" x2="50" y2="50" />
              <line x1="71" y1="50" x2="50" y2="50" />
              <line x1="33" y1="75" x2="50" y2="50" />
              <circle className="hero-wire-glow" cx="27" cy="27" r="3" />
              <circle className="hero-wire-glow" cx="71" cy="50" r="3" />
              <circle className="hero-wire-glow" cx="33" cy="75" r="3" />
              <circle cx="27" cy="27" r="1.5" />
              <circle cx="71" cy="50" r="1.5" />
              <circle cx="33" cy="75" r="1.5" />
            </svg>
            <div className="hero-prism">
              <span className="prism-shard" />
              <span className="prism-shard" />
              <span className="prism-shard" />
              <span className="prism-shard" />
              <span className="prism-shard" />
            </div>
            <span className="hero-node hero-node-1">Online forms</span>
            <span className="hero-node hero-node-2">Clinician</span>
            <span className="hero-node hero-node-3">Report</span>
          </div>
        </div>
      </section>

      <section id="how" aria-labelledby="how-title">
        <div className="section-head">
          <p className="eyebrow">How it works</p>
          <h2 id="how-title">Three simple steps to your evaluation</h2>
        </div>
        <ol className="pipeline">
          {howItWorks.map((step, index) => (
            <li key={step.title}>
              <span className="pipeline-index">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{step.title}</strong>
                <span>{step.detail}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="included" aria-labelledby="included-title">
        <div className="section-head">
          <p className="eyebrow">What you get</p>
          <h2 id="included-title">A clear picture of how you think, learn, and process</h2>
          <p>Your evaluation is a critical step toward the right support. It includes:</p>
        </div>
        <div className="audience-grid">
          {included.map((item) => (
            <article className="audience-card" key={item.title}>
              <h3>{item.title}</h3>
              <p className="included-detail">{item.detail}</p>
              {item.bullets ? (
                <ul>
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section id="team" aria-labelledby="team-title">
        <div className="section-head">
          <p className="eyebrow">Meet the team</p>
          <h2 id="team-title">Founders behind Synaptec</h2>
          <p>Clinical depth, institutional reach, and the engineering to make it effortless.</p>
        </div>
        <div className="founder-grid">
          {founders.map((person) => (
            <article className="founder-card" key={person.name}>
              <span className="founder-avatar" aria-hidden="true">
                {person.name
                  .replace(/,.*$/, "")
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")}
              </span>
              <h3>{person.name}</h3>
              <p className="founder-role">{person.role}</p>
              <p className="founder-bio">{person.bio}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-banner cta-banner-final" aria-labelledby="final-cta-title">
        <div className="cta-banner-copy">
          <h2 id="final-cta-title">Get the supports you need for school and daily life.</h2>
          <p>
            Questions? Reach Elizabeth Amador, CEO &amp; Co-founder, at{" "}
            <a href="mailto:eamador@getsynaptec.com">eamador@getsynaptec.com</a> or{" "}
            <a href="tel:+19179221976">+1.917.922.1976</a>.
          </p>
        </div>
        <Link className="button button-glow button-lg" href="/student/case">
          Get Started
        </Link>
      </section>
    </AppShell>
  );
}
