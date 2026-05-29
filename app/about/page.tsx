import type { Metadata } from "next";
import { CTABanner } from "@/components/CTABanner";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { FeatureRow } from "@/components/ui/FeatureRow";
import { Hero } from "@/components/ui/Hero";
import { Media } from "@/components/ui/Media";
import { Section } from "@/components/ui/Section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Our Practice",
  description: `Learn about ${site.dentistName} and the team providing family, cosmetic, and restorative dentistry in Bastrop, LA.`,
  alternates: { canonical: "/about" },
};

const values = [
  {
    title: "Listen first",
    body: "We start every visit by asking what you want — comfort, function, or a brand-new smile — and design care around your goals.",
  },
  {
    title: "Honest recommendations",
    body: "We treat what's truly needed and tell you what can wait. You'll always understand the why behind every option.",
  },
  {
    title: "Modern, gentle care",
    body: "Digital imaging, quiet handpieces, and a calm chairside manner make every appointment as easy as possible.",
  },
  {
    title: "Lifetime relationships",
    body: "From a child's first cleaning to a grandparent's full restoration, we're proud to be a single trusted home for your family's care.",
  },
];

const officeShots = [
  {
    src: "/office/waiting-room.jpg",
    alt: "Welcoming waiting room with leather chairs, soft gray walls, and warm wood floors at Chad Gardner, DDS in Bastrop, LA.",
    caption: "A calm, welcoming reception area.",
  },
  {
    src: "/office/operatory.jpg",
    alt: "Bright dental operatory with modern chair and digital monitor at Chad Gardner, DDS.",
    caption: "Modern operatories with great natural light.",
  },
  {
    src: "/office/waiting-room-2.jpg",
    alt: "Second view of the waiting room showing artwork, lamp, and additional seating.",
    caption: "Plenty of space, never feels crowded.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Hero
        eyebrow="About"
        title="Personal, modern dentistry in the heart of Bastrop."
        subtitle="For years, our team has been caring for the smiles of Morehouse Parish — combining the warmth of a small-town practice with the technology and training of a big-city office."
      />

      <Section>
        <FeatureRow
          eyebrow="Your dentist"
          title="About Dr. Chad Gardner"
          media={
            <div className="relative aspect-square overflow-hidden rounded-4xl bg-brand-50 shadow-glass">
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
            Dr. Chad Gardner has practiced general dentistry since 2005 and serves patients in Bastrop,
            Louisiana and the surrounding communities. His office focuses on practical, patient-centered
            dental care with an emphasis on clear communication, modern technology, and treatment plans that
            make sense for each patient&apos;s needs.
          </p>
          <p>
            At {site.practiceName} — {site.seoName}, patients can receive routine family dentistry, emergency
            care, whitening, dentures, implant-related dentistry, cosmetic options such as veneers, clear
            aligners, and sedation options for patients who feel anxious about dental treatment.
          </p>
          <p>
            Outside the office, Dr. Gardner and his wife Carey are proud members of the Bastrop community —
            you&apos;ll often find them at local events, supporting area schools, or having dinner with patients
            they&apos;ve known for years.
          </p>
        </FeatureRow>
      </Section>

      <Section variant="muted">
        <Reveal>
          <p className="eyebrow">What we believe</p>
          <h2 className="mt-2 text-balance text-display-2 font-display font-semibold text-ink">
            How we practice dentistry
          </h2>
        </Reveal>
        <RevealGroup className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.title} className="card card-hover h-full">
              <h3 className="font-display text-xl font-semibold text-ink">{v.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{v.body}</p>
            </div>
          ))}
        </RevealGroup>
      </Section>

      <Section>
        <Reveal>
          <p className="eyebrow">Inside the office</p>
          <h2 className="mt-2 text-balance text-display-2 font-display font-semibold text-ink">
            A comfortable space, designed around our patients.
          </h2>
          <p className="mt-4 max-w-2xl text-pretty text-ink-muted">
            From the moment you walk in, we want it to feel less like a typical dental office and more like a
            place you&apos;re glad to spend an hour in.
          </p>
        </Reveal>
        <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3">
          {officeShots.map((s) => (
            <figure key={s.src} className="card card-hover overflow-hidden p-0">
              <div className="relative aspect-[4/5] w-full bg-brand-50">
                <Media src={s.src} alt={s.alt} sizes="(min-width: 768px) 30vw, 90vw" label={s.caption} />
              </div>
              <figcaption className="p-5 text-sm text-ink-muted">{s.caption}</figcaption>
            </figure>
          ))}
        </RevealGroup>
      </Section>

      <Section variant="ink">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200">
              In-house technology
            </p>
            <h2 className="mt-2 text-balance text-display-2 font-display font-semibold">
              The lab is down the hall.
            </h2>
            <p className="mt-4 text-pretty text-brand-100">
              We&apos;ve invested in the equipment most dental offices ship out. That means faster turnarounds,
              better-fitting restorations, and the ability to handle complex full-mouth cases without sending
              your smile across the country.
            </p>
            <p className="mt-4 text-pretty text-brand-100">
              Dr. Gardner pairs scans and photos with a trusted designer, oversees the wax-up, mills final
              zirconia restorations on our 5-axis mill, and cements them himself. Every step happens under
              one roof.
            </p>
          </Reveal>
          <RevealGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {site.technology.map((t) => (
              <div
                key={t}
                className="flex items-start gap-3 rounded-2xl bg-white/5 p-4 text-sm text-brand-50 ring-1 ring-white/10"
              >
                <span
                  aria-hidden
                  className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-brand-500 text-[10px] font-bold text-white"
                >
                  ✓
                </span>
                {t}
              </div>
            ))}
          </RevealGroup>
        </div>
      </Section>

      <Section variant="muted">
        <RevealGroup className="grid gap-6 md:grid-cols-2">
          <div className="card h-full">
            <h3 className="font-display text-xl font-semibold text-ink">Insurance &amp; financing</h3>
            <p className="mt-3 text-sm text-ink-muted">
              We&apos;re in-network with most major PPO plans and happy to file claims on your behalf. For larger
              treatment plans, we offer flexible financing through CareCredit and other options.
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-ink">
              {site.insurance.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="card h-full">
            <h3 className="font-display text-xl font-semibold text-ink">New patient visit</h3>
            <p className="mt-3 text-sm text-ink-muted">
              Plan on about an hour for your first visit. We&apos;ll review your medical history, take a complete
              set of digital X-rays, perform a thorough exam, and design a plan around your priorities — all
              before any treatment begins.
            </p>
            <p className="mt-3 text-sm text-ink-muted">
              Bring your insurance card, a list of current medications, and any concerns you&apos;d like us to
              address. That&apos;s it.
            </p>
          </div>
        </RevealGroup>
      </Section>

      <CTABanner
        title="Meet us in person."
        body="Whether you're long overdue or just moved to the area, we'd love to be your dental home."
      />
    </>
  );
}
