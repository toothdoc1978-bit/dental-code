import type { Metadata } from "next";
import { CTABanner } from "@/components/CTABanner";
import { ServiceCard } from "@/components/ServiceCard";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { Hero } from "@/components/ui/Hero";
import { Section } from "@/components/ui/Section";
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
      <Hero
        eyebrow="Services"
        title="Comprehensive dentistry, all in one office."
        subtitle="From routine cleanings to full-mouth restorations, our team delivers gentle, modern care backed by in-house technology that most practices have to outsource."
      />

      <Section>
        <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.06}>
          {services.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </RevealGroup>
      </Section>

      <CTABanner />
    </>
  );
}
