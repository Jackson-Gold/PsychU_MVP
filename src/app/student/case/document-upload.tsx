"use client";

import { useActionState, useRef } from "react";
import { SubmitButton } from "@/components/submit-button";
import { uploadCaseDocument, type DocumentUploadState } from "@/app/student/case/actions";

const initialState: DocumentUploadState = { status: "idle", message: "" };

export function DocumentUpload({ caseId }: { caseId: string }) {
  const [state, formAction] = useActionState(uploadCaseDocument, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      className="screening-form"
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
    >
      <input type="hidden" name="case_id" value={caseId} />
      <div className="grid-two">
        <div className="field-row">
          <label htmlFor="document-category">Document type</label>
          <select id="document-category" name="category" defaultValue="prior_evaluation">
            <option value="prior_evaluation">Prior evaluation</option>
            <option value="iep_504">IEP or 504 plan</option>
            <option value="medical_note">Medical note</option>
            <option value="academic_record">Academic record</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="field-row">
          <label htmlFor="document-file">File (PDF or image, up to 15 MB)</label>
          <input
            id="document-file"
            name="file"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
            required
          />
        </div>
      </div>
      <SubmitButton label="Upload document" pendingLabel="Uploading..." className="button button-secondary" />
      {state.message ? (
        <p className={state.status === "error" ? "form-message form-message-error" : "form-message"} role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
