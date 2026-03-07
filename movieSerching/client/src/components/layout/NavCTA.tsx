import { Link } from "react-router-dom";

interface NavCTAProps {
  href: string;
  label: string;
  primary?: boolean;
}

export default function NavCTA({ href, label, primary }: NavCTAProps) {
  return (
    <Link
      to={href}
      className={`${
        primary
          ? "btn-primary !py-2 !px-5"
          : "text-sm text-foreground/80 hover:text-foreground font-semibold px-2"
      } transition-colors whitespace-nowrap`}
    >
      {label}
    </Link>
  );
}
