import type { ReactNode } from "react";

type StatProps = {
  value: ReactNode;
  label: ReactNode;
  dark?: boolean;
};

/** A single large, confident stat block. */
export function Stat({ value, label, dark = false }: StatProps) {
  return (
    <div
      className={`rounded-3xl border p-7 text-center ${
        dark ? "border-white/10 bg-white/5" : "border-black/[0.04] bg-white shadow-glass"
      }`}
    >
      <div
        className={`font-display text-4xl font-semibold tracking-tight sm:text-5xl ${
          dark ? "text-white" : "text-brand-700"
        }`}
      >
        {value}
      </div>
      <div className={`mt-2 text-sm ${dark ? "text-white/70" : "text-ink-muted"}`}>{label}</div>
    </div>
  );
}
