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
    <form className="panel" action={formAction} aria-labelledby="magic-link-title">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Passwordless Access</p>
          <h1 id="magic-link-title">Sign in with a magic link</h1>
        </div>
      </div>
      <div className="field-row">
        <label htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@university.edu" />
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
