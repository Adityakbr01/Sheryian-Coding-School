import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiSearch } from "react-icons/hi";
import { Squeeze as Hamburger } from "hamburger-react";
import { useAppSelector } from "@/hooks/useAppDispatch";
import { APP_INFO } from "@/constants";

import NavLinks from "./NavLinks";
import NavCTA from "./NavCTA";
import ProfileDropdown from "./ProfileDropdown";
import MobileNav from "./MobileNav";
import ThemeToggle from "./ThemeToggle";
import SearchDropdown from "@/components/common/SearchDropdown";

export default function Navbar() {
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setShowNav(currentY < lastScrollY || currentY < 50);
      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Simple and performant scroll lock
  useEffect(() => {
    if (isMobileMenuOpen) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.documentElement.style.overflow = "";
      document.documentElement.style.paddingRight = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.documentElement.style.paddingRight = "";
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Keyboard shortcut: Ctrl+K or Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <nav
        style={{ height: "var(--navbar-height-desktop)" }}
        className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ${
          showNav ? "translate-y-0" : "-translate-y-full"
        } bg-background/95 backdrop-blur-md shadow-sm border-b border-border/50 text-foreground`}
      >
        <div className="max-w-7xl mx-auto h-full grid grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-8">
          {/* Left: Logo */}
          <Link to="/" className="justify-self-start flex items-center gap-2">
            <span className="text-3xl font-juana tracking-wider font-bold">
              {APP_INFO.APP_NAME}
            </span>
          </Link>

          {/* Center: Nav Links */}
          <NavLinks />

          {/* Right: Search, Theme Toggle, Auth/Profile */}
          <div className="hidden min-[850px]:flex items-center gap-3 justify-self-end">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 bg-black/5 dark:bg-black/40 border-2 border-border/50 rounded-lg px-4 py-1.5 text-sm font-medium text-foreground hover:border-[var(--custom-primary)] hover:bg-black/10 transition-all cursor-pointer mr-2 shadow-sm focus:ring-2 focus:ring-[var(--custom-primary)]/20"
              title="Search (Ctrl+K)"
            >
              <HiSearch className="text-base" />
              <span className="hidden lg:inline">Search...</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 ml-2 text-[10px] text-muted-foreground/60 bg-black/10 dark:bg-white/10 rounded px-1.5 py-0.5">
                <span className="text-xs">&#8984;</span>K
              </kbd>
            </button>

            <ThemeToggle />

            {isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <NavCTA href="/login" label="Login" />
                <NavCTA href="/signup" label="Sign Up" primary />
              </div>
            )}
          </div>

          {/* Mobile: Search + Hamburger */}
          <div className="min-[850px]:hidden absolute right-4 flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Search"
            >
              <HiSearch className="text-xl" />
            </button>
            <Hamburger
              toggled={isMobileMenuOpen}
              toggle={setIsMobileMenuOpen}
              size={24}
              rounded
              label="Toggle menu"
            />
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <MobileNav isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />

      {/* Search Dropdown Overlay */}
      {isSearchOpen && (
        <SearchDropdown onClose={() => setIsSearchOpen(false)} />
      )}
    </>
  );
}
