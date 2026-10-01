import * as React from "react";
import Image from "@/components/compat/image";
import { motion, useScroll, useTransform } from "framer-motion";

import { sectionImages } from "@/lib/data";

/**
 * FEATURES intro, matching the reference transition: the section begins as a
 * full-width duotone action photo; as it scrolls into place, a dark studio
 * panel wipes in from the right and settles at 50% width, revealing the
 * FEATURES letters laid out in a regular three-column grid.
 */
const LETTERS: { char: string; left: string; top: string }[] = [
  { char: "F", left: "30%", top: "32%" },
  { char: "E", left: "48%", top: "32%" },
  { char: "A", left: "66%", top: "32%" },
  { char: "T", left: "30%", top: "54%" },
  { char: "U", left: "48%", top: "54%" },
  { char: "R", left: "66%", top: "54%" },
  { char: "E", left: "30%", top: "76%" },
  { char: "S", left: "48%", top: "76%" },
];

export function FeaturesIntro() {
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  // Dark panel wipes in from the right as the section arrives.
  const panelX = useTransform(scrollYProgress, [0.25, 0.85], ["100%", "0%"]);

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden bg-black">
      {/* Full-bleed duotone action photo */}
      <div className="absolute inset-0">
        <Image
          src={sectionImages.featureIntro}
          alt="Rider laying the WX140 into a corner"
          fill
          className="object-cover grayscale"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-turq mix-blend-multiply" />
        <div className="absolute inset-0 bg-turq/35 mix-blend-screen" />
      </div>

      {/* Dark studio panel sliding in from the right */}
      <motion.div
        style={{ x: panelX }}
        className="absolute inset-y-0 right-0 w-full overflow-hidden bg-[#0a0a0a] lg:w-1/2"
      >
        <Image
          src={sectionImages.refinedLook}
          alt=""
          fill
          className="object-cover opacity-45"
          sizes="(min-width:1024px) 50vw, 100vw"
        />
        <h2 className="absolute inset-0" aria-label="Features">
          {LETTERS.map((l, i) => (
            <span
              key={i}
              aria-hidden
              className="absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden"
              style={{ left: l.left, top: l.top }}
            >
              <motion.span
                className="display-heading block text-[clamp(2.75rem,3.6vw,4.5rem)] font-bold leading-[1.2] text-white"
                initial={{ y: "115%" }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  duration: 0.8,
                  ease: [0.165, 0.84, 0.44, 1],
                  delay: 0.35 + i * 0.07,
                }}
              >
                {l.char}
              </motion.span>
            </span>
          ))}
        </h2>
      </motion.div>

      {/* Keeps the section a full viewport tall */}
      <div className="min-h-[100svh]" />
    </section>
  );
}
