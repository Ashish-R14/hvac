import type { Metadata } from "next";
import "../index.css";
import "../App.css";
import ScrollRestorationReset from "../components/ScrollRestorationReset";
import { CLOUDINARY_IMAGES } from "../cloudinaryImages";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.climewaveengineers.com"),
  title: "HVAC Services Haldwani, Ramnagar, Dehradun | Climewave Engineers",
  description:
    "Expert HVAC installation, AC repair & maintenance in Haldwani, Ramnagar, Rudrapur, Kashipur, Dehradun & Pan India. AI-powered system design. Free site visit. Call +91-5946-317680.",
  keywords: [
    "HVAC Services Haldwani", "AC Repair Haldwani", "HVAC Ramnagar",
    "AC Service Dehradun", "HVAC Uttarakhand", "HVAC Installation",
    "HVAC Maintenance", "Central AC Installation", "AC Repair Dehradun",
    "HVAC Rudrapur", "HVAC Kashipur", "HVAC Khatima", "HVAC Sitarganj",
    "HVAC Lalkuan", "HVAC Kitcha",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Climewave Engineers | HVAC Services Haldwani, Ramnagar & Uttarakhand",
    description:
      "Expert HVAC installation, AC repair & maintenance across Uttarakhand & Pan India. Free AI-powered room analysis.",
    url: "/",
    siteName: "Climewave Engineers",
    images: [CLOUDINARY_IMAGES.logo],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Climewave Engineers | HVAC Services Haldwani, Ramnagar & Uttarakhand",
    description:
      "Expert HVAC installation, AC repair & maintenance across Uttarakhand & Pan India. Free AI-powered room analysis.",
    images: [CLOUDINARY_IMAGES.logo],
  },
  icons: {
    icon: CLOUDINARY_IMAGES.logo,
  },
};

const LOCAL_BUSINESS_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Climewave Engineers",
  description:
    "Expert HVAC installation, AC repair, and maintenance services across Uttarakhand and Pan India",
  url: "https://www.climewaveengineers.com",
  logo: CLOUDINARY_IMAGES.logo,
  image: CLOUDINARY_IMAGES.logo,
  telephone: "+91-5946-317680",
  email: "info@climewaveengineers.com",
  foundingDate: "2025",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Haldwani",
    addressRegion: "Uttarakhand",
    addressCountry: "IN",
  },
  geo: { "@type": "GeoCoordinates", latitude: "29.2183", longitude: "79.5130" },
  areaServed: [
    "Haldwani", "Ramnagar", "Rudrapur", "Kashipur", "Khatima", "Sitarganj",
    "Lalkuan", "Kitcha", "Dehradun", "Uttarakhand", "Delhi", "Noida", "Pan India",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "HVAC Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "HVAC Installation Services" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "AC Repair Services" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "HVAC Maintenance Services" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Central AC Installation" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Commercial HVAC Services" } },
    ],
  },
  sameAs: [
    "https://www.instagram.com/climewave_/",
    "https://www.linkedin.com/in/ashish-rawat-88087a354/",
  ],
  priceRange: "₹₹",
  openingHours: "Mo-Sa 09:00-18:00",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_JSON_LD) }}
        />
        <ScrollRestorationReset />
        {children}
      </body>
    </html>
  );
}
