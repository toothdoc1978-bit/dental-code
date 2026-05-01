export const site = {
  practiceName: "Chad Gardner, DDS",
  seoName: "Bastrop Dental Care",
  legacyName: "Bastrop Family Dental Care",
  dentistName: "Dr. Chad Gardner, DDS",
  tagline: "Family Dentistry in Bastrop, Louisiana",
  description:
    "Chad Gardner, DDS provides practical, modern dental care for families in Bastrop and the surrounding area — from emergency visits and routine care to dentures, whitening, implants, cosmetic dentistry, clear aligners, and sedation options.",
  url: "https://gardnerdds.com",
  address: {
    line1: "625 S. Washington St.",
    city: "Bastrop",
    state: "LA",
    zip: "71220",
    country: "US",
  },
  phone: {
    display: "318-281-5972",
    tel: "+13182815972",
  },
  fax: "318-281-9964",
  email: "gardnerdental@yahoo.com",
  hours: [
    { day: "Monday", open: "8:00 AM", close: "4:00 PM" },
    { day: "Tuesday", open: "8:00 AM", close: "4:00 PM" },
    { day: "Wednesday", open: "8:00 AM", close: "4:00 PM" },
    { day: "Thursday", open: "8:00 AM", close: "4:00 PM" },
    { day: "Friday", open: "Closed", close: "" },
    { day: "Saturday", open: "Closed", close: "" },
    { day: "Sunday", open: "Closed", close: "" },
  ],
  serviceArea: ["Bastrop", "Mer Rouge", "Bonita", "Oak Ridge", "Collinston", "Morehouse Parish"],
  highlights: [
    {
      title: "Same-day & rapid smile transformations",
      body:
        "With our in-office 5-axis zirconia mill, CEREC, and multiple intraoral scanners, we design, mill, and deliver beautiful restorations on a timeline most offices can't match — including full-mouth rehabs in as little as seven days.",
    },
    {
      title: "Natural-looking, well-fitting dentures",
      body:
        "Patients tell us our dentures don't look like dentures. We obsess over tooth shape, shade, and gumline so the result is comfortable, confident, and frequently complimented.",
    },
    {
      title: "Denture Insurance — replacements in 48 hours",
      body:
        "For $300, we scan your denture (or take a CBCT), convert it to an STL file, and securely store it in the cloud. If your denture is ever lost or broken, we can 3D print or mill a replacement and have it in your hands within 48 hours.",
    },
  ],
  technology: [
    "In-office 5-axis zirconia mill",
    "CEREC same-day restorations",
    "Multiple intraoral scanners",
    "Digital smile design and wax-up workflow",
    "Same-day STL-to-crown delivery",
    "Low-radiation digital X-rays",
  ],
  insurance: [
    "Most traditional dental insurance plans",
    "Medicaid for eligible patients under 21",
    "Financing options for qualifying treatment",
  ],
  social: {
    google: "https://maps.app.goo.gl/ZwZuedBxvSmN8GtbA?g_st=ic",
    facebook: "",
    instagram: "",
  },
  googleBusinessProfileId: "1081-9402-5847-2900-9804",
  links: {
    // TODO: replace with verified Jotform HIPAA-compliant URL before launch
    onlineForms: "TODO_VERIFY_JOTFORM_URL",
    // TODO: replace with combined PDF packet hosted at /forms/new-patient-packet.pdf
    printableFormsPacket: "/forms/new-patient-packet.pdf",
    directions:
      "https://www.google.com/maps/search/?api=1&query=625%20S%20Washington%20St%20Bastrop%20LA%2071220",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Smile Gallery", href: "/smile-gallery" },
    { label: "Patient Info", href: "/patient-forms" },
    { label: "Post-Op", href: "/post-op-instructions" },
    { label: "Reviews", href: "/reviews" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

export const fullAddress = `${site.address.line1}, ${site.address.city}, ${site.address.state} ${site.address.zip}`;
