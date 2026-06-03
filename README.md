# PsychU Screening MVP

Greenfield Next.js + Supabase MVP for student-first accessibility screening, PsychU clinician triage, reviewed packet generation, and student-controlled sharing with university staff.

## What Is Built

- Student portal: consent summary, case status, documentation, screening demo, and sharing controls.
- Student questionnaires: NeuropsychU intake, PHQ-9, and GAD-7 with persisted submissions and immediate PHQ-9 question 9 safety resources.
- Clinician portal: assignment-scoped review queue, submitted answers, scores, documents, deterministic risk flags, and reviewer notes.
- University portal: invite management and student-approved shared packet view.
- Admin portal: editable users, roles, assignments, modules, responses, scores, risk flags, clinician notes, statuses, and read-only audit logs.
- Supabase migration: domain tables, enums, RLS policies, indexes, and seed data.
- Tests: workflow/scoring/risk/share logic plus an accessible UI safety-banner check.

## Quick Start

```bash
nvm use
npm install
npm run dev
```

Open `http://localhost:3000`.

Without Supabase environment variables, the app runs in seeded demo mode. Add `.env.local` from `.env.example` to connect auth and persistence.

## Verification

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

or:

```bash
npm run verify
```

## Supabase Setup

1. Create a Supabase project.
2. Apply `supabase/migrations/20260429010000_initial_schema.sql`.
3. Apply `supabase/migrations/20260603010000_usable_mvp.sql`.
4. Apply `supabase/seed.sql` to create the sample accounts and questionnaire catalog.
5. Create a private storage bucket for case documents.
6. Configure magic-link email templates and redirect URL: `/auth/callback`.
7. Add environment variables to Vercel and local `.env.local`.

Sample credentials are documented in `docs/demo-logins.md`.

When `src/lib/assessment-catalog.ts` changes, refresh the generated questionnaire block in the seed:

```bash
node scripts/generate-assessment-seed.mjs
```

## Production Caveats

- Legal copy is placeholder text and must be approved by PsychU counsel before real student launch.
- PHQ-9 and GAD-7 are active for controlled MVP evaluation but must not be used with real students until permitted use and attribution are verified.
- External AI triage is stubbed behind an adapter and must not be enabled until vendor/privacy review is complete.
- This MVP does not diagnose, determine accommodations, or provide live crisis response.
