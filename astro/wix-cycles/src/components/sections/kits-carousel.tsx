import * as React from "react";
import Image from "@/components/compat/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useCart } from "@/lib/cart";
import type { Kit } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

export function KitsCarousel({ kits }: { kits: Kit[] }) {
  const { addToCart, busy } = useCart();
  const [justAdded, setJustAdded] = React.useState<string | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(true);
  const [progress, setProgress] = React.useState(0.15);

  React.useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
      setProgress(Math.max(0.15, Math.min(1, emblaApi.scrollProgress() * 0.85 + 0.15)));
    };
    update();
    emblaApi.on("select", update).on("scroll", update).on("reInit", update);
  }, [emblaApi]);

  return (
    <section id="kits" className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 lg:px-10">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="display-heading text-4xl lg:text-5xl">
            WX140 <span className="text-black/40">Builds</span>
          </h2>
          <a href="#geometry" className="link-cta text-ink hover:text-turq">
            View Build Specs
          </a>
        </Reveal>
      </div>

      {kits.length === 0 ? (
        <div className="mx-auto max-w-[1440px] px-5 py-16 lg:px-10">
          <p className="text-sm text-black/60">
            No builds are published in this site&rsquo;s store yet. Add products
            in the Wix dashboard and they will appear here.
          </p>
        </div>
      ) : (
      <>
      <Reveal delay={0.15} amount={0.15}>
        <div ref={emblaRef} className="mt-10 overflow-hidden">
          <div className="flex gap-5 pl-5 pr-5 lg:pl-[max(2.5rem,calc((100vw-1440px)/2+2.5rem))]">
            {kits.map((kit) => (
              <article
                key={kit.name}
                className="group flex w-[300px] shrink-0 flex-col border border-black/10 bg-white p-6 transition-shadow duration-300 hover:shadow-xl sm:w-[340px]"
              >
                <div className="relative mx-auto mt-2 aspect-[386/513] w-full overflow-hidden bg-black/5">
                  {kit.image && (
                    <Image
                      src={kit.image}
                      alt={kit.name}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="340px"
                    />
                  )}
                </div>
                <div className="mt-4 flex justify-center gap-2.5">
                  {["#2a4d3d", "#171717", "#9ca3af"].map((c) => (
                    <span
                      key={c}
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <h4 className="display-heading mt-3 text-xl">{kit.name}</h4>
                <p className="mt-1 text-lg font-semibold text-ink">{kit.price}</p>
                <p className="mt-3 line-clamp-4 flex-1 text-xs leading-relaxed text-black/60">
                  {kit.spec}
                </p>
                <Button
                  className="mt-6 w-full"
                  disabled={!kit.productId || busy}
                  onClick={async () => {
                    if (!kit.productId) return;
                    await addToCart(kit.productId);
                    setJustAdded(kit.name);
                    setTimeout(() => setJustAdded((v) => (v === kit.name ? null : v)), 2000);
                  }}
                >
                  {justAdded === kit.name ? "Added to Cart ✓" : "Add to Cart"}
                </Button>
              </article>
            ))}
            <div className="w-px shrink-0" />
          </div>
        </div>
      </Reveal>

      {/* Bottom controls: progress bar left, chevron arrows right */}
      <div className="mx-auto mt-10 flex max-w-[1440px] items-center justify-between px-5 lg:px-10">
        <div className="h-0.5 w-56 bg-black/10">
          <div
            className="h-full bg-black/50 transition-[width] duration-300 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="flex gap-6">
          <button
            aria-label="Previous builds"
            onClick={() => emblaApi?.scrollPrev()}
            className={cn(
              "text-ink transition-colors hover:text-turq",
              !canPrev && "pointer-events-none opacity-30"
            )}
          >
            <ChevronLeft className="size-6" strokeWidth={1.5} />
          </button>
          <button
            aria-label="Next builds"
            onClick={() => emblaApi?.scrollNext()}
            className={cn(
              "text-ink transition-colors hover:text-turq",
              !canNext && "pointer-events-none opacity-30"
            )}
          >
            <ChevronRight className="size-6" strokeWidth={1.5} />
          </button>
        </div>
      </div>
      </>
      )}
    </section>
  );
}
