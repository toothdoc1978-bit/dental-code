import type { Metadata } from "next";
import Link from "next/link";
import { fullAddress, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.practiceName} collects, uses, and protects information from website visitors.`,
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <section className="container-page py-16 md:py-20">
      <p className="eyebrow">Privacy</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">Privacy Policy</h1>
      <p className="mt-3 text-sm text-ink-muted">Last updated: 2026</p>

      <div className="prose mt-8 max-w-3xl text-ink-muted">
        <h2 className="font-display text-2xl font-semibold text-ink">Who we are</h2>
        <p className="mt-3">
          {site.practiceName} ({site.seoName}) operates this website. Our office is located at {fullAddress}.
          Questions about this policy can be directed to{" "}
          <a href={`mailto:${site.email}`} className="text-brand-700 underline hover:no-underline">
            {site.email}
          </a>{" "}
          or by phone at {site.phone.display}.
        </p>

        <h2 className="mt-8 font-display text-2xl font-semibold text-ink">Information we collect from this site</h2>
        <p className="mt-3">
          When you submit our general contact form, we collect your name, email, phone number, and message.
          We use this information only to respond to your request. We don't sell or rent your information.
        </p>
        <p className="mt-3">
          For your privacy, please don't include detailed medical or dental information in our general contact
          form. Use our secure online patient forms — delivered through a HIPAA-compliant service — or call
          our office for anything that involves protected health information.
        </p>

        <h2 className="mt-8 font-display text-2xl font-semibold text-ink">Cookies & analytics</h2>
        <p className="mt-3">
          We may use privacy-friendly analytics to understand how visitors use the site so we can improve it.
          Analytics data is aggregated and not used to identify individual visitors.
        </p>

        <h2 className="mt-8 font-display text-2xl font-semibold text-ink">Patient health information (HIPAA)</h2>
        <p className="mt-3">
          Protected health information is handled separately, through our HIPAA-compliant patient forms and
          internal systems. This website is not a place to share or transmit clinical details. If you have a
          question about how your records are used or stored, contact our office directly.
        </p>

        <h2 className="mt-8 font-display text-2xl font-semibold text-ink">Third-party links</h2>
        <p className="mt-3">
          Our site may link to third-party services (Google Maps, Jotform, Resend, etc.). Those services have
          their own privacy practices, and we encourage you to review them.
        </p>

        <h2 className="mt-8 font-display text-2xl font-semibold text-ink">Updates to this policy</h2>
        <p className="mt-3">
          We may update this policy from time to time. The most current version is always available on this
          page.
        </p>

        <p className="mt-8 text-sm">
          For accessibility-related questions, please see our{" "}
          <Link href="/accessibility" className="text-brand-700 underline hover:no-underline">
            accessibility statement
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
