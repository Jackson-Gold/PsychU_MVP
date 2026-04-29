# PsychU Screening MVP

Greenfield Next.js + Supabase MVP for student-first accessibility screening, PsychU clinician triage, reviewed packet generation, and student-controlled sharing with university staff.

## What Is Built

- Student portal: consent summary, case status, documentation, screening demo, and sharing controls.
- Clinician portal: review queue, scores, documents, deterministic risk flags, advisory AI triage, and packet approval surface.
- University portal: invite management and student-approved shared packet view.
- Admin portal: configurable assessment module catalog with license-gating.
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
3. Optionally apply `supabase/seed.sql`.
4. Create a private storage bucket for case documents.
5. Configure magic-link email templates and redirect URL: `/auth/callback`.
6. Add environment variables to Vercel and local `.env.local`.

## Production Caveats

- Legal copy is placeholder text and must be approved by PsychU counsel before real student launch.
- Named screeners/formal tests must remain disabled until licensing and permitted use are verified.
- External AI triage is stubbed behind an adapter and must not be enabled until vendor/privacy review is complete.
- This MVP does not diagnose, determine accommodations, or provide live crisis response.
