"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { acceptConsents, type ConsentActionState } from "@/app/student/case/actions";
import type { ConsentRecord } from "@/lib/consent";

const initialState: ConsentActionState = { status: "idle", message: "" };

export function ConsentGate({ consents }: { consents: ConsentRecord[] }) {
  const [state, formAction] = useActionState(acceptConsents, initialState);

  return (
    <form className="consent-form" action={formAction}>
      <ul className="consent-list">
        {consents.map((consent) => (
          <li key={consent.id}>
            <details>
              <summary>
                <span className="consent-list-title">{consent.title}</span>
                <span className="consent-list-toggle">Read</span>
              </summary>
              <p className="consent-body">{consent.body}</p>
            </details>
            <input type="hidden" name="consent_version_id" value={consent.id} />
          </li>
        ))}
      </ul>

      <label className="consent-agree">
        <input type="checkbox" name="agree" />
        <span>I have read and agree to {consents.length === 1 ? "this form" : "all forms above"}.</span>
      </label>

      <SubmitButton label="Agree & unlock submitting" pendingLabel="Saving..." />
      {state.message ? (
        <p className={state.status === "error" ? "form-message form-message-error" : "form-message"} role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
