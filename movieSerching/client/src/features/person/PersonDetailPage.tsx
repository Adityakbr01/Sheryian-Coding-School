import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { fetchPersonDetail, clearDetail } from "@/store/slices/movieSlice";
import {
  getImageUrl,
  formatDate,
  getMediaTitle,
  getMediaType,
} from "@/lib/utils";
import MovieCard from "@/components/common/MovieCard";
import Loader from "@/components/common/Loader";

export default function PersonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { personDetail: person, isDetailLoading } = useAppSelector(
    (state) => state.movies,
  );

  useEffect(() => {
    if (id) dispatch(fetchPersonDetail(Number(id)));
    return () => {
      dispatch(clearDetail());
    };
  }, [dispatch, id]);

  if (isDetailLoading || !person) return <Loader />;

  const knownFor = person.combined_credits?.cast?.slice(0, 12) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeInUp">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <HiArrowLeft size={18} />
        <span className="text-sm">Back</span>
      </button>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Image */}
        <div className="flex-shrink-0">
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

          <div className="flex flex-wrap gap-4 text-sm text-[var(--custom-accentColor)] font-NeuMachina mb-4">
            <span>Known for: {person.known_for_department}</span>
            {person.birthday && (
              <span>Born: {formatDate(person.birthday)}</span>
            )}
            {person.deathday && (
              <span>Died: {formatDate(person.deathday)}</span>
            )}
            {person.place_of_birth && (
              <span>From: {person.place_of_birth}</span>
            )}
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

      {/* Known For */}
      {knownFor.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-juana tracking-wide text-foreground mb-4">
            Known For
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {knownFor.map((item, idx) => (
              <MovieCard key={`${item.id}-${idx}`} movie={item} showMediaType />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
