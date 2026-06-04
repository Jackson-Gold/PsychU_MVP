"use client";

import { useActionState, useMemo, useRef, useState } from "react";
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
const scale04Labels = ["0", "1", "2", "3", "4"];

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
            Each questionnaire is broken into short steps and is saved on its own. Finish whenever you like, then
            submit that questionnaire by itself.
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
  const sections = useMemo(() => groupQuestionsBySection(module.questions), [module.questions]);
  const [step, setStep] = useState(0);
  const [clientError, setClientError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const hasSafetyFlag = useMemo(
    () =>
      module.questions.some((question) =>
        matchesRiskTrigger(question, answers[answerKey(module.id, question.id)])
      ),
    [answers, module]
  );

  const totalSteps = Math.max(sections.length, 1);
  const safeStep = Math.min(step, totalSteps - 1);
  const isLastStep = safeStep === totalSteps - 1;
  const currentSection = sections[safeStep];
  const stepProgress = Math.round(((safeStep + 1) / totalSteps) * 100);

  function updateAnswer(questionId: string, value: AnswerValue) {
    setAnswers((current) => ({ ...current, [answerKey(module.id, questionId)]: value }));
  }

  function goToStep(index: number) {
    setClientError(null);
    setStep(Math.max(0, Math.min(index, totalSteps - 1)));
  }

  function handleContinue() {
    const missing = firstUnansweredInSection(module.id, currentSection?.[1] ?? [], answers);
    if (missing) {
      setClientError(`Please answer: ${missing.label}`);
      focusQuestion(formRef.current, module.id, missing.id);
      return;
    }
    goToStep(safeStep + 1);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const incompleteIndex = sections.findIndex(([, questions]) =>
      Boolean(firstUnansweredInSection(module.id, questions, answers))
    );

    if (incompleteIndex !== -1) {
      const missing = firstUnansweredInSection(module.id, sections[incompleteIndex][1], answers);
      setStep(incompleteIndex);
      setClientError(missing ? `Please answer: ${missing.label}` : "Please complete the required questions.");
      window.requestAnimationFrame(() => focusQuestion(formRef.current, module.id, missing?.id));
      return;
    }

    setClientError(null);
    formAction(new FormData(event.currentTarget));
  }

  const message = clientError
    ? { status: "error" as const, message: clientError }
    : state;

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

      <form className="questionnaire-module-body" ref={formRef} onSubmit={handleSubmit}>
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

        <div className="stepper-header">
          <p className="stepper-progress-label">
            Section {safeStep + 1} of {totalSteps}
            {currentSection ? ` · ${currentSection[0]}` : ""}
          </p>
          <div className="progress-track" aria-label={`${stepProgress}% through this questionnaire`}>
            <span style={{ width: `${stepProgress}%` }} />
          </div>
        </div>

        <div className="questionnaire-sections">
          {sections.map(([section, questions], index) => (
            <fieldset
              className="form-card stepper-section"
              key={`${module.id}-${section}`}
              hidden={index !== safeStep}
            >
              <legend>{section}</legend>
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
          ))}
        </div>

        <div className="stepper-nav">
          <button
            className="button button-secondary"
            type="button"
            onClick={() => goToStep(safeStep - 1)}
            disabled={safeStep === 0}
          >
            Back
          </button>

          {isLastStep ? (
            <button className="button button-primary" type="submit" disabled={pending}>
              {pending ? "Saving..." : response ? "Update and resubmit" : "Save and submit questionnaire"}
            </button>
          ) : (
            <button className="button button-primary" type="button" onClick={handleContinue}>
              Continue
            </button>
          )}
        </div>

        <p className={message.status === "error" ? "form-message form-message-error" : "form-message"} role="status">
          {message.message}
        </p>
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

  if (question.type === "scale_0_3" || question.type === "scale_0_4") {
    const labels = question.type === "scale_0_3" ? scale03Labels : scale04Labels;
    return (
      <fieldset className="question-group" data-question-id={question.id}>
        <legend>{question.label}</legend>
        {question.helpText ? <p className="field-help">{question.helpText}</p> : null}
        <div className="radio-scale">
          {labels.map((label, index) => (
            <label key={label}>
              <input
                name={name}
                type="radio"
                value={index}
                checked={value === index}
                onChange={() => onChange(index)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (question.type === "boolean") {
    return (
      <fieldset className="question-group" data-question-id={question.id}>
        <legend>{question.label}</legend>
        {question.helpText ? <p className="field-help">{question.helpText}</p> : null}
        <div className="choice-row">
          <label>
            <input
              name={name}
              type="radio"
              value="true"
              checked={value === true}
              onChange={() => onChange(true)}
            />
            <span>Yes</span>
          </label>
          <label>
            <input
              name={name}
              type="radio"
              value="false"
              checked={value === false}
              onChange={() => onChange(false)}
            />
            <span>No</span>
          </label>
        </div>
      </fieldset>
    );
  }

  if (question.type === "single_select") {
    return (
      <div className="field-row" data-question-id={question.id}>
        <label htmlFor={inputId}>{question.label}</label>
        <select
          id={inputId}
          name={name}
          value={typeof value === "string" ? value : ""}
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
      <fieldset className="question-group" data-question-id={question.id}>
        <legend>{question.label}</legend>
        <div className="checkbox-grid">
          {question.options?.map((option) => (
            <label key={option}>
              <input
                name={name}
                type="checkbox"
                value={option}
                checked={selected.includes(option)}
                onChange={(event) =>
                  onChange(
                    event.target.checked
                      ? [...selected, option]
                      : selected.filter((item) => item !== option)
                  )
                }
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
      <div className="field-row" data-question-id={question.id}>
        <label htmlFor={inputId}>{question.label}</label>
        {question.helpText ? <p className="field-help">{question.helpText}</p> : null}
        <textarea
          id={inputId}
          name={name}
          rows={4}
          placeholder={question.placeholder}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="field-row" data-question-id={question.id}>
      <label htmlFor={inputId}>{question.label}</label>
      <input
        id={inputId}
        name={name}
        type={question.type}
        placeholder={question.placeholder}
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
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

function firstUnansweredInSection(
  moduleId: string,
  questions: AssessmentQuestion[],
  answers: AnswerState
): AssessmentQuestion | null {
  for (const question of questions) {
    if (!question.required) continue;
    if (!isQuestionVisible(moduleId, question, answers)) continue;

    const value = answers[answerKey(moduleId, question.id)];
    const empty =
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);

    if (empty) return question;
  }

  return null;
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

function focusQuestion(form: HTMLFormElement | null, moduleId: string, questionId?: string) {
  if (!form || !questionId) return;
  const container = form.querySelector<HTMLElement>(`[data-question-id="${questionId}"]`);
  if (!container) return;
  if (typeof container.scrollIntoView === "function") {
    container.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  const focusable = container.querySelector<HTMLElement>("input, select, textarea");
  focusable?.focus();
}
