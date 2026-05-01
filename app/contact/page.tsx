import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { PhoneLink } from "@/components/PhoneLink";
import { fullAddress, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact & Appointments",
  description: `Request an appointment, get directions, or call ${site.phone.display}. ${site.practiceName} in Bastrop, LA.`,
  alternates: { canonical: "/contact" },
};

const mapQuery = encodeURIComponent(fullAddress);

export default function ContactPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="container-page py-16 md:py-20">
          <p className="eyebrow">Contact</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">
            Request an appointment.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-muted">
            Send a quick message and we'll be in touch — usually the same business day. For urgent care or a
            same-day appointment, please call us directly.
          </p>
        </div>
      </section>

      <section className="container-page grid gap-10 py-12 md:grid-cols-[1.2fr_1fr]">
        <ContactForm />

        <aside className="flex flex-col gap-6">
          <div className="card">
            <h2 className="font-display text-xl font-semibold text-ink">Visit</h2>
            <p className="mt-3 text-sm text-ink-muted">{site.address.line1}</p>
            <p className="text-sm text-ink-muted">
              {site.address.city}, {site.address.state} {site.address.zip}
            </p>
            <a
              href={`https://www.google.com/maps?q=${mapQuery}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-600"
            >
              Get directions →
            </a>
          </div>

          <div className="card">
            <h2 className="font-display text-xl font-semibold text-ink">Call</h2>
            <PhoneLink className="mt-3 block font-display text-2xl font-semibold text-brand-700 hover:text-brand-600" />
            <p className="mt-2 text-sm text-ink-muted">Mon–Thu during office hours.</p>
          </div>

          <div className="card">
            <h2 className="font-display text-xl font-semibold text-ink">Email & Fax</h2>
            <a
              href={`mailto:${site.email}`}
              className="mt-3 block text-sm font-semibold text-brand-700 hover:text-brand-600"
            >
              {site.email}
            </a>
            <p className="mt-2 text-sm text-ink-muted">Fax: {site.fax}</p>
            <p className="mt-3 rounded-xl bg-brand-50 px-3 py-2 text-xs text-ink-muted">
              For your privacy, please don't include detailed medical information in our general contact
              form. Use our secure patient forms or call the office.
            </p>
          </div>

          <div className="card">
            <h2 className="font-display text-xl font-semibold text-ink">Hours</h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              {site.hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-3 text-ink-muted">
                  <span>{h.day}</span>
                  <span className="text-right">{h.close ? `${h.open} – ${h.close}` : h.open}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      <section className="container-page pb-20">
        <div className="overflow-hidden rounded-2xl shadow-soft ring-1 ring-brand-50">
          <iframe
            title={`Map showing ${site.practiceName}`}
            src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
            width="100%"
            height="420"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block w-full border-0"
          />
        </div>
      </section>
    </>
  );
}
