import { Link } from "react-router-dom";
import FlipText from "@/components/common/FlipText";

interface NavCTAProps {
  href: string;
  label: string;
  primary?: boolean;
}

export default function NavCTA({ href, label, primary }: NavCTAProps) {
  return (
    <Link
      to={href}
      className={`group ${
        primary
          ? "btn-primary py-2! px-5!"
          : "text-sm text-foreground/80 hover:text-foreground font-semibold px-2"
      } transition-colors whitespace-nowrap`}
    >
      <FlipText
        className={`uppercase tracking-wide font-bold ${!primary ? "text-foreground/80" : ""}`}
        hoverClassName={primary ? "text-white" : "text-foreground"}
      >
        {label}
      </FlipText>
    </Link>
  );
}
