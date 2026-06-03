"use client";

import { useActionState, useMemo, useState } from "react";
import {
  submitQuestionnaires,
  type QuestionnaireSubmissionState
} from "@/app/student/case/actions";
import { StatusBadge } from "@/components/status-badge";
import {
  crisisResourceCopy,
  type AssessmentModule,
  type AssessmentQuestion,
  type AssessmentResponse
} from "@/lib/domain";
import { answerFieldName } from "@/lib/questionnaires";

type AnswerValue = string | number | boolean | string[];
type AnswerState = Record<string, AnswerValue>;

type QuestionnaireFormProps = {
  caseId: string;
  modules: AssessmentModule[];
  responses: AssessmentResponse[];
};

const initialState: QuestionnaireSubmissionState = {
  status: "idle",
  message: "Your answers are private and are shared only with authorized PsychU reviewers."
};

const scale03Labels = ["Not at all", "Several days", "More than half the days", "Nearly every day"];

export function QuestionnaireForm({ caseId, modules, responses }: QuestionnaireFormProps) {
  const [state, formAction, pending] = useActionState(submitQuestionnaires, initialState);
  const [answers, setAnswers] = useState<AnswerState>(() => seedAnswers(modules, responses));
  const [openModules, setOpenModules] = useState<Set<string>>(
    () => new Set(modules[0] ? [modules[0].id] : [])
  );

  const hasSafetyFlag = useMemo(
    () =>
      modules.some((module) =>
        module.questions.some((question) =>
          matchesRiskTrigger(question, answers[answerKey(module.id, question.id)])
        )
      ),
    [answers, modules]
  );

  function updateAnswer(moduleId: string, questionId: string, value: AnswerValue) {
    setAnswers((current) => ({ ...current, [answerKey(moduleId, questionId)]: value }));
  }

  return (
    <section className="panel" aria-labelledby="questionnaire-title">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Student Questionnaires</p>
          <h2 id="questionnaire-title">Complete and submit all three forms</h2>
        </div>
        <StatusBadge value={`${responses.length} of ${modules.length} submitted`} tone="info" />
      </div>

      <p className="legal-copy">
        These questionnaires support screening and clinician review. They do not provide a diagnosis or live
        emergency monitoring. Named instruments remain subject to PsychU&apos;s final permitted-use review.
      </p>

      {hasSafetyFlag ? (
        <div className="crisis-banner" role="alert">
          <strong>Immediate support is available.</strong>
          <p>{crisisResourceCopy}</p>
          <p>
            Your response will also be prominently flagged for your assigned clinician. PsychU is not a live crisis
            response service.
          </p>
        </div>
      ) : null}

      <form className="questionnaire-form" action={formAction}>
        <input type="hidden" name="case_id" value={caseId} />

        {modules.map((module) => {
          const sections = groupQuestionsBySection(module.questions);

          return (
            <details
              className="questionnaire-module"
              key={module.id}
              open={openModules.has(module.id)}
              onToggle={(event) => {
                const isOpen = event.currentTarget.open;
                setOpenModules((current) => {
                  const next = new Set(current);
                  if (isOpen) next.add(module.id);
                  else next.delete(module.id);
                  return next;
                });
              }}
            >
              <summary>
                <span>
                  <strong>{module.title}</strong>
                  <small>
                    {module.estimatedMinutes ? `About ${module.estimatedMinutes} minutes` : "Complete all questions"}
                  </small>
                </span>
                <StatusBadge
                  value={responses.some((response) => response.moduleId === module.id) ? "submitted" : "draft"}
                />
              </summary>

              <div className="questionnaire-module-body">
                {module.description ? <p>{module.description}</p> : null}
                {module.attribution ? <p className="field-help">{module.attribution}</p> : null}

                {sections.map(([section, questions]) => (
                  <fieldset className="form-card" key={`${module.id}-${section}`}>
                    <legend>{section}</legend>
                    {questions.map((question) => {
                      const value = answers[answerKey(module.id, question.id)];
                      const visible = isQuestionVisible(module.id, question, answers);

                      if (!visible) return null;

                      return (
                        <QuestionField
                          key={question.id}
                          moduleId={module.id}
                          question={question}
                          value={value}
                          onChange={(nextValue) => updateAnswer(module.id, question.id, nextValue)}
                        />
                      );
                    })}
                  </fieldset>
                ))}
              </div>
            </details>
          );
        })}

        <button className="button button-primary" type="submit" disabled={pending}>
          {pending ? "Submitting..." : "Submit questionnaires"}
        </button>
        <p className={state.status === "error" ? "form-message form-message-error" : "form-message"} role="status">
          {state.message}
        </p>
      </form>
    </section>
  );
}

type QuestionFieldProps = {
  moduleId: string;
  question: AssessmentQuestion;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
};

