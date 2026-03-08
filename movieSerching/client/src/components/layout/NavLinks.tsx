import { NavLink } from "react-router-dom";
import FlipText from "@/components/common/FlipText";

export const navLinks = [
  { to: "/", label: "Home" },
  { to: "/movies", label: "Movies" },
  { to: "/tv", label: "TV Shows" },
  { to: "/trending", label: "Trending" },
  { to: "/spotlight", label: "Spotlight" },
];

export default function NavLinks() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors duration-200 block group ${
      isActive
        ? "text-[var(--custom-primary)] font-bold"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="hidden min-[850px]:flex items-center gap-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      {navLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={linkClass}
          end={link.to === "/"}
        >
          {({ isActive }) => (
            <FlipText
              className="uppercase font-bold tracking-wider"
              hoverClassName={
                isActive
                  ? "text-[var(--custom-accentColor)]"
                  : "text-foreground"
              }
            >
              {link.label}
            </FlipText>
          )}
        </NavLink>
      ))}
    </div>
  );
}
