"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRoles } from "@/lib/auth";
import type { AssessmentQuestion } from "@/lib/domain";
import { answerFieldName } from "@/lib/questionnaires";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type QuestionnaireSubmissionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const caseIdSchema = z.string().uuid();

export async function submitQuestionnaires(
  _previousState: QuestionnaireSubmissionState,
  formData: FormData
): Promise<QuestionnaireSubmissionState> {
  const context = await requireRoles(["student"]);
  const caseId = caseIdSchema.safeParse(formData.get("case_id"));

  if (!caseId.success) {
    return { status: "error", message: "The case identifier is missing or invalid." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: caseRecord, error: caseError } = await supabase
    .from("cases")
    .select("id,status")
    .eq("id", caseId.data)
    .eq("student_user_id", context.user.id)
    .maybeSingle();

  if (caseError || !caseRecord) {
    return { status: "error", message: "We could not find a case that belongs to this student account." };
  }

  const { data: modules, error: modulesError } = await supabase
    .from("assessment_modules")
    .select("id,version,questions")
    .eq("status", "active")
    .order("created_at");

  if (modulesError || !modules?.length) {
    return { status: "error", message: "No active questionnaires are available. Ask an administrator to sync the catalog." };
  }

  for (const assessmentModule of modules) {
    const questions = (assessmentModule.questions ?? []) as AssessmentQuestion[];
    const answers = parseAnswers(formData, assessmentModule.id, questions);
    const missingQuestion = questions.find(
      (question) => question.required && isQuestionVisible(question, answers) && isEmptyAnswer(answers[question.id])
    );

    if (missingQuestion) {
      return {
        status: "error",
        message: `Please answer the required question: ${missingQuestion.label}`
      };
    }

    const { error } = await supabase.from("assessment_responses").upsert(
      {
        case_id: caseId.data,
        module_id: assessmentModule.id,
        module_version: assessmentModule.version,
        answers,
        completed_at: new Date().toISOString()
      },
      { onConflict: "case_id,module_id,module_version" }
    );

    if (error) {
      return {
        status: "error",
        message: `We could not save the questionnaires. ${error.message}`
      };
    }
  }

  revalidatePath("/student");
  revalidatePath("/student/case");
  revalidatePath("/clinician/queue");
  revalidatePath(`/clinician/cases/${caseId.data}`);

  return {
    status: "success",
    message: "Your questionnaires were submitted to your assigned PsychU clinician."
  };
}

function parseAnswers(
  formData: FormData,
  moduleId: string,
  questions: AssessmentQuestion[]
): Record<string, string | number | boolean | string[]> {
  return Object.fromEntries(
    questions.map((question) => {
      const name = answerFieldName(moduleId, question.id);

      if (question.type === "multi_select") {
        return [question.id, formData.getAll(name).map(String)];
      }

      const rawValue = formData.get(name);

      if (question.type === "scale_0_3" || question.type === "scale_0_4") {
        return [question.id, rawValue === null || rawValue === "" ? "" : Number(rawValue)];
      }

      if (question.type === "boolean") {
        return [question.id, rawValue === "" || rawValue === null ? "" : rawValue === "true"];
      }

      return [question.id, rawValue === null ? "" : String(rawValue)];
    })
  );
}

function isQuestionVisible(
  question: AssessmentQuestion,
  answers: Record<string, string | number | boolean | string[]>
) {
  if (!question.showWhen) return true;
  const controllingAnswer = answers[question.showWhen.questionId];

  if (question.showWhen.equals !== undefined) {
    return controllingAnswer === question.showWhen.equals;
  }

  if (question.showWhen.notEquals !== undefined) {
    return controllingAnswer !== "" && controllingAnswer !== question.showWhen.notEquals;
  }

  return true;
}

function isEmptyAnswer(value: string | number | boolean | string[] | undefined) {
  return value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
}
