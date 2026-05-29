type PlaceholderProps = {
  /** Caption shown in the corner (defaults to the image alt text). */
  label?: string;
  className?: string;
};

/**
 * Branded gradient placeholder used in place of real photography. Sized by its
 * parent (typically an aspect-ratio box); fills via absolute inset when given
 * `absolute inset-0` in className.
 */
export function Placeholder({ label, className }: PlaceholderProps) {
  return (
    <div
      aria-hidden
      className={`relative isolate flex items-center justify-center overflow-hidden bg-aurora ${className ?? ""}`}
    >
      <div className="absolute inset-[-20%] animate-aurora bg-aurora opacity-70" />
      {/* Tooth + sparkle glyph */}
      <svg
        width="72"
        height="72"
        viewBox="0 0 24 24"
        fill="none"
        className="relative text-white/80 drop-shadow"
      >
        <path
          d="M12 3.5c-2.2-1.6-5.4-1.3-6.8.7-1.2 1.7-1 4.2-.5 6.7.4 2 .7 4 1.3 5.9.3 1 .7 2.2 1.6 2.5.9.3 1.4-.6 1.7-1.5.4-1.2.7-2.6 1.2-3.6.2-.4.6-.7 1.5-.7s1.3.3 1.5.7c.5 1 .8 2.4 1.2 3.6.3.9.8 1.8 1.7 1.5.9-.3 1.3-1.5 1.6-2.5.6-1.9.9-3.9 1.3-5.9.5-2.5.7-5-.5-6.7-1.4-2-4.6-2.3-6.8-.7-.4.3-.6.3-1 0z"
          stroke="currentColor"
          strokeWidth="1.1"
          fill="rgba(255,255,255,0.18)"
          strokeLinejoin="round"
        />
      </svg>
      {label && (
        <span className="absolute bottom-3 left-3 right-3 truncate rounded-full bg-white/85 px-3 py-1 text-center text-[11px] font-medium text-brand-700 backdrop-blur">
          {label}
        </span>
      )}
    </div>
  );
}
