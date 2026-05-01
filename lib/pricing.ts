export type PriceItem = {
  service: string;
  price: string;
  description: string;
};

export const pricing: PriceItem[] = [
  {
    service: "Emergency visit",
    price: "Starting at $75",
    description:
      "Includes an exam, necessary X-ray, diagnosis, possible medications when appropriate, and a plan to solve the emergency as soon as possible.",
  },
  {
    service: "Take-home whitening (Opalescence Go)",
    price: "Starting at $65",
    description:
      "Convenient ready-made whitening trays from Ultradent with professional-strength gel, desensitizers, and fluoride.",
  },
  {
    service: "Custom whitening trays",
    price: "Starting at $350",
    description:
      "Custom bleaching trays made to fit your teeth, including approximately six weeks of Opalescence PF whitening gel with fluoride and xylitol.",
  },
  {
    service: "Simple extractions",
    price: "Starting at $200 per tooth",
    description:
      "Simple extractions start at $200 per tooth. Final cost depends on exam findings and treatment complexity.",
  },
  {
    service: "Premium dentures",
    price: "$1,500 per arch",
    description:
      "Premium dentures made with high-quality acrylics and natural-looking denture teeth to restore function and appearance.",
  },
  {
    service: "Denture repairs",
    price: "$150 – $350",
    description:
      "Repair of chipped or broken denture teeth, broken dentures with reinforcement, or replacement of a denture tooth.",
  },
  {
    service: "Denture Insurance",
    price: "$300 (one-time)",
    description:
      "We scan your denture or take a CBCT, convert it to an STL file, and securely store it in the cloud — so we can 3D print or mill a replacement within 48 hours if it's ever lost or broken.",
  },
  {
    service: "Porcelain veneers",
    price: "$800 – $1,200 per tooth",
    description:
      "Long-lasting cosmetic smile transformation for appropriate candidates.",
  },
  {
    service: "Clear aligners",
    price: "$2,995 – $4,995",
    description:
      "Discreet orthodontic option for gradually straightening teeth without traditional brackets and wires.",
  },
];
