import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";

type ShowcaseStep = {
  index?: string;
  title: string;
  body: ReactNode;
};

type StickyShowcaseProps = {
  /** Pinned visual that stays in view while steps scroll past (desktop). */
  visual: ReactNode;
  steps: ShowcaseStep[];
  /** Use light text treatment for dark (ink) sections. */
  dark?: boolean;
};

/**
 * Apple "product story" layout: a sticky visual on one side while captioned
 * steps reveal on the other. Stacks cleanly on mobile.
 */
export function StickyShowcase({ visual, steps, dark = false }: StickyShowcaseProps) {
  const stepCard = dark ? "border-white/10 bg-white/5" : "border-black/[0.06] bg-white shadow-glass";
  const indexChip = dark ? "bg-white/10 text-white" : "bg-brand-50 text-brand-700";
  const bodyText = dark ? "text-white/70" : "text-ink-muted";

  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
      <div className="lg:sticky lg:top-28 lg:h-fit lg:self-start">{visual}</div>
      <div className="flex flex-col gap-6">
        {steps.map((step, i) => (
          <Reveal key={i} delay={i * 0.05}>
            <div className={`rounded-3xl border p-7 ${stepCard}`}>
              <div className="flex items-center gap-3">
                {step.index && (
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold ${indexChip}`}
                  >
                    {step.index}
                  </span>
                )}
                <h3 className="text-lg font-semibold">{step.title}</h3>
              </div>
              <div className={`mt-3 text-pretty leading-relaxed ${bodyText}`}>{step.body}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
