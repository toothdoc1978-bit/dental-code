import Link from "next/link";
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
    <section className="container-page my-20">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 to-brand-500 p-10 text-white shadow-soft md:p-14">
        <div className="grid gap-8 md:grid-cols-[2fr_1fr] md:items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h2>
            <p className="mt-3 max-w-xl text-brand-50">{body}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <Link href="/contact" className="btn-primary bg-white text-brand-700 hover:bg-brand-50">
              Request appointment
            </Link>
            <PhoneLink className="btn-secondary border-white text-white hover:bg-white/10" />
          </div>
        </div>
      </div>
    </section>
  );
}
