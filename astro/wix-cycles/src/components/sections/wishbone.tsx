import Image from "@/components/compat/image";

import { sectionImages } from "@/lib/data";
import { Reveal } from "@/components/reveal";

export function Wishbone() {
  return (
    <>
      {/* Compact link driver — full screen feature */}
      <section className="relative flex min-h-[90svh] items-end overflow-hidden bg-ink text-white">
        <Image
          src={sectionImages.wishbone}
          alt="WX140 loaded for a sunrise mission"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pb-16 lg:px-10 lg:pb-24">
          <Reveal>
            <h2 className="display-heading max-w-3xl text-4xl leading-[0.95] lg:text-6xl">
              The compact link driver.
            </h2>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/80">
              Our two-piece link driver moves the shock low and forward in the
              frame. You get room for a full-size water bottle, a lower
              standover, and clearance where the trail actually hits — and when
              it&rsquo;s service day, the shock drops out with two bolts.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Built to be rebuilt — dark section */}
      <section className="bg-ink py-20 text-white lg:py-28">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 lg:grid-cols-2 lg:gap-20 lg:px-10">
          <Reveal>
            <h2 className="display-heading text-5xl leading-[0.95] lg:text-7xl">
              Built to be
              <br />
              rebuilt.
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/70">
              Every pivot spins on standard-size cartridge bearings held by
              machined locking axles — no proprietary parts, no press-fit
              headaches. Bearings live in the linkage, not the frame, so a
              full refresh takes an evening, not a warranty claim.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={sectionImages.bearing}
                alt="Machined frame hardware detail"
                fill
                className="object-cover"
                sizes="(min-width:1024px) 45vw, 100vw"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
