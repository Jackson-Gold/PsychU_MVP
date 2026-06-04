-- Complete the MVP: private document storage, share-grant side effects, and
-- notification read state. Safe to re-run.

-- 1. Private storage bucket for case documents.
insert into storage.buckets (id, name, public)
values ('case-documents', 'case-documents', false)
on conflict (id) do nothing;

-- Extract the leading case id from an object name like "<case_id>/<file>".
create or replace function public.storage_object_case_id(object_name text)
returns uuid
language plpgsql
immutable
as $$
begin
  return split_part(object_name, '/', 1)::uuid;
exception when others then
  return null;
end;
$$;

drop policy if exists "case docs read" on storage.objects;
create policy "case docs read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'case-documents'
  and (
    public.is_psychu_staff()
    or exists (
      select 1 from public.cases c
      where c.id = public.storage_object_case_id(name)
        and c.student_user_id = auth.uid()
    )
  )
);

drop policy if exists "case docs insert" on storage.objects;
create policy "case docs insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'case-documents'
  and (
    public.is_psychu_staff()
    or exists (
      select 1 from public.cases c
      where c.id = public.storage_object_case_id(name)
        and c.student_user_id = auth.uid()
    )
  )
);

drop policy if exists "case docs delete" on storage.objects;
create policy "case docs delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'case-documents'
  and (
    public.is_psychu_staff()
    or exists (
      select 1 from public.cases c
      where c.id = public.storage_object_case_id(name)
        and c.student_user_id = auth.uid()
    )
  )
);

-- 2. Let users mark their own notifications read.
drop policy if exists "users update own notifications" on public.notifications;
create policy "users update own notifications"
on public.notifications for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- 3. Share-grant side effects run with definer rights so a student action can
-- notify the university, flag the case as shared, and write an audit entry
-- without needing broad write policies.
create or replace function public.process_share_grant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recipient record;
  target_case uuid;
begin
  if tg_op = 'INSERT' and new.status = 'active' then
    update public.cases
    set status = 'shared'
    where id = (select case_id from public.triage_packets where id = new.packet_id)
      and status in ('packet_ready', 'shared');

    if new.recipient_user_id is not null then
      insert into public.notifications (user_id, type, title, body)
      values (
        new.recipient_user_id,
        'share_created',
        'New shared packet',
        'A student released a reviewed PsychU triage packet to your accessibility office.'
      );
    else
      for recipient in
        select user_id
        from public.memberships
        where organization_id = new.organization_id
          and role in ('university_staff', 'university_admin')
      loop
        insert into public.notifications (user_id, type, title, body)
        values (
          recipient.user_id,
          'share_created',
          'New shared packet',
          'A student released a reviewed PsychU triage packet to your accessibility office.'
        );
      end loop;
    end if;

    insert into public.audit_logs (
      actor_user_id, organization_id, action, target_type, target_id, metadata
    )
    values (
      new.student_user_id,
      new.organization_id,
      'share_grant.created',
      'share_grant',
      new.id,
      jsonb_build_object('packet_id', new.packet_id, 'status', new.status)
    );
  elsif tg_op = 'UPDATE' and new.status = 'revoked' and old.status <> 'revoked' then
    select case_id into target_case from public.triage_packets where id = new.packet_id;

    update public.cases
    set status = 'packet_ready'
    where id = target_case
      and status = 'shared'
      and not exists (
        select 1
        from public.share_grants sg
        where sg.packet_id = new.packet_id
          and sg.status = 'active'
          and sg.id <> new.id
      );

    insert into public.audit_logs (
      actor_user_id, organization_id, action, target_type, target_id, metadata
    )
    values (
      new.student_user_id,
      new.organization_id,
      'share_grant.revoked',
      'share_grant',
      new.id,
      jsonb_build_object('packet_id', new.packet_id)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists process_share_grant_write on public.share_grants;
create trigger process_share_grant_write
after insert or update of status on public.share_grants
for each row execute function public.process_share_grant();
