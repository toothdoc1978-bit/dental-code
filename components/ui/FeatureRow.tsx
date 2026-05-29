import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";

type FeatureRowProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  children: ReactNode;
  /** The visual / media column. */
  media: ReactNode;
  /** Place the media on the left (text on the right). */
  reverse?: boolean;
  actions?: ReactNode;
};

/** Alternating text / visual row used on service detail, about, and home. */
export function FeatureRow({ eyebrow, title, children, media, reverse, actions }: FeatureRowProps) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <Reveal className={reverse ? "lg:order-2" : ""}>
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className="mt-3 text-display-3 font-display font-semibold text-ink">{title}</h2>
          <div className="mt-5 space-y-4 text-pretty text-ink-muted">{children}</div>
          {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
        </div>
      </Reveal>
      <Reveal className={reverse ? "lg:order-1" : ""} y={32}>
        {media}
      </Reveal>
    </div>
  );
}
