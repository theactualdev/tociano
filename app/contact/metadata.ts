import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Tociano Boutique | Get in Touch",
  description:
    "Contact Tociano Boutique for custom tailoring, styling consultations, and premium Nigerian fashion inquiries. Visit our Lagos showroom or send us a message.",
  keywords: [
    "contact Tociano Boutique",
    "Nigerian fashion consultation",
    "custom tailoring Lagos",
    "African fashion styling",
    "bespoke clothing Nigeria",
    "fashion boutique contact",
    "Ankara tailoring services",
    "wedding attire consultation",
  ],
  openGraph: {
    title: "Contact Us - Tociano Boutique",
    description:
      "Get in touch with Tociano Boutique for custom tailoring, styling consultations, and premium Nigerian fashion inquiries.",
    url: "/contact",
    siteName: "Tociano Boutique",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Tociano Boutique Contact",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us - Tociano Boutique",
    description:
      "Get in touch with Tociano Boutique for custom tailoring, styling consultations, and premium Nigerian fashion inquiries.",
    images: ["/logo.png"],
  },
};
