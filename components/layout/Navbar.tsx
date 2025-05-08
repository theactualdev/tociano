'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Menu, X, Search, Heart, Sun, Moon, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { CartSidebar } from '@/components/cart/CartSidebar';
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CATEGORIES = [
  { name: 'Women', href: '/products' },
  { name: 'Men', href: '/products' },
  { name: 'Accessories', href: '/products' },
  { name: 'New Arrivals', href: '/products' },
  { name: 'Sale', href: '/products' },
];


export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { cart, isCartOpen, setIsCartOpen } = useCart();
  const [directAdminCheck, setDirectAdminCheck] = useState<boolean>(false);
  
  // Check admin status directly from Firestore
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('Navbar - direct admin check:', userData.isAdmin);
            setDirectAdminCheck(userData.isAdmin || false);
          }
        } catch (error) {
          console.error('Error checking admin status in navbar:', error);
        }
      }
    };
    
    checkAdminStatus();
  }, [user]);
  
  // Use direct admin check or context-provided admin status
  const userIsAdmin = isAdmin || directAdminCheck;
  
  // Calculate total quantity of items in cart
  const cartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header 
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full',
          isScrolled ? 'bg-background/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
        )}
      >
        {/* Top bar with logo and actions */}
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            {/* <h1 className="text-2xl md:text-3xl font-bold text-primary">
              TOCIANO
            </h1> */}
            <Image src="/logo.png" priority alt="Logo" width={100} height={100} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {CATEGORIES.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className={cn(
                  'text-sm font-medium hover:text-primary transition-colors relative group',
                  pathname === category.href ? 'text-primary' : 'text-foreground'
                )}
              >
                {category.name}
                <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              </Link>
            ))}
            
            {userIsAdmin && (
              <Link
                href="/admin"
                className={cn(
                  'text-sm font-medium hover:text-primary transition-colors relative group',
                  pathname === '/admin' || pathname.startsWith('/admin/') ? 'text-primary' : 'text-foreground'
                )}
              >
                Admin
                <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search toggle */}
            {/* <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button> */}

            {/* Theme toggle */}
            {/* <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button> */}

            {/* Admin Dashboard (Icon only for desktop) */}
            {userIsAdmin && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Admin Dashboard"
                asChild
              >
                <Link href="/admin">
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
              </Button>
            )}

            {/* Wishlist button */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Wishlist"
              asChild
            >
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>

            {/* User account button */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Account"
              asChild
            >
              <Link href={user ? '/account' : '/login'}>
                <User className="h-5 w-5" />
              </Link>
            </Button>

            {/* Cart button */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Cart"
              onClick={() => setIsCartOpen(true)}
              className="relative"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartQuantity}
                </span>
              )}
            </Button>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Menu"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Search bar (conditional) */}
        {isSearchOpen && (
          <div className="container mx-auto px-4 py-3 border-t border-border animate-fade-in">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search for products..."
                className="w-full pr-10"
                autoFocus
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-border animate-fade-in">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                {CATEGORIES.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className={cn(
                      'text-base font-medium py-2 hover:text-primary transition-colors',
                      pathname === category.href ? 'text-primary' : 'text-foreground'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
                <div className="h-px bg-border my-2" />
                {user ? (
                  <>
                    <Link
                      href="/account"
                      className="text-base font-medium py-2 hover:text-primary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Account
                    </Link>
                    <Link
                      href="/account/orders"
                      className="text-base font-medium py-2 hover:text-primary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Orders
                    </Link>
                    {userIsAdmin && (
                      <Link
                        href="/admin"
                        className="text-base font-medium py-2 flex items-center hover:text-primary transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      className="text-base font-medium py-2 text-left hover:text-primary transition-colors"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-base font-medium py-2 hover:text-primary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="text-base font-medium py-2 hover:text-primary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} setIsOpen={setIsCartOpen} />

      {/* Spacer to prevent content from being hidden under fixed header */}
      <div className="h-20" />
    </>
  );
}