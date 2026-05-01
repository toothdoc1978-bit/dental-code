import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description: `${site.practiceName} accessibility commitment and contact information for accessibility issues.`,
  alternates: { canonical: "/accessibility" },
};

export default function AccessibilityPage() {
  return (
    <section className="container-page py-16 md:py-20">
      <p className="eyebrow">Accessibility</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">Accessibility Statement</h1>

      <div className="prose mt-8 max-w-3xl text-ink-muted">
        <p>
          We're committed to making our website usable for everyone, including patients who use assistive
          technology. We aim to follow WCAG 2.1 AA guidelines for color contrast, keyboard navigation, focus
          states, and meaningful alt text.
        </p>
        <p className="mt-4">
          If you have trouble using any part of this site, please contact us so we can help and so we can
          improve. Call {site.phone.display} or email{" "}
          <a href={`mailto:${site.email}`} className="text-brand-700 underline hover:no-underline">
            {site.email}
          </a>
          .
        </p>
      </div>
    </section>
  );
}
