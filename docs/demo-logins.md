# Synaptec MVP Demo Logins

These accounts are created by `supabase/seed.sql` after all migrations have been applied.

| Role | Email | Password | Landing page |
| --- | --- | --- | --- |
| Student | `student@example.com` | `PsychU-Demo-2026!` | `/student` |
| Neuropsychologist | `clinician@example.com` | `PsychU-Demo-2026!` | `/clinician/queue` |
| Synaptec admin | `admin@example.com` | `PsychU-Demo-2026!` | `/admin/forms` |
| University staff | `staff@example.com` | `PsychU-Demo-2026!` | `/university/shared-packets` |
| University admin | `university@example.com` | `PsychU-Demo-2026!` | `/university/invites` |

## Seeded Assignment

- The student account (`student@example.com`, Maya Chen) has one draft screening case for walking through the questionnaire flow.
- All demo cases are assigned to the clinician account, so the clinician queue and admin control center look realistic.
- After a student submits the NeuropsychU intake, PHQ-9, and GAD-7, the case appears in the clinician queue with auto-calculated scores and deterministic risk flags.
- The admin account can view and manually edit users, roles, assignments, questionnaire definitions, responses, scores, risk flags, clinician notes, and case statuses from a single tabbed control center.
- Admin changes are written to `audit_logs`.

### Additional demo students (clinician + admin realism)

These accounts share the same password and are members of Pilot University. They
exist to populate the clinician queue and admin views with completed, scored
cases across the full case lifecycle:

| Student | Email | Case state |
| --- | --- | --- |
| Jordan Lee | `jordan.lee@pilot.edu` | Submitted, awaiting first review (PHQ-9 mild, GAD-7 moderate) |
| Sam Rivera | `sam.rivera@pilot.edu` | Urgent flagged — PHQ-9 item 9 endorsed (severe depression/anxiety) |
| Taylor Brooks | `taylor.brooks@pilot.edu` | Under review — clinician drafting notes |
| Alex Nguyen | `alex.nguyen@pilot.edu` | Packet ready — approved review, packet awaiting student sharing |
| Riley Okafor | `riley.okafor@pilot.edu` | Shared — packet released to Pilot University accessibility office |
| Casey Diaz | `casey.diaz@pilot.edu` | Needs info — clinician requested prior records |

Inserting the seeded responses fires the `process_assessment_response` trigger,
which auto-creates scores, deterministic risk flags, audit entries, and
notifications. Final case statuses are then set explicitly, so re-running the
seed is safe.

## Important

- These credentials are for local development and controlled MVP demonstrations only.
- Change or remove them before any production deployment.
- Applying the migration does **not** create these accounts. Apply
  `supabase/migrations/20260603010000_usable_mvp.sql`, then run the entire
  `supabase/seed.sql` file.

## Create The Demo Accounts In Supabase

The simplest hosted-Supabase setup path is:

1. Open the same Supabase project used by `NEXT_PUBLIC_SUPABASE_URL`.
2. Open **SQL Editor** and create a new query.
3. Paste the entire contents of `supabase/seed.sql`.
4. Select **Run**.
5. Run this verification query:

```sql
select
  u.email,
  u.email_confirmed_at is not null as email_confirmed,
  m.role
from auth.users u
left join public.memberships m on m.user_id = u.id
where u.email in (
  'student@example.com',
  'clinician@example.com',
  'admin@example.com',
  'staff@example.com',
  'university@example.com'
)
order by u.email;
```

The query should return five rows, each with `email_confirmed = true` and its
expected role. The login page will then accept the credentials above.

The university staff and admin accounts are members of the Pilot University
organization, so they see student-released packets and can manage invites.

For CLI-based setup, authenticate and link the CLI first, then push migrations
and the seed:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --include-seed
```
