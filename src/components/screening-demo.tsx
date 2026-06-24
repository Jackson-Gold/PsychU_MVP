"use client";

import { useMemo, useState, useTransition } from "react";
import { StatusBadge } from "@/components/status-badge";
import { crisisResourceCopy, type AssessmentModule } from "@/lib/domain";

type ScreeningDemoProps = {
  modules: AssessmentModule[];
};

type Answers = Record<string, string | number | boolean | string[]>;

export function ScreeningDemo({ modules }: ScreeningDemoProps) {
  const [answers, setAnswers] = useState<Answers>(() => seedAnswers(modules));
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const hasSafetyFlag = useMemo(
    () =>
      modules.some((module) =>
        module.questions.some((question) => {
          const answer = answers[question.id];
          if (question.riskTrigger?.equals !== undefined && question.riskTrigger.equals === answer) return true;
          if (question.riskTrigger?.minimum !== undefined && typeof answer === "number") {
            return answer >= question.riskTrigger.minimum;
          }
          return false;
        })
      ),
    [answers, modules]
  );

  function updateAnswer(questionId: string, value: string | number | boolean | string[]) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  return (
    <section className="panel" aria-labelledby="screening-demo-title">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Interactive Demo</p>
          <h2 id="screening-demo-title">Configurable screening engine</h2>
        </div>
        <StatusBadge value={submitted ? (hasSafetyFlag ? "urgent_flagged" : "submitted") : "draft"} />
      </div>

      {hasSafetyFlag ? (
        <div className="crisis-banner" role="alert">
          <strong>Immediate support is available.</strong>
          <p>{crisisResourceCopy}</p>
        </div>
      ) : null}

      <form
        className="screening-form"
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(() => setSubmitted(true));
        }}
      >
        {modules.slice(0, 2).map((module) => (
          <fieldset className="form-card" key={module.id}>
            <legend>
              {module.title}
              <span>{module.licenseStatus.replaceAll("_", " ")}</span>
            </legend>
            {module.questions.map((question) => (
              <div className="field-row" key={question.id}>
                <label htmlFor={question.id}>{question.label}</label>
                {question.helpText ? <p className="field-help">{question.helpText}</p> : null}
                {question.type === "scale_0_4" ? (
                  <input
                    id={question.id}
                    type="range"
                    min="0"
                    max="4"
                    value={Number(answers[question.id] ?? 0)}
                    onChange={(event) => updateAnswer(question.id, Number(event.target.value))}
                  />
                ) : null}
                {question.type === "scale_0_3" ? (
                  <select
                    id={question.id}
                    value={String(answers[question.id] ?? "")}
                    onChange={(event) => updateAnswer(question.id, Number(event.target.value))}
                  >
                    <option value="">Select an answer</option>
                    <option value="0">Not at all</option>
                    <option value="1">Several days</option>
                    <option value="2">More than half the days</option>
                    <option value="3">Nearly every day</option>
                  </select>
                ) : null}
                {question.type === "boolean" ? (
                  <select
                    id={question.id}
                    value={String(answers[question.id] ?? false)}
                    onChange={(event) => updateAnswer(question.id, event.target.value === "true")}
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                ) : null}
                {question.type === "text" ? (
                  <textarea
                    id={question.id}
                    value={String(answers[question.id] ?? "")}
                    onChange={(event) => updateAnswer(question.id, event.target.value)}
                    rows={3}
                  />
                ) : null}
                {question.type === "single_select" ? (
                  <select
                    id={question.id}
                    value={String(answers[question.id] ?? "")}
                    onChange={(event) => updateAnswer(question.id, event.target.value)}
                  >
                    <option value="">Select an answer</option>
                    {question.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : null}
                <output htmlFor={question.id}>
                  Current answer: {Array.isArray(answers[question.id]) ? "selected" : String(answers[question.id] ?? "")}
                </output>
              </div>
            ))}
          </fieldset>
        ))}
        <button className="button button-primary" type="submit" disabled={isPending}>
          {isPending ? "Submitting..." : "Submit demo screening"}
        </button>
      </form>

      {submitted ? (
        <div className="success-callout" role="status">
          <strong>{hasSafetyFlag ? "Urgent flag created" : "Screening submitted"}</strong>
          <p>
            The production workflow records an audit event, updates the case status, and notifies Synaptec reviewers.
          </p>
        </div>
      ) : null}
    </section>
  );
}

function seedAnswers(modules: AssessmentModule[]): Answers {
  return Object.fromEntries(
    modules.flatMap((module) =>
      module.questions.map((question) => {
        if (question.type === "scale_0_4") return [question.id, 0] as const;
        if (question.type === "scale_0_3") return [question.id, ""] as const;
        if (question.type === "boolean") return [question.id, false] as const;
        if (question.type === "multi_select") return [question.id, []] as const;
        return [question.id, ""] as const;
      })
    )
  );
}
