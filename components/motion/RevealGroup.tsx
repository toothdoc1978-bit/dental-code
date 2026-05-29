"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Children, type ReactNode } from "react";

const EASE_APPLE = [0.22, 1, 0.36, 1] as const;

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_APPLE } },
};

type RevealGroupProps = {
  children: ReactNode;
  className?: string;
  /** Seconds between each child's entrance. */
  stagger?: number;
  once?: boolean;
};

/**
 * Staggers the entrance of its direct children (cards, stats, list items).
 * Each child is wrapped in a motion element, so apply grid/flex classes to
 * `className` and this component becomes the layout container.
 */
export function RevealGroup({ children, className, stagger = 0.08, once = true }: RevealGroupProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "0px 0px -10% 0px" }}
    >
      {Children.map(children, (child, i) => (
        <motion.div key={i} variants={itemVariants} className="h-full">
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
