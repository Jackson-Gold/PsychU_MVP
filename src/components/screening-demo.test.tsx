import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScreeningDemo } from "@/components/screening-demo";
import { demoAssessmentModules } from "@/lib/demo-data";

describe("ScreeningDemo", () => {
  it("shows immediate crisis resources when a student selects the safety risk answer", async () => {
    render(<ScreeningDemo modules={demoAssessmentModules} />);

    fireEvent.change(screen.getByLabelText("Are you currently worried you may hurt yourself or someone else?"), {
      target: { value: "true" }
    });

    expect(screen.getByRole("alert")).toHaveTextContent("call or text 988");
  });
});
