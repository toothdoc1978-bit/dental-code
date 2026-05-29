import Link from "next/link";
import { BeforeAfterCard } from "@/components/BeforeAfterCard";
import { CTABanner } from "@/components/CTABanner";
import { PhoneLink } from "@/components/PhoneLink";
import { ServiceCard } from "@/components/ServiceCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { FeatureRow } from "@/components/ui/FeatureRow";
import { Hero } from "@/components/ui/Hero";
import { Media } from "@/components/ui/Media";
import { Section } from "@/components/ui/Section";
import { StatGrid } from "@/components/ui/StatGrid";
import { StickyShowcase } from "@/components/ui/StickyShowcase";
import { galleryCases } from "@/lib/gallery";
import { services } from "@/lib/services";
import { site } from "@/lib/site";
import { testimonials } from "@/lib/testimonials";

const heroStats = [
  { value: "7 days", label: "Full-mouth rehab, start to finish" },
  { value: "48 hrs", label: "Denture replacement, when you need it" },
  { value: "2005", label: "Caring for Bastrop families since" },
  { value: "Most", label: "Dental insurance plans accepted" },
];

const rehabSteps = [
  { index: "1", title: "Day one: scan & design", body: "Photos and intraoral scans capture every detail. We build a digital wax-up you review and approve before anything is touched." },
  { index: "2", title: "Prep & STL files", body: "Teeth are gently prepped and converted into precise STL files — no goopy impressions, no guesswork." },
  { index: "3", title: "Milled in-office", body: "Restorations are milled in zirconia on our 5-axis mill right here. No cross-country lab, no weeks of waiting." },
  { index: "4", title: "Delivered & cemented", body: "Everything is fitted and cemented in a single, tightly-coordinated week — a workflow most practices simply can't offer." },
];

const dentureSteps = [
  { index: "1", title: "Digital capture", body: "We scan your denture or take a CBCT to create an exact STL file — no goopy impressions." },
  { index: "2", title: "Secure cloud storage", body: "Your file is stored safely so it's available the moment you need it." },
  { index: "3", title: "48-hour replacement", body: "If your denture is lost or broken, we 3D print or mill a replacement and deliver it within two days." },
  { index: "★", title: "Bonus: custom impression tray", body: "Your CBCT also lets us print a clear night-guard-resin tray — the best possible tray for any future denture work." },
];

