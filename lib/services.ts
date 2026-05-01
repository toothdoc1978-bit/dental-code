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
  iconKey:
    | "emergency"
    | "dentures"
    | "implants"
    | "whitening"
    | "veneers"
    | "aligners"
    | "sedation"
    | "family";
};

export const services: Service[] = [
  {
    slug: "emergency-dentist",
    name: "Emergency Dental Care",
    iconKey: "emergency",
    short:
      "Same-day evaluation for tooth pain, broken teeth, swelling, lost fillings, and urgent dental concerns.",
    hero:
      "Dental emergencies don't wait. When you call our office with a problem, we work to get you in as soon as possible — see you, diagnose what's going on, and put you on a clear path to relief.",
    whatItIs:
      "An emergency visit includes an exam, any X-rays needed to make a diagnosis, a clear explanation of what's going on, medications when appropriate, and a plan to solve the problem. The emergency visit fee starts at $75; final cost depends on what treatment is needed.",
    whoItsFor: [
      "Tooth pain that won't go away",
      "Broken, chipped, or knocked-out teeth",
      "Swelling around a tooth or in the gums",
      "Lost fillings or crowns",
      "Broken or lost dentures",
      "Trauma from an accident or sports",
    ],
    process: [
      {
        title: "Call us",
        body: "Tell us what's happening. We'll work you in to the next available emergency slot.",
      },
      {
        title: "Diagnose & relieve",
        body: "We exam, take any X-ray needed, explain what's wrong, and provide medication when appropriate.",
      },
      {
        title: "Plan the fix",
        body: "You leave with a clear plan to solve the problem — sometimes that day, sometimes scheduled.",
      },
    ],
    faqs: [
      {
        q: "What counts as a dental emergency?",
        a: "Tooth pain, broken or knocked-out teeth, swelling, lost fillings, broken dentures, and trauma all count. If you're not sure, call us — we'll help you figure out next steps.",
      },
      {
        q: "What does an emergency visit cost?",
        a: "The emergency visit starts at $75 and includes the exam, necessary X-ray, and diagnosis. Treatment costs depend on what's needed and are explained before anything is done.",
      },
      {
        q: "Are you open after hours or on weekends?",
        a: "Our regular hours are Monday through Thursday, 8 AM to 4 PM. Call our office for the next available emergency appointment.",
      },
    ],
    relatedGallery: [],
  },
  {
    slug: "dentures",
    name: "Dentures & Denture Repairs",
    iconKey: "dentures",
    short:
      "Natural-looking full and partial dentures, premium dentures, repairs, and our exclusive Denture Insurance backup program.",
    hero:
      "Patients tell us our dentures don't look like dentures. We obsess over tooth shape, shade, and gumline so the result is comfortable, confident, and frequently complimented — and our in-office Denture Insurance program means a lost or broken denture can be replaced in 48 hours.",
    whatItIs:
      "Premium full dentures starting at $1,500 per arch, partial dentures, denture repairs ($150–$350) for chipped teeth, broken plates, or replacement teeth, and our exclusive Denture Insurance backup program. Final cost depends on materials and complexity.",
    whoItsFor: [
      "Patients who need new full or partial dentures",
      "Existing denture wearers ready for an upgrade",
      "Anyone with a chipped, cracked, or broken denture",
      "Denture wearers who want a backup plan with Denture Insurance",
    ],
    process: [
      {
        title: "Consultation & impressions",
        body: "We listen to what you want from your denture — comfort, fit, appearance — and gather what we need to design it.",
      },
      {
        title: "Try-in & approval",
        body: "You see and approve the shape and shade before the final denture is finished.",
      },
      {
        title: "Delivery & adjustments",
        body: "We deliver, fit, and follow up. Adjustments are part of getting it right and we welcome them.",
      },
    ],
    faqs: [
      {
        q: "What is Denture Insurance?",
        a: "It's our exclusive backup program for denture wearers. For a one-time $300 fee, we scan your existing denture (or take a CBCT) and securely store the STL data in the cloud. If your denture is ever lost or broken, we can 3D print or mill a replacement within 48 hours — no impressions, no weeks of waiting.",
      },
      {
        q: "Why do you take a CBCT of dentures?",
        a: "A CBCT scan creates a perfect digital duplicate. Beyond the Denture Insurance backup, the data also lets us print a clear night-guard-resin custom tray — the best impression tray possible if a replacement is ever needed.",
      },
      {
        q: "Can you repair a broken denture?",
        a: "Yes. Repairs range from about $150 to $350 depending on the work needed — fixing a chipped or broken tooth, reinforcing a fractured plate, or replacing a missing tooth.",
      },
      {
        q: "How much do dentures cost?",
        a: "Premium dentures start at $1,500 per arch. Final cost depends on materials, the complexity of the case, and any preliminary treatment that may be needed. We'll give you a clear estimate after the exam.",
      },
    ],
    relatedGallery: ["case-01-full-mouth", "case-03-full-arch"],
  },
  {
    slug: "dental-implants",
    name: "Dental Implants",
    iconKey: "implants",
    short:
      "Single-tooth implants, implant bridges, and implant-supported solutions that look and feel like your own teeth.",
    hero:
      "Dental implants are the closest thing to a natural tooth. Whether you're missing one tooth or many, we'll plan a solution that lasts.",
    whatItIs:
      "Implant consultations, single-tooth implants, implant bridges, full-arch implant restorations, and the planning that ties them together. We use 3D imaging to plan implant position before surgery for safer, more predictable results.",
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
        a: "From placement to final crown, most cases take 3–6 months. Healing is the longest part — actual chair time is minimal.",
      },
      {
        q: "Are implants worth the cost?",
        a: "For most people, yes. Implants don't decay, they preserve bone, and they typically last decades when cared for.",
      },
    ],
    relatedGallery: ["case-03-full-arch"],
  },
  {
    slug: "teeth-whitening",
    name: "Teeth Whitening",
    iconKey: "whitening",
    short: "Professional take-home and custom-tray whitening for a brighter, more confident smile.",
    hero:
      "Whitening is one of the easiest ways to refresh your smile. We carry professional-strength options that are safer for enamel and more effective than store-bought strips.",
    whatItIs:
      "Take-home Opalescence Go (ready-made trays from Ultradent) starting at $65, and custom whitening trays starting at $350 — including roughly six weeks of Opalescence PF whitening gel with desensitizers, fluoride, and xylitol.",
    whoItsFor: [
      "Patients with healthy teeth and gums who want a brighter smile",
      "Anyone preparing for a milestone event",
      "Long-time patients ready to refresh their smile",
      "Existing whitening users who want a refill",
    ],
    process: [
      {
        title: "Quick whitening exam",
        body: "We confirm your teeth and gums are healthy and recommend the right concentration for your goals.",
      },
      {
        title: "Trays or take-home kit",
        body: "Choose ready-made Opalescence Go or custom trays for the most predictable results.",
      },
      {
        title: "Maintain it",
        body: "We'll show you how to keep your new shade and store gel safely between uses.",
      },
    ],
    faqs: [
      {
        q: "How white can I go?",
        a: "Most patients lighten 4–8 shades. Results vary based on starting shade, habits, enamel, restorations, and other factors.",
      },
      {
        q: "Is whitening safe for my enamel?",
        a: "Professional-grade gels include desensitizers and fluoride and are safer for enamel than many store-bought options.",
      },
      {
        q: "Do crowns or fillings whiten?",
        a: "No — whitening only changes natural tooth structure. We'll plan around any existing dental work to keep your smile even.",
      },
    ],
    relatedGallery: [],
  },
  {
    slug: "veneers-cosmetic-dentistry",
    name: "Veneers & Cosmetic Dentistry",
    iconKey: "veneers",
    short:
      "Porcelain veneers, smile makeovers, and bonding designed to give you a smile you love to show.",
    hero:
      "A confident smile changes everything. We design cosmetic results that look natural, fit your face, and feel great to live with — and with our in-office mill, many smile transformations move on a much faster timeline than traditional cosmetic dentistry.",
    whatItIs:
      "Porcelain veneers ($800–$1,200 per tooth), full-zirconia smile makeovers, cosmetic bonding, smile design, and gum contouring. Our in-office workflow lets us scan, design, mill, and deliver many cosmetic cases in a tightly coordinated timeline.",
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
        q: "How much do veneers cost?",
        a: "Porcelain veneers run $800–$1,200 per tooth. The number of teeth and the case complexity drive the final estimate, which we provide after consultation.",
      },
      {
        q: "Will veneers look fake?",
        a: "Not when they're designed well. We use translucent porcelain and shape them to match your facial features so they look like your own teeth.",
      },
      {
        q: "How long do veneers last?",
        a: "With good home care and regular cleanings, porcelain veneers commonly last 10–15+ years.",
      },
    ],
    relatedGallery: ["case-02-veneers", "case-04-smile-makeover"],
  },
  {
    slug: "clear-aligners",
    name: "Clear Aligners",
    iconKey: "aligners",
    short:
      "Discreet, removable aligners that gradually straighten teeth without traditional brackets and wires.",
    hero:
      "Clear aligners are a comfortable, low-profile way to straighten teeth — for adults who don't want braces and for teens whose parents want something less obvious.",
    whatItIs:
      "Invisalign or comparable clear aligner treatment, $2,995–$4,995 depending on case complexity. Includes scans, treatment design, aligner trays, progress visits, and a retainer plan.",
    whoItsFor: [
      "Adults who want straight teeth without metal braces",
      "Teens who are responsible enough to wear trays consistently",
      "Patients with mild to moderate crowding, spacing, or alignment issues",
      "Long-time patients ready to invest in their smile",
    ],
    process: [
      {
        title: "Consultation & scan",
        body: "A short consult and intraoral scan tell us whether clear aligners are right for you.",
      },
      {
        title: "Custom plan",
        body: "We design the tooth-by-tooth movement plan and show you a preview of your final smile.",
      },
      {
        title: "Trays & check-ins",
        body: "You wear each set of trays as directed and come in periodically so we can keep things on track.",
      },
    ],
    faqs: [
      {
        q: "Am I a candidate for clear aligners?",
        a: "Most patients with mild to moderate crowding or spacing are. Severe bite issues sometimes need a different approach — we'll let you know after the consult.",
      },
      {
        q: "How long does treatment take?",
        a: "Many cases finish in 6–18 months. Your timeline depends on what we're correcting and how consistently you wear the trays.",
      },
      {
        q: "Will I need a retainer afterward?",
        a: "Yes — a retainer is essential to keep teeth from shifting back. We'll plan the retainer with the rest of your treatment.",
      },
    ],
    relatedGallery: [],
  },
  {
    slug: "sedation-dentistry",
    name: "Sedation Dentistry",
    iconKey: "sedation",
    short:
      "Comfort options for patients who feel anxious about dental treatment.",
    hero:
      "If the dentist makes you anxious, you're not alone — and you don't have to power through it. Sedation options may be available for patients who'd rather sleep through their visit or simply take the edge off.",
    whatItIs:
      "Sedation options may be available depending on the procedure and your medical history. Call to discuss whether sedation is appropriate for your visit.",
    whoItsFor: [
      "Patients with dental anxiety",
      "Those who've had a difficult dental experience in the past",
      "Patients undergoing longer procedures who'd rather not feel every minute",
      "Anyone with a strong gag reflex",
    ],
    process: [
      {
        title: "Honest conversation",
        body: "Tell us how you feel about the dentist. Sometimes a calmer chairside approach is all you need; sometimes sedation makes sense.",
      },
      {
        title: "Health review",
        body: "We review your medical history and medications to make sure sedation is appropriate.",
      },
      {
        title: "Comfortable visit",
        body: "On the day of treatment, we'll walk you through every step and make sure you're comfortable from start to finish.",
      },
    ],
    faqs: [
      {
        q: "What sedation options do you offer?",
        a: "Options vary based on the procedure and patient. The best way to find out what fits you is to call our office and tell us what you're worried about — we'll discuss options together.",
      },
      {
        q: "Is sedation safe?",
        a: "Sedation is well-established when it's done in the right setting with the right pre-screening. We review your medical history thoroughly before recommending it.",
      },
      {
        q: "Will I need a ride home?",
        a: "Some forms of sedation require a ride home. We'll let you know in advance based on the option you choose.",
      },
    ],
    relatedGallery: [],
  },
  {
    slug: "family-preventive-dentistry",
    name: "Family & Preventive Dentistry",
    iconKey: "family",
    short:
      "Cleanings, exams, X-rays, fluoride, sealants, and the everyday care that keeps your smile healthy for life.",
    hero:
      "Preventive care is the foundation of every healthy mouth. From a child's first visit to a senior's lifelong maintenance, we make routine dentistry comfortable and thorough.",
    whatItIs:
      "Comprehensive exams, low-radiation digital X-rays when needed, professional cleanings, fluoride and sealants, periodontal therapy, custom mouthguards, tooth-colored fillings, and same-day relief for toothaches. Medicaid is accepted for eligible patients under 21.",
    whoItsFor: [
      "Families looking for one trusted office for every age",
      "Patients overdue for a cleaning",
      "Anyone with sensitivity, bleeding gums, or a small cavity",
      "Athletes and night-time grinders needing custom guards",
    ],
    process: [
      {
        title: "Comfortable exam",
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
        a: "We work with many traditional dental insurance plans and Medicaid for eligible patients under 21. Call us with your card and we'll help review your benefits.",
      },
    ],
    relatedGallery: [],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
