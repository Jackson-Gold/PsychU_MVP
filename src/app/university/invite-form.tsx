"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { createInvite, type InviteActionState } from "@/app/university/actions";

const initialState: InviteActionState = { status: "idle", message: "" };

export function InviteForm({ organizationId }: { organizationId: string }) {
  const [state, formAction] = useActionState(createInvite, initialState);

  return (
    <form className="screening-form" action={formAction}>
      <input type="hidden" name="organization_id" value={organizationId} />
      <div className="grid-three">
        <div className="field-row">
          <label htmlFor="invite-email">Email address</label>
          <input id="invite-email" name="email" type="email" placeholder="student@university.edu" required />
        </div>
        <div className="field-row">
          <label htmlFor="invite-role">Role</label>
          <select id="invite-role" name="role" defaultValue="student">
            <option value="student">Student</option>
            <option value="university_staff">University staff</option>
            <option value="university_admin">University admin</option>
          </select>
        </div>
        <div className="field-row">
          <label htmlFor="invite-note">Internal note</label>
          <input id="invite-note" name="note" type="text" placeholder="Pilot cohort or reason" />
        </div>
      </div>
      <SubmitButton label="Create invite" pendingLabel="Creating..." />
      {state.message ? (
        <p className={state.status === "error" ? "form-message form-message-error" : "form-message"} role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
