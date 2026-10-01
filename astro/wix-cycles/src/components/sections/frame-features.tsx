import * as React from "react";
import Image from "@/components/compat/image";
import { animate, motion, useInView } from "framer-motion";

import { sectionImages } from "@/lib/data";
import { Reveal } from "@/components/reveal";
import { SectionTag } from "@/components/section-tag";

/** Animated 0 → 15 counter for the leverage-rate progressivity figure */
function ProgressivityCounter() {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  React.useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, 15, {
      duration: 1.6,
      ease: [0.165, 0.84, 0.44, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [inView]);

  return (
    <span className="display-heading text-[clamp(5rem,14vw,10rem)] leading-none text-white/40">
      <span ref={ref}>0</span>
      <span className="text-[0.35em] align-top">%</span>
    </span>
  );
}

/** Leverage-rate chart that draws itself in on scroll, like the reference */
function LeverageChart() {
  const ref = React.useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <svg
      ref={ref}
      viewBox="0 0 460 300"
      className="w-full max-w-xl"
      role="img"
      aria-label="Leverage rate falling gently from 2.9 to 2.2 across 140mm of travel"
    >
      {/* axes */}
      <line x1="50" y1="20" x2="50" y2="260" stroke="rgba(255,255,255,.25)" strokeWidth="1" />
      <line x1="50" y1="260" x2="440" y2="260" stroke="rgba(255,255,255,.25)" strokeWidth="1" />
      {[0, 1, 2, 3].map((i) => (
        <text key={i} x="20" y={40 + i * 70} fill="rgba(255,255,255,.35)" fontSize="10">
          {(3.0 - i * 0.25).toFixed(2)}
        </text>
      ))}
      {[0, 40, 80, 120].map((v, i) => (
        <text key={v} x={46 + i * 105} y="280" fill="rgba(255,255,255,.35)" fontSize="10">
          {v}
        </text>
      ))}
      <text
        x="245"
        y="298"
        textAnchor="middle"
        fill="rgba(255,255,255,.35)"
        fontSize="9"
        letterSpacing="2"
      >
        VERTICAL WHEEL TRAVEL (MM)
      </text>
      <text
        x="12"
        y="140"
        fill="rgba(255,255,255,.35)"
        fontSize="9"
        letterSpacing="2"
        transform="rotate(-90 12 140)"
        textAnchor="middle"
      >
        LEVERAGE RATE
      </text>
      {/* the curve: near-linear with end-stroke ramp */}
      <motion.path
        d="M 50 45 C 160 75, 280 120, 360 165 C 400 190, 425 215, 440 240"
        fill="none"
        stroke="var(--turq)"
        strokeWidth="2.5"
        initial={{ pathLength: 0 }}
        animate={inView ? { pathLength: 1 } : {}}
        transition={{ duration: 1.8, ease: [0.165, 0.84, 0.44, 1] }}
      />
    </svg>
  );
}

export function FrameFeatures() {
  return (
    <>
      {/* Refined silhouette — dark, image upper right, copy lower left */}
      <section className="relative bg-ink py-20 text-white lg:py-28">
        <SectionTag label="Features 03" />
        <div className="mx-auto max-w-[1440px] px-5 lg:px-10">
          <Reveal amount={0.2} className="relative">
            <div className="relative ml-auto aspect-[16/9] lg:w-3/4">
              <Image
                src={sectionImages.refinedLook}
                alt="WX140 silhouette against a dark backdrop"
                fill
                className="object-cover"
                sizes="(min-width:1024px) 75vw, 100vw"
              />
              <span className="tracked-tagline absolute -left-2 top-1/2 hidden -translate-y-1/2 text-xs text-white/60 lg:block">
                New WX140
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="mt-14 max-w-2xl">
            <h2 className="tracked-tagline text-base lg:text-lg">
              A sharper silhouette. Unmistakably Wix.
            </h2>
            <p className="mt-6 max-w-xl text-[15px] leading-loose text-white/60">
              The new front triangle tucks the shock and linkage deeper into
              the frame, trimming visual bulk while adding real-world
              clearance. The result is a stiffer chassis that clears rocks the
              old bike clipped — and looks fast standing still.
            </p>
          </Reveal>
        </div>
      </section>

      {/* One ride feel — dark, image left, tracked copy right */}
      <section className="relative bg-black py-20 text-white lg:py-28">
        <SectionTag label="Features 04" />
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 lg:grid-cols-2 lg:gap-20 lg:px-10">
          <Reveal>
            <div className="relative aspect-[4/3]">
              <Image
                src={sectionImages.rideFeel}
                alt="Two riders pushing the pace together"
                fill
                className="object-cover"
                sizes="(min-width:1024px) 45vw, 100vw"
              />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <h2 className="tracked-tagline text-base leading-[2] lg:text-lg">
              One ride feel.
              <br />
              For all riders.
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-loose text-white/60">
              A small frame and an extra-large frame shouldn&rsquo;t feel like
              different bikes. We tune the carbon schedule of every size
              independently, so torsional stiffness and compliance stay
              constant from XS to XXL — the same precise, planted feel for
              every rider.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Leverage curve — dark, self-drawing chart + counter */}
      <section className="relative bg-[#0d0d0d] py-20 text-white lg:py-28">
        <SectionTag label="Features 05" />
        <div className="mx-auto max-w-[1440px] px-5 lg:px-10">
          <Reveal amount={0.3}>
            <LeverageChart />
          </Reveal>
          <div className="mt-16 grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <h2 className="tracked-tagline text-base text-white lg:text-lg">
                A leverage curve with a plan.
              </h2>
              <p className="mt-6 max-w-md text-[15px] leading-loose text-white/60">
                Mostly linear, with a deliberate ramp reserved for the last of
                the travel. Small bumps disappear, the mid-stroke holds you up
                through corners, and hard landings end with composure instead
                of a clank. Progression for its own sake impresses
                spreadsheets — this curve is tuned for dirt.
              </p>
            </Reveal>
            <Reveal delay={0.15} className="lg:text-right">
              <p className="tracked-tagline text-xs text-white/40">Progressivity</p>
              <ProgressivityCounter />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