export default function HomePage() {
  const galleryTeasers = galleryCases.slice(0, 3);
  const homeTestimonials = testimonials.slice(0, 3);
  const formsLink = site.links.onlineForms;
  const formsReady = formsLink && !formsLink.startsWith("TODO");

  return (
    <>
      <Hero
        variant="home"
        eyebrow={`${site.seoName} · Bastrop, LA`}
        title={
          <>
            Modern dentistry.
            <br />
            <span className="text-brand-600">Delivered in days.</span>
          </>
        }
        subtitle={
          <>
            {site.practiceName} brings same-day restorations, natural-looking dentures, and gentle,
            patient-centered care to Bastrop and Morehouse Parish — from emergency visits to complete
            smile transformations.
          </>
        }
        actions={
          <>
            <PhoneLink className="btn-primary">Call {site.phone.display}</PhoneLink>
            <Link href="/contact" className="btn-secondary">
              Request appointment
            </Link>
            <a href={site.links.directions} target="_blank" rel="noreferrer" className="btn-ghost">
              Get directions <span className="btn-ghost-arrow">→</span>
            </a>
          </>
        }
        aside={
          <div className="glass-card mx-auto max-w-sm">
            <div className="flex items-center gap-1 text-2xl text-amber-400" aria-hidden>
              ★★★★★
            </div>
            <p className="mt-3 font-display text-2xl font-semibold text-ink">5-Star Patient Reviews</p>
            <p className="mt-2 text-sm text-ink-muted">
              &ldquo;They make you feel like family — and the technology is unreal.&rdquo;
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl bg-white/70 p-4">
                <div className="font-display text-2xl font-semibold text-brand-700">Same-day</div>
                <div className="mt-1 text-xs text-ink-muted">crowns &amp; restorations</div>
              </div>
              <div className="rounded-2xl bg-white/70 p-4">
                <div className="font-display text-2xl font-semibold text-brand-700">In-office</div>
                <div className="mt-1 text-xs text-ink-muted">zirconia mill &amp; CEREC</div>
              </div>
            </div>
          </div>
        }
      />

      {/* Trust strip */}
      <Section variant="muted" className="!py-14">
        <StatGrid stats={heroStats} />
      </Section>

      {/* Why patients choose us */}
      <Section>
        <Reveal>
          <p className="eyebrow">Why patients choose us</p>
          <h2 className="mt-2 max-w-3xl text-balance text-display-2 font-display font-semibold text-ink">
            Big-city dentistry, delivered in days — not months.
          </h2>
          <p className="mt-4 max-w-3xl text-pretty text-lead text-ink-muted">
            Most dental offices send your case across the country and wait weeks for restorations. We
            design, mill, and deliver them right here.
          </p>
        </Reveal>
        <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3">
          {site.highlights.map((h) => (
            <div key={h.title} className="card card-hover h-full">
              <h3 className="font-display text-xl font-semibold text-ink">{h.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{h.body}</p>
            </div>
          ))}
        </RevealGroup>
      </Section>

      {/* 7-day full-mouth rehab — sticky showcase */}
      <Section variant="ink">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200">
            Same-day technology
          </p>
          <h2 className="mt-2 max-w-3xl text-balance text-display-2 font-display font-semibold">
            A full-mouth rehab in as little as <span className="text-brand-200">7 days.</span>
          </h2>
        </Reveal>
        <div className="mt-12">
          <StickyShowcase
            dark
            visual={
              <div className="rounded-4xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                <div className="font-display text-7xl font-semibold tracking-tight text-white">7</div>
                <div className="text-sm uppercase tracking-[0.2em] text-brand-200">days, in-office</div>
                <ul className="mt-7 grid gap-3">
                  {site.technology.map((t) => (
                    <li
                      key={t}
                      className="flex items-start gap-3 rounded-2xl bg-white/5 p-3 text-sm text-brand-50 ring-1 ring-white/10"
                    >
                      <span
                        aria-hidden
                        className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-brand-500 text-[10px] font-bold text-white"
                      >
                        ✓
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/services/dentures"
                  className="mt-7 inline-flex text-sm font-semibold text-white hover:text-brand-100"
                >
                  See how rapid restoration works →
                </Link>
              </div>
            }
            steps={rehabSteps}
          />
        </div>
      </Section>

      {/* Denture Insurance */}
      <Section variant="aurora">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow">Exclusive program</p>
            <h2 className="mt-2 text-balance text-display-2 font-display font-semibold text-ink">
              Denture Insurance — a replacement in 48 hours.
            </h2>
            <p className="mt-5 text-pretty text-lead text-ink-muted">
              A lost or broken denture used to mean weeks of waiting. Not anymore. For a one-time{" "}
              <span className="font-semibold text-ink">$300</span>, we capture your denture digitally and
              securely store it in the cloud — so we can 3D print or mill an exact replacement within{" "}
              <span className="font-semibold text-ink">48 hours</span> if you ever need one.
            </p>
            <Link href="/services/dentures" className="btn-primary mt-7">
              Learn how it works
            </Link>
          </Reveal>
          <RevealGroup className="grid gap-4">
            {dentureSteps.map((item) => (
              <div key={item.title} className="flex gap-4 rounded-3xl border border-black/[0.06] bg-white p-5 shadow-glass">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-brand-600 font-display text-sm font-semibold text-white">
                  {item.index}
                </span>
                <div>
                  <p className="font-display text-base font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-sm text-ink-muted">{item.body}</p>
                </div>
              </div>
            ))}
          </RevealGroup>
        </div>
      </Section>

      {/* Services */}
      <Section>
        <Reveal>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Services</p>
              <h2 className="mt-2 text-balance text-display-2 font-display font-semibold text-ink">
                Comprehensive care, all in one place.
              </h2>
            </div>
            <Link href="/services" className="btn-ghost">
              See all services <span className="btn-ghost-arrow">→</span>
            </Link>
          </div>
        </Reveal>
        <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.06}>
          {services.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </RevealGroup>
      </Section>

      {/* Patient forms */}
      <Section variant="muted">
        <FeatureRow
          eyebrow="Save time before your visit"
          title="Patient forms — secure & online."
          actions={
            <>
              {formsReady ? (
                <a href={formsLink} target="_blank" rel="noreferrer" className="btn-primary">
                  Fill out forms online
                </a>
              ) : (
                <Link href="/patient-forms" className="btn-primary">
                  See patient forms
                </Link>
              )}
              <a href={site.links.printableFormsPacket} className="btn-secondary">
                Download printable packet
              </a>
            </>
          }
          media={
            <div className="card">
              <h3 className="font-display text-lg font-semibold text-ink">What to bring</h3>
              <ul className="mt-4 space-y-2 text-sm text-ink">
                {[
                  "Photo ID",
                  "Dental insurance card (if applicable)",
                  "List of current medications",
                  "Recent dental records or X-rays, if available",
                  "Any specific concerns to discuss",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span aria-hidden className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-500" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          }
        >
          <p>
            Complete your health history, dental history, insurance information, and consent forms online
            before your appointment. Printable versions are also available if you prefer to complete them by
            hand.
          </p>
        </FeatureRow>
      </Section>

      {/* Smile gallery teaser */}
      <Section variant="muted" className="!pt-0">
        <Reveal>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Smile Gallery</p>
              <h2 className="mt-2 text-balance text-display-2 font-display font-semibold text-ink">
                Real patients. Real transformations.
              </h2>
              <p className="mt-4 max-w-2xl text-pretty text-ink-muted">
                Every smile is designed for the person behind it. Browse a few of our recent
                before-and-afters.
              </p>
            </div>
            <Link href="/smile-gallery" className="btn-ghost">
              View full gallery <span className="btn-ghost-arrow">→</span>
            </Link>
          </div>
        </Reveal>
        <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3">
          {galleryTeasers.map((c) => (
            <BeforeAfterCard key={c.id} item={c} />
          ))}
        </RevealGroup>
      </Section>

      {/* About Dr. Gardner */}
      <Section>
        <FeatureRow
          reverse
          eyebrow="About"
          title="Meet Dr. Chad Gardner"
          actions={
            <Link href="/about" className="btn-ghost">
              More about our practice <span className="btn-ghost-arrow">→</span>
            </Link>
          }
          media={
            <div className="relative aspect-[5/4] overflow-hidden rounded-4xl bg-brand-50 shadow-glass">
              <Media
                src="/team/chad-and-carey.jpg"
                alt={`${site.dentistName} and his wife Carey`}
                sizes="(min-width: 1024px) 45vw, 90vw"
                label="Dr. Chad Gardner & Carey"
              />
            </div>
          }
        >
          <p>
            Practicing general dentistry since 2005, Dr. Gardner serves families in Bastrop and the
            surrounding parish with a focus on practical, patient-centered care, clear communication, and
            modern technology.
          </p>
          <p>
            Dr. Gardner and his wife Carey have called Bastrop home for years and love serving their
            neighbors across Morehouse Parish.
          </p>
        </FeatureRow>
      </Section>

      {/* Testimonials */}
      <Section variant="muted">
        <Reveal>
          <p className="eyebrow">Patient stories</p>
          <h2 className="mt-2 text-balance text-display-2 font-display font-semibold text-ink">
            What our patients say
          </h2>
        </Reveal>
        <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3">
          {homeTestimonials.map((t) => (
            <TestimonialCard key={t.author} t={t} />
          ))}
        </RevealGroup>
        <Reveal delay={0.1}>
          <div className="mt-8">
            <Link href="/reviews" className="btn-ghost">
              Read more reviews <span className="btn-ghost-arrow">→</span>
            </Link>
          </div>
        </Reveal>
      </Section>

      <CTABanner />
    </>
  );
}
