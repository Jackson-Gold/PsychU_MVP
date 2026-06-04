"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { acceptConsents, type ConsentActionState } from "@/app/student/case/actions";
import type { ConsentRecord } from "@/lib/consent";

const initialState: ConsentActionState = { status: "idle", message: "" };

export function ConsentGate({ consents }: { consents: ConsentRecord[] }) {
  const [state, formAction] = useActionState(acceptConsents, initialState);

  return (
    <form className="screening-form" action={formAction}>
      <div className="questionnaire-sections">
        {consents.map((consent) => (
          <details className="question-section" key={consent.id} open={consents.length === 1}>
            <summary>
              <span>
                <strong>{consent.title}</strong>
                <small>Version {consent.version}</small>
              </span>
              <span className="summary-chevron" aria-hidden="true">
                +
              </span>
            </summary>
            <div className="form-card">
              <p>{consent.body}</p>
            </div>
          </details>
        ))}
      </div>

      {consents.map((consent) => (
        <input key={consent.id} type="hidden" name="consent_version_id" value={consent.id} />
      ))}

      <label className="field-row" style={{ flexDirection: "row", alignItems: "flex-start", gap: "10px" }}>
        <input type="checkbox" name="agree" style={{ width: "auto", marginTop: "0.3em" }} />
        <span>I have read and agree to the consent forms above.</span>
      </label>

      <SubmitButton label="Agree and continue" pendingLabel="Saving..." />
      {state.message ? (
        <p className={state.status === "error" ? "form-message form-message-error" : "form-message"} role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
