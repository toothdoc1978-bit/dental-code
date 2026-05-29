import type { Metadata } from "next";
import { CTABanner } from "@/components/CTABanner";
import { ServiceCard } from "@/components/ServiceCard";
import { services } from "@/lib/services";

export const metadata: Metadata = {
  title: "Dental Services in Bastrop, LA",
  description:
    "Family, cosmetic, restorative, and implant dentistry — including same-day crowns, full-mouth restorations, and natural-looking dentures.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="container-page py-16 md:py-20">
          <p className="eyebrow">Services</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">
            Comprehensive dentistry, all in one office.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-muted">
            From routine cleanings to full-mouth restorations, our team delivers gentle, modern care backed
            by in-house technology that most practices have to outsource.
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
      </section>

      <CTABanner />
    </>
  );
}
