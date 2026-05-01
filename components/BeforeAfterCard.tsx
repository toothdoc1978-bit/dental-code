import Image from "next/image";
import type { GalleryCase } from "@/lib/gallery";

export function BeforeAfterCard({ item }: { item: GalleryCase }) {
  return (
    <article className="card flex h-full flex-col gap-4 overflow-hidden p-0">
      <div className="relative aspect-[4/5] w-full bg-brand-50">
        <Image
          src={item.image}
          alt={item.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm">
          Before / After
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="font-display text-xl font-semibold text-ink">{item.title}</h3>
        <p className="text-sm leading-relaxed text-ink-muted">{item.description}</p>
      </div>
    </article>
  );
}
