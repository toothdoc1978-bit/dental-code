export type GalleryCase = {
  id: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  tags: ("Restorative" | "Veneers" | "Whitening" | "Implants" | "Cosmetic" | "Bonding" | "Zirconia")[];
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
  {
    id: "case-05-anterior-bonding",
    title: "Anterior Cosmetic Bonding",
    description:
      "Worn, chipped, and discolored anterior teeth corrected with conservative direct composite bonding. Minimal tooth reduction, beautifully uniform shape and shade — finished in a single visit.",
    image: "/gallery/case-05-anterior-bonding.jpg",
    alt: "Before and after of anterior cosmetic bonding: worn and chipped upper teeth restored to a uniform, natural smile.",
    tags: ["Bonding", "Cosmetic"],
  },
  {
    id: "case-06-veneer-transformation",
    title: "Porcelain Veneer Transformation",
    description:
      "A complete cosmetic transformation with custom porcelain veneers — designed to match the patient's facial features for a smile that looks like hers, only better.",
    image: "/gallery/case-06-veneer-transformation.jpg",
    alt: "Before and after of a porcelain veneer cosmetic transformation: discolored, uneven smile restored with bright, lifelike veneers.",
    tags: ["Veneers", "Cosmetic"],
  },
  {
    id: "case-07-pediatric-bonding",
    title: "Composite Bonding for a Young Patient",
    description:
      "Small, peg-shaped, and discolored anterior teeth in a young patient corrected with direct composite bonding. A confidence-changing result that's gentle on developing teeth.",
    image: "/gallery/case-07-pediatric-bonding.jpg",
    alt: "Before and after of composite bonding on a young patient: peg-shaped, discolored teeth restored to a uniform, bright smile.",
    tags: ["Bonding", "Cosmetic"],
  },
  {
    id: "case-08-zirconia-restoration",
    title: "Indirect Zirconia Restoration",
    description:
      "Severe decay on the upper anterior teeth fully rehabilitated with custom zirconia restorations milled in our office. Dramatic recovery of function, health, and appearance.",
    image: "/gallery/case-08-zirconia-restoration.jpg",
    alt: "Before and after of an indirect zirconia restoration: severely decayed upper front teeth rebuilt with bright, lifelike zirconia crowns.",
    tags: ["Zirconia", "Restorative", "Cosmetic"],
  },
];

export const galleryFilters = [
  "All",
  "Veneers",
  "Bonding",
  "Zirconia",
  "Restorative",
  "Whitening",
  "Implants",
  "Cosmetic",
] as const;
export type GalleryFilter = (typeof galleryFilters)[number];

export function getCase(id: string) {
  return galleryCases.find((c) => c.id === id);
}
