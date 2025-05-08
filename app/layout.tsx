import { Metadata } from "next";
import "./globals.css";
import { montserrat, playfair } from "@/lib/fonts";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MaintenanceMode } from "@/components/MaintenanceMode";

export const metadata: Metadata = {
  metadataBase: new URL("https://tociano.vercel.app"),
  title: "Tociano Boutique | Premium Nigerian Fashion",
  description: 
    "Discover authentic Nigerian fashion at Tociano Boutique. Premium Ankara prints, Aso Oke, and modern African luxury clothing for all occasions.",
  icons: [
    {
      rel: "icon",
      url: "/favicon.ico",
    },
    {
      rel: "apple-touch-icon",
      url: "/apple-touch-icon.png",
      sizes: "180x180",
    },
  ],
  applicationName: "Tociano Boutique",
  authors: [{ name: "Olayinka Ayodele", url: "https://olayinka.codes" }],
  generator: "Next.js",
  keywords: [
    "Nigerian fashion",
    "African luxury",
    "Ankara prints",
    "Aso Oke",
    "Premium attire",
    "African designer clothing",
    "Agbada attire",
    "Nigerian wedding attire",
    "Aso ebi styles",
    "Adire fabric",
    "Contemporary African fashion",
    "African print dresses",
    "Premium lace fabrics",
    "Traditional bridal wear",
    "Sustainable African fashion",
    "Nigerian haute couture",
    "African inspired accessories",
    "Nigerian fashion week",
    "Luxury Nigerian handbags",
  ],
  creator: "Olayinka Ayodele",
  publisher: "Tociano Boutique",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "https://tociano.vercel.app",
    title: "Tociano Boutique | Premium Nigerian Fashion",
    description: "Discover authentic Nigerian fashion at Tociano Boutique. Premium Ankara prints, Aso Oke, and modern African luxury clothing for all occasions.",
    siteName: "Tociano Boutique",
    images: [
      {
        url: "https://tociano.vercel.app/image.jpg",
        width: 1200,
        height: 630,
        alt: "Tociano Boutique - Premium Nigerian Fashion",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@theactualdev",
    creator: "@theactualdev",
    title: "Tociano Boutique | Premium Nigerian Fashion",
    description: "Discover authentic Nigerian fashion at Tociano Boutique. Premium Ankara prints, Aso Oke, and modern African luxury clothing for all occasions.",
    images: [
      {
        url: "https://tociano.vercel.app/image.jpg",
        alt: "Tociano Boutique - Premium Nigerian Fashion",
      }
    ],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  verification: {
    google: "verification_token",
  },
  alternates: {
    canonical: "https://tociano.vercel.app",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <MaintenanceMode>
                  <Navbar />
                  <main className="flex-grow">{children}</main>
                  <Footer />
                </MaintenanceMode>
                <Toaster />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
