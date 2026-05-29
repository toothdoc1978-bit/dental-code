type AuroraBackgroundProps = {
  className?: string;
  /** Fade the bottom edge into white (for hero → content transitions). */
  fade?: boolean;
};

/**
 * CSS-only premium gradient mesh. SSR-safe and dependency-free — used behind
 * heroes and as the imagery substitute while real photos are absent.
 * The drift animation is automatically disabled under prefers-reduced-motion.
 */
export function AuroraBackground({ className, fade = false }: AuroraBackgroundProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className ?? ""}`}
    >
      <div className="absolute inset-[-20%] animate-aurora bg-aurora" />
      {fade && <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-white" />}
    </div>
  );
}
