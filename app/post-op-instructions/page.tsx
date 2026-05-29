import type { Metadata } from "next";
import Link from "next/link";
import { CTABanner } from "@/components/CTABanner";
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
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="container-page py-16 md:py-20">
          <p className="eyebrow">Patient Education</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">
            Post-Op Instructions
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-muted">
            Pick the procedure you had and we'll walk you through what to expect, what to avoid, when to call
            us, and how to heal cleanly.
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {postOps.map((p) => (
            <Link
              key={p.slug}
              href={`/post-op-instructions/${p.slug}`}
              className="card flex flex-col gap-3 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <h2 className="font-display text-xl font-semibold text-ink">{p.name}</h2>
              <p className="text-sm text-ink-muted">{p.short}</p>
              <span className="mt-auto text-sm font-semibold text-brand-700">Read instructions →</span>
            </Link>
          ))}
        </div>
      </section>

      <CTABanner
        title="Something doesn't feel right?"
        body="If you have heavy bleeding, swelling that's getting worse, a fever, trouble swallowing, or pain that's increasing, call us right away."
      />
    </>
  );
}
