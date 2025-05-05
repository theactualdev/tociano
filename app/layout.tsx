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

export const metadata: Metadata = {
  metadataBase: new URL("https://tociano.codes"),
  title: "Tociano Boutique - Premium Nigerian Fashion",
  description:
    "Discover luxury fashion at Tociano Boutique - Nigeria's premier fashion destination for elegant, high-quality clothing and accessories.",
  icons: [
    {
      sizes: "64x64 32x",
      type: "image/x-icon",
      url: "/favicon.ico",
      rel: "icon",
    },
    { url: "/image.jpg", type: "image/png", rel: "apple-touch-icon" },
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
    "Lagos fashion",
    "Traditional headwraps",
    "Nigerian designer clothing",
    "Gele styles",
    "Agbada attire",
    "Kaftan luxury",
    "African beaded jewelry",
    "Nigerian wedding attire",
    "Aso ebi styles",
    "Adire fabric",
    "Contemporary Nigerian fashion",
    "Afrocentric couture",
    "Luxury dashiki",
    "Nigerian accessories",
    "Bespoke Nigerian outfits",
    "African print dresses",
    "Handcrafted Nigerian bags",
    "Premium lace fabrics",
    "Nigerian celebrity styles",
    "Afromodern fashion",
    "Nigerian streetwear",
    "Traditional bridal wear",
    "African embroidery",
    "Nigerian festival outfits",
    "Sustainable African fashion",
    "Isiagu clothing",
    "Nigerian statement pieces",
    "Luxury african footwear",
    "Handwoven Nigerian textiles",
    "Premium coral beads",
    "Fashion forward Lagos",
    "Nigerian haute couture",
    "African inspired accessories",
    "Buba and Sokoto sets",
    "Nigerian fashion week",
    "Trendy Ankara jumpsuits",
    "Luxury Nigerian handbags",
    "African print headbands",
    "Nigerian fashion influencers",
    "Customized African attire",
    "Premium Nigerian leather goods",
    "Elegant African gowns",
    "Nigerian men's fashion",
    "Prestige Nigerian boutique",
    "African fashion revolution",
    "Nigerian fashion tech",
  ],
  referrer: "origin",
  creator: "Olayinka Ayodele",
  publisher: "Vercel",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    nosnippet: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-snippet": -1,
      "max-image-preview": "large",
      notranslate: false,
    },
  },
  openGraph: {
    type: "website",
    url: "https://tociano.vercel.app",
    title: "Tociano Boutique - Premium Nigerian Fashion",
    description: "Discover luxury fashion at Tociano Boutique - Nigeria\'s premier fashion destination for elegant, high-quality clothing and accessories.",
    siteName: "Tociano Boutique",
    images: [
      {
        url: "/image.jpg",
        width: 1200,
        height: 630,
        alt: "Tociano Boutique - Premium Nigerian Fashion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@theactualdev",
    creator: "@theactualdev",
    title: "Tociano Boutique - Premium Nigerian Fashion",
    description: "Discover luxury fashion at Tociano Boutique - Nigeria\'s premier fashion destination for elegant, high-quality clothing and accessories.",
    images: "/image.jpg",
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
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
                <Navbar />
                <main className="flex-grow">{children}</main>
                <Footer />
                <Toaster />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
