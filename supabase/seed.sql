insert into public.organizations (id, name, slug, type, retention_years)
values
  ('00000000-0000-0000-0000-000000000001', 'PsychU', 'psychu', 'psychu', 7),
  ('00000000-0000-0000-0000-000000000002', 'Pilot University', 'pilot-university', 'university', 7)
on conflict (id) do nothing;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'student@example.com',
    crypt('PsychU-Demo-2026!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Maya Chen"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'clinician@example.com',
    crypt('PsychU-Demo-2026!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Dr. Elena Rivera"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000003',
    'authenticated',
    'authenticated',
    'admin@example.com',
    crypt('PsychU-Demo-2026!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Avery Morgan"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
on conflict (id) do update set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '{"sub":"10000000-0000-0000-0000-000000000001","email":"student@example.com"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    '{"sub":"10000000-0000-0000-0000-000000000002","email":"clinician@example.com"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000003',
    '{"sub":"10000000-0000-0000-0000-000000000003","email":"admin@example.com"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  )
on conflict (provider_id, provider) do update set
  identity_data = excluded.identity_data,
  updated_at = now();

insert into public.memberships (id, user_id, organization_id, role)
values
  (
    '30000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'student'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'psychu_clinician'
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'psychu_admin'
  )
on conflict (user_id, organization_id, role) do nothing;

insert into public.student_profiles (
  id,
  user_id,
  organization_id,
  preferred_name,
  date_of_birth,
  year_in_school,
  major,
  prior_accommodations,
  accessibility_needs
)
values (
  '40000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'Maya',
  '2005-03-17',
  'Sophomore',
  'Biology',
  array['Extended time in high school', 'Reduced-distraction testing room'],
  array['Difficulty sustaining attention during long exams', 'Slow reading under time pressure']
)
on conflict (user_id, organization_id) do update set
  preferred_name = excluded.preferred_name,
  year_in_school = excluded.year_in_school,
  major = excluded.major,
  prior_accommodations = excluded.prior_accommodations,
  accessibility_needs = excluded.accessibility_needs;

insert into public.cases (
  id,
  student_user_id,
  organization_id,
  status,
  assigned_clinician_user_id,
  current_summary,
  next_step
)
values (
  '50000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'draft',
  '10000000-0000-0000-0000-000000000002',
  'Student is completing the NeuropsychU intake, PHQ-9, and GAD-7 questionnaires.',
  'Complete and submit all questionnaires for assigned clinician review.'
)
on conflict (id) do update set
  assigned_clinician_user_id = excluded.assigned_clinician_user_id,
  current_summary = excluded.current_summary,
  next_step = excluded.next_step;

insert into public.consent_versions (key, title, version, body, required)
values
  (
    'student_consent',
    'Student Screening Consent',
    '1.0-draft',
    'Draft placeholder. Replace with PsychU counsel-approved consent before production launch.',
    true
  ),
  (
    'release_of_information',
    'Release of Information',
    '1.0-draft',
    'Draft placeholder. Students control release of reviewed packets to university recipients.',
    true
  ),
  (
    'privacy_notice',
    'PsychU Pilot Privacy Notice',
    '1.0-draft',
    'Draft placeholder. Describes FERPA-first pilot data handling, private document storage, audit logs, retention, and student-controlled sharing.',
    true
  )
on conflict (key, version) do nothing;

insert into public.invites (
  id,
  email,
  organization_id,
  invited_by_user_id,
  role,
  status,
  expires_at
)
values
  (
    '00000000-0000-0000-0000-000000000201',
    'maya.student@pilot.edu',
    '00000000-0000-0000-0000-000000000002',
    null,
    'student',
    'pending',
    now() + interval '14 days'
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    'accessibility.staff@pilot.edu',
    '00000000-0000-0000-0000-000000000002',
    null,
    'university_staff',
    'pending',
    now() + interval '14 days'
  ),
  (
    '00000000-0000-0000-0000-000000000203',
    'clinician@psychu.test',
    '00000000-0000-0000-0000-000000000001',
    null,
    'psychu_clinician',
    'pending',
    now() + interval '14 days'
  )
on conflict (id) do update set
  email = excluded.email,
  role = excluded.role,
  status = excluded.status,
  expires_at = excluded.expires_at;

insert into public.audit_logs (
  id,
  actor_user_id,
  organization_id,
  action,
  target_type,
  target_id,
  metadata
)
values
  (
    '00000000-0000-0000-0000-000000000301',
    null,
    '00000000-0000-0000-0000-000000000002',
    'demo_seed.invites_created',
    'organization',
    '00000000-0000-0000-0000-000000000002',
    '{"note":"Demo pilot invites seeded for walkthrough validation."}'::jsonb
  )
on conflict (id) do nothing;

update public.assessment_modules
set status = 'retired'
where slug in (
  'attention-executive-function-custom',
  'mood-anxiety-safety-custom',
  'academic-history-documentation-custom'
);

-- BEGIN GENERATED ASSESSMENT CATALOG
insert into public.assessment_modules (
  id,
  slug,
  title,
  version,
  status,
  license_status,
  domains,
  description,
  attribution,
  estimated_minutes,
  scoring_strategy,
  scoring_config,
  questions
)
values
  (
    '00000000-0000-0000-0000-000000000110',
    'phq-9',
    'Patient Health Questionnaire-9 (PHQ-9)',
    '1.0.0',
    'active',
    'licensed_pending',
    array['mood', 'depression', 'safety'],
    'A nine-item symptom questionnaire about the last two weeks. Question 9 is treated as a deterministic safety flag when answered above ''Not at all''.',
    'Developed by Drs. Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke and colleagues, with an educational grant from Pfizer Inc. Source document states that no permission is required to reproduce, translate, display, or distribute.',
    4,
    'sum_scale',
    '{"label":"PHQ-9 total score","maxValue":27,"ranges":[{"min":0,"max":4,"severity":"minimal","interpretation":"None-minimal depression severity"},{"min":5,"max":9,"severity":"mild","interpretation":"Mild depression severity"},{"min":10,"max":14,"severity":"moderate","interpretation":"Moderate depression severity"},{"min":15,"max":19,"severity":"moderately_severe","interpretation":"Moderately severe depression severity"},{"min":20,"max":27,"severity":"severe","interpretation":"Severe depression severity"}]}'::jsonb,
    '[{"id":"phq9_1","label":"Little interest or pleasure in doing things","section":"Over the last 2 weeks","helpText":"Choose the answer that best describes how often this has bothered you.","type":"scale_0_3","required":true},{"id":"phq9_2","label":"Feeling down, depressed, or hopeless","section":"Over the last 2 weeks","helpText":"Choose the answer that best describes how often this has bothered you.","type":"scale_0_3","required":true},{"id":"phq9_3","label":"Trouble falling or staying asleep, or sleeping too much","section":"Over the last 2 weeks","helpText":"Choose the answer that best describes how often this has bothered you.","type":"scale_0_3","required":true},{"id":"phq9_4","label":"Feeling tired or having little energy","section":"Over the last 2 weeks","helpText":"Choose the answer that best describes how often this has bothered you.","type":"scale_0_3","required":true},{"id":"phq9_5","label":"Poor appetite or overeating","section":"Over the last 2 weeks","helpText":"Choose the answer that best describes how often this has bothered you.","type":"scale_0_3","required":true},{"id":"phq9_6","label":"Feeling bad about yourself - or that you are a failure or have let yourself or your family down","section":"Over the last 2 weeks","helpText":"Choose the answer that best describes how often this has bothered you.","type":"scale_0_3","required":true},{"id":"phq9_7","label":"Trouble concentrating on things, such as reading the newspaper or watching television","section":"Over the last 2 weeks","helpText":"Choose the answer that best describes how often this has bothered you.","type":"scale_0_3","required":true},{"id":"phq9_8","label":"Moving or speaking so slowly that other people could have noticed, or the opposite - being so fidgety or restless that you have been moving around a lot more than usual","section":"Over the last 2 weeks","helpText":"Choose the answer that best describes how often this has bothered you.","type":"scale_0_3","required":true},{"id":"phq9_9","label":"Thoughts that you would be better off dead or of hurting yourself in some way","section":"Over the last 2 weeks","helpText":"Choose the answer that best describes how often this has bothered you.","type":"scale_0_3","required":true,"riskTrigger":{"minimum":1,"severity":"high","message":"A response above ''Not at all'' to PHQ-9 question 9 requires prompt follow-up by a clinician competent to assess suicide risk. If you might hurt yourself or someone else, call or text 988 now, use 988 Lifeline chat, or call 911 if there is immediate danger. PsychU is not a live crisis response service."}},{"id":"phq9_difficulty","label":"If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?","section":"Functional impact","type":"single_select","required":true,"options":["Not difficult at all","Somewhat difficult","Very difficult","Extremely difficult"]}]'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000111',
    'gad-7',
    'GAD-7 Anxiety',
    '1.0.0',
    'active',
    'licensed_pending',
    array['anxiety'],
    'A seven-item anxiety symptom questionnaire about the last two weeks.',
    'Copyright 1999 Pfizer Inc. All rights reserved. Reproduced with permission in the supplied source document. PsychU must confirm permitted use before production launch.',
    3,
    'sum_scale',
    '{"label":"GAD-7 total score","maxValue":21,"ranges":[{"min":0,"max":4,"severity":"minimal","interpretation":"Minimal anxiety severity"},{"min":5,"max":9,"severity":"mild","interpretation":"Mild anxiety severity"},{"min":10,"max":14,"severity":"moderate","interpretation":"Moderate anxiety severity"},{"min":15,"max":21,"severity":"severe","interpretation":"Severe anxiety severity"}]}'::jsonb,
    '[{"id":"gad7_1","label":"Feeling nervous, anxious, or on edge","section":"Over the last 2 weeks","helpText":"Choose the answer that best describes how often this has bothered you.","type":"scale_0_3","required":true},{"id":"gad7_2","label":"Not being able to stop or control worrying","section":"Over the last 2 weeks","helpText":"Choose the answer that best describes how often this has bothered you.","type":"scale_0_3","required":true},{"id":"gad7_3","label":"Worrying too much about different things","section":"Over the last 2 weeks","helpText":"Choose the answer that best describes how often this has bothered you.","type":"scale_0_3","required":true},{"id":"gad7_4","label":"Trouble relaxing","section":"Over the last 2 weeks","helpText":"Choose the answer that best describes how often this has bothered you.","type":"scale_0_3","required":true},{"id":"gad7_5","label":"Being so restless that it is hard to sit still","section":"Over the last 2 weeks","helpText":"Choose the answer that best describes how often this has bothered you.","type":"scale_0_3","required":true},{"id":"gad7_6","label":"Becoming easily annoyed or irritable","section":"Over the last 2 weeks","helpText":"Choose the answer that best describes how often this has bothered you.","type":"scale_0_3","required":true},{"id":"gad7_7","label":"Feeling afraid, as if something awful might happen","section":"Over the last 2 weeks","helpText":"Choose the answer that best describes how often this has bothered you.","type":"scale_0_3","required":true},{"id":"gad7_difficulty","label":"If you checked any problems, how difficult have they made it for you to do your work, take care of things at home, or get along with other people?","section":"Functional impact","type":"single_select","required":true,"options":["Not difficult at all","Somewhat difficult","Very difficult","Extremely difficult"]}]'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000112',
    'neuropsychu-screening-intake',
    'NeuropsychU Screening and Intake Questionnaire',
    '2026-05-25',
    'active',
    'custom',
    array['demographics', 'present_concerns', 'developmental_history', 'medical_history', 'mental_health', 'educational_history', 'social_history'],
    'The student-facing questions from the NeuropsychU draft intake, organized into sections. Internal drafting notes and unresolved author comments are intentionally excluded.',
    '',
    35,
    'manual_review',
    '{}'::jsonb,
    '[{"id":"referral_source","label":"Who referred you to NeuropsychU, or how did you first connect with us?","section":"Registration and demographics","type":"text","required":true},{"id":"full_name","label":"Full name","section":"Registration and demographics","type":"text","required":true},{"id":"date_of_birth","label":"Date of birth","section":"Registration and demographics","type":"date","required":true},{"id":"age","label":"Age","section":"Registration and demographics","type":"number","required":true},{"id":"phone_number","label":"Phone number","section":"Registration and demographics","type":"tel","required":true},{"id":"email_address","label":"Email address","section":"Registration and demographics","type":"email","required":true},{"id":"assigned_sex_at_birth","label":"Assigned sex at birth","section":"Registration and demographics","type":"text","required":false},{"id":"gender_identity","label":"Preferred or identified gender","section":"Registration and demographics","type":"text","required":false},{"id":"pronouns","label":"Pronouns","section":"Registration and demographics","type":"text","required":false},{"id":"school_name","label":"Name of college or graduate school","section":"Registration and demographics","type":"text","required":true},{"id":"year_in_school","label":"Year in college or graduate school","section":"Registration and demographics","type":"single_select","options":["Freshman in college","Sophomore in college","Junior in college","Senior in college","Graduate or professional school"],"required":true},{"id":"degree_program","label":"Major, concentration, degree topic, and any minors","section":"Registration and demographics","type":"text","required":true},{"id":"anticipated_degree","label":"Anticipated degree from your college or graduate program","section":"Registration and demographics","type":"text","required":true},{"id":"native_language","label":"Native language and whether English is your dominant language","section":"Registration and demographics","type":"text","required":true},{"id":"present_concerns","label":"Why are you seeking this current evaluation? Tell us about your current concerns, when they started, and how they have progressed.","section":"Reason for testing and present concerns","type":"text","required":true},{"id":"evaluation_goals","label":"What do you hope to get out of this current evaluation? How can we best help?","section":"Reason for testing and present concerns","type":"text","required":true},{"id":"family_adhd","label":"Is there a history of Attention-Deficit/Hyperactivity Disorder (ADHD) in your family?","section":"Family psychiatric history","type":"boolean","required":true},{"id":"family_adhd_details","label":"If yes, please describe.","section":"Family psychiatric history","type":"text","required":false,"showWhen":{"questionId":"family_adhd","equals":true}},{"id":"family_learning","label":"Is there a history of learning disabilities or learning challenges in your family?","section":"Family psychiatric history","type":"boolean","required":true},{"id":"family_learning_details","label":"If yes, please describe.","section":"Family psychiatric history","type":"text","required":false,"showWhen":{"questionId":"family_learning","equals":true}},{"id":"family_anxiety","label":"Is there a history of anxiety in your family?","section":"Family psychiatric history","type":"boolean","required":true},{"id":"family_anxiety_details","label":"If yes, please describe.","section":"Family psychiatric history","type":"text","required":false,"showWhen":{"questionId":"family_anxiety","equals":true}},{"id":"family_mood","label":"Is there a history of any mood disorders, such as depression or bipolar disorder, in your family?","section":"Family psychiatric history","type":"boolean","required":true},{"id":"family_mood_details","label":"If yes, please describe.","section":"Family psychiatric history","type":"text","required":false,"showWhen":{"questionId":"family_mood","equals":true}},{"id":"family_substance","label":"Is there a history of problematic substance use in your family?","section":"Family psychiatric history","type":"boolean","required":true},{"id":"family_substance_details","label":"If yes, please describe.","section":"Family psychiatric history","type":"text","required":false,"showWhen":{"questionId":"family_substance","equals":true}},{"id":"developmental_challenges","label":"Are you aware of any developmental challenges you experienced during early childhood, such as speech and language, motor, social-emotional, or behavioral difficulties?","section":"Developmental history","type":"boolean","required":true},{"id":"developmental_challenges_details","label":"If yes, please describe.","section":"Developmental history","type":"text","required":false,"showWhen":{"questionId":"developmental_challenges","equals":true}},{"id":"developmental_services","label":"Did you receive services during early childhood to address developmental concerns?","section":"Developmental history","type":"boolean","required":true},{"id":"developmental_services_details","label":"If yes, please describe services such as speech-language, physical, occupational, or behavioral therapy.","section":"Developmental history","type":"text","required":false,"showWhen":{"questionId":"developmental_services","equals":true}},{"id":"childhood_health","label":"During early childhood, did you experience any significant health problems or medical illnesses or conditions?","section":"Developmental history","type":"boolean","required":true},{"id":"childhood_health_details","label":"If yes, please describe.","section":"Developmental history","type":"text","required":false,"showWhen":{"questionId":"childhood_health","equals":true}},{"id":"medical_conditions","label":"Please list any medical conditions that you have and/or have been treated for.","section":"Medical history and health-related behavior","type":"text","required":true},{"id":"current_medications","label":"Please list any current prescribed medications, including psychiatric and medical medications.","section":"Medical history and health-related behavior","type":"text","required":true},{"id":"past_medications","label":"Please list medications that have been prescribed to you in the past.","section":"Medical history and health-related behavior","type":"text","required":false},{"id":"hospitalizations","label":"Do you have a history of hospitalizations for medical and/or psychiatric reasons?","section":"Medical history and health-related behavior","type":"boolean","required":true},{"id":"hospitalizations_details","label":"If yes, please describe.","section":"Medical history and health-related behavior","type":"text","required":false,"showWhen":{"questionId":"hospitalizations","equals":true}},{"id":"vision_concerns","label":"Are there any current concerns with your vision, including needing glasses or contact lenses for correction?","section":"Medical history and health-related behavior","type":"boolean","required":true},{"id":"vision_concerns_details","label":"If yes, please describe.","section":"Medical history and health-related behavior","type":"text","required":false,"showWhen":{"questionId":"vision_concerns","equals":true}},{"id":"hearing_concerns","label":"Are there any current concerns with your hearing, including needing hearing aids or implants for correction?","section":"Medical history and health-related behavior","type":"boolean","required":true},{"id":"hearing_concerns_details","label":"If yes, please describe.","section":"Medical history and health-related behavior","type":"text","required":false,"showWhen":{"questionId":"hearing_concerns","equals":true}},{"id":"neurological_concerns","label":"Do you have any history of neurological concerns, such as seizures, concussions, and/or traumatic brain injury?","section":"Medical history and health-related behavior","type":"boolean","required":true},{"id":"neurological_concerns_details","label":"If yes, please describe and note whether this continues to affect you or has caused long-term challenges.","section":"Medical history and health-related behavior","type":"text","required":false,"showWhen":{"questionId":"neurological_concerns","equals":true}},{"id":"eating_patterns","label":"Please describe your current eating patterns and any concerns with your eating.","section":"Medical history and health-related behavior","type":"text","required":true},{"id":"sleeping_patterns","label":"Please describe your current sleeping patterns and any concerns with your sleeping.","section":"Medical history and health-related behavior","type":"text","required":true},{"id":"exercise_routine","label":"Please describe your current exercise routine and any concerns you have in this area.","section":"Medical history and health-related behavior","type":"text","required":true},{"id":"alcohol_frequency","label":"How often do you drink alcohol in a single week?","section":"Medical history and health-related behavior","type":"single_select","options":["Not at all - 0 days","1-2 days","3-4 days","5-6 days","Nearly every day of the week"],"required":true},{"id":"alcohol_context","label":"Do you tend to drink alone, with friends or others, or both?","section":"Alcohol use follow-up","type":"single_select","options":["Alone","With friends or others","Both"],"required":false,"showWhen":{"questionId":"alcohol_frequency","notEquals":"Not at all - 0 days"}},{"id":"alcohol_function","label":"What is your reason for drinking alcohol and what function does it serve for you?","section":"Alcohol use follow-up","type":"text","required":false,"showWhen":{"questionId":"alcohol_frequency","notEquals":"Not at all - 0 days"}},{"id":"alcohol_negative_effects","label":"Are there ways that alcohol use negatively affects you, such as in work, school, or relationships?","section":"Alcohol use follow-up","type":"text","required":false,"showWhen":{"questionId":"alcohol_frequency","notEquals":"Not at all - 0 days"}},{"id":"alcohol_more_than_anticipated","label":"Do you tend to drink more than you anticipate?","section":"Alcohol use follow-up","type":"boolean","required":true,"showWhen":{"questionId":"alcohol_frequency","notEquals":"Not at all - 0 days"}},{"id":"alcohol_more_than_anticipated_details","label":"If yes, please describe.","section":"Alcohol use follow-up","type":"text","required":false,"showWhen":{"questionId":"alcohol_frequency","notEquals":"Not at all - 0 days"}},{"id":"alcohol_stop_unsuccessful","label":"Have you ever tried to stop drinking and been unsuccessful?","section":"Alcohol use follow-up","type":"boolean","required":true,"showWhen":{"questionId":"alcohol_frequency","notEquals":"Not at all - 0 days"}},{"id":"alcohol_stop_unsuccessful_details","label":"If yes, please describe.","section":"Alcohol use follow-up","type":"text","required":false,"showWhen":{"questionId":"alcohol_frequency","notEquals":"Not at all - 0 days"}},{"id":"alcohol_problem","label":"Do you feel like you have a problem with your use of alcohol?","section":"Alcohol use follow-up","type":"boolean","required":true,"showWhen":{"questionId":"alcohol_frequency","notEquals":"Not at all - 0 days"}},{"id":"alcohol_problem_details","label":"If yes, please describe.","section":"Alcohol use follow-up","type":"text","required":false,"showWhen":{"questionId":"alcohol_frequency","notEquals":"Not at all - 0 days"}},{"id":"cannabis_frequency","label":"How often do you use cannabis in a single week?","section":"Medical history and health-related behavior","type":"single_select","options":["Not at all - 0 days","1-2 days","3-4 days","5-6 days","Nearly every day of the week"],"required":true},{"id":"cannabis_form","label":"In what form do you consume cannabis?","section":"Cannabis use follow-up","type":"multi_select","options":["Smoking in joints, blunts, or bongs","Vaping with devices such as pens","Edibles","Other"],"required":false,"showWhen":{"questionId":"cannabis_frequency","notEquals":"Not at all - 0 days"}},{"id":"cannabis_context","label":"Do you tend to use cannabis alone, with friends or others, or both?","section":"Cannabis use follow-up","type":"single_select","options":["Alone","With friends or others","Both"],"required":false,"showWhen":{"questionId":"cannabis_frequency","notEquals":"Not at all - 0 days"}},{"id":"cannabis_function","label":"What is your reason for using cannabis and what function does it serve for you?","section":"Cannabis use follow-up","type":"text","required":false,"showWhen":{"questionId":"cannabis_frequency","notEquals":"Not at all - 0 days"}},{"id":"cannabis_negative_effects","label":"Are there ways that cannabis use negatively affects you, such as in work, school, or relationships?","section":"Cannabis use follow-up","type":"text","required":false,"showWhen":{"questionId":"cannabis_frequency","notEquals":"Not at all - 0 days"}},{"id":"cannabis_more_than_anticipated","label":"Do you tend to use more cannabis than you anticipate?","section":"Cannabis use follow-up","type":"boolean","required":true,"showWhen":{"questionId":"cannabis_frequency","notEquals":"Not at all - 0 days"}},{"id":"cannabis_more_than_anticipated_details","label":"If yes, please describe.","section":"Cannabis use follow-up","type":"text","required":false,"showWhen":{"questionId":"cannabis_frequency","notEquals":"Not at all - 0 days"}},{"id":"cannabis_stop_unsuccessful","label":"Have you ever tried to stop using cannabis and been unsuccessful?","section":"Cannabis use follow-up","type":"boolean","required":true,"showWhen":{"questionId":"cannabis_frequency","notEquals":"Not at all - 0 days"}},{"id":"cannabis_stop_unsuccessful_details","label":"If yes, please describe.","section":"Cannabis use follow-up","type":"text","required":false,"showWhen":{"questionId":"cannabis_frequency","notEquals":"Not at all - 0 days"}},{"id":"cannabis_problem","label":"Do you feel like you have a problem with your use of cannabis?","section":"Cannabis use follow-up","type":"boolean","required":true,"showWhen":{"questionId":"cannabis_frequency","notEquals":"Not at all - 0 days"}},{"id":"cannabis_problem_details","label":"If yes, please describe.","section":"Cannabis use follow-up","type":"text","required":false,"showWhen":{"questionId":"cannabis_frequency","notEquals":"Not at all - 0 days"}},{"id":"other_substances","label":"Please describe any use of other drugs or substances that you would like the reviewer to understand.","section":"Medical history and health-related behavior","type":"text","required":false},{"id":"overall_health","label":"How do you feel about your current overall health status?","section":"Medical history and health-related behavior","type":"text","required":true},{"id":"adhd_concern","label":"Has anyone, or have you yourself, ever been concerned about you having ADHD?","section":"Psychiatric, mental health, and treatment history","type":"boolean","required":true},{"id":"adhd_concern_details","label":"If yes, please describe.","section":"Psychiatric, mental health, and treatment history","type":"text","required":false,"showWhen":{"questionId":"adhd_concern","equals":true}},{"id":"anxiety_concern","label":"Has anyone, or have you yourself, ever been concerned about you having anxiety?","section":"Psychiatric, mental health, and treatment history","type":"boolean","required":true},{"id":"anxiety_concern_details","label":"If yes, please describe.","section":"Psychiatric, mental health, and treatment history","type":"text","required":false,"showWhen":{"questionId":"anxiety_concern","equals":true}},{"id":"mood_concern","label":"Has anyone, or have you yourself, ever been concerned about you having a mood disorder, such as depression or bipolar disorder?","section":"Psychiatric, mental health, and treatment history","type":"boolean","required":true},{"id":"mood_concern_details","label":"If yes, please describe.","section":"Psychiatric, mental health, and treatment history","type":"text","required":false,"showWhen":{"questionId":"mood_concern","equals":true}},{"id":"past_therapy","label":"Have you ever been in any form of psychotherapy or counseling?","section":"Psychiatric, mental health, and treatment history","type":"boolean","required":true},{"id":"past_therapy_details","label":"If yes, please detail when and the primary goals for each treatment.","section":"Psychiatric, mental health, and treatment history","type":"text","required":false,"showWhen":{"questionId":"past_therapy","equals":true}},{"id":"current_therapy","label":"Are you currently in psychotherapy or counseling?","section":"Psychiatric, mental health, and treatment history","type":"boolean","required":true},{"id":"current_therapy_details","label":"If yes, please describe the objectives of the treatment.","section":"Psychiatric, mental health, and treatment history","type":"text","required":false,"showWhen":{"questionId":"current_therapy","equals":true}},{"id":"current_psychiatric_medications","label":"Are you currently taking any psychiatric medications for focus, concentration, anxiety, or depression?","section":"Psychiatric, mental health, and treatment history","type":"boolean","required":true},{"id":"current_psychiatric_medications_details","label":"If yes, please list the medications and describe their effectiveness.","section":"Psychiatric, mental health, and treatment history","type":"text","required":false,"showWhen":{"questionId":"current_psychiatric_medications","equals":true}},{"id":"current_supplements","label":"Are you currently taking any supplements or vitamins to help your mood, energy, or focus?","section":"Psychiatric, mental health, and treatment history","type":"boolean","required":true},{"id":"current_supplements_details","label":"If yes, please list them, how often you take them, why you take them, and their effectiveness.","section":"Psychiatric, mental health, and treatment history","type":"text","required":false,"showWhen":{"questionId":"current_supplements","equals":true}},{"id":"current_caffeine","label":"Are you currently drinking coffee, tea, and/or energy drinks or taking caffeine pills?","section":"Psychiatric, mental health, and treatment history","type":"boolean","required":true},{"id":"current_caffeine_details","label":"If yes, please list them, how often you use them, why you use them, and their effectiveness.","section":"Psychiatric, mental health, and treatment history","type":"text","required":false,"showWhen":{"questionId":"current_caffeine","equals":true}},{"id":"past_psychiatric_medications","label":"In the past, have you ever been prescribed medication for attention, focus, anxiety, or mood?","section":"Psychiatric, mental health, and treatment history","type":"boolean","required":true},{"id":"past_psychiatric_medications_details","label":"If yes, please list medications, why they were prescribed, how long you took them, and their effectiveness.","section":"Psychiatric, mental health, and treatment history","type":"text","required":false,"showWhen":{"questionId":"past_psychiatric_medications","equals":true}},{"id":"non_prescribed_stimulant","label":"Have you ever tried a stimulant medication for focus, concentration, or studying that was not prescribed to you?","section":"Psychiatric, mental health, and treatment history","type":"boolean","required":true},{"id":"non_prescribed_stimulant_details","label":"If yes, please explain when you took this medication and how it was helpful.","section":"Psychiatric, mental health, and treatment history","type":"text","required":false,"showWhen":{"questionId":"non_prescribed_stimulant","equals":true}},{"id":"prior_neuropsych_eval","label":"Have you ever received a neuropsychological, psychoeducational, and/or psychological evaluation or testing before?","section":"Evaluation history","type":"boolean","required":true},{"id":"prior_neuropsych_eval_details","label":"If yes, please describe when you were evaluated, why the evaluation was initiated, and the results.","section":"Evaluation history","type":"text","required":false,"showWhen":{"questionId":"prior_neuropsych_eval","equals":true}},{"id":"school_district_eval","label":"As a child or teen, were you ever evaluated by your school district for attentional and/or learning concerns?","section":"Evaluation history","type":"boolean","required":true},{"id":"school_district_eval_details","label":"If yes, please describe the reason, timing, and outcomes, including any special education services, IEP, or 504 Plan.","section":"Evaluation history","type":"text","required":false,"showWhen":{"questionId":"school_district_eval","equals":true}},{"id":"psychiatrist_eval","label":"Have you ever been evaluated by a psychiatrist?","section":"Evaluation history","type":"boolean","required":true},{"id":"psychiatrist_eval_details","label":"If yes, please describe when, the reason for evaluation, and any diagnoses given.","section":"Evaluation history","type":"text","required":false,"showWhen":{"questionId":"psychiatrist_eval","equals":true}},{"id":"current_school_level","label":"What level of school are you currently in?","section":"Educational history","type":"single_select","options":["Freshman in college","Sophomore in college","Junior in college","Senior in college","Graduate or professional school"],"required":true},{"id":"graduate_program_details","label":"If you are in graduate or professional school, please describe the type of program.","section":"Educational history","type":"text","required":false,"showWhen":{"questionId":"current_school_level","equals":"Graduate or professional school"}},{"id":"school_supports","label":"Did you have any academic accommodations or additional support in elementary, middle, or high school?","section":"Educational history","type":"boolean","required":true},{"id":"school_supports_details","label":"If yes, please describe what the supports were, why you received them, and whether they were helpful.","section":"Educational history","type":"text","required":false,"showWhen":{"questionId":"school_supports","equals":true}},{"id":"reading_challenges","label":"In your early years of school, do you remember having any trouble learning how to read?","section":"Educational history","type":"boolean","required":true},{"id":"reading_challenges_details","label":"If yes, please describe the challenges and whether they resolved or persisted.","section":"Educational history","type":"text","required":false,"showWhen":{"questionId":"reading_challenges","equals":true}},{"id":"teacher_attention_concern","label":"Have teachers ever expressed concern about your ability to pay attention, focus, or concentrate in class?","section":"Educational history","type":"boolean","required":true},{"id":"teacher_attention_concern_details","label":"If yes, please describe the timeline and circumstances, including whether this was before or after 7th grade.","section":"Educational history","type":"text","required":false,"showWhen":{"questionId":"teacher_attention_concern","equals":true}},{"id":"teacher_behavior_concern","label":"Have teachers ever expressed concern about your classroom behavior, such as being disruptive?","section":"Educational history","type":"boolean","required":true},{"id":"teacher_behavior_concern_details","label":"If yes, please describe the timeline and circumstances, including whether this was before or after 7th grade.","section":"Educational history","type":"text","required":false,"showWhen":{"questionId":"teacher_behavior_concern","equals":true}},{"id":"timed_test_concern","label":"Have teachers ever been concerned that you were unable to finish timed tests in school?","section":"Educational history","type":"boolean","required":true},{"id":"timed_test_concern_details","label":"If yes, please describe the timeline and circumstances, including whether this was before or after 7th grade.","section":"Educational history","type":"text","required":false,"showWhen":{"questionId":"timed_test_concern","equals":true}},{"id":"admissions_exam_challenges","label":"Did you experience any challenges with college-admissions exams, such as the SAT or ACT?","section":"Educational history","type":"boolean","required":true},{"id":"admissions_exam_challenges_details","label":"If yes, please describe.","section":"Educational history","type":"text","required":false,"showWhen":{"questionId":"admissions_exam_challenges","equals":true}},{"id":"high_school_humanities_grades","label":"How would you describe your high school grades in English, history, or humanities?","section":"Educational history","type":"single_select","options":["Mostly A student","Mostly A and B student","Mostly B student","Mostly B and C student","Mostly C student","Below C student","Failing grades in this area","Not applicable"],"required":true},{"id":"high_school_humanities_details","label":"Please add any context about your high school humanities grades.","section":"Educational history","type":"text","required":false},{"id":"high_school_stem_grades","label":"How would you describe your high school grades in sciences and mathematics?","section":"Educational history","type":"single_select","options":["Mostly A student","Mostly A and B student","Mostly B student","Mostly B and C student","Mostly C student","Below C student","Failing grades in this area","Not applicable"],"required":true},{"id":"high_school_stem_details","label":"Please add any context about your high school science and mathematics grades.","section":"Educational history","type":"text","required":false},{"id":"high_school_language_grades","label":"How would you describe your high school grades in foreign languages?","section":"Educational history","type":"single_select","options":["Mostly A student","Mostly A and B student","Mostly B student","Mostly B and C student","Mostly C student","Below C student","Failing grades in this area","Not applicable"],"required":true},{"id":"high_school_language_details","label":"Please add any context about your high school foreign language grades.","section":"Educational history","type":"text","required":false},{"id":"current_college_accommodations","label":"Do you currently have any accommodations in the college setting?","section":"Educational history","type":"boolean","required":true},{"id":"current_college_accommodations_details","label":"If yes, please describe them. If no, please describe whether you or anyone else believes you may need them and why.","section":"Educational history","type":"text","required":true},{"id":"current_college_grades","label":"Please describe your current college grades by semester or term, class name, and grade. You may also upload an unofficial transcript or academic record.","section":"Educational history","type":"text","required":true},{"id":"living_circumstances","label":"Please describe your current living circumstances and how you feel about them.","section":"Social history","type":"text","required":true},{"id":"social_relationships","label":"Please describe your current social relationships and how you feel about them.","section":"Social history","type":"text","required":true},{"id":"romantic_relationships","label":"Please describe any current romantic relationships or related endeavors and how you feel about them.","section":"Social history","type":"text","required":false},{"id":"family_relationships","label":"Please describe your current familial relationships and how you feel about them.","section":"Social history","type":"text","required":true},{"id":"strengths","label":"When you think about yourself, what strengths come to mind?","section":"Social history","type":"text","required":true},{"id":"weaknesses","label":"When you think about yourself, what weaknesses or areas for growth come to mind?","section":"Social history","type":"text","required":true},{"id":"future_plans","label":"What are your plans after college or after completing your graduate or professional program?","section":"Social history","type":"text","required":true},{"id":"gambling","label":"Do you engage in gambling?","section":"Social history","type":"boolean","required":true},{"id":"gambling_details","label":"If yes, please describe when you started, how often and what type, what you get out of it, and any negative effects.","section":"Social history","type":"text","required":false,"showWhen":{"questionId":"gambling","equals":true}},{"id":"gaming","label":"Do you engage in gaming, such as video games?","section":"Social history","type":"boolean","required":true},{"id":"gaming_details","label":"If yes, please describe when you started, how often and what type, what you get out of it, and any negative effects.","section":"Social history","type":"text","required":false,"showWhen":{"questionId":"gaming","equals":true}},{"id":"device_use_concerns","label":"Do you have any concerns about your social media or device use?","section":"Social history","type":"boolean","required":true},{"id":"device_use_concerns_details","label":"If yes, please describe.","section":"Social history","type":"text","required":false,"showWhen":{"questionId":"device_use_concerns","equals":true}}]'::jsonb
  )
on conflict (slug, version) do update set
  title = excluded.title,
  status = excluded.status,
  license_status = excluded.license_status,
  domains = excluded.domains,
  description = excluded.description,
  attribution = excluded.attribution,
  estimated_minutes = excluded.estimated_minutes,
  scoring_strategy = excluded.scoring_strategy,
  scoring_config = excluded.scoring_config,
  questions = excluded.questions;
-- END GENERATED ASSESSMENT CATALOG
