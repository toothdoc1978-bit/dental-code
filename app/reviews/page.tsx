import type { Metadata } from "next";
import { CTABanner } from "@/components/CTABanner";
import { TestimonialCard } from "@/components/TestimonialCard";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { Hero } from "@/components/ui/Hero";
import { Section } from "@/components/ui/Section";
import { site } from "@/lib/site";
import { testimonials } from "@/lib/testimonials";

export const metadata: Metadata = {
  title: "Patient Reviews",
  description:
    "Hear from patients about their experience with Chad Gardner, DDS in Bastrop, Louisiana — cosmetic, restorative, and family dentistry.",
  alternates: { canonical: "/reviews" },
};

export default function ReviewsPage() {
  return (
    <>
      <Hero
        eyebrow="Reviews"
        title="Trusted by families across Morehouse Parish."
        subtitle="We're grateful for every patient who trusts us with their smile. Here's what some of them have to say."
        actions={
          site.social.google ? (
            <a href={site.social.google} target="_blank" rel="noreferrer" className="btn-secondary">
              Read all reviews on Google →
            </a>
          ) : undefined
        }
      />

      <Section>
        <RevealGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard key={t.author} t={t} />
          ))}
        </RevealGroup>
      </Section>

      <Section variant="muted">
        <Reveal>
          <div className="text-center">
            <p className="eyebrow">Leave a review</p>
            <h2 className="mt-2 text-display-3 font-display font-semibold text-ink">
              Loved your visit? Share it.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-pretty text-ink-muted">
              Honest reviews help other Bastrop families find us. If we earned your smile, we&apos;d be
              grateful for a moment of your time on Google.
            </p>
            {site.social.google && (
              <a href={site.social.google} target="_blank" rel="noreferrer" className="btn-primary mt-6">
                Leave a Google review
              </a>
            )}
          </div>
        </Reveal>
      </Section>

      <CTABanner />
    </>
  );
}
