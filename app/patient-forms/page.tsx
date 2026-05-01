import type { Metadata } from "next";
import Link from "next/link";
import { CTABanner } from "@/components/CTABanner";
import { PhoneLink } from "@/components/PhoneLink";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Patient Forms & Visit Information",
  description: `Complete your forms before your visit. New patient registration, health and dental history, insurance, and consent for ${site.practiceName} in Bastrop, LA.`,
  alternates: { canonical: "/patient-forms" },
};

const onlineForms = [
  "New Patient Registration",
  "Medical / Health History",
  "Dental History",
  "Insurance Information",
  "HIPAA Acknowledgment",
  "Financial Policy",
  "Consent for Treatment",
  "Assignment of Benefits",
  "Minor Patient Consent (if applicable)",
  "Records Release (if applicable)",
];

const printable = [
  { label: "Combined New Patient Packet (PDF)", href: site.links.printableFormsPacket },
  { label: "Medical History (PDF)", href: "/forms/medical-history.pdf" },
  { label: "Dental History (PDF)", href: "/forms/dental-history.pdf" },
  { label: "Insurance Information (PDF)", href: "/forms/insurance-information.pdf" },
  { label: "HIPAA Acknowledgment (PDF)", href: "/forms/hipaa-acknowledgment.pdf" },
  { label: "Financial Policy (PDF)", href: "/forms/financial-policy.pdf" },
  { label: "Consent for Treatment (PDF)", href: "/forms/consent-for-treatment.pdf" },
];

const formsLink = site.links.onlineForms;
const formsReady = formsLink && !formsLink.startsWith("TODO");

export default function PatientFormsPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="container-page py-16 md:py-20">
          <p className="eyebrow">Patient Info</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">
            Patient Forms & Visit Information
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-muted">
            Complete your patient forms before your visit to save time at the office. You can fill out forms
            securely online, or download printable versions to complete by hand and bring with you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {formsReady ? (
              <a href={formsLink} target="_blank" rel="noreferrer" className="btn-primary">
                Fill out forms online
              </a>
            ) : (
              <span className="btn-primary cursor-not-allowed opacity-60" aria-disabled="true">
                Online forms coming soon
              </span>
            )}
            <a href={site.links.printableFormsPacket} className="btn-secondary">
              Download printable packet
            </a>
            <PhoneLink className="btn-secondary" />
          </div>
        </div>
      </section>

      <section className="container-page grid gap-10 py-16 md:grid-cols-2">
        <div className="card">
          <h2 className="font-display text-2xl font-semibold text-ink">Online forms</h2>
          <p className="mt-3 text-ink-muted">
            Our online forms are delivered through a HIPAA-compliant service with electronic signatures. You
            can complete them from any phone, tablet, or computer.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-ink">
            {onlineForms.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-500" />
                {f}
              </li>
            ))}
          </ul>
          {formsReady ? (
            <a href={formsLink} target="_blank" rel="noreferrer" className="btn-primary mt-6 inline-flex">
              Open online forms
            </a>
          ) : (
            <p className="mt-6 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-ink-muted">
              Online forms link is being finalized. In the meantime, please download the printable packet
              below or call our office.
            </p>
          )}
        </div>

        <div className="card">
          <h2 className="font-display text-2xl font-semibold text-ink">Printable forms</h2>
          <p className="mt-3 text-ink-muted">
            Prefer paper? Download the packet, fill it out, and bring it to your appointment.
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            {printable.map((p) => (
              <li key={p.href}>
                <a
                  href={p.href}
                  className="flex items-center justify-between gap-3 rounded-xl border border-brand-50 px-4 py-3 text-ink transition hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-700"
                >
                  <span>{p.label}</span>
                  <span aria-hidden className="text-brand-600">↓</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-surface-muted py-16">
        <div className="container-page grid gap-10 md:grid-cols-2">
          <div className="card">
            <h2 className="font-display text-xl font-semibold text-ink">What to bring to your first visit</h2>
            <ul className="mt-4 space-y-2 text-sm text-ink">
              <li className="flex items-start gap-3">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-500" />
                Photo ID
              </li>
              <li className="flex items-start gap-3">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-500" />
                Dental insurance card (if applicable)
              </li>
              <li className="flex items-start gap-3">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-500" />
                List of current medications and dosages
              </li>
              <li className="flex items-start gap-3">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-500" />
                Recent dental records or X-rays, if you have them
              </li>
              <li className="flex items-start gap-3">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-500" />
                Any specific concerns you'd like us to address
              </li>
            </ul>
          </div>
          <div className="card">
            <h2 className="font-display text-xl font-semibold text-ink">Insurance & financing</h2>
            <p className="mt-3 text-sm text-ink-muted">
              We work with many traditional dental insurance plans and Medicaid for eligible patients under
              21. Financing options may also be available for qualifying treatment. Please call our office so
              we can help review your benefits.
            </p>
            <PhoneLink className="btn-secondary mt-5 inline-flex" />
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <p className="font-semibold">A note on privacy</p>
          <p className="mt-2 text-sm">
            For your privacy, please don't include detailed medical or dental information in our general
            contact form. Use the secure online forms above, or call our office directly. For urgent dental
            concerns,{" "}
            <Link href="/services/emergency-dentist" className="underline hover:no-underline">
              see our emergency page
            </Link>{" "}
            or call{" "}
            <PhoneLink className="font-semibold underline hover:no-underline" />.
          </p>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
