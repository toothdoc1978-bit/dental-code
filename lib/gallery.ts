export type GalleryCase = {
  id: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  tags: ("Restorative" | "Veneers" | "Whitening" | "Implants" | "Cosmetic")[];
};

export const galleryCases: GalleryCase[] = [
  {
    id: "case-01-full-mouth",
    title: "Full-Mouth Restoration",
    description:
      "Severe staining and worn enamel restored with full-coverage crowns on the upper and lower arches. The patient regained a comfortable bite and a healthy, even smile.",
    image: "/gallery/case-01-full-mouth.jpg",
    alt: "Before and after of a full-mouth restoration: stained, worn teeth restored to even, natural-shaded crowns.",
    tags: ["Restorative", "Cosmetic"],
  },
  {
    id: "case-02-veneers",
    title: "Cosmetic Veneers",
    description:
      "A subtle smile refresh with porcelain veneers — gaps closed, edges aligned, and the natural translucency preserved for a lifelike result.",
    image: "/gallery/case-02-veneers.jpg",
    alt: "Before and after of porcelain veneers, with gaps closed and tooth shape refined.",
    tags: ["Veneers", "Cosmetic"],
  },
  {
    id: "case-03-full-arch",
    title: "Full-Arch Implant Restoration",
    description:
      "Severely worn dentition rebuilt with a full-arch implant restoration. The patient's bite, function, and confidence were all restored in a single phased plan.",
    image: "/gallery/case-03-full-arch.jpg",
    alt: "Before and after of a full-arch implant restoration: worn, broken teeth replaced with a bright, even smile.",
    tags: ["Implants", "Restorative"],
  },
  {
    id: "case-04-smile-makeover",
    title: "Premium Smile Makeover",
    description:
      "A long-time patient ready for the next level — high-translucency porcelain veneers shaped for a brighter, fuller smile that fits her face.",
    image: "/gallery/case-04-smile-makeover.jpg",
    alt: "Before and after of a premium smile makeover with bright porcelain veneers.",
    tags: ["Veneers", "Cosmetic", "Whitening"],
  },
];

export const galleryFilters = ["All", "Veneers", "Restorative", "Whitening", "Implants", "Cosmetic"] as const;
export type GalleryFilter = (typeof galleryFilters)[number];

export function getCase(id: string) {
  return galleryCases.find((c) => c.id === id);
}
