import * as React from "react";
import Image from "@/components/compat/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import { sectionImages, type Review } from "@/lib/data";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

export function CarbonLayup() {
  return (
    <section className="relative flex min-h-[80svh] items-center overflow-hidden bg-ink text-white">
      <Image
        src={sectionImages.carbonLayup}
        alt="Monochrome motion blur of riders at race pace"
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 py-24 text-center lg:px-10">
        <Reveal>
          <h2 className="tracked-tagline text-2xl leading-[2] text-white lg:text-4xl">
            ProCarbon
            <br />
            Construction
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-[15px] leading-relaxed text-white/80">
            Aerospace-grade fiber, laid by hand and tuned by size. ProCarbon
            frames carry a lifetime warranty because we expect them to outlast
            every part bolted to them.
          </p>
          <a href="#kits" className="link-cta mt-10 inline-block text-white hover:text-turq">
            Explore
          </a>
        </Reveal>
      </div>
    </section>
  );
}

export function Reviews({ reviews }: { reviews: Review[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: false }),
  ]);
  const [selected, setSelected] = React.useState(0);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // An empty `reviews` collection means the section has nothing to say —
  // render nothing rather than an empty carousel. Placed after the hooks so
  // they always run in the same order.
  if (reviews.length === 0) return null;

  return (
    <section id="reviews" className="bg-gray-light py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-5 lg:px-10">
        <Reveal>
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {reviews.map((review) => (
                <blockquote
                  key={review.source}
                  className="flex min-w-0 shrink-0 grow-0 basis-full flex-col items-center px-4 text-center"
                >
                  <p className="mx-auto max-w-4xl text-2xl font-light leading-snug text-black/70 lg:text-4xl">
                    &ldquo;{review.pre}
                    <em className="not-italic font-semibold text-ink">
                      {review.highlight}
                    </em>
                    {review.post}&rdquo;
                  </p>
                  <a href="#reviews" className="link-cta mt-10 text-ink hover:text-turq">
                    Read More
                  </a>
                </blockquote>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Source badges double as carousel tabs */}
        <div className="mt-14 flex items-center justify-center gap-10 lg:gap-16">
          {reviews.map((review, i) => (
            <button
              key={review.source}
              onClick={() => emblaApi?.scrollTo(i)}
              className={cn(
                "flex flex-col items-center gap-3 transition-all duration-300",
                selected === i ? "opacity-100" : "opacity-35 hover:opacity-70"
              )}
            >
              <span className="display-heading flex size-14 items-center justify-center rounded-full border-2 border-ink text-xl text-ink lg:size-16">
                {review.initials}
              </span>
              <span className="tracked-tagline text-[10px] text-ink">
                {review.source}
              </span>
              <span
                className={cn(
                  "h-0.5 w-full origin-left bg-turq transition-transform duration-500",
                  selected === i ? "scale-x-100" : "scale-x-0"
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
