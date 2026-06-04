import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuestionnaireForm } from "@/components/questionnaire-form";
import { assessmentCatalog } from "@/lib/assessment-catalog";

describe("QuestionnaireForm", () => {
  it("shows immediate crisis resources for a PHQ-9 question 9 response above not at all", () => {
    render(<QuestionnaireForm caseId="50000000-0000-0000-0000-000000000001" modules={assessmentCatalog} responses={[]} />);

    fireEvent.click(screen.getAllByLabelText("Several days")[8]);

    expect(screen.getByRole("alert")).toHaveTextContent("call or text 988");
  });

  it("keeps each questionnaire in an independently submittable form", () => {
    const { container } = render(
      <QuestionnaireForm
        caseId="50000000-0000-0000-0000-000000000001"
        modules={assessmentCatalog}
        responses={[]}
      />
    );

    const forms = container.querySelectorAll(".questionnaire-module form");

    expect(forms).toHaveLength(3);
    expect(within(forms[0] as HTMLFormElement).queryByLabelText("Feeling nervous, anxious, or on edge")).toBeNull();
  });
});
