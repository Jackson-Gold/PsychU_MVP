# PsychU MVP Decisions

This document records the product and technical decisions made while converting the doctor-authored workflow into an implementable MVP. The flowchart remains an important guide, but it is not treated as a literal source of truth when safety, licensing, privacy, or implementation clarity require a more precise path.

## Flowchart Alignment

- We preserve the intended high-level journey: student onboarding, intake, screening, documentation, clinician review, triage output, and sharing with the university when appropriate.
- We convert any ambiguous "testing" language into "screening and routing" for v1. The MVP does not diagnose, determine accommodations, or administer formal/proctored tests.
- We add explicit consent gates before intake and release-of-information gates before university access. This is a deliberate hardening step not fully visible in the flowchart.
- We add deterministic high-risk handling: immediate 988/911 resource copy, urgent case flagging, reviewer notification, and audit logging. PsychU does not claim to provide live crisis monitoring.
- We make student-controlled sharing the default. Universities do not automatically receive triage packets.

## Clinical and Assessment Boundaries

- Launch modules are custom/non-restricted screeners only until PsychU verifies licensing, allowed use, scoring, attribution, and counsel approval for any named instrument.
- All scoring is decision support for PsychU clinicians. AI and automated scoring never create student-facing clinical conclusions without reviewer approval.
- Triage packet language must remain non-diagnostic and should describe functional impact, documentation received, and recommended next steps.

## AI Triage Policy

- AI triage is advisory only. It may suggest priority, rationale, missing information, and reviewer actions.
- Deterministic safety flags and clinician judgment always override AI output.
- External AI providers must not be enabled until vendor privacy review, BAA/DPA status, retention policy, prompt/output logging policy, and validation criteria are approved.
- The app uses a provider adapter so OpenAI, Azure OpenAI, or another approved provider can be swapped without rewriting product workflows.

## Security, Privacy, and Retention

- The app is B2B and FERPA-first for university pilots. HIPAA applicability must still be reviewed with counsel for specific service arrangements.
- Records default to a tenant-configurable seven-year retention policy until legal and university contracts specify otherwise.
- Role-based access, tenant scoping, private storage, audit logs, and RLS are required for production launch.
- Legal copy in the app is placeholder text and must be replaced with PsychU counsel-approved consent, privacy, clinical disclaimer, and release language before real students use the system.

## Launch Blockers

- Supabase project creation, environment variables, email template configuration, and storage bucket policy review.
- Final legal copy for consent, privacy, release, and non-diagnostic disclaimer.
- Instrument license verification for anything beyond custom MVP modules.
- Written operational protocol for urgent flags, reviewer staffing, escalation response time, and student support language.
- Security review of RLS policies, audit retention, backups, incident response, and AI provider configuration.
