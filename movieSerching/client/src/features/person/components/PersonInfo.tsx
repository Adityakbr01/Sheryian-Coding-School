import { getImageUrl, formatDate } from "@/lib/utils";
import type { TMDBPersonDetail } from "@/types";

export default function PersonInfo({ person }: { person: TMDBPersonDetail }) {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Profile Image */}
      <div className="shrink-0">
        <img
          src={getImageUrl(person.profile_path, "w500")}
          alt={person.name}
          className="w-48 md:w-64 rounded-xl shadow-2xl"
        />
      </div>

      {/* Info */}
      <div className="flex-1">
        <h1 className="text-3xl md:text-5xl font-juana tracking-wide font-bold text-foreground mb-2">
          {person.name}
        </h1>

        <div className="flex flex-wrap gap-4 text-sm text-(--custom-accentColor) font-NeuMachina mb-4">
          <span>Known for: {person.known_for_department}</span>
          {person.birthday && <span>Born: {formatDate(person.birthday)}</span>}
          {person.deathday && <span>Died: {formatDate(person.deathday)}</span>}
          {person.place_of_birth && <span>From: {person.place_of_birth}</span>}
        </div>

        {/* Biography */}
        <div className="mb-8">
          <h2 className="text-xl font-juana tracking-wide text-foreground mb-2">
            Biography
          </h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line font-HelveticaNow text-justify">
            {person.biography || "No biography available."}
          </p>
        </div>
      </div>
    </div>
  );
}
