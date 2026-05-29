import type { ReactNode } from "react";
import { AuroraBackground } from "./AuroraBackground";

type SectionVariant = "default" | "muted" | "ink" | "aurora";

type SectionProps = {
  children: ReactNode;
  variant?: SectionVariant;
  className?: string;
  id?: string;
  containerClassName?: string;
};

const VARIANT_BG: Record<SectionVariant, string> = {
  default: "bg-surface",
  muted: "bg-surface-muted",
  ink: "bg-brand-900 text-white",
  aurora: "relative isolate overflow-hidden bg-surface",
};

/** Standardized section with generous vertical rhythm and a background variant. */
export function Section({
  children,
  variant = "default",
  className,
  id,
  containerClassName,
}: SectionProps) {
  return (
    <section id={id} className={`section-pad ${VARIANT_BG[variant]} ${className ?? ""}`}>
      {variant === "aurora" && <AuroraBackground fade />}
      <div className={containerClassName ?? "container-page"}>{children}</div>
    </section>
  );
}
