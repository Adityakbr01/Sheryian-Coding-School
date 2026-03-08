import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiHeart, HiClock, HiCog, HiLogout } from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { logout } from "@/store/slices/authSlice";
import toast from "react-hot-toast";

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await dispatch(logout());
    setIsOpen(false);
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div ref={profileRef} className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        aria-label="User Profile"
      >
        <div className="w-10 h-10 rounded-full bg-[var(--custom-primary)] border border-white/20 flex items-center justify-center text-sm font-bold text-black shadow-[0_0_10px_rgba(27,209,166,0.5)] overflow-hidden">
          <img
            src="/images/avatar.jpg"
            alt={user?.name || "Avatar"}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to text if image fails to load
              e.currentTarget.style.display = "none";
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerText =
                  user?.name?.charAt(0).toUpperCase() || "";
              }
            }}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-48 rounded-lg bg-card border border-border shadow-xl py-1 fade-in font-NeuMachina z-50">
          <div className="px-4 py-2 border-b border-border">
            <p className="text-sm font-medium text-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Link
            to="/favorites"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
          >
            <HiHeart className="text-red-400" /> Favorites
          </Link>
          <Link
            to="/history"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
          >
            <HiClock className="text-[var(--custom-primary)]" /> Watch History
          </Link>
          {user?.role === "admin" && (
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
            >
              <HiCog className="text-yellow-400" /> Admin Panel
            </Link>
          )}
          <Link
            to={"/"}
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground/80 border-none! hover:bg-black/5 dark:hover:bg-white/5 hover:text-red-400 cursor-pointer text-left"
          >
            <HiLogout /> Logout
          </Link>
        </div>
      )}
    </div>
  );
}
