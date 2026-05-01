import Link from "next/link";
import type { Service } from "@/lib/services";

const icons: Record<Service["iconKey"], React.ReactNode> = {
  emergency: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  ),
  dentures: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 9c2-2 5-2 8-2s6 0 8 2c0 4-2 9-4 9-1 0-1-2-2-2H10c-1 0-1 2-2 2-2 0-4-5-4-9z" strokeLinejoin="round" />
    </svg>
  ),
  implants: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v8m0 0l-3 3m3-3l3 3M8 21h8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  whitening: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3l1.8 4.6L18 9l-4.2 2.4L12 16l-1.8-4.6L6 9l4.2-1.4L12 3z" strokeLinejoin="round" />
    </svg>
  ),
  veneers: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 8a4 4 0 0 1 7-2.6A4 4 0 0 1 19 8c0 5-3 8-3 12h-2l-.6-3a1 1 0 0 0-2 0L11 20H9c0-4-4-7-4-12z" strokeLinejoin="round" />
    </svg>
  ),
  aligners: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="7" width="16" height="10" rx="3" strokeLinejoin="round" />
      <path d="M9 7v10M15 7v10" strokeLinecap="round" />
    </svg>
  ),
  sedation: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" strokeLinejoin="round" />
    </svg>
  ),
  family: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s-7-4.5-7-11a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 6.5-7 11-7 11z" strokeLinejoin="round" />
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
        {icons[service.iconKey]}
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
