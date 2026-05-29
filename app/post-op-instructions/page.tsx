import type { Metadata } from "next";
import Link from "next/link";
import { CTABanner } from "@/components/CTABanner";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { Hero } from "@/components/ui/Hero";
import { Section } from "@/components/ui/Section";
import { postOps } from "@/lib/post-op";

export const metadata: Metadata = {
  title: "Post-Op Instructions",
  description:
    "Care instructions after extractions, fillings, crowns, dentures, implants, whitening, and clear aligner appointments at Chad Gardner, DDS in Bastrop, LA.",
  alternates: { canonical: "/post-op-instructions" },
};

export default function PostOpHubPage() {
  return (
    <>
      <Hero
        eyebrow="Patient Education"
        title="Post-Op Instructions"
        subtitle="Pick the procedure you had and we'll walk you through what to expect, what to avoid, when to call us, and how to heal cleanly."
      />

      <Section>
        <RevealGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {postOps.map((p) => (
            <Link
              key={p.slug}
              href={`/post-op-instructions/${p.slug}`}
              className="card card-hover group flex h-full flex-col gap-3"
            >
              <h2 className="font-display text-xl font-semibold text-ink">{p.name}</h2>
              <p className="text-sm text-ink-muted">{p.short}</p>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                Read instructions{" "}
                <span className="transition-transform duration-300 ease-apple group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </Link>
          ))}
        </RevealGroup>
      </Section>

      <CTABanner
        title="Something doesn't feel right?"
        body="If you have heavy bleeding, swelling that's getting worse, a fever, trouble swallowing, or pain that's increasing, call us right away."
      />
    </>
  );
}
