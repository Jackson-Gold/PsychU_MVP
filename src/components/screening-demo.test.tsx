import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScreeningDemo } from "@/components/screening-demo";
import { demoAssessmentModules } from "@/lib/demo-data";

describe("ScreeningDemo", () => {
  it("shows immediate crisis resources when PHQ-9 question 9 is above not at all", async () => {
    render(<ScreeningDemo modules={demoAssessmentModules} />);

    fireEvent.change(
      screen.getByLabelText("Thoughts that you would be better off dead or of hurting yourself in some way"),
      { target: { value: "1" } }
    );

    expect(screen.getByRole("alert")).toHaveTextContent("call or text 988");
  });
});
