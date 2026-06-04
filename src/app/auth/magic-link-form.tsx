"use client";

import { useActionState } from "react";
import { sendMagicLink, type MagicLinkState } from "@/app/auth/actions";

const initialState: MagicLinkState = {
  status: "idle",
  message: "Use the email address tied to your university invite."
};

export function MagicLinkForm() {
  const [state, formAction, pending] = useActionState(sendMagicLink, initialState);

  return (
    <form className="magic-link-form" action={formAction} aria-labelledby="magic-link-title">
      <p id="magic-link-title" className="field-help">
        Enter the email address tied to your university invitation.
      </p>
      <div className="field-row">
        <label htmlFor="magic-link-email">Email address</label>
        <input
          id="magic-link-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@university.edu"
        />
      </div>
      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send magic link"}
      </button>
      <p className={state.status === "error" ? "form-message form-message-error" : "form-message"} role="status">
        {state.message}
      </p>
    </form>
  );
}
