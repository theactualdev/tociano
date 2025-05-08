'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  User, 
  Package, 
  Heart, 
  CreditCard, 
  Settings, 
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Metadata } from 'next';

const accountLinks = [
  { name: 'Profile', href: '/account', icon: User },
  { name: 'Orders', href: '/account/orders', icon: Package },
  { name: 'Wishlist', href: '/wishlist', icon: Heart },
  // { name: 'Payment Methods', href: '/account/payment', icon: CreditCard },
  { name: 'Settings', href: '/account/settings', icon: Settings },
];

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
      }
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@theactualdev",
    creator: "@theactualdev",
    title: "Tociano Boutique | Premium Nigerian Fashion",
    description: "Discover authentic Nigerian fashion at Tociano Boutique. Premium Ankara prints, Aso Oke, and modern African luxury clothing for all occasions.",
    images: "https://tociano.vercel.app/image.jpg",
  },
  verification: {
    google: "verification_token",
  },
  alternates: {
    canonical: "https://tociano.vercel.app",
  },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  // Redirect if user is not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/account');
    }
  }, [user, loading, router]);
  
  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push('/');
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  
  // If not authenticated, nothing to render (will be redirected)
  if (!user) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">My Account</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="md:col-span-1">
          <div className="space-y-1">
            {accountLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Button
                  key={link.name}
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={link.href}>
                    <Icon className="mr-2 h-5 w-5" />
                    {link.name}
                  </Link>
                </Button>
              );
            })}
            <Separator className="my-2" />
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </aside>
        
        {/* Main Content */}
        <div className="md:col-span-3">{children}</div>
      </div>
    </div>
  );
}