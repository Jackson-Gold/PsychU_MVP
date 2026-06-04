import Link from "next/link";

type MetricCardProps = {
  label: string;
  value: string | number;
  detail: string;
  href?: string;
};

export function MetricCard({ label, value, detail, href }: MetricCardProps) {
  const content = (
    <>
      <p className="eyebrow">{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </>
  );

  if (href) {
    return (
      <Link className="metric-card metric-card-link" href={href}>
        {content}
      </Link>
    );
  }

  return <article className="metric-card">{content}</article>;
}
