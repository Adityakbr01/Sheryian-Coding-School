import { Link } from "react-router-dom";
import { getImageUrl } from "@/lib/utils";
import type { TMDBPerson } from "@/types";

export default function PersonCard({ person }: { person: TMDBPerson }) {
  return (
    <Link to={`/person/${person.id}`} className="group block">
      <div className="card-hover relative overflow-hidden rounded-xl bg-card border border-border/50">
        <div className="aspect-2/3 overflow-hidden">
          <img
            src={getImageUrl(person.profile_path)}
            alt={person.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="absolute top-2 right-2 bg-purple-600/80 rounded-full px-2 py-0.5">
          <span className="text-xs font-medium text-white">PERSON</span>
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-(--custom-primary) transition-colors">
            {person.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {person.known_for_department}
          </p>
          {person.known_for && person.known_for.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {person.known_for
                .slice(0, 2)
                .map((m: any) => m.title || m.name)
                .join(", ")}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
