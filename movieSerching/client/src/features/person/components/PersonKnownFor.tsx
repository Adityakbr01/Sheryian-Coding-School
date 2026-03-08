import MovieCard from "@/components/common/MovieCard";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function PersonKnownFor({ knownFor }: { knownFor: any[] }) {
  if (!knownFor || knownFor.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-juana tracking-wide text-foreground mb-4">
        Known For
      </h2>
      {/* Mobile view (Swiper) */}
      <div className="block md:hidden pb-4">
        <Swiper spaceBetween={16} slidesPerView={1.2} className="w-full">
          {knownFor.map((item, idx) => (
            <SwiperSlide key={`${item.id}-${idx}`}>
              <MovieCard movie={item} showMediaType />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Desktop view (Grid) */}
      <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-6 gap-4">
        {knownFor.map((item, idx) => (
          <MovieCard key={`${item.id}-${idx}`} movie={item} showMediaType />
        ))}
      </div>
    </section>
  );
}
