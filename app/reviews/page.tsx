import type { Metadata } from "next";
import { CTABanner } from "@/components/CTABanner";
import { TestimonialCard } from "@/components/TestimonialCard";
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
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="container-page py-16 md:py-20">
          <p className="eyebrow">Reviews</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">
            Trusted by families across Morehouse Parish.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-muted">
            We're grateful for every patient who trusts us with their smile. Here's what some of them have to say.
          </p>
          {site.social.google && (
            <a
              href={site.social.google}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary mt-8"
            >
              Read all reviews on Google →
            </a>
          )}
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard key={t.author} t={t} />
          ))}
        </div>
      </section>

      <section className="bg-surface-muted py-16">
        <div className="container-page text-center">
          <p className="eyebrow">Leave a review</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
            Loved your visit? Share it.
          </h2>
          <p className="mt-3 mx-auto max-w-2xl text-ink-muted">
            Honest reviews help other Bastrop families find us. If we earned your smile, we'd be grateful for
            a moment of your time on Google.
          </p>
          {site.social.google && (
            <a
              href={site.social.google}
              target="_blank"
              rel="noreferrer"
              className="btn-primary mt-6"
            >
              Leave a Google review
            </a>
          )}
        </div>
      </section>

      <CTABanner />
    </>
  );
}
