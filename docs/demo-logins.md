# PsychU MVP Demo Logins

These accounts are created by `supabase/seed.sql` after all migrations have been applied.

| Role | Email | Password | Landing page |
| --- | --- | --- | --- |
| Student | `student@example.com` | `PsychU-Demo-2026!` | `/student` |
| Clinician | `clinician@example.com` | `PsychU-Demo-2026!` | `/clinician/queue` |
| PsychU admin | `admin@example.com` | `PsychU-Demo-2026!` | `/admin/forms` |

## Seeded Assignment

- The student account has one draft screening case.
- The case is assigned to the clinician account.
- After the student submits the NeuropsychU intake, PHQ-9, and GAD-7, the case appears in the clinician queue.
- The admin account can view and manually edit users, roles, assignments, questionnaire definitions, responses, scores, risk flags, clinician notes, and case statuses.
- Admin changes are written to `audit_logs`.

## Important

- These credentials are for local development and controlled MVP demonstrations only.
- Change or remove them before any production deployment.
- Apply `supabase/migrations/20260603010000_usable_mvp.sql` before applying the seed.

