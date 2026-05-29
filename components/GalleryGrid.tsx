"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BeforeAfterCard } from "./BeforeAfterCard";
import { galleryCases, galleryFilters, type GalleryFilter } from "@/lib/gallery";

export function GalleryGrid() {
  const [filter, setFilter] = useState<GalleryFilter>("All");
  const reduce = useReducedMotion();

  const filtered = useMemo(() => {
    if (filter === "All") return galleryCases;
    return galleryCases.filter((c) => c.tags.includes(filter as Exclude<GalleryFilter, "All">));
  }, [filter]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {galleryFilters.map((label) => {
          const active = filter === label;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setFilter(label)}
              className={`relative rounded-full border px-4 py-2 text-sm font-medium transition duration-300 ease-apple ${
                active
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-brand-100 bg-white text-ink-muted hover:border-brand-300 hover:text-brand-700"
              }`}
              aria-pressed={active}
            >
              {label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-ink-muted">
          No cases yet for this category — check back soon.
        </p>
      ) : (
        <motion.div layout={!reduce} className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((c) => (
              <motion.div
                key={c.id}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <BeforeAfterCard item={c} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
