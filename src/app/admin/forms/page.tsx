import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { demoAssessmentModules } from "@/lib/demo-data";

export default function AdminFormsPage() {
  return (
    <AppShell active="/admin/forms">
      <section className="panel" aria-labelledby="forms-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">PsychU Admin</p>
            <h1 id="forms-title">Assessment module catalog</h1>
          </div>
          <StatusBadge value="license gated" tone="warn" />
        </div>
        <p>
          The MVP ships with custom/non-restricted modules only. Named screeners or formal tests must remain
          disabled until PsychU confirms licensing, permitted commercial use, scoring rules, and attribution.
        </p>
      </section>

      <section className="panel" aria-labelledby="modules-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Configurable Engine</p>
            <h2 id="modules-title">Active modules</h2>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Module</th>
              <th>Domains</th>
              <th>License</th>
              <th>Questions</th>
              <th>Scoring</th>
            </tr>
          </thead>
          <tbody>
            {demoAssessmentModules.map((module) => (
              <tr key={module.id}>
                <td>
                  <strong>{module.title}</strong>
                  <br />
                  v{module.version}
                </td>
                <td>{module.domains.join(", ")}</td>
                <td>
                  <StatusBadge value={module.licenseStatus} tone={module.licenseStatus === "custom" ? "good" : "warn"} />
                </td>
                <td>{module.questions.length}</td>
                <td>{module.scoringStrategy.replaceAll("_", " ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel" aria-labelledby="module-design-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Extension Point</p>
            <h2 id="module-design-title">Add licensed instruments later</h2>
          </div>
        </div>
        <div className="workflow-map">
          <div className="workflow-step">
            <strong>1. Legal approval</strong>
            <span>Store proof of license, permitted setting, and required attribution before activation.</span>
          </div>
          <div className="workflow-step">
            <strong>2. Versioned module</strong>
            <span>Question text, scoring, and interpretation are immutable once responses exist.</span>
          </div>
          <div className="workflow-step">
            <strong>3. Clinician validation</strong>
            <span>PsychU reviewers validate output before any student-facing packet includes it.</span>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
