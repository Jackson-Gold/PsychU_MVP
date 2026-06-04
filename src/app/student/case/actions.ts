"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRoles } from "@/lib/auth";
import type { AssessmentQuestion } from "@/lib/domain";
import { getPendingConsents } from "@/lib/consent";
import { answerFieldName } from "@/lib/questionnaires";
import { CASE_DOCUMENTS_BUCKET } from "@/lib/supabase/storage";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type QuestionnaireSubmissionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type DocumentUploadState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type ConsentActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const caseIdSchema = z.string().uuid();

const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024;
const documentCategories = [
  "prior_evaluation",
  "iep_504",
  "medical_note",
  "academic_record",
  "other"
] as const;

export async function submitQuestionnaire(
  _previousState: QuestionnaireSubmissionState,
  formData: FormData
): Promise<QuestionnaireSubmissionState> {
  const context = await requireRoles(["student"]);
  const caseId = caseIdSchema.safeParse(formData.get("case_id"));
  const moduleId = caseIdSchema.safeParse(formData.get("module_id"));

  if (!caseId.success || !moduleId.success) {
    return { status: "error", message: "The case or questionnaire identifier is missing or invalid." };
  }

  const supabase = await createSupabaseServerClient();

  const pendingConsents = await getPendingConsents(supabase, context.user.id);
  if (pendingConsents.length) {
    return {
      status: "error",
      message: "Please review and accept the required consent forms before submitting a questionnaire."
    };
  }

  const { data: caseRecord, error: caseError } = await supabase
    .from("cases")
    .select("id,status")
    .eq("id", caseId.data)
    .eq("student_user_id", context.user.id)
    .maybeSingle();

  if (caseError || !caseRecord) {
    return { status: "error", message: "We could not find a case that belongs to this student account." };
  }

  const { data: assessmentModule, error: moduleError } = await supabase
    .from("assessment_modules")
    .select("id,title,version,questions")
    .eq("id", moduleId.data)
    .eq("status", "active")
    .maybeSingle();

  if (moduleError || !assessmentModule) {
    return { status: "error", message: "This questionnaire is not currently available." };
  }

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
      message: `We could not save this questionnaire. ${error.message}`
    };
  }

  revalidatePath("/student");
  revalidatePath("/student/case");
  revalidatePath("/clinician/queue");
  revalidatePath(`/clinician/cases/${caseId.data}`);

  return {
    status: "success",
    message: `${assessmentModule.title} was saved and submitted to your assigned clinician.`
  };
}

const uploadSchema = z.object({
  case_id: caseIdSchema,
  category: z.enum(documentCategories)
});

export async function uploadCaseDocument(
  _previousState: DocumentUploadState,
  formData: FormData
): Promise<DocumentUploadState> {
  const context = await requireRoles(["student"]);
  const input = uploadSchema.safeParse({
    case_id: formData.get("case_id"),
    category: formData.get("category")
  });

  if (!input.success) {
    return { status: "error", message: "Choose a valid document category and try again." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Select a file to upload." };
  }

  if (file.size > MAX_DOCUMENT_BYTES) {
    return { status: "error", message: "Files must be 15 MB or smaller." };
  }

  const supabase = await createSupabaseServerClient();

  const { data: caseRecord } = await supabase
    .from("cases")
    .select("id")
    .eq("id", input.data.case_id)
    .eq("student_user_id", context.user.id)
    .maybeSingle();

  if (!caseRecord) {
    return { status: "error", message: "We could not find a case that belongs to this student account." };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || "document";
  const storagePath = `${input.data.case_id}/${randomUUID()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(CASE_DOCUMENTS_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false
    });

  if (uploadError) {
    return { status: "error", message: `We could not upload the file. ${uploadError.message}` };
  }

  const { error: recordError } = await supabase.from("uploaded_documents").insert({
    case_id: input.data.case_id,
    uploaded_by_user_id: context.user.id,
    storage_path: storagePath,
    file_name: file.name,
    content_type: file.type || "application/octet-stream",
    size_bytes: file.size,
    category: input.data.category
  });

  if (recordError) {
    await supabase.storage.from(CASE_DOCUMENTS_BUCKET).remove([storagePath]);
    return { status: "error", message: `We could not save the document record. ${recordError.message}` };
  }

  revalidatePath("/student/case");
  revalidatePath(`/clinician/cases/${input.data.case_id}`);

  return { status: "success", message: `${file.name} was uploaded and is visible to your assigned clinician.` };
}

export async function acceptConsents(
  _previousState: ConsentActionState,
  formData: FormData
): Promise<ConsentActionState> {
  const context = await requireRoles(["student"]);
  const consentIds = formData
    .getAll("consent_version_id")
    .map((value) => String(value))
    .filter(Boolean);
  const agreed = formData.get("agree") === "on";

  if (!agreed) {
    return { status: "error", message: "Please check the box to confirm you have read and agree to the forms." };
  }

  if (!consentIds.length) {
    return { status: "success", message: "There are no consent forms awaiting your agreement." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("student_consents").upsert(
    consentIds.map((consentId) => ({
      user_id: context.user.id,
      consent_version_id: consentId
    })),
    { onConflict: "user_id,consent_version_id" }
  );

  if (error) {
    return { status: "error", message: `We could not record your consent. ${error.message}` };
  }

  revalidatePath("/student/case");

  return { status: "success", message: "Thank you. Your consent has been recorded." };
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
