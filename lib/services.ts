export type Service = {
  slug: string;
  name: string;
  short: string;
  hero: string;
  whatItIs: string;
  whoItsFor: string[];
  process: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  relatedGallery: string[];
};

export const services: Service[] = [
  {
    slug: "general",
    name: "General & Preventive",
    short: "Cleanings, exams, fillings, and the everyday care that keeps your smile healthy for life.",
    hero:
      "Routine care is the foundation of a healthy mouth. From a child's first visit to a senior's lifelong maintenance, we make preventive dentistry comfortable and thorough.",
    whatItIs:
      "Comprehensive exams, digital X-rays, professional cleanings, fluoride and sealants, tooth-colored fillings, periodontal therapy, custom mouthguards, and same-day relief for toothaches.",
    whoItsFor: [
      "Families looking for one trusted office for every age",
      "Patients overdue for a cleaning",
      "Anyone with tooth sensitivity, bleeding gums, or a small cavity",
      "Athletes and night-time grinders needing custom guards",
    ],
    process: [
      {
        title: "Comfortable, complete exam",
        body: "Digital imaging, oral-cancer screening, and a clear walk-through of what we see.",
      },
      {
        title: "Hygienist cleaning",
        body: "Gentle plaque and tartar removal with a polish that leaves your teeth feeling brand new.",
      },
      {
        title: "Right-sized treatment plan",
        body: "We treat what's truly needed — and tell you what can wait. No surprises, no pressure.",
      },
    ],
    faqs: [
      {
        q: "How often should I come in?",
        a: "Most patients do best with a cleaning and exam every six months. We'll personalize that based on your gum health and risk factors.",
      },
      {
        q: "Do you see kids?",
        a: "Yes — we love seeing families. Children are usually ready for their first visit around age one or when their first tooth appears.",
      },
      {
        q: "Will you take my insurance?",
        a: "We accept most major PPO plans and file claims for you. Call us with your card and we'll verify your coverage.",
      },
    ],
    relatedGallery: [],
  },
  {
    slug: "cosmetic",
    name: "Cosmetic Dentistry",
    short: "Veneers, professional whitening, and bonding designed to give you a smile you love to show.",
    hero:
      "A confident smile changes everything. We design cosmetic results that look natural, fit your face, and feel great to live with.",
    whatItIs:
      "Porcelain veneers, full-zirconia smile makeovers, professional in-office and take-home whitening, cosmetic bonding, smile design, and gum contouring. With our in-office mill and digital wax-up workflow, many smile transformations are completed in a single short timeline.",
    whoItsFor: [
      "Anyone unhappy with the color, shape, or alignment of their smile",
      "Patients with chips, gaps, or worn edges",
      "Brides, grooms, and professionals preparing for a milestone",
      "Long-time patients ready to refresh their smile",
    ],
    process: [
      {
        title: "Smile consultation",
        body: "We listen, photograph your smile, and talk through what's possible — including options at different price points.",
      },
      {
        title: "Custom design",
        body: "Shade, length, and shape are tailored to your face. You approve the look before any tooth is touched.",
      },
      {
        title: "Comfortable delivery",
        body: "Most cosmetic cases are completed in two visits. You leave with a smile that looks like you, only better.",
      },
    ],
    faqs: [
      {
        q: "Will veneers look fake?",
        a: "Not when they're designed well. We use translucent porcelain and shape them to match your facial features so they look like your own teeth.",
      },
      {
        q: "How white can I go with whitening?",
        a: "Most patients lighten 4–8 shades. We'll preview what's realistic for your enamel before you start.",
      },
      {
        q: "How long do veneers last?",
        a: "With good home care and regular cleanings, porcelain veneers commonly last 10–15+ years.",
      },
    ],
    relatedGallery: ["case-02-veneers", "case-04-smile-makeover"],
  },
  {
    slug: "restorative",
    name: "Restorative Dentistry",
    short: "Crowns, bridges, dentures, and full-mouth rehabilitation for teeth that need rebuilding.",
    hero:
      "When teeth are worn, broken, or missing, we rebuild function and appearance together. Eat, speak, and smile with confidence again.",
    whatItIs:
      "Tooth-colored crowns, fixed bridges, natural-looking partial and full dentures, our exclusive Denture Insurance backup program, root canal therapy, and full-mouth restorations for severe wear or decay. Thanks to our in-office 5-axis zirconia mill and CEREC, full-mouth rehabs can be completed in as little as seven days from prep to delivery.",
    whoItsFor: [
      "Patients with broken, cracked, or heavily worn teeth",
      "Anyone wearing an old crown or bridge that needs replacing",
      "Denture wearers who want a better-fitting solution",
      "Those whose teeth have been damaged by acid wear or grinding",
    ],
    process: [
      {
        title: "Diagnose the whole picture",
        body: "We map the bite, photograph every tooth, and explain what's driving the wear so we fix the cause, not just the symptom.",
      },
      {
        title: "Phase the treatment",
        body: "Full restorations are sequenced so you always have a working, presentable smile during care.",
      },
      {
        title: "Long-term follow-up",
        body: "We protect your investment with night guards, hygiene visits, and quick adjustments whenever you need them.",
      },
    ],
    faqs: [
      {
        q: "How long does a crown take?",
        a: "With CERAC and our in-office mill, many single crowns can be designed, milled, and cemented in a single visit. Larger cases follow a planned timeline that's mapped out at your consult.",
      },
      {
        q: "Can a full-mouth restoration really be done in a week?",
        a: "Yes. With intraoral scans, a digital wax-up, our in-office 5-axis zirconia mill, and a tight workflow with our designer, we've completed full-mouth rehabs in as little as seven days. Most cases are sequenced to fit your schedule.",
      },
      {
        q: "Will my new dentures look natural?",
        a: "Yes — and this is one of the things we're most known for. We choose tooth shape and shade to match your face and age, and we shape the gum line for a lifelike appearance. Patients tell us our dentures get complimented without anyone realizing they're dentures.",
      },
      {
        q: "What is Denture Insurance?",
        a: "It's our exclusive backup program for denture wearers. For a one-time $300 fee, we scan your existing denture (or take a CBCT) and securely store the STL data in the cloud. If your denture is ever lost, broken, or stolen, we can 3D print or mill a replacement and have it ready within 48 hours — no impressions, no weeks of waiting.",
      },
      {
        q: "Why do you take a CBCT of dentures?",
        a: "A CBCT scan of your denture creates a perfect digital duplicate. Beyond the Denture Insurance backup, the data also lets us print a clear night-guard-resin custom tray that's the best impression tray possible if a replacement is ever needed.",
      },
      {
        q: "Are payment plans available?",
        a: "We work with CareCredit and several other financing options so larger restorations are easier to afford.",
      },
    ],
    relatedGallery: ["case-01-full-mouth", "case-03-full-arch"],
  },
  {
    slug: "implants",
    name: "Implants & Oral Surgery",
    short: "Single-tooth implants, implant bridges, and full-arch solutions that look and feel like your own teeth.",
    hero:
      "Dental implants are the closest thing to a natural tooth. Whether you're missing one tooth or many, we'll build a solution that lasts.",
    whatItIs:
      "Single-tooth dental implants, implant-supported bridges, full-arch implant restorations, simple and surgical extractions, and bone preservation grafting.",
    whoItsFor: [
      "Patients missing one or more teeth",
      "Denture wearers tired of slipping or sore spots",
      "Anyone with a failing tooth that can't be saved",
      "Patients who want a long-term, low-maintenance solution",
    ],
    process: [
      {
        title: "3D planning visit",
        body: "We use digital imaging to plan the implant position before surgery — safer, faster, and more predictable.",
      },
      {
        title: "Gentle placement",
        body: "Most single implants are placed in under an hour with local anesthesia and optional sedation.",
      },
      {
        title: "Beautiful final tooth",
        body: "After healing, we deliver a custom crown or bridge that's shaped, shaded, and adjusted to fit your smile perfectly.",
      },
    ],
    faqs: [
      {
        q: "Am I a candidate for implants?",
        a: "Most adults are. We'll review your bone health, gum condition, and medical history during a consultation.",
      },
      {
        q: "How long does the whole process take?",
        a: "From placement to final crown, most cases take 3–6 months. Healing time is the longest part — actual chair time is minimal.",
      },
      {
        q: "Are implants worth the cost?",
        a: "For most people, yes. Implants don't decay, they preserve bone, and they typically last decades when cared for.",
      },
    ],
    relatedGallery: ["case-03-full-arch"],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
