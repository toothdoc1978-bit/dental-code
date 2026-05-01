import type { Testimonial } from "@/lib/testimonials";

export function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="card flex h-full flex-col gap-5">
      <svg viewBox="0 0 32 24" className="h-7 w-7 text-brand-300" fill="currentColor" aria-hidden>
        <path d="M0 24V12C0 5.4 4.6 0 12 0v4.8c-3.6 0-6 2.4-6 6V12h6v12H0zm20 0V12c0-6.6 4.6-12 12-12v4.8c-3.6 0-6 2.4-6 6V12h6v12H20z" />
      </svg>
      <blockquote className="text-base leading-relaxed text-ink">"{t.quote}"</blockquote>
      <figcaption className="mt-auto text-sm">
        <span className="font-semibold text-ink">{t.author}</span>
        {t.context && <span className="text-ink-muted"> · {t.context}</span>}
      </figcaption>
    </figure>
  );
}
