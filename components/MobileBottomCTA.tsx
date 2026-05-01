import Link from "next/link";
import { site } from "@/lib/site";

export function MobileBottomCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-brand-100 bg-white/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-3 divide-x divide-brand-50">
        <a
          href={`tel:${site.phone.tel}`}
          className="flex flex-col items-center justify-center gap-1 py-3 text-xs font-semibold text-brand-700"
          aria-label={`Call ${site.practiceName}`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path
              d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1 .37 2 .72 2.94a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l2.14-1.29a2 2 0 0 1 2.11-.45c.94.35 1.94.59 2.94.72A2 2 0 0 1 22 16.92z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Call
        </a>
        <Link
          href="/patient-forms"
          className="flex flex-col items-center justify-center gap-1 py-3 text-xs font-semibold text-brand-700"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path
              d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M9 13h6M9 17h4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Forms
        </Link>
        <a
          href={site.links.directions}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center justify-center gap-1 py-3 text-xs font-semibold text-brand-700"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path
              d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Directions
        </a>
      </div>
    </div>
  );
}
