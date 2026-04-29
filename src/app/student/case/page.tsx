import { AppShell } from "@/components/app-shell";
import { ScreeningDemo } from "@/components/screening-demo";
import { StatusBadge } from "@/components/status-badge";
import {
  demoAssessmentModules,
  demoAssessmentResponses,
  demoCase,
  demoScores,
  demoStudentProfile,
  demoUploadedDocuments
} from "@/lib/demo-data";

export default function StudentCasePage() {
  return (
    <AppShell active="/student">
      <section className="panel" aria-labelledby="case-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Case {demoCase.id}</p>
            <h1 id="case-title">Screening and documentation</h1>
          </div>
          <StatusBadge value={demoCase.status} />
        </div>

        <div className="grid-two">
          <div>
            <h2>Student profile</h2>
            <ul className="clean-list">
              <li>
                <strong>Program</strong>
                <span>
                  {demoStudentProfile.yearInSchool}, {demoStudentProfile.major}
                </span>
              </li>
              <li>
                <strong>Prior accommodations</strong>
                <span>{demoStudentProfile.priorAccommodations.join(", ")}</span>
              </li>
              <li>
                <strong>Reported needs</strong>
                <span>{demoStudentProfile.accessibilityNeeds.join("; ")}</span>
              </li>
            </ul>
          </div>
          <div>
            <h2>Uploaded documents</h2>
            <ul className="clean-list">
              {demoUploadedDocuments.map((document) => (
                <li key={document.id}>
                  <strong>{document.fileName}</strong>
                  <span>
                    {document.category.replaceAll("_", " ")} · {Math.round(document.sizeBytes / 1024)} KB
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ScreeningDemo modules={demoAssessmentModules} />

      <section className="panel" aria-labelledby="scores-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Submission Summary</p>
            <h2 id="scores-title">Existing demo responses</h2>
          </div>
          <StatusBadge value={`${demoAssessmentResponses.length} modules`} tone="info" />
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Module</th>
              <th>Score</th>
              <th>Reviewer summary</th>
            </tr>
          </thead>
          <tbody>
            {demoScores.map((score) => (
              <tr key={score.id}>
                <td>{score.label}</td>
                <td>
                  {score.value} / 4, {score.severity}
                </td>
                <td>{score.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AppShell>
  );
}
