import type {
  AssessmentModule,
  AssessmentQuestion
} from "./domain";

const catalogCreatedAt = "2026-06-03T00:00:00.000Z";
const crisisResourceCopy =
  "If you might hurt yourself or someone else, call or text 988 now, use 988 Lifeline chat, or call 911 if there is immediate danger. PsychU is not a live crisis response service.";

const frequencyOptions = [
  "Not at all - 0 days",
  "1-2 days",
  "3-4 days",
  "5-6 days",
  "Nearly every day of the week"
];

const gradeOptions = [
  "Mostly A student",
  "Mostly A and B student",
  "Mostly B student",
  "Mostly B and C student",
  "Mostly C student",
  "Below C student",
  "Failing grades in this area",
  "Not applicable"
];

const schoolLevelOptions = [
  "Freshman in college",
  "Sophomore in college",
  "Junior in college",
  "Senior in college",
  "Graduate or professional school"
];

const yesNoFollowUp = (
  id: string,
  label: string,
  section: string,
  followUpLabel = "If yes, please describe."
): AssessmentQuestion[] => [
  {
    id,
    label,
    section,
    type: "boolean",
    required: true
  },
  {
    id: `${id}_details`,
    label: followUpLabel,
    section,
    type: "text",
    required: false,
    showWhen: { questionId: id, equals: true }
  }
];

const phq9Questions: AssessmentQuestion[] = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself - or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed, or the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead or of hurting yourself in some way"
].map((label, index) => ({
  id: `phq9_${index + 1}`,
  label,
  section: "Over the last 2 weeks",
  helpText: "Choose the answer that best describes how often this has bothered you.",
  type: "scale_0_3" as const,
  required: true,
  ...(index === 8
    ? {
        riskTrigger: {
          minimum: 1,
          severity: "high" as const,
          message:
            "A response above 'Not at all' to PHQ-9 question 9 requires prompt follow-up by a clinician competent to assess suicide risk. " +
            crisisResourceCopy
        }
      }
    : {})
}));

phq9Questions.push({
  id: "phq9_difficulty",
  label:
    "If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?",
  section: "Functional impact",
  type: "single_select",
  required: true,
  options: ["Not difficult at all", "Somewhat difficult", "Very difficult", "Extremely difficult"]
});

const gad7Questions: AssessmentQuestion[] = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen"
].map((label, index) => ({
  id: `gad7_${index + 1}`,
  label,
  section: "Over the last 2 weeks",
  helpText: "Choose the answer that best describes how often this has bothered you.",
  type: "scale_0_3" as const,
  required: true
}));

gad7Questions.push({
  id: "gad7_difficulty",
  label:
    "If you checked any problems, how difficult have they made it for you to do your work, take care of things at home, or get along with other people?",
  section: "Functional impact",
  type: "single_select",
  required: true,
  options: ["Not difficult at all", "Somewhat difficult", "Very difficult", "Extremely difficult"]
});

