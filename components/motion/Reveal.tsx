"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const EASE_APPLE = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Animation delay in seconds. */
  delay?: number;
  /** Distance (px) the element rises from. */
  y?: number;
  /** Only animate the first time it enters the viewport. */
  once?: boolean;
  /** Animate on mount instead of on scroll — use for above-the-fold hero content. */
  immediate?: boolean;
};

/**
 * Scroll-reveal wrapper (fade + rise). The workhorse motion primitive used across
 * the site. Honors prefers-reduced-motion by rendering a static element.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  once = true,
  immediate = false,
}: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  const motionProps = immediate
    ? { animate: { opacity: 1, y: 0 } }
    : {
        whileInView: { opacity: 1, y: 0 },
        viewport: { once, margin: "0px 0px -10% 0px" },
      };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      transition={{ duration: 0.7, ease: EASE_APPLE, delay }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
