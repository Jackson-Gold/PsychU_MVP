"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import {
  revokeShare,
  shareWithUniversity,
  type ShareActionState
} from "@/app/student/share/actions";

const initialState: ShareActionState = { status: "idle", message: "" };

type ShareControlsProps = {
  packetId: string;
  activeGrantId: string | null;
  universityName: string;
};

export function ShareControls({ packetId, activeGrantId, universityName }: ShareControlsProps) {
  const [shareState, shareAction] = useActionState(shareWithUniversity, initialState);
  const [revokeState, revokeAction] = useActionState(revokeShare, initialState);
  const message = activeGrantId ? revokeState : shareState;

  if (activeGrantId) {
    return (
      <form className="screening-form" action={revokeAction}>
        <input type="hidden" name="grant_id" value={activeGrantId} />
        <p>
          This packet is currently shared with <strong>{universityName}</strong>. You can revoke access at any time.
        </p>
        <SubmitButton label="Revoke university access" pendingLabel="Revoking..." className="button button-danger" />
        {message.message ? (
          <p
            className={message.status === "error" ? "form-message form-message-error" : "form-message"}
            role="status"
          >
            {message.message}
          </p>
        ) : null}
      </form>
    );
  }

  return (
    <form className="screening-form" action={shareAction}>
      <input type="hidden" name="packet_id" value={packetId} />
      <div className="field-row">
        <label htmlFor="expires-in-days">Automatically expire access</label>
        <select id="expires-in-days" name="expires_in_days" defaultValue="90">
          <option value="0">No automatic expiry</option>
          <option value="30">In 30 days</option>
          <option value="90">In 90 days</option>
          <option value="180">In 180 days</option>
        </select>
        <p className="field-help">
          You can revoke access manually at any time, regardless of the expiry you choose.
        </p>
      </div>
      <SubmitButton label={`Share packet with ${universityName}`} pendingLabel="Sharing..." />
      {message.message ? (
        <p className={message.status === "error" ? "form-message form-message-error" : "form-message"} role="status">
          {message.message}
        </p>
      ) : null}
    </form>
  );
}
