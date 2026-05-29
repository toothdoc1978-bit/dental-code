import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { AuroraBackground } from "./AuroraBackground";

type HeroProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Optional right-column / floating visual content. */
  aside?: ReactNode;
  variant?: "home" | "interior";
};

/**
 * Full-bleed hero with an aurora background. Headline and supporting content
 * animate in on mount (reduced-motion safe via <Reveal immediate>).
 */
export function Hero({ eyebrow, title, subtitle, actions, aside, variant = "interior" }: HeroProps) {
  const isHome = variant === "home";

  return (
    // -mt-20 pulls the aurora up behind the transparent sticky header.
    <section className="relative isolate -mt-20 overflow-hidden mesh-bg">
      <AuroraBackground fade />
      <div
        className={`container-page ${
          isHome ? "min-h-[92vh] pb-24 pt-32 sm:pt-36" : "pb-20 pt-32 sm:pb-28 sm:pt-36"
        } flex flex-col justify-center`}
      >
        <div className={aside ? "grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]" : ""}>
          <div className={aside ? "" : "max-w-3xl"}>
            {eyebrow && (
              <Reveal immediate>
                <p className="eyebrow">{eyebrow}</p>
              </Reveal>
            )}
            <Reveal immediate delay={0.06}>
              <h1
                className={`mt-4 text-balance font-display font-semibold text-ink ${
                  isHome ? "text-display-1" : "text-display-2"
                }`}
              >
                {title}
              </h1>
            </Reveal>
            {subtitle && (
              <Reveal immediate delay={0.12}>
                <p className="mt-6 max-w-2xl text-pretty text-lead text-ink-muted">{subtitle}</p>
              </Reveal>
            )}
            {actions && (
              <Reveal immediate delay={0.18}>
                <div className="mt-9 flex flex-wrap items-center gap-3">{actions}</div>
              </Reveal>
            )}
          </div>
          {aside && (
            <Reveal immediate delay={0.24} y={32}>
              {aside}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
