-- Extend the initial screening MVP into a role-scoped, scored questionnaire workflow.

alter table public.assessment_modules
  add column if not exists description text not null default '',
  add column if not exists attribution text not null default '',
  add column if not exists estimated_minutes integer check (estimated_minutes is null or estimated_minutes > 0),
  add column if not exists scoring_config jsonb not null default '{}'::jsonb;

alter table public.assessment_modules
  drop constraint if exists assessment_modules_scoring_strategy_check;

alter table public.assessment_modules
  add constraint assessment_modules_scoring_strategy_check
  check (scoring_strategy in ('average_scale', 'sum_scale', 'manual_review'));

alter table public.scores
  add column if not exists max_value numeric(6, 2),
  add column if not exists interpretation text;

alter table public.scores
  drop constraint if exists scores_severity_check;

alter table public.scores
  add constraint scores_severity_check
  check (
    severity in (
      'minimal',
      'mild',
      'moderate',
      'moderately_severe',
      'significant',
      'severe',
      'review_required'
    )
  );

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email citext not null,
  full_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_user_profiles_updated_at on public.user_profiles;
create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (user_id) do update set
    email = excluded.email,
    full_name = case
      when excluded.full_name = '' then public.user_profiles.full_name
      else excluded.full_name
    end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_profile on auth.users;
create trigger on_auth_user_profile
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.handle_auth_user_profile();

insert into public.user_profiles (user_id, email, full_name)
select
  id,
  email,
  coalesce(raw_user_meta_data ->> 'full_name', '')
from auth.users
where email is not null
on conflict (user_id) do update set
  email = excluded.email,
  full_name = case
    when excluded.full_name = '' then public.user_profiles.full_name
    else excluded.full_name
  end;

alter table public.user_profiles enable row level security;

create or replace function public.is_psychu_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.is_psychu_staff(array['psychu_admin']::public.app_role[]);
$$;

create or replace function public.is_psychu_clinician()
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.is_psychu_staff(array['psychu_clinician']::public.app_role[]);
$$;

create or replace function public.can_access_case(target_case_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cases c
    where c.id = target_case_id
      and (
        c.student_user_id = auth.uid()
        or public.is_psychu_admin()
        or (
          c.assigned_clinician_user_id = auth.uid()
          and public.is_psychu_clinician()
        )
      )
  );
$$;

create or replace function public.is_case_student(target_case_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cases c
    where c.id = target_case_id
      and c.student_user_id = auth.uid()
  );
$$;

drop policy if exists "users and admins read user profiles" on public.user_profiles;
create policy "users and admins read user profiles"
on public.user_profiles for select
using (
  user_id = auth.uid()
  or public.is_psychu_admin()
  or exists (
    select 1
    from public.cases c
    where c.student_user_id = public.user_profiles.user_id
      and c.assigned_clinician_user_id = auth.uid()
      and public.is_psychu_clinician()
  )
);

drop policy if exists "users update own user profile" on public.user_profiles;
create policy "users update own user profile"
on public.user_profiles for update
using (user_id = auth.uid() or public.is_psychu_admin())
with check (user_id = auth.uid() or public.is_psychu_admin());

drop policy if exists "students and psychu read profiles" on public.student_profiles;
create policy "students and assigned psychu read profiles"
on public.student_profiles for select
using (
  user_id = auth.uid()
  or public.is_psychu_admin()
  or exists (
    select 1
    from public.cases c
    where c.student_user_id = public.student_profiles.user_id
      and c.assigned_clinician_user_id = auth.uid()
      and public.is_psychu_clinician()
  )
);

drop policy if exists "students and psychu read cases" on public.cases;
create policy "students admins and assigned clinicians read cases"
on public.cases for select
using (
  student_user_id = auth.uid()
  or public.is_psychu_admin()
  or (
    assigned_clinician_user_id = auth.uid()
    and public.is_psychu_clinician()
  )
);

drop policy if exists "psychu staff update cases" on public.cases;
create policy "psychu admins and assigned clinicians update cases"
on public.cases for update
using (
  public.is_psychu_admin()
  or (
    assigned_clinician_user_id = auth.uid()
    and public.is_psychu_clinician()
  )
)
with check (
  public.is_psychu_admin()
  or (
    assigned_clinician_user_id = auth.uid()
    and public.is_psychu_clinician()
  )
);

drop policy if exists "students and psychu manage responses" on public.assessment_responses;
drop policy if exists "students admins and assigned clinicians manage responses" on public.assessment_responses;
create policy "students admins and assigned clinicians read responses"
on public.assessment_responses for select
using (public.can_access_case(case_id))
;

create policy "students and admins write responses"
on public.assessment_responses for all
using (public.is_psychu_admin() or public.is_case_student(case_id))
with check (public.is_psychu_admin() or public.is_case_student(case_id));

drop policy if exists "students and psychu read scores" on public.scores;
create policy "students admins and assigned clinicians read scores"
on public.scores for select
using (public.can_access_case(case_id));

