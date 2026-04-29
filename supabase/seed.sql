insert into public.organizations (id, name, slug, type, retention_years)
values
  ('00000000-0000-0000-0000-000000000001', 'PsychU', 'psychu', 'psychu', 7),
  ('00000000-0000-0000-0000-000000000002', 'Pilot University', 'pilot-university', 'university', 7)
on conflict (id) do nothing;

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
  )
on conflict (key, version) do nothing;

insert into public.assessment_modules (
  id,
  slug,
  title,
  version,
  status,
  license_status,
  domains,
  scoring_strategy,
  questions
)
values
  (
    '00000000-0000-0000-0000-000000000101',
    'attention-executive-function-custom',
    'Attention and Executive Function Screener',
    '1.0.0',
    'active',
    'custom',
    array['attention', 'executive_function', 'academic_functioning'],
    'average_scale',
    '[
      {"id":"attention_followthrough","label":"How often do you have trouble following through on reading, assignments, or exam preparation?","type":"scale_0_4","required":true},
      {"id":"attention_focus","label":"How often do you lose focus during classes, exams, or independent work?","type":"scale_0_4","required":true},
      {"id":"attention_time","label":"How often do you underestimate time needed for academic tasks?","type":"scale_0_4","required":true}
    ]'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    'mood-anxiety-safety-custom',
    'Mood, Anxiety, and Safety Screener',
    '1.0.0',
    'active',
    'custom',
    array['mood', 'anxiety', 'safety'],
    'average_scale',
    '[
      {"id":"anxiety_exam","label":"How often does anxiety interfere with tests, presentations, or deadlines?","type":"scale_0_4","required":true},
      {"id":"mood_energy","label":"How often do low mood, energy, or motivation interfere with coursework?","type":"scale_0_4","required":true},
      {"id":"safety_self_harm","label":"Are you currently worried you may hurt yourself or someone else?","type":"boolean","required":true,"riskTrigger":{"equals":true,"severity":"critical","message":"If you might hurt yourself or someone else, call or text 988 now, use 988 Lifeline chat, or call 911 if there is immediate danger. PsychU is not a live crisis response service."}}
    ]'::jsonb
  )
on conflict (slug, version) do nothing;
