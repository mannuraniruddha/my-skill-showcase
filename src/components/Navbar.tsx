import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Settings, LogIn, LogOut, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import SearchCommand from "./SearchCommand";

const navLinks = [
  { label: "Skills", sectionId: "skills" },
  { label: "Projects", sectionId: "projects" },
  { label: "About", sectionId: "about" },
  { label: "Contact", sectionId: "contact" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    // If not on home page, navigate there first
    if (location.pathname !== "/") {
      window.location.href = `${import.meta.env.BASE_URL}#/?section=${sectionId}`;
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for fixed navbar
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
  };

  // Keyboard shortcut for search (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Check if deployment banner is visible (only in production and not dismissed)
  const showBanner = import.meta.env.PROD && typeof window !== "undefined" && 
    localStorage.getItem("deployment-banner-dismissed") !== "true";

  return (
    <>
      <header
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
          showBanner ? "top-10" : "top-0"
        } ${isScrolled ? "bg-background/80 backdrop-blur-lg border-b border-border" : ""}`}
      >
        <nav className="container px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-mono text-lg font-semibold text-primary">
            &lt;AM /&gt;
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-8">
            {/* Search Button */}
            <li>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="hidden lg:inline">Search</span>
                <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>
            </li>
            {navLinks.map((link) => (
              <li key={link.sectionId}>
                <button
                  onClick={() => scrollToSection(link.sectionId)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </button>
              </li>
            ))}
            {isAdmin && (
              <li>
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </Link>
              </li>
            )}
            <li>
              {user ? (
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in
                </Link>
              )}
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-full left-0 right-0 bg-background border-b border-border md:hidden"
              >
                <ul className="container px-6 py-4 space-y-4">
                  {navLinks.map((link) => (
                    <li key={link.sectionId}>
                      <button
                        onClick={() => {
                          scrollToSection(link.sectionId);
                          setIsMobileMenuOpen(false);
                        }}
                        className="block text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                  {isAdmin && (
                    <li>
                      <Link
                        to="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Admin
                      </Link>
                    </li>
                  )}
                  <li>
                    {user ? (
                      <button
                        onClick={() => {
                          signOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    ) : (
                      <Link
                        to="/auth"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <LogIn className="w-4 h-4" />
                        Sign in
                      </Link>
                    )}
                  </li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>

      <SearchCommand open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
};

export default Navbar;
