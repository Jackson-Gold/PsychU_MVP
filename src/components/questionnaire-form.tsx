"use client";

import { useActionState, useMemo, useState, type FormEvent } from "react";
import {
  submitQuestionnaire,
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
  const completedModuleIds = new Set(responses.map((response) => response.moduleId));
  const firstIncompleteId = modules.find((module) => !completedModuleIds.has(module.id))?.id ?? modules[0]?.id;
  const progress = modules.length ? Math.round((completedModuleIds.size / modules.length) * 100) : 0;

  return (
    <section className="panel questionnaire-panel" aria-labelledby="questionnaire-title">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Student Questionnaires</p>
          <h2 id="questionnaire-title">Complete one form at a time</h2>
          <p className="section-intro">
            Save each questionnaire independently. Your case moves to clinician review after all three are submitted.
          </p>
        </div>
        <StatusBadge value={`${completedModuleIds.size} of ${modules.length} submitted`} tone="info" />
      </div>

      <div className="progress-track" aria-label={`${progress}% of questionnaires submitted`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="notice-inline">
        These questionnaires support screening and clinician review. They do not provide a diagnosis or live
        emergency monitoring. Named instruments remain subject to PsychU&apos;s final permitted-use review.
      </div>

      <div className="questionnaire-stack">
        {modules.map((module) => {
          const response = responses.find((item) => item.moduleId === module.id);

          return (
            <QuestionnaireModuleForm
              caseId={caseId}
              defaultOpen={module.id === firstIncompleteId}
              key={module.id}
              module={module}
              response={response}
            />
          );
        })}
      </div>
    </section>
  );
}

type QuestionnaireModuleFormProps = {
  caseId: string;
  defaultOpen: boolean;
  module: AssessmentModule;
  response?: AssessmentResponse;
};

function QuestionnaireModuleForm({ caseId, defaultOpen, module, response }: QuestionnaireModuleFormProps) {
  const [state, formAction, pending] = useActionState(submitQuestionnaire, initialState);
  const [answers, setAnswers] = useState<AnswerState>(() => seedModuleAnswers(module, response));
  const sections = groupQuestionsBySection(module.questions);
  const hasSafetyFlag = useMemo(
    () =>
      module.questions.some((question) =>
        matchesRiskTrigger(question, answers[answerKey(module.id, question.id)])
      ),
    [answers, module]
  );

  function updateAnswer(questionId: string, value: AnswerValue) {
    setAnswers((current) => ({ ...current, [answerKey(module.id, questionId)]: value }));
  }

  return (
    <details className="questionnaire-module" open={defaultOpen ? true : undefined}>
      <summary>
        <span className="questionnaire-summary-main">
          <strong>{module.title}</strong>
          <small>
            {module.estimatedMinutes ? `About ${module.estimatedMinutes} minutes` : "Complete all questions"}
            {" · "}
            {sections.length} {sections.length === 1 ? "section" : "sections"}
          </small>
        </span>
        <span className="questionnaire-summary-status">
          <StatusBadge value={response ? "submitted" : "not started"} tone={response ? "good" : "neutral"} />
          <span className="summary-chevron" aria-hidden="true">
            +
          </span>
        </span>
      </summary>

      <form className="questionnaire-module-body" action={formAction} onInvalid={revealInvalidField}>
        <input type="hidden" name="case_id" value={caseId} />
        <input type="hidden" name="module_id" value={module.id} />

        <div className="questionnaire-intro">
          {module.description ? <p>{module.description}</p> : null}
          {module.attribution ? <p className="field-help">{module.attribution}</p> : null}
          {response ? (
            <p className="saved-note">Last submitted {new Date(response.completedAt).toLocaleString()}.</p>
          ) : null}
        </div>

        {hasSafetyFlag ? (
          <div className="crisis-banner" role="alert">
            <strong>Immediate support is available.</strong>
            <p>{crisisResourceCopy}</p>
            <p>
              Your response will also be prominently flagged for your assigned clinician. PsychU is not a live
              crisis response service.
            </p>
          </div>
        ) : null}

        <div className="questionnaire-sections">
          {sections.map(([section, questions], index) => (
            <details className="question-section" open={index === 0 ? true : undefined} key={`${module.id}-${section}`}>
              <summary>
                <span>
                  <strong>{section}</strong>
                  <small>
                    {questions.length} {questions.length === 1 ? "question" : "questions"}
                  </small>
                </span>
                <span className="summary-chevron" aria-hidden="true">
                  +
                </span>
              </summary>
              <fieldset className="form-card">
                <legend className="sr-only">{section}</legend>
                {questions.map((question) => {
                  const value = answers[answerKey(module.id, question.id)];
                  if (!isQuestionVisible(module.id, question, answers)) return null;

                  return (
                    <QuestionField
                      key={question.id}
                      moduleId={module.id}
                      question={question}
                      value={value}
                      onChange={(nextValue) => updateAnswer(question.id, nextValue)}
                    />
                  );
                })}
              </fieldset>
            </details>
          ))}
        </div>

        <div className="form-actions">
          <button className="button button-primary" type="submit" disabled={pending}>
            {pending ? "Saving..." : response ? "Update submitted questionnaire" : "Save and submit questionnaire"}
          </button>
          <p className={state.status === "error" ? "form-message form-message-error" : "form-message"} role="status">
            {state.message}
          </p>
        </div>
      </form>
    </details>
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
              <input name={name} type="checkbox" value={option} defaultChecked={selected.includes(option)} />
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

function seedModuleAnswers(module: AssessmentModule, response?: AssessmentResponse): AnswerState {
  return Object.fromEntries(
    module.questions.map((question) => {
      const savedValue = response?.answers[question.id];

      if (savedValue !== undefined) return [answerKey(module.id, question.id), savedValue] as const;
      if (question.type === "multi_select") return [answerKey(module.id, question.id), []] as const;
      return [answerKey(module.id, question.id), ""] as const;
    })
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

function revealInvalidField(event: FormEvent<HTMLFormElement>) {
  let details = (event.target as HTMLElement).closest("details");

  while (details) {
    details.open = true;
    details = details.parentElement?.closest("details") ?? null;
  }
}