const intakeQuestions: AssessmentQuestion[] = [
  {
    id: "referral_source",
    label: "Who referred you to NeuropsychU, or how did you first connect with us?",
    section: "Registration and demographics",
    type: "text",
    required: true
  },
  {
    id: "full_name",
    label: "Full name",
    section: "Registration and demographics",
    type: "text",
    required: true
  },
  {
    id: "date_of_birth",
    label: "Date of birth",
    section: "Registration and demographics",
    type: "date",
    required: true
  },
  {
    id: "age",
    label: "Age",
    section: "Registration and demographics",
    type: "number",
    required: true
  },
  {
    id: "phone_number",
    label: "Phone number",
    section: "Registration and demographics",
    type: "tel",
    required: true
  },
  {
    id: "email_address",
    label: "Email address",
    section: "Registration and demographics",
    type: "email",
    required: true
  },
  {
    id: "assigned_sex_at_birth",
    label: "Assigned sex at birth",
    section: "Registration and demographics",
    type: "text",
    required: false
  },
  {
    id: "gender_identity",
    label: "Preferred or identified gender",
    section: "Registration and demographics",
    type: "text",
    required: false
  },
  {
    id: "pronouns",
    label: "Pronouns",
    section: "Registration and demographics",
    type: "text",
    required: false
  },
  {
    id: "school_name",
    label: "Name of college or graduate school",
    section: "Registration and demographics",
    type: "text",
    required: true
  },
  {
    id: "year_in_school",
    label: "Year in college or graduate school",
    section: "Registration and demographics",
    type: "single_select",
    options: schoolLevelOptions,
    required: true
  },
  {
    id: "degree_program",
    label: "Major, concentration, degree topic, and any minors",
    section: "Registration and demographics",
    type: "text",
    required: true
  },
  {
    id: "anticipated_degree",
    label: "Anticipated degree from your college or graduate program",
    section: "Registration and demographics",
    type: "text",
    required: true
  },
  {
    id: "native_language",
    label: "Native language and whether English is your dominant language",
    section: "Registration and demographics",
    type: "text",
    required: true
  },
  {
    id: "present_concerns",
    label:
      "Why are you seeking this current evaluation? Tell us about your current concerns, when they started, and how they have progressed.",
    section: "Reason for testing and present concerns",
    type: "text",
    required: true
  },
  {
    id: "evaluation_goals",
    label: "What do you hope to get out of this current evaluation? How can we best help?",
    section: "Reason for testing and present concerns",
    type: "text",
    required: true
  },
  ...yesNoFollowUp(
    "family_adhd",
    "Is there a history of Attention-Deficit/Hyperactivity Disorder (ADHD) in your family?",
    "Family psychiatric history"
  ),
  ...yesNoFollowUp(
    "family_learning",
    "Is there a history of learning disabilities or learning challenges in your family?",
    "Family psychiatric history"
  ),
  ...yesNoFollowUp(
    "family_anxiety",
    "Is there a history of anxiety in your family?",
    "Family psychiatric history"
  ),
  ...yesNoFollowUp(
    "family_mood",
    "Is there a history of any mood disorders, such as depression or bipolar disorder, in your family?",
    "Family psychiatric history"
  ),
  ...yesNoFollowUp(
    "family_substance",
    "Is there a history of problematic substance use in your family?",
    "Family psychiatric history"
  ),
  ...yesNoFollowUp(
    "developmental_challenges",
    "Are you aware of any developmental challenges you experienced during early childhood, such as speech and language, motor, social-emotional, or behavioral difficulties?",
    "Developmental history"
  ),
  ...yesNoFollowUp(
    "developmental_services",
    "Did you receive services during early childhood to address developmental concerns?",
    "Developmental history",
    "If yes, please describe services such as speech-language, physical, occupational, or behavioral therapy."
  ),
  ...yesNoFollowUp(
    "childhood_health",
    "During early childhood, did you experience any significant health problems or medical illnesses or conditions?",
    "Developmental history"
  ),
  {
    id: "medical_conditions",
    label: "Please list any medical conditions that you have and/or have been treated for.",
    section: "Medical history and health-related behavior",
    type: "text",
    required: true
  },
  {
    id: "current_medications",
    label: "Please list any current prescribed medications, including psychiatric and medical medications.",
    section: "Medical history and health-related behavior",
    type: "text",
    required: true
  },
  {
    id: "past_medications",
    label: "Please list medications that have been prescribed to you in the past.",
    section: "Medical history and health-related behavior",
    type: "text",
    required: false
  },
  ...yesNoFollowUp(
    "hospitalizations",
    "Do you have a history of hospitalizations for medical and/or psychiatric reasons?",
    "Medical history and health-related behavior"
  ),
  ...yesNoFollowUp(
    "vision_concerns",
    "Are there any current concerns with your vision, including needing glasses or contact lenses for correction?",
    "Medical history and health-related behavior"
  ),
  ...yesNoFollowUp(
    "hearing_concerns",
    "Are there any current concerns with your hearing, including needing hearing aids or implants for correction?",
    "Medical history and health-related behavior"
  ),
  ...yesNoFollowUp(
    "neurological_concerns",
    "Do you have any history of neurological concerns, such as seizures, concussions, and/or traumatic brain injury?",
    "Medical history and health-related behavior",
    "If yes, please describe and note whether this continues to affect you or has caused long-term challenges."
  ),
  {
    id: "eating_patterns",
    label: "Please describe your current eating patterns and any concerns with your eating.",
    section: "Medical history and health-related behavior",
    type: "text",
    required: true
  },
  {
    id: "sleeping_patterns",
    label: "Please describe your current sleeping patterns and any concerns with your sleeping.",
    section: "Medical history and health-related behavior",
    type: "text",
    required: true
  },
  {
    id: "exercise_routine",
    label: "Please describe your current exercise routine and any concerns you have in this area.",
    section: "Medical history and health-related behavior",
    type: "text",
    required: true
  },
  {
    id: "alcohol_frequency",
    label: "How often do you drink alcohol in a single week?",
    section: "Medical history and health-related behavior",
    type: "single_select",
    options: frequencyOptions,
    required: true
  },
  {
    id: "alcohol_context",
    label: "Do you tend to drink alone, with friends or others, or both?",
    section: "Alcohol use follow-up",
    type: "single_select",
    options: ["Alone", "With friends or others", "Both"],
    required: false,
    showWhen: { questionId: "alcohol_frequency", notEquals: "Not at all - 0 days" }
  },
  {
    id: "alcohol_function",
    label: "What is your reason for drinking alcohol and what function does it serve for you?",
    section: "Alcohol use follow-up",
    type: "text",
    required: false,
    showWhen: { questionId: "alcohol_frequency", notEquals: "Not at all - 0 days" }
  },
  {
    id: "alcohol_negative_effects",
    label: "Are there ways that alcohol use negatively affects you, such as in work, school, or relationships?",
    section: "Alcohol use follow-up",
    type: "text",
    required: false,
    showWhen: { questionId: "alcohol_frequency", notEquals: "Not at all - 0 days" }
  },
  ...yesNoFollowUp(
    "alcohol_more_than_anticipated",
    "Do you tend to drink more than you anticipate?",
    "Alcohol use follow-up"
  ).map((question) => ({
    ...question,
    showWhen: { questionId: "alcohol_frequency", notEquals: "Not at all - 0 days" }
  })),
  ...yesNoFollowUp(
    "alcohol_stop_unsuccessful",
    "Have you ever tried to stop drinking and been unsuccessful?",
    "Alcohol use follow-up"
  ).map((question) => ({
    ...question,
    showWhen: { questionId: "alcohol_frequency", notEquals: "Not at all - 0 days" }
  })),
  ...yesNoFollowUp(
    "alcohol_problem",
    "Do you feel like you have a problem with your use of alcohol?",
    "Alcohol use follow-up"
  ).map((question) => ({
    ...question,
    showWhen: { questionId: "alcohol_frequency", notEquals: "Not at all - 0 days" }
  })),
  {
    id: "cannabis_frequency",
    label: "How often do you use cannabis in a single week?",
    section: "Medical history and health-related behavior",
    type: "single_select",
    options: frequencyOptions,
    required: true
  },
  {
    id: "cannabis_form",
    label: "In what form do you consume cannabis?",
    section: "Cannabis use follow-up",
    type: "multi_select",
    options: ["Smoking in joints, blunts, or bongs", "Vaping with devices such as pens", "Edibles", "Other"],
    required: false,
    showWhen: { questionId: "cannabis_frequency", notEquals: "Not at all - 0 days" }
  },
  {
    id: "cannabis_context",
    label: "Do you tend to use cannabis alone, with friends or others, or both?",
    section: "Cannabis use follow-up",
    type: "single_select",
    options: ["Alone", "With friends or others", "Both"],
    required: false,
    showWhen: { questionId: "cannabis_frequency", notEquals: "Not at all - 0 days" }
  },
  {
    id: "cannabis_function",
    label: "What is your reason for using cannabis and what function does it serve for you?",
    section: "Cannabis use follow-up",
    type: "text",
    required: false,
    showWhen: { questionId: "cannabis_frequency", notEquals: "Not at all - 0 days" }
  },
  {
    id: "cannabis_negative_effects",
    label: "Are there ways that cannabis use negatively affects you, such as in work, school, or relationships?",
    section: "Cannabis use follow-up",
    type: "text",
    required: false,
    showWhen: { questionId: "cannabis_frequency", notEquals: "Not at all - 0 days" }
  },
  ...yesNoFollowUp(
    "cannabis_more_than_anticipated",
    "Do you tend to use more cannabis than you anticipate?",
    "Cannabis use follow-up"
  ).map((question) => ({
    ...question,
    showWhen: { questionId: "cannabis_frequency", notEquals: "Not at all - 0 days" }
  })),
  ...yesNoFollowUp(
    "cannabis_stop_unsuccessful",
    "Have you ever tried to stop using cannabis and been unsuccessful?",
    "Cannabis use follow-up"
  ).map((question) => ({
    ...question,
    showWhen: { questionId: "cannabis_frequency", notEquals: "Not at all - 0 days" }
  })),
  ...yesNoFollowUp(
    "cannabis_problem",
    "Do you feel like you have a problem with your use of cannabis?",
    "Cannabis use follow-up"
  ).map((question) => ({
    ...question,
    showWhen: { questionId: "cannabis_frequency", notEquals: "Not at all - 0 days" }
  })),
  {
    id: "other_substances",
    label: "Please describe any use of other drugs or substances that you would like the reviewer to understand.",
    section: "Medical history and health-related behavior",
    type: "text",
    required: false
  },
  {
    id: "overall_health",
    label: "How do you feel about your current overall health status?",
    section: "Medical history and health-related behavior",
    type: "text",
    required: true
  },
  ...yesNoFollowUp(
    "adhd_concern",
    "Has anyone, or have you yourself, ever been concerned about you having ADHD?",
    "Psychiatric, mental health, and treatment history"
  ),
  ...yesNoFollowUp(
    "anxiety_concern",
    "Has anyone, or have you yourself, ever been concerned about you having anxiety?",
    "Psychiatric, mental health, and treatment history"
  ),
  ...yesNoFollowUp(
    "mood_concern",
    "Has anyone, or have you yourself, ever been concerned about you having a mood disorder, such as depression or bipolar disorder?",
    "Psychiatric, mental health, and treatment history"
  ),
  ...yesNoFollowUp(
    "past_therapy",
    "Have you ever been in any form of psychotherapy or counseling?",
    "Psychiatric, mental health, and treatment history",
    "If yes, please detail when and the primary goals for each treatment."
  ),
  ...yesNoFollowUp(
    "current_therapy",
    "Are you currently in psychotherapy or counseling?",
    "Psychiatric, mental health, and treatment history",
    "If yes, please describe the objectives of the treatment."
  ),
  ...yesNoFollowUp(
    "current_psychiatric_medications",
    "Are you currently taking any psychiatric medications for focus, concentration, anxiety, or depression?",
    "Psychiatric, mental health, and treatment history",
    "If yes, please list the medications and describe their effectiveness."
  ),
  ...yesNoFollowUp(
    "current_supplements",
    "Are you currently taking any supplements or vitamins to help your mood, energy, or focus?",
    "Psychiatric, mental health, and treatment history",
    "If yes, please list them, how often you take them, why you take them, and their effectiveness."
  ),
  ...yesNoFollowUp(
    "current_caffeine",
    "Are you currently drinking coffee, tea, and/or energy drinks or taking caffeine pills?",
    "Psychiatric, mental health, and treatment history",
    "If yes, please list them, how often you use them, why you use them, and their effectiveness."
  ),
  ...yesNoFollowUp(
    "past_psychiatric_medications",
    "In the past, have you ever been prescribed medication for attention, focus, anxiety, or mood?",
    "Psychiatric, mental health, and treatment history",
    "If yes, please list medications, why they were prescribed, how long you took them, and their effectiveness."
  ),
  ...yesNoFollowUp(
    "non_prescribed_stimulant",
    "Have you ever tried a stimulant medication for focus, concentration, or studying that was not prescribed to you?",
    "Psychiatric, mental health, and treatment history",
    "If yes, please explain when you took this medication and how it was helpful."
  ),
  ...yesNoFollowUp(
    "prior_neuropsych_eval",
    "Have you ever received a neuropsychological, psychoeducational, and/or psychological evaluation or testing before?",
    "Evaluation history",
    "If yes, please describe when you were evaluated, why the evaluation was initiated, and the results."
  ),
  ...yesNoFollowUp(
    "school_district_eval",
    "As a child or teen, were you ever evaluated by your school district for attentional and/or learning concerns?",
    "Evaluation history",
    "If yes, please describe the reason, timing, and outcomes, including any special education services, IEP, or 504 Plan."
  ),
  ...yesNoFollowUp(
    "psychiatrist_eval",
    "Have you ever been evaluated by a psychiatrist?",
    "Evaluation history",
    "If yes, please describe when, the reason for evaluation, and any diagnoses given."
  ),
  {
    id: "current_school_level",
    label: "What level of school are you currently in?",
    section: "Educational history",
    type: "single_select",
    options: schoolLevelOptions,
    required: true
  },
  {
    id: "graduate_program_details",
    label: "If you are in graduate or professional school, please describe the type of program.",
    section: "Educational history",
    type: "text",
    required: false,
    showWhen: { questionId: "current_school_level", equals: "Graduate or professional school" }
  },
  ...yesNoFollowUp(
    "school_supports",
    "Did you have any academic accommodations or additional support in elementary, middle, or high school?",
    "Educational history",
    "If yes, please describe what the supports were, why you received them, and whether they were helpful."
  ),
  ...yesNoFollowUp(
    "reading_challenges",
    "In your early years of school, do you remember having any trouble learning how to read?",
    "Educational history",
    "If yes, please describe the challenges and whether they resolved or persisted."
  ),
  ...yesNoFollowUp(
    "teacher_attention_concern",
    "Have teachers ever expressed concern about your ability to pay attention, focus, or concentrate in class?",
    "Educational history",
    "If yes, please describe the timeline and circumstances, including whether this was before or after 7th grade."
  ),
  ...yesNoFollowUp(
    "teacher_behavior_concern",
    "Have teachers ever expressed concern about your classroom behavior, such as being disruptive?",
    "Educational history",
    "If yes, please describe the timeline and circumstances, including whether this was before or after 7th grade."
  ),
  ...yesNoFollowUp(
    "timed_test_concern",
    "Have teachers ever been concerned that you were unable to finish timed tests in school?",
    "Educational history",
    "If yes, please describe the timeline and circumstances, including whether this was before or after 7th grade."
  ),
  ...yesNoFollowUp(
    "admissions_exam_challenges",
    "Did you experience any challenges with college-admissions exams, such as the SAT or ACT?",
    "Educational history"
  ),
  {
    id: "high_school_humanities_grades",
    label: "How would you describe your high school grades in English, history, or humanities?",
    section: "Educational history",
    type: "single_select",
    options: gradeOptions,
    required: true
  },
  {
    id: "high_school_humanities_details",
    label: "Please add any context about your high school humanities grades.",
    section: "Educational history",
    type: "text",
    required: false
  },
  {
    id: "high_school_stem_grades",
    label: "How would you describe your high school grades in sciences and mathematics?",
    section: "Educational history",
    type: "single_select",
    options: gradeOptions,
    required: true
  },
  {
    id: "high_school_stem_details",
    label: "Please add any context about your high school science and mathematics grades.",
    section: "Educational history",
    type: "text",
    required: false
  },
  {
    id: "high_school_language_grades",
    label: "How would you describe your high school grades in foreign languages?",
    section: "Educational history",
    type: "single_select",
    options: gradeOptions,
    required: true
  },
  {
    id: "high_school_language_details",
    label: "Please add any context about your high school foreign language grades.",
    section: "Educational history",
    type: "text",
    required: false
  },
  {
    id: "current_college_accommodations",
    label: "Do you currently have any accommodations in the college setting?",
    section: "Educational history",
    type: "boolean",
    required: true
  },
  {
    id: "current_college_accommodations_details",
    label:
      "If yes, please describe them. If no, please describe whether you or anyone else believes you may need them and why.",
    section: "Educational history",
    type: "text",
    required: true
  },
  {
    id: "current_college_grades",
    label:
      "Please describe your current college grades by semester or term, class name, and grade. You may also upload an unofficial transcript or academic record.",
    section: "Educational history",
    type: "text",
    required: true
  },
  {
    id: "living_circumstances",
    label: "Please describe your current living circumstances and how you feel about them.",
    section: "Social history",
    type: "text",
    required: true
  },
  {
    id: "social_relationships",
    label: "Please describe your current social relationships and how you feel about them.",
    section: "Social history",
    type: "text",
    required: true
  },
  {
    id: "romantic_relationships",
    label: "Please describe any current romantic relationships or related endeavors and how you feel about them.",
    section: "Social history",
    type: "text",
    required: false
  },
  {
    id: "family_relationships",
    label: "Please describe your current familial relationships and how you feel about them.",
    section: "Social history",
    type: "text",
    required: true
  },
  {
    id: "strengths",
    label: "When you think about yourself, what strengths come to mind?",
    section: "Social history",
    type: "text",
    required: true
  },
  {
    id: "weaknesses",
    label: "When you think about yourself, what weaknesses or areas for growth come to mind?",
    section: "Social history",
    type: "text",
    required: true
  },
  {
    id: "future_plans",
    label: "What are your plans after college or after completing your graduate or professional program?",
    section: "Social history",
    type: "text",
    required: true
  },
  ...yesNoFollowUp(
    "gambling",
    "Do you engage in gambling?",
    "Social history",
    "If yes, please describe when you started, how often and what type, what you get out of it, and any negative effects."
  ),
  ...yesNoFollowUp(
    "gaming",
    "Do you engage in gaming, such as video games?",
    "Social history",
    "If yes, please describe when you started, how often and what type, what you get out of it, and any negative effects."
  ),
  ...yesNoFollowUp(
    "device_use_concerns",
    "Do you have any concerns about your social media or device use?",
    "Social history"
  )
];