drop policy if exists "psychu writes scores" on public.scores;
create policy "psychu admins and assigned clinicians write scores"
on public.scores for all
using (
  public.is_psychu_admin()
  or (
    public.is_psychu_clinician()
    and public.can_access_case(case_id)
  )
)
with check (
  public.is_psychu_admin()
  or (
    public.is_psychu_clinician()
    and public.can_access_case(case_id)
  )
);

drop policy if exists "students and psychu manage documents" on public.uploaded_documents;
create policy "students admins and assigned clinicians manage documents"
on public.uploaded_documents for all
using (
  uploaded_by_user_id = auth.uid()
  or public.can_access_case(case_id)
)
with check (
  uploaded_by_user_id = auth.uid()
  or public.can_access_case(case_id)
);

drop policy if exists "students and psychu read risk flags" on public.risk_flags;
create policy "students admins and assigned clinicians read risk flags"
on public.risk_flags for select
using (public.can_access_case(case_id));

drop policy if exists "psychu writes risk flags" on public.risk_flags;
create policy "psychu admins and assigned clinicians write risk flags"
on public.risk_flags for all
using (
  public.is_psychu_admin()
  or (
    public.is_psychu_clinician()
    and public.can_access_case(case_id)
  )
)
with check (
  public.is_psychu_admin()
  or (
    public.is_psychu_clinician()
    and public.can_access_case(case_id)
  )
);

drop policy if exists "psychu reads ai triage runs" on public.ai_triage_runs;
create policy "psychu admins and assigned clinicians read ai triage runs"
on public.ai_triage_runs for select
using (
  public.is_psychu_admin()
  or (
    public.is_psychu_clinician()
    and public.can_access_case(case_id)
  )
);

drop policy if exists "psychu writes ai triage runs" on public.ai_triage_runs;
create policy "psychu admins and assigned clinicians write ai triage runs"
on public.ai_triage_runs for all
using (
  public.is_psychu_admin()
  or (
    public.is_psychu_clinician()
    and public.can_access_case(case_id)
  )
)
with check (
  public.is_psychu_admin()
  or (
    public.is_psychu_clinician()
    and public.can_access_case(case_id)
  )
);

drop policy if exists "psychu manages clinician reviews" on public.clinician_reviews;
create policy "psychu admins and assigned clinicians manage clinician reviews"
on public.clinician_reviews for all
using (
  public.is_psychu_admin()
  or (
    reviewer_user_id = auth.uid()
    and public.is_psychu_clinician()
    and public.can_access_case(case_id)
  )
)
with check (
  public.is_psychu_admin()
  or (
    reviewer_user_id = auth.uid()
    and public.is_psychu_clinician()
    and public.can_access_case(case_id)
  )
);

drop policy if exists "packet access by owner psychu or active share" on public.triage_packets;
create policy "packet access by owner assigned psychu or active share"
on public.triage_packets for select
using (
  public.can_access_case(case_id)
  or exists (
    select 1
    from public.share_grants sg
    join public.memberships m on m.organization_id = sg.organization_id
    where sg.packet_id = public.triage_packets.id
      and sg.status = 'active'
      and (sg.expires_at is null or sg.expires_at > now())
      and m.user_id = auth.uid()
      and m.role in ('university_staff', 'university_admin')
      and (sg.recipient_user_id is null or sg.recipient_user_id = auth.uid())
  )
);

drop policy if exists "psychu writes packets" on public.triage_packets;
create policy "psychu admins and assigned clinicians write packets"
on public.triage_packets for all
using (
  public.is_psychu_admin()
  or (
    public.is_psychu_clinician()
    and public.can_access_case(case_id)
  )
)
with check (
  public.is_psychu_admin()
  or (
    public.is_psychu_clinician()
    and public.can_access_case(case_id)
  )
);

create or replace function public.process_assessment_response()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  module_record public.assessment_modules%rowtype;
  response_record public.assessment_responses%rowtype;
  question jsonb;
  answer jsonb;
  risk_trigger jsonb;
  total_score numeric(6, 2);
  score_range jsonb;
  score_severity text;
  score_interpretation text;
  score_label text;
  score_max numeric(6, 2);
  has_urgent_flag boolean;
  has_all_active_responses boolean;
  assigned_clinician uuid;
  case_org uuid;
