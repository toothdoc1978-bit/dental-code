import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { PhoneLink } from "./PhoneLink";

type Props = {
  title?: string;
  body?: string;
};

export function CTABanner({
  title = "Ready for a healthier, brighter smile?",
  body = "We're welcoming new patients of all ages. Call us or request an appointment online — we'll find a time that works for you.",
}: Props) {
  return (
    <section className="container-page my-24 sm:my-32">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-4xl bg-gradient-to-br from-brand-700 to-brand-500 p-10 text-white shadow-lift md:p-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-brand-300/30 blur-3xl"
          />
          <div className="relative grid gap-8 md:grid-cols-[2fr_1fr] md:items-center">
            <div>
              <h2 className="text-balance font-display text-display-2 font-semibold">{title}</h2>
              <p className="mt-4 max-w-xl text-pretty text-lead text-brand-50">{body}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <Link href="/contact" className="btn-primary bg-white text-brand-700 hover:bg-brand-50">
                Request appointment
              </Link>
              <PhoneLink className="btn-secondary border-white/40 bg-white/10 text-white hover:bg-white/20" />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
