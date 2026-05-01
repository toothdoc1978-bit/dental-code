import type { Metadata } from "next";
import { CTABanner } from "@/components/CTABanner";
import { GalleryGrid } from "@/components/GalleryGrid";

export const metadata: Metadata = {
  title: "Smile Gallery — Before & After",
  description:
    "Real before-and-after photos of cosmetic, restorative, and implant dentistry from Chad Gardner, DDS in Bastrop, LA.",
  alternates: { canonical: "/smile-gallery" },
};

export default function SmileGalleryPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="container-page py-16 md:py-20">
          <p className="eyebrow">Smile Gallery</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">
            Real patients. Real transformations.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-muted">
            Every smile here was designed for the person behind it. Many were completed in days using our
            in-office mill — not weeks of waiting for an outside lab.
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <GalleryGrid />
      </section>

      <CTABanner
        title="Imagine your before-and-after."
        body="Send us a photo or come in for a consultation. We'll walk you through what's possible — including timeline, options, and price ranges."
      />
    </>
  );
}
