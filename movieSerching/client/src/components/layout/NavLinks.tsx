import { NavLink } from "react-router-dom";

export const navLinks = [
  { to: "/", label: "Home" },
  { to: "/movies", label: "Movies" },
  { to: "/tv", label: "TV Shows" },
  { to: "/trending", label: "Trending" },
];

export default function NavLinks() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "text-[var(--custom-primary)] font-bold"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="hidden min-[850px]:flex items-center gap-6 justify-self-center">
      {navLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={linkClass}
          end={link.to === "/"}
        >
          {link.label}
        </NavLink>
      ))}
    </div>
  );
}
