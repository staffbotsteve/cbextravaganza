import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Wine, UtensilsCrossed, GlassWater, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Map", path: "/map" },
  { label: "Map", path: "/map" },
  { label: "Vendors", path: "/vendors" },
  { label: "Sponsors", path: "/sponsors" },
  { label: "Get Involved", path: "/get-involved" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 md:h-20 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 text-primary">
            <Wine className="h-6 w-6" />
            <GlassWater className="h-6 w-6" />
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <span className="hidden sm:inline font-display font-bold text-secondary text-lg">
            CB Extravaganza
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-semibold font-body transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/admin/login"
            className={cn(
              "px-3 py-2 rounded-md text-sm font-semibold font-body transition-colors flex items-center gap-1",
              location.pathname.startsWith("/admin")
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            )}
          >
            <Lock className="h-3.5 w-3.5" />
            Admin
          </Link>
        </nav>

        {/* Mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile nav */}
      {isOpen && (
        <nav className="lg:hidden bg-background border-t border-border px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={cn(
                "block px-4 py-2.5 rounded-md font-semibold font-body transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/admin/login"
            onClick={() => setIsOpen(false)}
            className={cn(
              "block px-4 py-2.5 rounded-md font-semibold font-body transition-colors flex items-center gap-1",
              location.pathname.startsWith("/admin")
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            )}
          >
            <Lock className="h-3.5 w-3.5" />
            Admin
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
