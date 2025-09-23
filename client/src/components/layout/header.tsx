import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Truck } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/category/garment", label: "Garment" },
    { href: "/category/fabric", label: "Fabric" },
    { href: "/category/yarn", label: "Yarn" },
    { href: "/category/home-textiles", label: "Home Textiles" },
    { href: "/category/fiber-feedstock", label: "Fiber & Feedstock" },
  ];

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm" data-testid="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" data-testid="logo-link">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Truck className="text-xl" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-primary" data-testid="logo-title">
                  Karmic International
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block" data-testid="logo-subtitle">
                  Premium Textile Exports
                </p>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8" data-testid="desktop-nav">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <span className={`font-medium transition-colors hover:text-primary ${
                  location === item.href ? 'text-primary' : 'text-foreground'
                }`}>
                  {item.label}
                </span>
              </Link>
            ))}
            <Link href="/quotation" data-testid="nav-link-quote">
              <Button className="bg-secondary text-secondary-foreground hover:opacity-90">
                Get Quote
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" data-testid="mobile-menu-trigger">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" data-testid="mobile-menu">
              <nav className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    onClick={() => setIsOpen(false)}
                    data-testid={`mobile-nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span className={`block py-2 font-medium transition-colors hover:text-primary ${
                      location === item.href ? 'text-primary' : 'text-foreground'
                    }`}>
                      {item.label}
                    </span>
                  </Link>
                ))}
                <Link href="/quotation" onClick={() => setIsOpen(false)} data-testid="mobile-nav-link-quote">
                  <Button className="w-full bg-secondary text-secondary-foreground hover:opacity-90 mt-4">
                    Get Quote
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
