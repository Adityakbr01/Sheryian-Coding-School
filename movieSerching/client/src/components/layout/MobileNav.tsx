import { Link, NavLink, useNavigate } from "react-router-dom";
import { HiSearch, HiHeart, HiClock, HiCog, HiLogout } from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { logout } from "@/store/slices/authSlice";
import toast from "react-hot-toast";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { navLinks } from "./NavLinks";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Instead of completely unmounting, we'll keep it mounted to allow CSS transitions
  // if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      onClose();
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
    onClose();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-lg font-medium transition-colors duration-200 ${
      isActive
        ? "text-[var(--custom-primary)] font-bold"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div
      className={`min-[850px]:hidden fixed top-[var(--navbar-height-mobile)] left-0 w-full h-[calc(100vh-var(--navbar-height-mobile))] bg-background/95 backdrop-blur-xl border-t border-border/50 z-40 overflow-y-auto transition-all duration-300 ease-in-out origin-top ${
        isOpen
          ? "opacity-100 translate-y-0 scale-y-100 cursor-auto"
          : "opacity-0 -translate-y-4 scale-y-95 pointer-events-none"
      }`}
    >
      <div className="px-6 py-6 space-y-6">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies, TV shows..."
            className="w-full bg-black/5 dark:bg-black/40 border border-border/50 rounded-full px-4 py-3 pl-10 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[var(--custom-primary)]"
          />
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </form>

        <div className="flex justify-between items-center pb-4 border-b border-border/50">
          <span className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">
            Appearance
          </span>
          <ThemeToggle />
        </div>

        <div className="flex flex-col gap-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={linkClass}
              end={link.to === "/"}
            >
              <span className="block">{link.label}</span>
            </NavLink>
          ))}
        </div>

        {isAuthenticated ? (
          <div className="pt-6 border-t border-border/50 flex flex-col gap-4">
            <Link
              to="/favorites"
              onClick={onClose}
              className="flex items-center gap-3 text-base text-foreground/80"
            >
              <HiHeart className="text-red-400 text-xl" /> Favorites
            </Link>
            <Link
              to="/history"
              onClick={onClose}
              className="flex items-center gap-3 text-base text-foreground/80"
            >
              <HiClock className="text-[var(--custom-primary)] text-xl" /> Watch
              History
            </Link>
            {user?.role === "admin" && (
              <Link
                to="/admin"
                onClick={onClose}
                className="flex items-center gap-3 text-base text-foreground/80"
              >
                <HiCog className="text-yellow-400 text-xl" /> Admin Panel
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-base text-foreground/80 cursor-pointer"
            >
              <HiLogout className="text-xl" /> Logout
            </button>
          </div>
        ) : (
          <div className="pt-6 border-t border-border/50 flex gap-4">
            <Link
              to="/login"
              onClick={onClose}
              className="text-foreground border border-border hover:bg-black/5 dark:hover:bg-white/5 font-semibold py-2 px-6 flex-1 text-center rounded-lg transition-transform duration-300"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              onClick={onClose}
              className="btn-primary py-2 px-6 flex-1 text-center"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
