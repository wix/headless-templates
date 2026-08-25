import * as React from "react";
import { useScroll } from "framer-motion";

import { sectionImages } from "@/lib/data";

const QUOTE_LINES = ["The best line is", "the one you commit to."];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ramp = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

/**
 * Pinned quote sequence: the photo starts inset on a white ground, expands
 * to full-bleed as you scroll, then the quote lines fade up one after the
 * other, followed by the attribution. All values are written imperatively
 * from one scroll subscription.
 */
export function QuoteMask() {
  const ref = React.useRef<HTMLElement>(null);
  const frameRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLDivElement>(null);
  const lineRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const whoRef = React.useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  React.useEffect(() => {
    const apply = (p: number) => {
      if (frameRef.current) {
        const inset = 7 * (1 - ramp(p, 0, 0.32));
        frameRef.current.style.clipPath = `inset(${inset}% ${inset}% ${inset}% ${inset}%)`;
      }
      if (imgRef.current) {
        imgRef.current.style.transform = `scale(${1.08 - 0.08 * p})`;
      }
      lineRefs.current.forEach((el, i) => {
        if (!el) return;
        const start = 0.42 + i * 0.14;
        const t = ramp(p, start, start + 0.12);
        el.style.opacity = String(t);
        el.style.transform = `translateY(${40 * (1 - t)}px)`;
      });
      if (whoRef.current) {
        whoRef.current.style.opacity = String(ramp(p, 0.74, 0.86));
      }
    };
    apply(scrollYProgress.get());
    return scrollYProgress.on("change", apply);
  }, [scrollYProgress]);

  return (
    <section ref={ref} className="relative h-[240vh] bg-white">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div ref={frameRef} className="absolute inset-0 overflow-hidden will-change-[clip-path]">
          <div
            ref={imgRef}
            className="absolute inset-0 bg-cover bg-center will-change-transform"
            style={{ backgroundImage: `url(${sectionImages.quote})` }}
          />
          <div className="absolute inset-0 bg-black/25" />
        </div>

        <blockquote className="relative z-10 mx-auto w-full max-w-5xl px-5 text-center">
          {QUOTE_LINES.map((line, i) => (
            <span
              key={line}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              className="tracked-tagline block text-xl leading-[2.4] text-white will-change-[opacity,transform] sm:text-2xl lg:text-4xl"
              style={{ opacity: 0 }}
            >
              {line}
            </span>
          ))}
          <footer
            ref={whoRef}
            className="tracked-tagline mt-6 text-[11px] text-white/80 sm:text-xs"
            style={{ opacity: 0 }}
          >
            Dana Rivers — Wix Factory Racing
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
