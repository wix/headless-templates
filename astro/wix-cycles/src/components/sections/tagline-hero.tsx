import * as React from "react";
import Image from "@/components/compat/image";
import { motion, useScroll, useTransform } from "framer-motion";

import { heroImages } from "@/lib/data";

const HEADING_LINES = ["Trail bike?", "And then some."];

/**
 * Full-screen landscape hero after the builds carousel. The heading and
 * paragraph are scroll-linked, as on the reference: they fade in and travel
 * upward continuously as the section moves through the viewport.
 */
export function TaglineHero() {
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const headingOpacity = useTransform(scrollYProgress, [0.18, 0.42], [0, 1]);
  const headingY = useTransform(scrollYProgress, [0.18, 0.55], [260, -40]);
  const copyOpacity = useTransform(scrollYProgress, [0.28, 0.5], [0, 1]);
  const copyY = useTransform(scrollYProgress, [0.28, 0.6], [200, -30]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink text-white"
    >
      <motion.div className="absolute inset-0" style={{ scale: imageScale }}>
        <Image
          src={heroImages.desktop}
          alt="WX140 rider sending a dirt jump through dark woods at dusk"
          fill
          className="object-cover"
          sizes="100vw"
        />
        {/* Base dim plus a center emphasis so the white copy stays readable */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_center,rgba(0,0,0,0.35),transparent_100%)]" />
      </motion.div>

      <div className="relative z-10 mx-auto w-full max-w-4xl px-5">
        <motion.h2
          style={{ opacity: headingOpacity, y: headingY }}
          className="mx-auto w-fit text-left"
        >
          {HEADING_LINES.map((line) => (
            <span
              key={line}
              className="tracked-tagline block text-3xl leading-[1.9] text-white lg:text-5xl"
            >
              {line}
            </span>
          ))}
        </motion.h2>
        <motion.p
          style={{ opacity: copyOpacity, y: copyY }}
          className="mx-auto mt-10 max-w-sm text-center text-[13px] leading-loose text-white/90"
        >
          Some bikes are built for the trail you know. The WX140 is built for
          the one past it — the loose chute, the awkward rock garden, the
          climb everyone else walks. Wherever the map runs out, this is the
          bike that keeps going.
        </motion.p>
      </div>
    </section>
  );
}
