import { motion, useScroll, useTransform } from "framer-motion";
import * as React from "react";

import { sectionImages } from "@/lib/data";

const LINES = ["Relentlessly capable.", "Endlessly comfortable.", "Ready for anything."];

/**
 * Closing hero — centered, letter-spaced uppercase lines over the action
 * photo, ending with the model name, in the style of the reference ender.
 */
export function Ender() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink text-white"
    >
      <motion.div
        style={{ y, backgroundImage: `url(${sectionImages.ender})` }}
        className="absolute -inset-y-[15%] inset-x-0 bg-cover bg-center"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 text-center lg:px-10">
        <h2 aria-label={`${LINES.join(" ")} WX140`}>
          {LINES.map((line, i) => (
            <span key={line} aria-hidden className="block overflow-hidden">
              <motion.span
                className="tracked-tagline block text-xl leading-[2.2] text-white sm:text-2xl lg:text-4xl"
                initial={{ y: "110%" }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  duration: 1,
                  ease: [0.165, 0.84, 0.44, 1],
                  delay: 0.1 + i * 0.15,
                }}
              >
                {line}
              </motion.span>
            </span>
          ))}
          <span aria-hidden className="mt-10 block overflow-hidden">
            <motion.span
              className="tracked-tagline block text-2xl text-white sm:text-3xl lg:text-5xl"
              initial={{ y: "110%" }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 1, ease: [0.165, 0.84, 0.44, 1], delay: 0.6 }}
            >
              WX140
            </motion.span>
          </span>
        </h2>
      </div>
    </section>
  );
}
