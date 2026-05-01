import type { Metadata } from "next";
import { CTABanner } from "@/components/CTABanner";

export const metadata: Metadata = {
  title: "Dental Blog & Patient Tips",
  description:
    "Practical dental tips and patient education from Chad Gardner, DDS in Bastrop, LA — emergencies, dentures, whitening, implants, and more.",
  alternates: { canonical: "/blog" },
};

const upcomingTopics = [
  "What to Do If You Break a Tooth in Bastrop, LA",
  "How Much Do Dentures Cost — and What Drives the Price?",
  "Teeth Whitening: Store-Bought vs Dentist-Supervised",
  "When Is a Dental Emergency Really an Emergency?",
  "What New Patients Should Bring to Their First Visit",
  "Clear Aligners vs Braces: Which Is Right for You?",
  "Why Dental X-Rays May Be Needed During an Emergency Visit",
  "Denture Repair: When to Fix It and When to Replace It",
  "How to Help a Child Who Is Nervous at the Dentist",
];

export default function BlogIndexPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="container-page py-16 md:py-20">
          <p className="eyebrow">Blog</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">
            Dental tips, patient education, and Bastrop news
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-muted">
            We're putting together a regular series of practical dental articles for our patients and
            neighbors. Expect plain-spoken answers to the questions we get asked every day.
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="card max-w-3xl">
          <h2 className="font-display text-2xl font-semibold text-ink">Coming soon</h2>
          <p className="mt-3 text-sm text-ink-muted">
            New articles are on the way. Topics we're planning to cover:
          </p>
          <ul className="mt-5 grid gap-2 text-sm text-ink sm:grid-cols-2">
            {upcomingTopics.map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-500" />
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-ink-muted">
            Have a question you'd like us to write about? Mention it next time you call or visit.
          </p>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
