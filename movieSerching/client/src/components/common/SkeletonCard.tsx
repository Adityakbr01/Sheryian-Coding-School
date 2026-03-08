export default function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden bg-card border border-border/50">
      <div className="aspect-2/3 skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-4 skeleton w-3/4" />
        <div className="h-3 skeleton w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper/modules";

export function SkeletonHero() {
  return (
    <div className="w-full relative bg-background pb-10 pt-4 pointer-events-none">
      <Swiper
        modules={[EffectCoverflow]}
        effect="coverflow"
        centeredSlides={true}
        slidesPerView="auto"
        loop={true}
        allowTouchMove={false}
        spaceBetween={25}
        coverflowEffect={{
          rotate: 0,
          stretch: -25,
          depth: 50,
          modifier: 1,
          slideShadows: false,
        }}
        className="w-full pb-12!"
        initialSlide={1}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <SwiperSlide
            key={i}
            className="w-[95%] sm:w-[85%] md:w-[75%] lg:w-[60%] xl:w-[50%] max-w-6xl"
          >
            {({ isActive }) => (
              <div
                className={`relative h-[60vh] md:h-[65vh] rounded-[2rem] overflow-hidden border border-white/5 transition-all duration-500 bg-foreground/5 ${
                  isActive ? "opacity-100" : "opacity-40 grayscale-[20%]"
                }`}
              >
                <div className="absolute inset-0 skeleton" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 space-y-4 z-10">
                  <div className="h-6 skeleton w-24 rounded-full bg-background/20" />
                  <div className="h-10 skeleton w-3/4 max-w-xl rounded-lg bg-background/20" />
                  <div className="h-4 skeleton w-full max-w-2xl bg-background/20" />
                  <div className="flex gap-3 pt-2">
                    <div className="h-10 w-32 skeleton rounded-lg bg-background/20" />
                    <div className="h-10 w-32 skeleton rounded-lg bg-background/20" />
                  </div>
                </div>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