export const assessmentCatalog: AssessmentModule[] = [
  {
    id: "00000000-0000-0000-0000-000000000110",
    slug: "phq-9",
    title: "Patient Health Questionnaire-9 (PHQ-9)",
    version: "1.0.0",
    status: "active",
    licenseStatus: "licensed_pending",
    domains: ["mood", "depression", "safety"],
    description:
      "A nine-item symptom questionnaire about the last two weeks. Question 9 is treated as a deterministic safety flag when answered above 'Not at all'.",
    attribution:
      "Developed by Drs. Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke and colleagues, with an educational grant from Pfizer Inc. Source document states that no permission is required to reproduce, translate, display, or distribute.",
    estimatedMinutes: 4,
    scoringStrategy: "sum_scale",
    scoringConfig: {
      label: "PHQ-9 total score",
      maxValue: 27,
      ranges: [
        { min: 0, max: 4, severity: "minimal", interpretation: "None-minimal depression severity" },
        { min: 5, max: 9, severity: "mild", interpretation: "Mild depression severity" },
        { min: 10, max: 14, severity: "moderate", interpretation: "Moderate depression severity" },
        {
          min: 15,
          max: 19,
          severity: "moderately_severe",
          interpretation: "Moderately severe depression severity"
        },
        { min: 20, max: 27, severity: "severe", interpretation: "Severe depression severity" }
      ]
    },
    questions: phq9Questions,
    createdAt: catalogCreatedAt
  },
  {
    id: "00000000-0000-0000-0000-000000000111",
    slug: "gad-7",
    title: "GAD-7 Anxiety",
    version: "1.0.0",
    status: "active",
    licenseStatus: "licensed_pending",
    domains: ["anxiety"],
    description: "A seven-item anxiety symptom questionnaire about the last two weeks.",
    attribution:
      "Copyright 1999 Pfizer Inc. All rights reserved. Reproduced with permission in the supplied source document. PsychU must confirm permitted use before production launch.",
    estimatedMinutes: 3,
    scoringStrategy: "sum_scale",
    scoringConfig: {
      label: "GAD-7 total score",
      maxValue: 21,
      ranges: [
        { min: 0, max: 4, severity: "minimal", interpretation: "Minimal anxiety severity" },
        { min: 5, max: 9, severity: "mild", interpretation: "Mild anxiety severity" },
        { min: 10, max: 14, severity: "moderate", interpretation: "Moderate anxiety severity" },
        { min: 15, max: 21, severity: "severe", interpretation: "Severe anxiety severity" }
      ]
    },
    questions: gad7Questions,
    createdAt: catalogCreatedAt
  },
  {
    id: "00000000-0000-0000-0000-000000000112",
    slug: "neuropsychu-screening-intake",
    title: "NeuropsychU Screening and Intake Questionnaire",
    version: "2026-05-25",
    status: "active",
    licenseStatus: "custom",
    domains: [
      "demographics",
      "present_concerns",
      "developmental_history",
      "medical_history",
      "mental_health",
      "educational_history",
      "social_history"
    ],
    description:
      "The student-facing questions from the NeuropsychU draft intake, organized into sections. Internal drafting notes and unresolved author comments are intentionally excluded.",
    estimatedMinutes: 35,
    scoringStrategy: "manual_review",
    questions: intakeQuestions,
    createdAt: catalogCreatedAt
  }
];
