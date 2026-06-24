import Link from "next/link";

type TakeAssessmentCtaProps = {
  href?: string;
  label?: string;
  variant?: "primary" | "coral" | "ghost" | "glow";
  size?: "sm" | "md" | "lg";
  className?: string;
};

/**
 * Reusable "Take an Assessment" call to action. Logged-out visitors are routed
 * through auth by middleware before they reach the intake flow.
 */
export function TakeAssessmentCta({
  href = "/student/case",
  label = "Take an Assessment",
  variant = "primary",
  size = "md",
  className
}: TakeAssessmentCtaProps) {
  const variantClass =
    variant === "coral"
      ? "button-coral"
      : variant === "ghost"
        ? "button-ghost"
        : variant === "glow"
          ? "button-glow"
          : "button-primary";
  const sizeClass = size === "lg" ? "button-lg" : size === "sm" ? "button-sm" : "";

  return (
    <Link
      className={["button", variantClass, sizeClass, className].filter(Boolean).join(" ")}
      href={href}
    >
      {label}
    </Link>
  );
}
