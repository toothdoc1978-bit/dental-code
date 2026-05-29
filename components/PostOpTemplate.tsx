import Link from "next/link";
import { PhoneLink } from "./PhoneLink";
import { Hero } from "@/components/ui/Hero";
import type { PostOp } from "@/lib/post-op";

export function PostOpTemplate({ p }: { p: PostOp }) {
  return (
    <>
      <Hero eyebrow="Post-Op Instructions" title={p.name} subtitle={p.intro} />

      <section className="container-page pt-12 pb-12">
        <div className="rounded-2xl border-l-4 border-l-rose-500 bg-rose-50 p-6">
          <h2 className="font-display text-xl font-semibold text-rose-900">Call us if…</h2>
          <ul className="mt-3 space-y-2 text-sm text-rose-900">
            {p.callIfYou.map((c) => (
              <li key={c} className="flex items-start gap-3">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-rose-500" />
                {c}
              </li>
            ))}
          </ul>
          <PhoneLink className="btn-primary mt-5 inline-flex bg-rose-600 hover:bg-rose-700 focus-visible:outline-rose-500" />
        </div>
      </section>

      <section className="container-page grid gap-6 pb-12 md:grid-cols-2">
        <div className="card">
          <h2 className="font-display text-xl font-semibold text-ink">What to expect</h2>
          <ul className="mt-4 space-y-2 text-sm text-ink">
            {p.whatToExpect.map((w) => (
              <li key={w} className="flex items-start gap-3">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-500" />
                {w}
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2 className="font-display text-xl font-semibold text-ink">What to avoid</h2>
          <ul className="mt-4 space-y-2 text-sm text-ink">
            {p.avoid.map((a) => (
              <li key={a} className="flex items-start gap-3">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-amber-500" />
                {a}
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2 className="font-display text-xl font-semibold text-ink">Medication & comfort</h2>
          <ul className="mt-4 space-y-2 text-sm text-ink">
            {p.medication.map((m) => (
              <li key={m} className="flex items-start gap-3">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-emerald-500" />
                {m}
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2 className="font-display text-xl font-semibold text-ink">Follow-up</h2>
          <p className="mt-3 text-sm text-ink">{p.followUp}</p>
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="rounded-2xl border border-brand-100 bg-surface-muted p-6 text-sm text-ink-muted">
          <p>
            <span className="font-semibold text-ink">A note from us:</span> These instructions are general
            guidance and don't replace advice from your dentist. If you have heavy bleeding, swelling that
            worsens, fever, trouble breathing or swallowing, allergic symptoms, or pain that isn't improving,
            call our office or seek urgent medical care.
          </p>
          <p className="mt-3">
            Have a question we didn't cover? <Link href="/contact" className="font-semibold text-brand-700 underline hover:no-underline">Reach out</Link> or call <PhoneLink className="font-semibold text-brand-700 underline hover:no-underline" />.
          </p>
        </div>
      </section>
    </>
  );
}
