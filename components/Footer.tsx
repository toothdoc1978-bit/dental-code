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
