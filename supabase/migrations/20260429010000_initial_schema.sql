create extension if not exists pgcrypto;
create extension if not exists citext;

do $$
begin
  create type public.organization_type as enum ('psychu', 'university');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.app_role as enum (
    'student',
    'psychu_clinician',
    'psychu_admin',
    'university_staff',
    'university_admin'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.case_status as enum (
    'draft',
    'submitted',
    'urgent_flagged',
    'under_review',
    'needs_info',
    'packet_ready',
    'shared',
    'closed'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.triage_outcome as enum (
    'request_more_docs',
    'schedule_psychu_review',
    'refer_external_evaluation',
    'share_with_university',
    'urgent_safety_followup',
    'no_current_action'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.share_status as enum ('active', 'revoked', 'expired');
exception when duplicate_object then null;
end $$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type public.organization_type not null,
  retention_years integer not null default 7 check (retention_years between 1 and 30),
  created_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, organization_id, role)
);

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  email citext not null,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invited_by_user_id uuid references auth.users(id) on delete set null,
  role public.app_role not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'revoked')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.consent_versions (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  title text not null,
  version text not null,
  body text not null,
  required boolean not null default true,
  effective_at timestamptz not null default now(),
  unique (key, version)
);

create table if not exists public.student_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_version_id uuid not null references public.consent_versions(id),
  accepted_at timestamptz not null default now(),
  ip_address inet,
  user_agent text,
  unique (user_id, consent_version_id)
);

create table if not exists public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  preferred_name text not null,
  date_of_birth date not null,
  year_in_school text not null,
  major text,
  prior_accommodations text[] not null default '{}',
  accessibility_needs text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, organization_id)
);

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  status public.case_status not null default 'draft',
  submitted_at timestamptz,
  assigned_clinician_user_id uuid references auth.users(id) on delete set null,
  current_summary text not null default '',
  next_step text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessment_modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  version text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'retired')),
  license_status text not null check (
    license_status in ('custom', 'public_domain_verified', 'licensed_pending', 'licensed_verified')
  ),
  domains text[] not null default '{}',
  scoring_strategy text not null check (scoring_strategy in ('average_scale', 'manual_review')),
  questions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (slug, version)
);

create table if not exists public.assessment_responses (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  module_id uuid not null references public.assessment_modules(id),
  module_version text not null,
  answers jsonb not null default '{}'::jsonb,
  completed_at timestamptz not null default now(),
  unique (case_id, module_id, module_version)
);

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  module_id uuid not null references public.assessment_modules(id),
  label text not null,
  value numeric(6, 2) not null,
  severity text not null check (severity in ('minimal', 'mild', 'moderate', 'significant', 'review_required')),
  summary text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.uploaded_documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  uploaded_by_user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  content_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  category text not null check (
    category in ('prior_evaluation', 'iep_504', 'medical_note', 'academic_record', 'other')
  ),
  created_at timestamptz not null default now()
);

