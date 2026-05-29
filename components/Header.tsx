"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { site } from "@/lib/site";
import { PhoneLink } from "./PhoneLink";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 24);
  });

  const shell = scrolled || open ? "glass-nav shadow-glass" : "border-transparent bg-transparent";

  return (
    <header className={`sticky top-0 z-40 transition-colors duration-300 ease-apple ${shell}`}>
      <div
        className={`container-page flex items-center justify-between gap-4 transition-all duration-300 ease-apple ${
          scrolled ? "h-16" : "h-20"
        }`}
      >
        <Link href="/" className="flex items-center gap-3 font-display font-bold text-brand-700">
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
            CG
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-base">{site.practiceName}</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-500">
              {site.seoName}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
          {site.nav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-sm font-medium transition-colors ${
                  active ? "text-brand-700" : "text-ink-muted hover:text-brand-700"
                }`}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full bg-brand-600"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <PhoneLink className="hidden text-sm font-semibold text-brand-700 hover:text-brand-600 sm:inline" />
          <Link href="/contact" className="btn-primary hidden sm:inline-flex">
            Request appointment
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Toggle menu"
            className="grid h-10 w-10 place-items-center rounded-xl border border-brand-100 bg-white/60 text-brand-700 backdrop-blur lg:hidden"
          >
            <span className="sr-only">Toggle menu</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            className="overflow-hidden border-t hairline bg-white/95 backdrop-blur-xl lg:hidden"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul className="container-page flex flex-col py-3">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-3 text-base font-medium text-ink hover:bg-brand-50 hover:text-brand-700"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2 flex flex-col gap-2 pt-2">
                <PhoneLink className="btn-secondary" />
                <Link href="/contact" onClick={() => setOpen(false)} className="btn-primary">
                  Request appointment
                </Link>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
