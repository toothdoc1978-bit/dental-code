import { site } from "@/lib/site";

export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: site.practiceName,
    alternateName: [site.seoName, site.legacyName],
    description: site.description,
    url: site.url,
    telephone: site.phone.tel,
    faxNumber: `+1-${site.fax}`,
    email: site.email,
    image: `${site.url}/og/default.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.line1,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.zip,
      addressCountry: site.address.country,
    },
    areaServed: site.serviceArea.map((name) => ({ "@type": "City", name })),
    openingHoursSpecification: site.hours
      .filter((h) => h.close)
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.day,
        opens: h.open,
        closes: h.close,
      })),
    priceRange: "$$",
    "@id": site.url,
    sameAs: [
      site.social.google,
      site.social.facebook,
      site.social.instagram,
      site.social.youtube,
    ].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      suppressHydrationWarning
    />
  );
}