begin
  select * into module_record
  from public.assessment_modules
  where id = new.module_id;

  delete from public.scores
  where case_id = new.case_id
    and module_id = new.module_id;

  if module_record.scoring_strategy = 'manual_review' then
    insert into public.scores (
      case_id,
      module_id,
      label,
      value,
      max_value,
      severity,
      interpretation,
      summary
    )
    values (
      new.case_id,
      new.module_id,
      module_record.title || ' review',
      0,
      0,
      'review_required',
      'Manual clinician review required',
      'Manual clinician review required for narrative responses.'
    );
  else
    select coalesce(sum((new.answers ->> (q ->> 'id'))::numeric), 0)
    into total_score
    from jsonb_array_elements(module_record.questions) q
    where q ->> 'type' in ('scale_0_3', 'scale_0_4')
      and new.answers ? (q ->> 'id');

    if module_record.scoring_strategy = 'average_scale' then
      select coalesce(
        round(
          total_score / nullif(count(*), 0),
          2
        ),
        0
      )
      into total_score
      from jsonb_array_elements(module_record.questions) q
      where q ->> 'type' in ('scale_0_3', 'scale_0_4');
    end if;

    select r
    into score_range
    from jsonb_array_elements(module_record.scoring_config -> 'ranges') r
    where total_score between (r ->> 'min')::numeric and (r ->> 'max')::numeric
    limit 1;

    score_severity := coalesce(
      score_range ->> 'severity',
      case
        when total_score >= 3 then 'significant'
        when total_score >= 2 then 'moderate'
        when total_score >= 1 then 'mild'
        else 'minimal'
      end
    );
    score_interpretation := score_range ->> 'interpretation';
    score_label := coalesce(
      module_record.scoring_config ->> 'label',
      module_record.title || ' average'
    );
    score_max := coalesce(
      (module_record.scoring_config ->> 'maxValue')::numeric,
      4
    );

    insert into public.scores (
      case_id,
      module_id,
      label,
      value,
      max_value,
      severity,
      interpretation,
      summary
    )
    values (
      new.case_id,
      new.module_id,
      score_label,
      total_score,
      score_max,
      score_severity,
      score_interpretation,
      case
        when score_interpretation is not null
          then module_record.title || ': ' || score_interpretation || '. A clinician must interpret this result in context.'
        else module_record.title || ' requires clinician interpretation.'
      end
    );
  end if;

  delete from public.risk_flags
  where case_id = new.case_id
    and source = 'deterministic_screening';

  for response_record in
    select ar.*
    from public.assessment_responses ar
    where ar.case_id = new.case_id
  loop
    select * into module_record
    from public.assessment_modules
    where id = response_record.module_id;

    for question in
      select q
      from jsonb_array_elements(module_record.questions) q
      where q ? 'riskTrigger'
    loop
      answer := response_record.answers -> (question ->> 'id');
      risk_trigger := question -> 'riskTrigger';

      if (
        (risk_trigger ? 'equals' and answer = risk_trigger -> 'equals')
        or (
          risk_trigger ? 'minimum'
          and jsonb_typeof(answer) = 'number'
          and (answer #>> '{}')::numeric >= (risk_trigger ->> 'minimum')::numeric
        )
        or (
          risk_trigger ? 'includes'
          and jsonb_typeof(answer) = 'string'
          and lower(answer #>> '{}') like '%' || lower(risk_trigger ->> 'includes') || '%'
        )
      ) then
        insert into public.risk_flags (
          case_id,
          source,
          severity,
          message
        )
        values (
          new.case_id,
          'deterministic_screening',
          risk_trigger ->> 'severity',
          risk_trigger ->> 'message'
        );
      end if;
    end loop;
  end loop;

  select exists (
    select 1
    from public.risk_flags rf
    where rf.case_id = new.case_id
      and rf.resolved_at is null
      and rf.severity in ('high', 'critical')
  )
  into has_urgent_flag;

  select (
    count(*) > 0
    and count(*) = (
      select count(distinct ar.module_id)
      from public.assessment_responses ar
      join public.assessment_modules am on am.id = ar.module_id
      where ar.case_id = new.case_id
        and am.status = 'active'
    )
  )
  into has_all_active_responses
  from public.assessment_modules
  where status = 'active';

  select assigned_clinician_user_id, organization_id
  into assigned_clinician, case_org
  from public.cases
  where id = new.case_id;

  update public.cases
  set
    status = case
      when has_urgent_flag then 'urgent_flagged'::public.case_status
      when has_all_active_responses and status in ('draft', 'needs_info') then 'submitted'::public.case_status
      else status
    end,
    submitted_at = case
      when has_urgent_flag or has_all_active_responses then coalesce(submitted_at, now())
      else submitted_at
    end,
    next_step = case
      when has_urgent_flag then 'Prompt clinician safety follow-up required.'
      when not has_all_active_responses then 'Complete and submit all questionnaires for assigned clinician review.'
      else 'Assigned PsychU clinician review pending.'
    end
  where id = new.case_id;

  if has_urgent_flag and assigned_clinician is not null then
    insert into public.notifications (user_id, type, title, body)
    values (
      assigned_clinician,
      'urgent_flag',
      'Urgent screening flag',
      'An assigned student submission requires prompt safety follow-up.'
    );
  end if;

  insert into public.audit_logs (
    actor_user_id,
    organization_id,
    action,
    target_type,
    target_id,
    metadata
  )
  values (
    auth.uid(),
    case_org,
    'assessment_response.submitted',
    'assessment_response',
    new.id,
    jsonb_build_object(
      'case_id', new.case_id,
      'module_id', new.module_id,
      'module_version', new.module_version,
      'urgent_flag', has_urgent_flag
    )
  );

  return new;
end;
$$;

drop trigger if exists process_assessment_response_after_write on public.assessment_responses;
create trigger process_assessment_response_after_write
after insert or update of answers on public.assessment_responses
for each row execute function public.process_assessment_response();
