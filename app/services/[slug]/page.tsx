import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BeforeAfterCard } from "@/components/BeforeAfterCard";
import { CTABanner } from "@/components/CTABanner";
import { PhoneLink } from "@/components/PhoneLink";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { Hero } from "@/components/ui/Hero";
import { Section } from "@/components/ui/Section";
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
      <Hero
        eyebrow="Service"
        title={service.name}
        subtitle={service.hero}
        actions={
          <>
            <Link href="/contact" className="btn-primary">
              Request appointment
            </Link>
            <PhoneLink className="btn-secondary" />
          </>
        }
      />

      <Section>
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr]">
          <div>
            <Reveal>
              <p className="eyebrow">What it is</p>
              <h2 className="mt-2 text-display-3 font-display font-semibold text-ink">What we offer</h2>
              <p className="mt-4 text-pretty text-ink-muted">{service.whatItIs}</p>
            </Reveal>

            <Reveal>
              <p className="eyebrow mt-14">How it works</p>
              <h2 className="mt-2 text-display-3 font-display font-semibold text-ink">Our process</h2>
            </Reveal>
            <RevealGroup className="mt-6 grid gap-5">
              {service.process.map((step, idx) => (
                <div key={step.title} className="card flex gap-4">
                  <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink">{step.title}</h3>
                    <p className="mt-1 text-sm text-ink-muted">{step.body}</p>
                  </div>
                </div>
              ))}
            </RevealGroup>
          </div>
          <Reveal y={32}>
            <aside className="card h-fit lg:sticky lg:top-28">
              <h3 className="font-display text-lg font-semibold text-ink">Who it&apos;s for</h3>
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
          </Reveal>
        </div>
      </Section>

      {related.length > 0 && (
        <Section variant="muted">
          <Reveal>
            <p className="eyebrow">Real results</p>
            <h2 className="mt-2 text-balance text-display-2 font-display font-semibold text-ink">
              {service.name} in our gallery
            </h2>
          </Reveal>
          <RevealGroup className="mt-12 grid gap-6 md:grid-cols-2">
            {related.map((c) => (
              <BeforeAfterCard key={c.id} item={c} />
            ))}
          </RevealGroup>
          <Reveal delay={0.1}>
            <div className="mt-8">
              <Link href="/smile-gallery" className="btn-ghost">
                View the full smile gallery <span className="btn-ghost-arrow">→</span>
              </Link>
            </div>
          </Reveal>
        </Section>
      )}

      <Section>
        <Reveal>
          <p className="eyebrow">Common questions</p>
          <h2 className="mt-2 text-balance text-display-2 font-display font-semibold text-ink">FAQs</h2>
        </Reveal>
        <RevealGroup className="mt-12 grid gap-4">
          {service.faqs.map((f) => (
            <details key={f.q} className="card group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold text-ink">
                {f.q}
                <span
                  aria-hidden
                  className="text-brand-600 transition-transform duration-300 ease-apple group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{f.a}</p>
            </details>
          ))}
        </RevealGroup>
      </Section>

      <Section variant="muted">
        <Reveal>
          <p className="eyebrow">More services</p>
          <h2 className="mt-2 text-display-3 font-display font-semibold text-ink">Other ways we can help</h2>
        </Reveal>
        <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.05}>
          {otherServices.map((s) => (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="card card-hover group flex h-full items-start justify-between gap-3"
            >
              <div>
                <h3 className="font-display text-lg font-semibold text-ink">{s.name}</h3>
                <p className="mt-1 text-sm text-ink-muted">{s.short}</p>
              </div>
              <span
                aria-hidden
                className="text-brand-600 transition-transform duration-300 ease-apple group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          ))}
        </RevealGroup>
      </Section>

      <CTABanner />
    </>
  );
}
