"use client";

import { useActionState } from "react";
import {
  saveClinicianReview,
  type ClinicianReviewState
} from "@/app/clinician/cases/[id]/actions";
import {
  caseStatuses,
  triageOutcomes,
  type ClinicianReview,
  type PsychuCase
} from "@/lib/domain";

type ClinicianReviewFormProps = {
  caseRecord: PsychuCase;
  review: ClinicianReview | null;
};

const initialState: ClinicianReviewState = {
  status: "idle",
  message: "Save notes, next steps, and the case status as the review progresses."
};

export function ClinicianReviewForm({ caseRecord, review }: ClinicianReviewFormProps) {
  const [state, formAction, pending] = useActionState(saveClinicianReview, initialState);

  return (
    <form className="screening-form" action={formAction}>
      <input type="hidden" name="case_id" value={caseRecord.id} />
      <input type="hidden" name="review_id" value={review?.id ?? ""} />

      <div className="grid-two">
        <div className="field-row">
          <label htmlFor="case-status">Case status</label>
          <select id="case-status" name="case_status" defaultValue={caseRecord.status}>
            {caseStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="field-row">
          <label htmlFor="review-outcome">Triage outcome</label>
          <select id="review-outcome" name="outcome" defaultValue={review?.outcome ?? "schedule_psychu_review"}>
            {triageOutcomes.map((outcome) => (
              <option key={outcome} value={outcome}>
                {outcome.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-row">
        <label htmlFor="reviewer-notes">Reviewer notes</label>
        <textarea id="reviewer-notes" name="reviewer_notes" rows={6} defaultValue={review?.reviewerNotes ?? ""} />
      </div>

      <div className="field-row">
        <label htmlFor="student-facing-summary">Student-facing summary</label>
        <textarea
          id="student-facing-summary"
          name="student_facing_summary"
          rows={5}
          defaultValue={review?.studentFacingSummary ?? ""}
        />
      </div>

      <div className="field-row">
        <label htmlFor="requested-documents">Requested documents, one per line</label>
        <textarea
          id="requested-documents"
          name="requested_documents"
          rows={4}
          defaultValue={review?.requestedDocuments.join("\n") ?? ""}
        />
      </div>

      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save clinician review"}
      </button>
      <p className={state.status === "error" ? "form-message form-message-error" : "form-message"} role="status">
        {state.message}
      </p>
    </form>
  );
}

