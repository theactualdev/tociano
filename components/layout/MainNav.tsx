import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";

export function MainNav() {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  
  // Define navigation items
  const items = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" }
  ];
  
  return (
    <nav className="flex items-center space-x-6">
      <Link href="/" className="hidden lg:block">
        <h1 className="text-xl font-bold">Tociano</h1>
      </Link>

      <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors",
                isActive 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
        
        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              "text-sm font-medium transition-colors",
              pathname.startsWith('/admin')
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Admin
          </Link>
        )}
      </div>
    </nav>
  );
} 