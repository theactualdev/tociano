import { Metadata } from "next";
import "./globals.css";
import { montserrat, playfair } from "../lib/fonts";
import { AuthProvider } from "@/src/context/AuthContext";
import { CartProvider } from "@/src/context/CartContext";
import { WishlistProvider } from "@/src/context/WishlistContext";
import { Navbar } from "@/src/components/layout/Navbar";
import { Footer } from "@/src/components/layout/Footer";
import { Toaster } from "@/src/components/ui/toaster";
import { ThemeProvider } from "@/src/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Tociano Boutique - Premium Nigerian Fashion",
  description:
    "Discover luxury fashion at Tociano Boutique - Nigeria's premier fashion destination for elegant, high-quality clothing and accessories.",
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
