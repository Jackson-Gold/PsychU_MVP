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
  ),
  (
    'privacy_notice',
    'PsychU Pilot Privacy Notice',
    '1.0-draft',
    'Draft placeholder. Describes FERPA-first pilot data handling, private document storage, audit logs, retention, and student-controlled sharing.',
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
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    'academic-history-documentation-custom',
    'Academic History and Documentation',
    '1.0.0',
    'active',
    'custom',
    array['academic_history', 'prior_supports', 'documentation'],
    'manual_review',
    '[
      {"id":"history_prior_eval","label":"Have you ever received a psychoeducational, neuropsychological, or medical evaluation?","type":"boolean","required":true},
      {"id":"history_supports","label":"Which supports have you used before?","type":"multi_select","required":false,"options":["Extended time","Separate room","Note-taking support","Reduced course load","Other"]},
      {"id":"history_goal","label":"What are you hoping PsychU can help clarify?","type":"text","required":true}
    ]'::jsonb
  )
on conflict (slug, version) do nothing;

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
