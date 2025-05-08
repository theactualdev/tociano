'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Package, 
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingBag
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  
  return (
    <aside className="w-64 bg-card shadow-md min-h-screen">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>
      
      <nav className="py-6">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-6 py-3 text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="px-6 py-4 mt-auto border-t">
        <button
          onClick={logout}
          className="flex w-full items-center px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
} 