"use client";

import { useState } from "react";

const accommodationOptions = [
  "Graduate school exams (MCAT, LSAT, GRE, GMAT, Bar)",
  "College / university coursework & extended time",
  "ADHD / learning disability diagnosis"
];

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [zip, setZip] = useState("");
  const [accommodation, setAccommodation] = useState(accommodationOptions[0]);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="waitlist-success" role="status">
        <span className="waitlist-check" aria-hidden="true">
          ✓
        </span>
        <div>
          <strong>You&apos;re on the priority list.</strong>
          <p>
            We&apos;ll email <span className="waitlist-email">{email || "you"}</span> the moment booking opens for the
            launch cohort. Watch for your priority spot and your free Accommodation Cheat Sheet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form className="waitlist-form" onSubmit={handleSubmit} aria-label="Join the priority waitlist">
      <div className="waitlist-fields">
        <div className="field-row">
          <label htmlFor="waitlist-email">Email address</label>
          <input
            id="waitlist-email"
            name="email"
            type="email"
            required
            placeholder="you@school.edu"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <p className="field-help">Use your .edu address if you have one.</p>
        </div>

        <div className="field-row">
          <label htmlFor="waitlist-zip">Zip code</label>
          <input
            id="waitlist-zip"
            name="zip"
            inputMode="numeric"
            pattern="[0-9]{5}"
            maxLength={5}
            required
            placeholder="10007"
            autoComplete="postal-code"
            value={zip}
            onChange={(event) => setZip(event.target.value.replace(/[^0-9]/g, ""))}
          />
          <p className="field-help">We prioritize launching where waitlist demand is highest.</p>
        </div>

        <div className="field-row">
          <label htmlFor="waitlist-need">What are you seeking accommodations for?</label>
          <select
            id="waitlist-need"
            name="accommodation"
            value={accommodation}
            onChange={(event) => setAccommodation(event.target.value)}
          >
            {accommodationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button className="button button-glow button-lg" type="submit">
        Join the Priority Waitlist
      </button>
      <p className="field-help">No spam. We&apos;ll only email you about launch timing and your priority spot.</p>
    </form>
  );
}