create table if not exists public.risk_flags (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  source text not null check (source in ('deterministic_screening', 'clinician', 'ai_suggestion')),
  severity text not null check (severity in ('info', 'moderate', 'high', 'critical')),
  message text not null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_triage_runs (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  provider text not null,
  model text not null,
  input_hash text not null,
  output jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.clinician_reviews (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  reviewer_user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft', 'approved')),
  outcome public.triage_outcome not null,
  reviewer_notes text not null default '',
  student_facing_summary text not null default '',
  requested_documents text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.triage_packets (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  review_id uuid not null references public.clinician_reviews(id) on delete restrict,
  version integer not null default 1,
  approved_by_user_id uuid not null references auth.users(id) on delete restrict,
  student_summary text not null,
  university_summary text not null,
  scores jsonb not null default '[]'::jsonb,
  risk_flags jsonb not null default '[]'::jsonb,
  document_list jsonb not null default '[]'::jsonb,
  recommended_next_steps text[] not null default '{}',
  legal_disclaimer text not null,
  created_at timestamptz not null default now(),
  unique (case_id, version)
);

create table if not exists public.share_grants (
  id uuid primary key default gen_random_uuid(),
  packet_id uuid not null references public.triage_packets(id) on delete cascade,
  student_user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  recipient_user_id uuid references auth.users(id) on delete cascade,
  status public.share_status not null default 'active',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('case_status', 'document_request', 'urgent_flag', 'share_created', 'invite')),
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_memberships_user on public.memberships(user_id);
create index if not exists idx_cases_student on public.cases(student_user_id);
create index if not exists idx_cases_org_status on public.cases(organization_id, status);
create index if not exists idx_assessment_responses_case on public.assessment_responses(case_id);
create index if not exists idx_share_grants_packet on public.share_grants(packet_id);
create index if not exists idx_share_grants_org_status on public.share_grants(organization_id, status);
create index if not exists idx_audit_logs_target on public.audit_logs(target_type, target_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_student_profiles_updated_at on public.student_profiles;
create trigger set_student_profiles_updated_at
before update on public.student_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_cases_updated_at on public.cases;
create trigger set_cases_updated_at
before update on public.cases
for each row execute function public.set_updated_at();

drop trigger if exists set_clinician_reviews_updated_at on public.clinician_reviews;
create trigger set_clinician_reviews_updated_at
before update on public.clinician_reviews
for each row execute function public.set_updated_at();

create or replace function public.has_org_role(target_org uuid, allowed_roles public.app_role[])
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships
    where user_id = auth.uid()
      and organization_id = target_org
      and role = any(allowed_roles)
  );
$$;

create or replace function public.is_psychu_staff(allowed_roles public.app_role[] default array['psychu_clinician', 'psychu_admin']::public.app_role[])
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    join public.organizations o on o.id = m.organization_id
    where m.user_id = auth.uid()
      and o.type = 'psychu'
      and m.role = any(allowed_roles)
  );
$$;

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.invites enable row level security;
alter table public.consent_versions enable row level security;
alter table public.student_consents enable row level security;
alter table public.student_profiles enable row level security;
alter table public.cases enable row level security;
alter table public.assessment_modules enable row level security;
alter table public.assessment_responses enable row level security;
alter table public.scores enable row level security;
alter table public.uploaded_documents enable row level security;
alter table public.risk_flags enable row level security;
alter table public.ai_triage_runs enable row level security;
alter table public.clinician_reviews enable row level security;
alter table public.triage_packets enable row level security;
alter table public.share_grants enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "members can read their organizations" on public.organizations;
create policy "members can read their organizations"
on public.organizations for select
using (public.has_org_role(id, array['student','psychu_clinician','psychu_admin','university_staff','university_admin']::public.app_role[]));

drop policy if exists "users can read own memberships" on public.memberships;
create policy "users can read own memberships"
on public.memberships for select
using (user_id = auth.uid() or public.is_psychu_staff(array['psychu_admin']::public.app_role[]));

drop policy if exists "admins manage memberships" on public.memberships;
create policy "admins manage memberships"
on public.memberships for all
using (public.is_psychu_staff(array['psychu_admin']::public.app_role[]))
with check (public.is_psychu_staff(array['psychu_admin']::public.app_role[]));

drop policy if exists "org admins manage invites" on public.invites;
create policy "org admins manage invites"
on public.invites for all
using (
  public.has_org_role(organization_id, array['university_admin']::public.app_role[])
  or public.is_psychu_staff(array['psychu_admin']::public.app_role[])
)
with check (
  public.has_org_role(organization_id, array['university_admin']::public.app_role[])
  or public.is_psychu_staff(array['psychu_admin']::public.app_role[])
);

drop policy if exists "authenticated users read consent versions" on public.consent_versions;
create policy "authenticated users read consent versions"
on public.consent_versions for select
to authenticated
using (true);

drop policy if exists "psychu admins manage consent versions" on public.consent_versions;
create policy "psychu admins manage consent versions"
on public.consent_versions for all
using (public.is_psychu_staff(array['psychu_admin']::public.app_role[]))
with check (public.is_psychu_staff(array['psychu_admin']::public.app_role[]));

drop policy if exists "students manage own consents" on public.student_consents;
create policy "students manage own consents"
on public.student_consents for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "students and psychu read profiles" on public.student_profiles;
create policy "students and psychu read profiles"
on public.student_profiles for select
using (user_id = auth.uid() or public.is_psychu_staff());

drop policy if exists "students manage own profiles" on public.student_profiles;
create policy "students manage own profiles"
on public.student_profiles for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "students and psychu read cases" on public.cases;
create policy "students and psychu read cases"
on public.cases for select
using (student_user_id = auth.uid() or public.is_psychu_staff());

drop policy if exists "students create own cases" on public.cases;
create policy "students create own cases"
on public.cases for insert
with check (student_user_id = auth.uid());

drop policy if exists "students update draft cases" on public.cases;
create policy "students update draft cases"
on public.cases for update
using (student_user_id = auth.uid() and status in ('draft', 'needs_info'))
with check (student_user_id = auth.uid());

drop policy if exists "psychu staff update cases" on public.cases;
create policy "psychu staff update cases"
on public.cases for update
using (public.is_psychu_staff())
with check (public.is_psychu_staff());

drop policy if exists "authenticated read active assessment modules" on public.assessment_modules;
create policy "authenticated read active assessment modules"
on public.assessment_modules for select
to authenticated
using (status = 'active' or public.is_psychu_staff());

drop policy if exists "psychu admins manage assessment modules" on public.assessment_modules;
create policy "psychu admins manage assessment modules"
on public.assessment_modules for all
using (public.is_psychu_staff(array['psychu_admin']::public.app_role[]))
with check (public.is_psychu_staff(array['psychu_admin']::public.app_role[]));

drop policy if exists "students and psychu manage responses" on public.assessment_responses;
create policy "students and psychu manage responses"
on public.assessment_responses for all
using (
  public.is_psychu_staff()
  or exists (select 1 from public.cases c where c.id = case_id and c.student_user_id = auth.uid())
)
with check (
  public.is_psychu_staff()
  or exists (select 1 from public.cases c where c.id = case_id and c.student_user_id = auth.uid())
);

drop policy if exists "students and psychu read scores" on public.scores;
create policy "students and psychu read scores"
on public.scores for select
using (
  public.is_psychu_staff()
  or exists (select 1 from public.cases c where c.id = case_id and c.student_user_id = auth.uid())
);

drop policy if exists "psychu writes scores" on public.scores;
create policy "psychu writes scores"
on public.scores for all
using (public.is_psychu_staff())
with check (public.is_psychu_staff());

drop policy if exists "students and psychu manage documents" on public.uploaded_documents;
create policy "students and psychu manage documents"
on public.uploaded_documents for all
using (
  public.is_psychu_staff()
  or uploaded_by_user_id = auth.uid()
  or exists (select 1 from public.cases c where c.id = case_id and c.student_user_id = auth.uid())
)
with check (
  public.is_psychu_staff()
  or uploaded_by_user_id = auth.uid()
  or exists (select 1 from public.cases c where c.id = case_id and c.student_user_id = auth.uid())
);

drop policy if exists "students and psychu read risk flags" on public.risk_flags;
create policy "students and psychu read risk flags"
on public.risk_flags for select
using (
  public.is_psychu_staff()
  or exists (select 1 from public.cases c where c.id = case_id and c.student_user_id = auth.uid())
);

drop policy if exists "psychu writes risk flags" on public.risk_flags;
create policy "psychu writes risk flags"
on public.risk_flags for all
using (public.is_psychu_staff())
with check (public.is_psychu_staff());

drop policy if exists "psychu reads ai triage runs" on public.ai_triage_runs;
create policy "psychu reads ai triage runs"
on public.ai_triage_runs for select
using (public.is_psychu_staff());

drop policy if exists "psychu writes ai triage runs" on public.ai_triage_runs;
create policy "psychu writes ai triage runs"
on public.ai_triage_runs for all
using (public.is_psychu_staff())
with check (public.is_psychu_staff());

drop policy if exists "psychu manages clinician reviews" on public.clinician_reviews;
create policy "psychu manages clinician reviews"
on public.clinician_reviews for all
using (public.is_psychu_staff())
with check (public.is_psychu_staff());

drop policy if exists "students read approved clinician reviews" on public.clinician_reviews;
create policy "students read approved clinician reviews"
on public.clinician_reviews for select
using (
  status = 'approved'
  and exists (select 1 from public.cases c where c.id = case_id and c.student_user_id = auth.uid())
);

drop policy if exists "packet access by owner psychu or active share" on public.triage_packets;
create policy "packet access by owner psychu or active share"
on public.triage_packets for select
using (
  public.is_psychu_staff()
  or exists (select 1 from public.cases c where c.id = case_id and c.student_user_id = auth.uid())
  or exists (
    select 1
    from public.share_grants sg
    join public.memberships m on m.organization_id = sg.organization_id
    where sg.packet_id = id
      and sg.status = 'active'
      and (sg.expires_at is null or sg.expires_at > now())
      and m.user_id = auth.uid()
      and m.role in ('university_staff', 'university_admin')
      and (sg.recipient_user_id is null or sg.recipient_user_id = auth.uid())
  )
);

drop policy if exists "psychu writes packets" on public.triage_packets;
create policy "psychu writes packets"
on public.triage_packets for all
using (public.is_psychu_staff())
with check (public.is_psychu_staff());

drop policy if exists "students and recipients read share grants" on public.share_grants;
create policy "students and recipients read share grants"
on public.share_grants for select
using (
  student_user_id = auth.uid()
  or public.has_org_role(organization_id, array['university_staff','university_admin']::public.app_role[])
  or public.is_psychu_staff()
);

drop policy if exists "students manage own share grants" on public.share_grants;
create policy "students manage own share grants"
on public.share_grants for all
using (student_user_id = auth.uid())
with check (student_user_id = auth.uid());

drop policy if exists "org members read audit logs" on public.audit_logs;
create policy "org members read audit logs"
on public.audit_logs for select
using (
  public.is_psychu_staff(array['psychu_admin']::public.app_role[])
  or public.has_org_role(organization_id, array['university_admin']::public.app_role[])
);

drop policy if exists "authenticated users insert own audit logs" on public.audit_logs;
create policy "authenticated users insert own audit logs"
on public.audit_logs for insert
with check (actor_user_id = auth.uid());

drop policy if exists "users read own notifications" on public.notifications;
create policy "users read own notifications"
on public.notifications for select
using (user_id = auth.uid());

drop policy if exists "psychu writes notifications" on public.notifications;
create policy "psychu writes notifications"
on public.notifications for all
using (public.is_psychu_staff())
with check (public.is_psychu_staff());
