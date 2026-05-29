import { RevealGroup } from "@/components/motion/RevealGroup";
import { Stat } from "./Stat";

export type StatItem = {
  value: string;
  label: string;
};

type StatGridProps = {
  stats: StatItem[];
  dark?: boolean;
  className?: string;
};

/** Responsive grid of staggered, revealing stat blocks. */
export function StatGrid({ stats, dark = false, className }: StatGridProps) {
  return (
    <RevealGroup
      className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className ?? ""}`}
    >
      {stats.map((s) => (
        <Stat key={s.label} value={s.value} label={s.label} dark={dark} />
      ))}
    </RevealGroup>
  );
}
