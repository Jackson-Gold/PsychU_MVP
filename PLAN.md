# PsychU Screening MVP Plan

**Summary**
- Build a greenfield, production-minded MVP for 1-3 university pilots: student-first intake/screening, PsychU clinician review, triage packet generation, and student-controlled sharing.
- Use `Next.js + TypeScript`, `Vercel`, and `Supabase` for app hosting, magic-link auth, Postgres, storage, migrations, and fast deployment.
- Target WCAG 2.2 AA for the app UX, while recognizing DOJ Title II currently anchors public entities to WCAG 2.1 AA.

**Key Implementation**
- Roles: `student`, `psychu_clinician`, `psychu_admin`, `university_staff`, `university_admin`.
- Student flow: invite, magic-link login, consent/legal screens, profile, academic/accommodation history, document upload, core neuropsych screening, submit case, track status, share packet.
- Screening scope: screening-only, non-diagnostic, configurable assessment engine; ship custom/non-restricted modules first, then enable named instruments only after PsychU confirms licensing and legal approval.
- Safety flow: deterministic high-risk flags show crisis resources immediately, mark the case urgent, notify PsychU reviewers, and log the event; no live emergency-monitoring claim.
- AI triage: provider-adapter architecture; AI suggests priority, rationale, missing-info prompts, and reviewer actions only; deterministic safety rules and clinicians always override AI.
- Clinician portal: queue, urgent flags, student timeline, uploaded docs, scores, AI suggestion, reviewer notes, status changes, document requests, triage outcome, packet approval.
- University portal: university staff can invite students and view only packets the student explicitly releases; every access and share action is audited.
- Sharing: secure portal sharing plus reviewed/watermarked PDF export; students can grant/revoke university access.
- Documentation: create `docs/mvp-decisions.md` to document where we follow, modify, or intentionally diverge from the doctor-authored flowchart; also document AI, security, retention, and launch-blocking legal assumptions.

**Core Data Contracts**
- Main entities: `Organization`, `User`, `Membership`, `Invite`, `ConsentVersion`, `StudentProfile`, `Case`, `AssessmentModule`, `AssessmentResponse`, `Score`, `UploadedDocument`, `RiskFlag`, `AITriageRun`, `ClinicianReview`, `TriagePacket`, `ShareGrant`, `AuditLog`, `Notification`.
- Case states: `draft`, `submitted`, `urgent_flagged`, `under_review`, `needs_info`, `packet_ready`, `shared`, `closed`.
- Triage outcomes: `request_more_docs`, `schedule_psychu_review`, `refer_external_evaluation`, `share_with_university`, `urgent_safety_followup`, `no_current_action`.
- AI output schema: `priority`, `rationale`, `missing_information`, `recommended_reviewer_actions`, `confidence`, `safety_caveats`; output is never student-facing until clinician-approved.
- Public routes: `/student`, `/student/case`, `/student/share`, `/clinician/queue`, `/clinician/cases/[id]`, `/university/invites`, `/university/shared-packets`, `/admin/forms`.

**Testing & Acceptance**
- Acceptance: a student can complete intake/screening, PsychU can review and approve a packet, and the student can share it with university staff through portal and PDF.
- Unit tests: scoring/versioning, risk flags, consent gates, share permissions, AI output validation, status transitions.
- Integration tests: invite-to-submit, urgent-risk escalation, clinician review, document request, packet approval, share/revoke, PDF generation.
- Security tests: role-based access, tenant isolation, Supabase RLS policies, private file access, audit-log creation, env validation.
- Accessibility tests: automated axe checks, keyboard-only flows, visible focus states, semantic forms, screen-reader labels, mobile responsiveness.
- Deployment checks: Vercel preview/prod environments, Supabase migrations, seed data, backups, error monitoring, no sensitive data in logs.

**Assumptions**
- PsychU Legal supplies or approves consent, privacy, release, and clinical disclaimer copy before real student launch.
- Instrument licensing is not final, so the first build must not embed copyrighted/proprietary test text without approval.
- Records default to configurable seven-year retention, pending counsel and university contract review.
- Out of scope for v1: native apps, payments, formal/proctored testing, diagnosis, accommodation letters, live crisis response, automatic university release, and autonomous AI decisions.
- Compliance references used for planning: ADA Title II web rule at https://www.ada.gov/resources/2024-03-08-web-rule/, WCAG 2.2 at https://www.w3.org/TR/WCAG22/, FERPA/HIPAA student-record guidance at https://www.hhs.gov/hipaa/for-professionals/special-topics/ferpa-hipaa/index.html, and 988 crisis-resource guidance at https://988lifeline.org/get-help/what-to-expect/.
