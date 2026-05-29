"use client";

import { useMemo, useState } from "react";
import { BeforeAfterCard } from "./BeforeAfterCard";
import { galleryCases, galleryFilters, type GalleryFilter } from "@/lib/gallery";

export function GalleryGrid() {
  const [filter, setFilter] = useState<GalleryFilter>("All");

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
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
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
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <BeforeAfterCard key={c.id} item={c} />
          ))}
        </div>
      )}
    </div>
  );
}
