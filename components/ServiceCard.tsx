import Link from "next/link";
import type { Service } from "@/lib/services";

const icons: Record<string, React.ReactNode> = {
  general: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s-7-4.5-7-11a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 6.5-7 11-7 11z" strokeLinejoin="round" />
    </svg>
  ),
  cosmetic: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3l1.8 4.6L18 9l-4.2 2.4L12 16l-1.8-4.6L6 9l4.2-1.4L12 3z" strokeLinejoin="round" />
    </svg>
  ),
  restorative: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 8a4 4 0 0 1 7-2.6A4 4 0 0 1 19 8c0 5-3 8-3 12h-2l-.6-3a1 1 0 0 0-2 0L11 20H9c0-4-4-7-4-12z" strokeLinejoin="round" />
    </svg>
  ),
  implants: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v8m0 0l-3 3m3-3l3 3M8 21h8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group card flex flex-col gap-4 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
        {icons[service.slug]}
      </div>
      <div>
        <h3 className="font-display text-xl font-semibold text-ink">{service.name}</h3>
        <p className="mt-2 text-sm text-ink-muted">{service.short}</p>
      </div>
      <span className="mt-auto text-sm font-semibold text-brand-700 group-hover:text-brand-600">
        Learn more →
      </span>
    </Link>
  );
}
