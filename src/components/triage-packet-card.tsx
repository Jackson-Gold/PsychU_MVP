import { StatusBadge } from "@/components/status-badge";
import type { TriagePacket } from "@/lib/domain";

type TriagePacketCardProps = {
  packet: TriagePacket;
  audience: "student" | "clinician" | "university";
};

export function TriagePacketCard({ packet, audience }: TriagePacketCardProps) {
  return (
    <section className="panel packet-panel" aria-labelledby={`${audience}-packet-title`}>
      <div className="panel-header">
        <div>
          <p className="eyebrow">Reviewed Packet</p>
          <h2 id={`${audience}-packet-title`}>Triage packet v{packet.version}</h2>
        </div>
        <StatusBadge value="packet_ready" />
      </div>
      <p>{audience === "university" ? packet.universitySummary : packet.studentSummary}</p>

      <div className="split-grid">
        <div>
          <h3>Scores</h3>
          <ul className="clean-list">
            {packet.scores.map((score) => (
              <li key={score.id}>
                <strong>{score.label}</strong>
                <span>
                  {score.value} / 4, {score.severity}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Recommended next steps</h3>
          <ul className="check-list">
            {packet.recommendedNextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="document-strip" aria-label="Documents included">
        {packet.documentList.map((document) => (
          <span key={document.id}>{document.fileName}</span>
        ))}
      </div>

      <p className="legal-copy">{packet.legalDisclaimer}</p>
    </section>
  );
}
