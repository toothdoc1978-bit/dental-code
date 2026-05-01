import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BeforeAfterCard } from "@/components/BeforeAfterCard";
import { CTABanner } from "@/components/CTABanner";
import { PhoneLink } from "@/components/PhoneLink";
import { galleryCases } from "@/lib/gallery";
import { getService, services } from "@/lib/services";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Metadata {
  const service = getService(params.slug);
  if (!service) return {};
  return {
    title: `${service.name} in Bastrop, LA`,
    description: service.short,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default function ServiceDetailPage({ params }: Props) {
  const service = getService(params.slug);
  if (!service) notFound();

  const related = galleryCases.filter((c) => service.relatedGallery.includes(c.id));
  const otherServices = services.filter((s) => s.slug !== service.slug);

  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="container-page py-16 md:py-20">
          <p className="eyebrow">Service</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">{service.name}</h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-muted">{service.hero}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="btn-primary">
              Request appointment
            </Link>
            <PhoneLink className="btn-secondary" />
          </div>
        </div>
      </section>

      <section className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="eyebrow">What it is</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
            What we offer
          </h2>
          <p className="mt-4 text-ink-muted">{service.whatItIs}</p>

          <p className="eyebrow mt-12">How it works</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">Our process</h2>
          <ol className="mt-6 space-y-5">
            {service.process.map((step, idx) => (
              <li key={step.title} className="card flex gap-4">
                <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <aside className="card h-fit">
          <h3 className="font-display text-lg font-semibold text-ink">Who it's for</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink">
            {service.whoItsFor.map((reason) => (
              <li key={reason} className="flex items-start gap-3">
                <span aria-hidden className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-brand-500" />
                {reason}
              </li>
            ))}
          </ul>
          <Link href="/contact" className="btn-primary mt-6 w-full">
            Request consultation
          </Link>
        </aside>
      </section>

      {related.length > 0 && (
        <section className="bg-surface-muted py-20">
          <div className="container-page">
            <p className="eyebrow">Real results</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
              {service.name} in our gallery
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {related.map((c) => (
                <BeforeAfterCard key={c.id} item={c} />
              ))}
            </div>
            <div className="mt-8">
              <Link href="/smile-gallery" className="text-sm font-semibold text-brand-700 hover:text-brand-600">
                View the full smile gallery →
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="container-page py-20">
        <p className="eyebrow">Common questions</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">FAQs</h2>
        <div className="mt-10 grid gap-4">
          {service.faqs.map((f) => (
            <details key={f.q} className="card group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold text-ink">
                {f.q}
                <span aria-hidden className="text-brand-600 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-surface-muted py-16">
        <div className="container-page">
          <p className="eyebrow">More services</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
            Other ways we can help
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherServices.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="card flex items-start justify-between gap-3 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">{s.name}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{s.short}</p>
                </div>
                <span aria-hidden className="text-brand-600">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
