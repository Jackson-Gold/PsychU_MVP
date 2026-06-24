import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { WaitlistForm } from "@/components/waitlist-form";

const heroPills = ["15-day evaluation", "100% virtual", "Clinician-signed", "Launching Fall 2026"];

const problemStats = [
  { value: "5–18 mo", label: "Typical waitlist", detail: "Students lose an entire semester — or longer — before a single test is run." },
  { value: "$4,500", label: "Average cost", detail: "Price barriers put evaluations out of reach for thousands of students." },
  { value: "$30k+", label: "Tuition at risk", detail: "Missing an accommodation deadline can delay a degree and career by a year." },
  { value: "<6,000", label: "Neuropsychologists in the U.S.", detail: "A shrinking pool against 2M+ students who need an evaluation." }
];

const howItWorks = [
  {
    title: "Virtual testing",
    detail:
      "Complete your standardized testing battery remotely, proctored live by a trained psychometrist. No traveling to far-off clinics."
  },
  {
    title: "AI-assisted scribing",
    detail: "Our secure, clinical-grade AI drafts the massive, structured diagnostic report instantly."
  },
  {
    title: "Licensed neuropsychologist sign-off",
    detail:
      "A doctoral-level, licensed neuropsychologist reviews the data, makes the diagnosis, and signs your report — 100% compliant with university and testing-board (MCAT, LSAT) standards."
  }
];

const coFounders = [
  {
    name: "Elizabeth Amador",
    role: "Co-Founder & CEO",
    bio: "Strategic ops and mental-health innovator (Northwestern MBA / MA in Psychology)."
  },
  {
    name: "Richard Keeling, MD",
    role: "Co-Founder & VP, Institutional Relationships",
    bio: "30+ years advising U.S. universities on student health and disability resources."
  },
  {
    name: "Jodi Gold, MD",
    role: "Co-Founder & Chief Clinical Officer",
    bio: "Nationally recognized, board-certified child and adolescent psychiatrist."
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
            In development · Launching Fall 2026
          </span>
          <h1 id="landing-title">
            The waitlist for neuropsych testing is 6 months. We&apos;re launching a way to do it in{" "}
            <span className="hero-accent">15 days</span>.
          </h1>
          <p className="hero-lede">
            Synaptec is the first end-to-end virtual telehealth platform built specifically to solve the student
            accommodation crisis. Same clinical gold standard. 90% less wait time.
          </p>
          <div className="hero-actions">
            <Link className="button button-glow button-lg" href="#waitlist">
              Join the Priority Waitlist
            </Link>
            <Link className="button button-ghost button-lg" href="#how">
              See how it works
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
            <span className="hero-node hero-node-1">Virtual testing</span>
            <span className="hero-node hero-node-2">AI scribe</span>
            <span className="hero-node hero-node-3">NP sign-off</span>
          </div>
        </div>
      </section>

      <section id="waitlist" className="panel waitlist-panel" aria-labelledby="waitlist-title">
        <div className="waitlist-copy">
          <p className="eyebrow">Early access</p>
          <h2 id="waitlist-title">Join the waitlist to secure priority booking &amp; save your semester</h2>
          <p className="section-intro">
            Traditional waitlists will delay your accommodations. Secure your spot in our limited launch cohort today.
          </p>
        </div>
        <WaitlistForm />
      </section>

      <section id="why" aria-labelledby="why-title">
        <div className="section-head">
          <p className="eyebrow">Why we&apos;re building this</p>
          <h2 id="why-title">The system is broken. Students are paying the price.</h2>
          <p>
            Over 2 million higher-ed students need a neuropsychological evaluation to unlock the accommodations — like
            extended testing time or quiet rooms — they are legally entitled to. With fewer than 6,000
            neuropsychologists in the U.S., the bottlenecks are devastating.
          </p>
        </div>
        <div className="stat-grid">
          {problemStats.map((stat) => (
            <article className="stat-card" key={stat.label}>
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
              <span className="stat-detail">{stat.detail}</span>
            </article>
          ))}
        </div>
        <div className="cta-banner" aria-label="How Synaptec fixes it">
          <div className="cta-banner-copy">
            <h2>Synaptec is fixing this.</h2>
            <p>
              By automating clinical paperwork and using remote, psychometrist-led testing, we reduce the doctor&apos;s
              time per evaluation from 10 hours to 2 — increasing clinical throughput by 8× and taking wait times down
              from months to just 15 days.
            </p>
          </div>
          <Link className="button button-glow button-lg" href="#waitlist">
            Join the Priority Waitlist
          </Link>
        </div>
      </section>

      <section id="how" aria-labelledby="how-title">
        <div className="section-head">
          <p className="eyebrow">How it works (when we launch)</p>
          <h2 id="how-title">Same clinical standard. 8× faster.</h2>
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

      <section id="team" aria-labelledby="team-title">
        <div className="section-head">
          <p className="eyebrow">Trusted clinical leadership</p>
          <h2 id="team-title">Our co-founders</h2>
        </div>
        <div className="cofounder-grid">
          {coFounders.map((person) => (
            <article className="cofounder-card" key={person.name}>
              <span className="cofounder-avatar" aria-hidden="true">
                {person.name
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")}
              </span>
              <h3>{person.name}</h3>
              <p className="cofounder-role">{person.role}</p>
              <p className="cofounder-bio">{person.bio}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-banner cta-banner-final" aria-labelledby="final-cta-title">
        <div className="cta-banner-copy">
          <h2 id="final-cta-title">Be the first in line when we launch.</h2>
          <p>
            Are you an investor? Help us accelerate our launch — contact Elizabeth Amador at{" "}
            <a href="mailto:eamador@getsynaptec.com">eamador@getsynaptec.com</a>.
          </p>
        </div>
        <Link className="button button-glow button-lg" href="#waitlist">
          Join the Priority Waitlist
        </Link>
      </section>
    </AppShell>
  );
}
