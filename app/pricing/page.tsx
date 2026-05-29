import type { Metadata } from "next";
import { CTABanner } from "@/components/CTABanner";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { Hero } from "@/components/ui/Hero";
import { Section } from "@/components/ui/Section";
import { pricing } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Common Dental Fees & Payment Options",
  description:
    "Transparent starting prices for cleanings, dentures, whitening, veneers, clear aligners, and more at Chad Gardner, DDS in Bastrop, LA.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <Hero
        eyebrow="Pricing"
        title="Common Dental Fees & Payment Options"
        subtitle="We believe patients should understand their options before making treatment decisions. The fees below are general starting points for common services and may vary depending on exam findings, X-rays, insurance coverage, materials, and treatment complexity."
      />

      <Section>
        <Reveal className="overflow-hidden rounded-3xl shadow-glass ring-1 ring-black/[0.06]">
          <table className="w-full bg-white text-left text-sm">
            <thead className="bg-brand-50 text-brand-700">
              <tr>
                <th scope="col" className="px-5 py-4 font-display text-xs uppercase tracking-wider">
                  Service
                </th>
                <th scope="col" className="px-5 py-4 font-display text-xs uppercase tracking-wider">
                  Starting price
                </th>
                <th scope="col" className="hidden px-5 py-4 font-display text-xs uppercase tracking-wider md:table-cell">
                  What's included
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {pricing.map((p) => (
                <tr key={p.service} className="align-top">
                  <td className="px-5 py-4 font-semibold text-ink">{p.service}</td>
                  <td className="px-5 py-4 text-brand-700">{p.price}</td>
                  <td className="hidden px-5 py-4 text-ink-muted md:table-cell">{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </Section>

      <Section className="!pt-0">
        <RevealGroup className="grid gap-6 md:grid-cols-2">
          <div className="card h-full">
            <h2 className="font-display text-xl font-semibold text-ink">Insurance &amp; financing</h2>
            <p className="mt-3 text-sm text-ink-muted">
              We work with many traditional dental insurance plans and Medicaid for eligible patients under
              21. Financing options may also be available for qualifying treatment. Please call our office so
              we can help review your benefits and walk through the options that fit your treatment plan.
            </p>
          </div>
          <div className="card h-full">
            <h2 className="font-display text-xl font-semibold text-ink">Important note on prices</h2>
            <p className="mt-3 text-sm text-ink-muted">
              Prices are estimates and may vary based on exam findings, X-rays, insurance coverage, materials,
              and treatment complexity. A final treatment plan and fee estimate will be provided after your
              evaluation, before any treatment begins.
            </p>
          </div>
        </RevealGroup>
      </Section>

      <CTABanner />
    </>
  );
}