function QuestionField({ moduleId, question, value, onChange }: QuestionFieldProps) {
  const name = answerFieldName(moduleId, question.id);
  const inputId = `${moduleId}-${question.id}`;

  if (question.type === "scale_0_3") {
    return (
      <fieldset className="question-group">
        <legend>{question.label}</legend>
        {question.helpText ? <p className="field-help">{question.helpText}</p> : null}
        <div className="radio-scale">
          {scale03Labels.map((label, index) => (
            <label key={label}>
              <input
                name={name}
                type="radio"
                value={index}
                checked={value === index}
                required={question.required}
                onChange={() => onChange(index)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (question.type === "scale_0_4") {
    return (
      <div className="field-row">
        <label htmlFor={inputId}>{question.label}</label>
        {question.helpText ? <p className="field-help">{question.helpText}</p> : null}
        <input
          id={inputId}
          name={name}
          type="range"
          min="0"
          max="4"
          value={typeof value === "number" ? value : 0}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <output htmlFor={inputId}>Current answer: {typeof value === "number" ? value : 0}</output>
      </div>
    );
  }

  if (question.type === "boolean") {
    return (
      <div className="field-row">
        <label htmlFor={inputId}>{question.label}</label>
        <select
          id={inputId}
          name={name}
          value={typeof value === "boolean" ? String(value) : ""}
          required={question.required}
          onChange={(event) => onChange(event.target.value === "" ? "" : event.target.value === "true")}
        >
          <option value="">Select an answer</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
    );
  }

  if (question.type === "single_select") {
    return (
      <div className="field-row">
        <label htmlFor={inputId}>{question.label}</label>
        <select
          id={inputId}
          name={name}
          value={typeof value === "string" ? value : ""}
          required={question.required}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Select an answer</option>
          {question.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (question.type === "multi_select") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <fieldset className="question-group">
        <legend>{question.label}</legend>
        <div className="checkbox-grid">
          {question.options?.map((option) => (
            <label key={option}>
              <input
                name={name}
                type="checkbox"
                value={option}
                defaultChecked={selected.includes(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (question.type === "text") {
    return (
      <div className="field-row">
        <label htmlFor={inputId}>{question.label}</label>
        {question.helpText ? <p className="field-help">{question.helpText}</p> : null}
        <textarea
          id={inputId}
          name={name}
          rows={4}
          required={question.required}
          placeholder={question.placeholder}
          defaultValue={typeof value === "string" ? value : ""}
        />
      </div>
    );
  }

  return (
    <div className="field-row">
      <label htmlFor={inputId}>{question.label}</label>
      <input
        id={inputId}
        name={name}
        type={question.type}
        required={question.required}
        placeholder={question.placeholder}
        defaultValue={typeof value === "string" ? value : ""}
      />
    </div>
  );
}

function seedAnswers(modules: AssessmentModule[], responses: AssessmentResponse[]): AnswerState {
  const responseByModule = new Map(responses.map((response) => [response.moduleId, response]));

  return Object.fromEntries(
    modules.flatMap((module) =>
      module.questions.map((question) => {
        const savedValue = responseByModule.get(module.id)?.answers[question.id];

        if (savedValue !== undefined) return [answerKey(module.id, question.id), savedValue] as const;
        if (question.type === "multi_select") return [answerKey(module.id, question.id), []] as const;
        return [answerKey(module.id, question.id), ""] as const;
      })
    )
  );
}

function answerKey(moduleId: string, questionId: string) {
  return `${moduleId}:${questionId}`;
}

function groupQuestionsBySection(questions: AssessmentQuestion[]) {
  const sections = new Map<string, AssessmentQuestion[]>();

  for (const question of questions) {
    const section = question.section ?? "Questions";
    sections.set(section, [...(sections.get(section) ?? []), question]);
  }

  return [...sections.entries()];
}

function isQuestionVisible(moduleId: string, question: AssessmentQuestion, answers: AnswerState) {
  if (!question.showWhen) return true;
  const controllingAnswer = answers[answerKey(moduleId, question.showWhen.questionId)];

  if (question.showWhen.equals !== undefined) {
    return controllingAnswer === question.showWhen.equals;
  }

  if (question.showWhen.notEquals !== undefined) {
    return controllingAnswer !== "" && controllingAnswer !== question.showWhen.notEquals;
  }

  return true;
}

function matchesRiskTrigger(question: AssessmentQuestion, answer: AnswerValue | undefined) {
  if (!question.riskTrigger) return false;
  if (question.riskTrigger.equals !== undefined && answer === question.riskTrigger.equals) return true;
  if (question.riskTrigger.minimum !== undefined && typeof answer === "number") {
    return answer >= question.riskTrigger.minimum;
  }
  if (
    question.riskTrigger.includes &&
    typeof answer === "string" &&
    answer.toLowerCase().includes(question.riskTrigger.includes.toLowerCase())
  ) {
    return true;
  }
  return false;
}
