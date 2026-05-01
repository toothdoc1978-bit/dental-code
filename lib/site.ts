export const site = {
  practiceName: "Chad Gardner, DDS",
  dentistName: "Chad Gardner, DDS",
  tagline: "Bright, healthy smiles for Bastrop — designed and delivered in days, not months.",
  description:
    "Family, cosmetic, restorative, and implant dentistry in Bastrop, Louisiana. Home of natural-looking dentures and same-day full-mouth restorations powered by our in-office 5-axis zirconia mill and CEREC technology.",
  url: "https://chadgardnerdds.com",
  address: {
    line1: "625 S. Washington St.",
    city: "Bastrop",
    state: "LA",
    zip: "71220",
    country: "US",
  },
  phone: {
    display: "(318) 281-5972",
    tel: "+13182815972",
  },
  email: "info@chadgardnerdds.com",
  hours: [
    { day: "Monday", open: "8:00 AM", close: "5:00 PM" },
    { day: "Tuesday", open: "8:00 AM", close: "5:00 PM" },
    { day: "Wednesday", open: "8:00 AM", close: "5:00 PM" },
    { day: "Thursday", open: "8:00 AM", close: "5:00 PM" },
    { day: "Friday", open: "By appointment", close: "" },
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
    "Delta Dental",
    "BlueCross BlueShield",
    "Cigna",
    "MetLife",
    "United Concordia",
    "Aetna",
  ],
  social: {
    google: "",
    facebook: "",
    instagram: "",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Smile Gallery", href: "/smile-gallery" },
    { label: "Reviews", href: "/reviews" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

export const fullAddress = `${site.address.line1}, ${site.address.city}, ${site.address.state} ${site.address.zip}`;
