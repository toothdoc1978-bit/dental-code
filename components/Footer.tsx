import Link from "next/link";
import { fullAddress, site } from "@/lib/site";
import { PhoneLink } from "./PhoneLink";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-brand-50 bg-brand-900 pb-24 text-brand-50 md:pb-0">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-2xl font-semibold text-white">{site.practiceName}</p>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-200">{site.seoName}</p>
          <p className="mt-4 max-w-md text-sm text-brand-100">{site.description}</p>
          <p className="mt-6 text-sm text-brand-100">
            <span className="block font-semibold text-white">Visit us</span>
            {fullAddress}
          </p>
          <p className="mt-3 text-sm text-brand-100">
            <span className="block font-semibold text-white">Call</span>
            <PhoneLink className="hover:text-white" />
          </p>
          <p className="mt-3 text-sm text-brand-100">
            <span className="block font-semibold text-white">Fax</span>
            {site.fax}
          </p>
          <p className="mt-3 text-sm text-brand-100">
            <span className="block font-semibold text-white">Email</span>
            <a href={`mailto:${site.email}`} className="hover:text-white">
              {site.email}
            </a>
          </p>
          <div className="mt-6 flex items-center gap-3">
            {site.social.facebook && (
              <a
                href={site.social.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-brand-100 transition hover:bg-white hover:text-brand-700"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                  <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.5 1.6-1.5H16V5.1c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8V11H7.6v3h2.5v7h3.4z" />
                </svg>
              </a>
            )}
            {site.social.instagram && (
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-brand-100 transition hover:bg-white hover:text-brand-700"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
            )}
            {site.social.youtube && (
              <a
                href={site.social.youtube}
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-brand-100 transition hover:bg-white hover:text-brand-700"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                  <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8C22 15.2 22 12 22 12s0-3.2-.4-4.8zM10 15V9l5 3-5 3z" />
                </svg>
              </a>
            )}
          </div>
        </div>

        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-wider text-white">Explore</p>
          <ul className="mt-4 space-y-2 text-sm">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-brand-100 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/pricing" className="text-brand-100 hover:text-white">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="text-brand-100 hover:text-white">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-wider text-white">Hours</p>
          <ul className="mt-4 space-y-2 text-sm text-brand-100">
            {site.hours.map((h) => (
              <li key={h.day} className="flex justify-between gap-3">
                <span>{h.day}</span>
                <span className="text-right">{h.close ? `${h.open} – ${h.close}` : h.open}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 font-display text-sm font-semibold uppercase tracking-wider text-white">Areas We Serve</p>
          <p className="mt-3 text-sm text-brand-100">{site.serviceArea.join(" · ")}</p>
          {site.social.google && (
            <a
              href={site.social.google}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-100 hover:text-white"
            >
              <span aria-hidden>★</span> Find us on Google
            </a>
          )}
        </div>
      </div>
      <div className="border-t border-brand-800/60">
        <div className="container-page flex flex-col items-start justify-between gap-3 py-5 text-xs text-brand-200 sm:flex-row sm:items-center">
          <p>© {year} {site.practiceName} ({site.seoName}). All rights reserved.</p>
          <p>Designed for healthier smiles in Bastrop, Louisiana.</p>
        </div>
      </div>
    </footer>
  );
}
