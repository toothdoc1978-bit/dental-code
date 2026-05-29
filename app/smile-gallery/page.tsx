import type { Metadata } from "next";
import { CTABanner } from "@/components/CTABanner";
import { GalleryGrid } from "@/components/GalleryGrid";
import { Hero } from "@/components/ui/Hero";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Smile Gallery — Before & After",
  description:
    "Real before-and-after photos of cosmetic, restorative, and implant dentistry from Chad Gardner, DDS in Bastrop, LA.",
  alternates: { canonical: "/smile-gallery" },
};

export default function SmileGalleryPage() {
  return (
    <>
      <Hero
        eyebrow="Smile Gallery"
        title="Real patients. Real transformations."
        subtitle="Every smile here was designed for the person behind it. Many were completed in days using our in-office mill — not weeks of waiting for an outside lab."
      />

      <Section>
        <GalleryGrid />
      </Section>

      <CTABanner
        title="Imagine your before-and-after."
        body="Send us a photo or come in for a consultation. We'll walk you through what's possible — including timeline, options, and price ranges."
      />
    </>
  );
}
