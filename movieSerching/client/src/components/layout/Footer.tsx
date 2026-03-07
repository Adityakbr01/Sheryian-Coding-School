import { Link } from "react-router-dom";
import { FaTwitter, FaInstagram, FaFacebookF } from "react-icons/fa";
import { APP_INFO } from "@/constants";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-white/5 mt-auto font-NeuMachina">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <span className="text-2xl font-juana tracking-wider">
              {APP_INFO.APP_NAME}
            </span>
            <p className="mt-2 text-sm text-gray-400">
              {APP_INFO.APP_DESCRIPTION}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">
              Quick Links
            </h3>
            <div className="space-y-2">
              <Link
                to="/movies"
                className="block text-sm text-gray-400 hover:text-[var(--custom-primary)] transition-colors"
              >
                Movies
              </Link>
              <Link
                to="/tv"
                className="block text-sm text-gray-400 hover:text-[var(--custom-primary)] transition-colors"
              >
                TV Shows
              </Link>
              <Link
                to="/trending"
                className="block text-sm text-gray-400 hover:text-[var(--custom-primary)] transition-colors"
              >
                Trending
              </Link>
              <Link
                to="/search"
                className="block text-sm text-gray-400 hover:text-[var(--custom-primary)] transition-colors"
              >
                Search
              </Link>
            </div>
          </div>

          {/* Attribution */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">About</h3>
            <p className="text-sm text-gray-400">
              This product uses the TMDB API but is not endorsed or certified by
              TMDB.
            </p>
            <div className="flex gap-3 mt-3">
              <a
                href={APP_INFO.APP_SOCIAL.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <FaTwitter size={18} />
              </a>
              <a
                href={APP_INFO.APP_SOCIAL.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href={APP_INFO.APP_SOCIAL.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <FaFacebookF size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-gray-500">{APP_INFO.APP_COPYRIGHT}</p>
        </div>
      </div>
    </footer>
  );
}
