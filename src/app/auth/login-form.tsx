"use client";

import { useActionState, useState } from "react";
import {
  signInWithPassword,
  type PasswordLoginState
} from "@/app/auth/actions";

const initialState: PasswordLoginState = {
  status: "idle",
  message: "Choose a demo role below or enter your account credentials."
};

const demoAccounts = [
  { role: "Student", email: "student@example.com" },
  { role: "Neuropsychologist", email: "clinician@example.com" },
  { role: "Synaptec admin", email: "admin@example.com" }
];

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInWithPassword, initialState);
  const [email, setEmail] = useState("student@example.com");
  const [password, setPassword] = useState("PsychU-Demo-2026!");

  return (
    <section className="panel auth-panel" aria-labelledby="password-login-title">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Role-Based Access</p>
          <h1 id="password-login-title">Sign in to Synaptec</h1>
        </div>
      </div>

      <form className="screening-form" action={formAction}>
        <div className="field-row">
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="field-row">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <button className="button button-primary" type="submit" disabled={pending}>
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className={state.status === "error" ? "form-message form-message-error" : "form-message"} role="status">
        {state.message}
      </p>

      <div className="demo-account-grid" aria-label="Sample login choices">
        <p className="field-help">Demo accounts</p>
        {demoAccounts.map((account) => (
          <button
            className="demo-account"
            key={account.email}
            type="button"
            onClick={() => {
              setEmail(account.email);
              setPassword("PsychU-Demo-2026!");
            }}
          >
            <strong>{account.role}</strong>
            <span>{account.email}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
