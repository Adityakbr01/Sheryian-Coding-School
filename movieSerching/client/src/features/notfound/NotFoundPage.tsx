import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fadeInUp">
      <div className="text-center">
        <h1 className="text-8xl md:text-[10rem] font-juana tracking-wide gradient-text mb-4">
          404
        </h1>
        <p className="text-xl md:text-3xl font-NeuMachina text-[var(--custom-accentColor)] mb-2">
          Page Not Found
        </p>
        <p className="text-muted-foreground mb-8 font-HelveticaNow">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="btn-primary">
          Go Home
        </Link>
      </div>
    </div>
  );
}
