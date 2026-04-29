# Security and Compliance Notes

## Baseline

- Accessibility target: WCAG 2.2 AA for product UX, with awareness that the DOJ Title II web rule sets WCAG 2.1 AA for covered public entities.
- Privacy posture: FERPA-first B2B university pilot, with HIPAA reviewed per customer and service configuration.
- Authentication: Supabase magic-link auth for invited students, PsychU clinicians, and university staff.
- Authorization: role-based access control in application code plus Supabase row-level security.

## Data Handling

- Student documents should be stored in a private Supabase Storage bucket, scoped by case path and checked by signed URLs.
- The UI must avoid logging student narratives, document names, AI prompts, or generated summaries to analytics.
- Audit logs should record access and sharing events without storing unnecessary clinical content.
- PDF export should be watermarked as reviewed, non-diagnostic, and student-authorized.

## AI Controls

- AI output must be schema validated and stored with provider, model, input hash, and timestamp.
- Clinicians see the AI suggestion, but students and university staff do not see raw AI output.
- Production external AI must be disabled until vendor and legal reviews are complete.

## Operational Readiness

- Configure Vercel production and preview environments separately.
- Configure Supabase backups, point-in-time recovery if available, and migration review.
- Add monitoring for auth failures, elevated error rates, urgent flags, PDF generation failures, and share access.
- Establish incident response and breach notification workflows before handling real student records.
