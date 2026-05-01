import Image from "next/image";
import Link from "next/link";
import { BeforeAfterCard } from "@/components/BeforeAfterCard";
import { CTABanner } from "@/components/CTABanner";
import { PhoneLink } from "@/components/PhoneLink";
import { ServiceCard } from "@/components/ServiceCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { galleryCases } from "@/lib/gallery";
import { services } from "@/lib/services";
import { site } from "@/lib/site";
import { testimonials } from "@/lib/testimonials";

export default function HomePage() {
  const galleryTeasers = galleryCases.slice(0, 3);
  const homeTestimonials = testimonials.slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
        <div className="container-page grid items-center gap-12 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
          <div>
            <p className="eyebrow">Bastrop, Louisiana</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              {site.tagline}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-muted">
              From routine cleanings to complete smile makeovers, {site.dentistName.split(",")[0]} and our team
              deliver gentle, modern dentistry for the whole family.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary">
                Request appointment
              </Link>
              <PhoneLink className="btn-secondary" />
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-3 text-sm text-ink-muted sm:grid-cols-3">
              <li className="flex items-center gap-2">
                <span aria-hidden className="grid h-6 w-6 place-items-center rounded-full bg-brand-50 text-brand-700">✓</span>
                Accepting new patients
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden className="grid h-6 w-6 place-items-center rounded-full bg-brand-50 text-brand-700">✓</span>
                Most insurance accepted
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden className="grid h-6 w-6 place-items-center rounded-full bg-brand-50 text-brand-700">✓</span>
                Financing available
              </li>
            </ul>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-brand-100 shadow-soft">
              <Image
                src="/gallery/case-04-smile-makeover.jpg"
                alt="A bright, healthy smile after cosmetic dentistry."
                fill
                sizes="(min-width: 768px) 40vw, 90vw"
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-white p-5 shadow-soft ring-1 ring-brand-50 md:block">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Trusted Care</p>
              <p className="mt-1 font-display text-2xl font-semibold text-ink">5-Star Patient Reviews</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <p className="eyebrow">Why patients choose us</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Big-city dentistry, delivered in days — not months.
        </h2>
        <p className="mt-3 max-w-3xl text-ink-muted">
          Most dental offices send your case across the country and wait weeks for restorations. We design,
          mill, and deliver them right here.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {site.highlights.map((h) => (
            <div key={h.title} className="card h-full">
              <h3 className="font-display text-xl font-semibold text-ink">{h.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{h.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-900 text-white">
        <div className="container-page grid gap-10 py-16 md:grid-cols-[1.1fr_1fr] md:items-center md:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200">Same-day technology</p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              A full-mouth rehab in as little as <span className="text-brand-200">7 days.</span>
            </h2>
            <p className="mt-4 max-w-xl text-brand-100">
              Photos and intraoral scans on day one. A digital wax-up reviewed and approved. Teeth prepped,
              STL files generated, restorations milled in zirconia in our office, and cemented — all in a
              single tightly-coordinated week. It's a workflow most practices can't offer because they don't
              own the equipment. We do.
            </p>
            <Link href="/services/restorative" className="mt-6 inline-flex text-sm font-semibold text-white hover:text-brand-100">
              See how rapid full-mouth restoration works →
            </Link>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {site.technology.map((t) => (
              <li key={t} className="flex items-start gap-3 rounded-2xl bg-white/5 p-4 text-sm text-brand-50 ring-1 ring-white/10">
                <span aria-hidden className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-brand-500 text-[10px] font-bold text-white">✓</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-brand-100">
          <div className="grid gap-0 md:grid-cols-[1fr_1.1fr]">
            <div className="bg-brand-50 p-10 md:p-14">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Exclusive program</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
                Denture Insurance — a replacement in 48 hours.
              </h2>
              <p className="mt-4 text-ink-muted">
                A lost or broken denture used to mean weeks of waiting. Not anymore. For a one-time
                <span className="font-semibold text-ink"> $300</span>, we capture your denture digitally and
                securely store it in the cloud — so we can 3D print or mill an exact replacement within
                <span className="font-semibold text-ink"> 48 hours</span> if you ever need one.
              </p>
              <Link
                href="/services/restorative"
                className="mt-6 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-600"
              >
                Learn how it works →
              </Link>
            </div>
            <ul className="grid gap-0 divide-y divide-brand-50 p-2 md:p-6">
              {[
                {
                  step: "1",
                  title: "Digital capture",
                  body: "We scan your denture or take a CBCT to create an exact STL file — no goopy impressions.",
                },
                {
                  step: "2",
                  title: "Secure cloud storage",
                  body: "Your file is stored safely so it's available the moment you need it.",
                },
                {
                  step: "3",
                  title: "48-hour replacement",
                  body: "If your denture is lost or broken, we 3D print or mill a replacement and deliver it within two days.",
                },
                {
                  step: "★",
                  title: "Bonus: custom impression tray",
                  body: "Your CBCT also lets us print a clear night-guard-resin tray — the best possible tray for any future denture work.",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-4 p-5">
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-brand-600 font-display text-sm font-semibold text-white">
                    {item.step}
                  </span>
                  <div>
                    <p className="font-display text-base font-semibold text-ink">{item.title}</p>
                    <p className="mt-1 text-sm text-ink-muted">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Services</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
              Comprehensive dental care, all in one place.
            </h2>
          </div>
          <Link href="/services" className="text-sm font-semibold text-brand-700 hover:text-brand-600">
            See all services →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
      </section>

      <section className="bg-surface-muted py-20">
        <div className="container-page">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Smile Gallery</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
                Real patients. Real transformations.
              </h2>
              <p className="mt-3 max-w-2xl text-ink-muted">
                Every smile is designed for the person behind it. Browse a few of our recent before-and-afters.
              </p>
            </div>
            <Link href="/smile-gallery" className="text-sm font-semibold text-brand-700 hover:text-brand-600">
              View full gallery →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {galleryTeasers.map((c) => (
              <BeforeAfterCard key={c.id} item={c} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-brand-50 shadow-soft">
            <Image
              src="/team/chad-and-carey.jpg"
              alt={`${site.dentistName} and his wife Carey`}
              fill
              sizes="(min-width: 768px) 40vw, 90vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="eyebrow">About</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
              Meet {site.dentistName.split(",")[0]}
            </h2>
            <p className="mt-4 text-ink-muted">
              Our practice was built on a simple promise — treat every patient like family, and never recommend
              anything we wouldn't do for our own. From your first cleaning to a complete smile redesign, you'll
              be cared for by a team that listens, explains, and takes the time to get it right.
            </p>
            <p className="mt-4 text-ink-muted">
              Dr. Gardner and his wife Carey have called Bastrop home for years, and they love serving their
              neighbors across Morehouse Parish.
            </p>
            <Link href="/about" className="mt-6 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-600">
              More about our practice →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-surface-muted py-20">
        <div className="container-page">
          <p className="eyebrow">Patient stories</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
            What our patients say
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {homeTestimonials.map((t) => (
              <TestimonialCard key={t.author} t={t} />
            ))}
          </div>
          <div className="mt-8">
            <Link href="/reviews" className="text-sm font-semibold text-brand-700 hover:text-brand-600">
              Read more reviews →
            </Link>
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
