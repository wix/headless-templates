import * as React from "react";
import { motion } from "framer-motion";
import { MoveHorizontal } from "lucide-react";

import { sectionImages } from "@/lib/data";
import { Reveal } from "@/components/reveal";
import { SectionTag } from "@/components/section-tag";

/** Draggable before/after comparison: New WX140 vs WX130 */
export function CompareSlider() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState(50);
  const dragging = React.useRef(false);

  const updateFromClientX = React.useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(96, Math.max(4, pct)));
  }, []);

  React.useEffect(() => {
    const move = (e: PointerEvent) => {
      if (dragging.current) updateFromClientX(e.clientX);
    };
    const up = () => (dragging.current = false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [updateFromClientX]);

  return (
    <section id="compare" className="relative bg-ink py-16 lg:py-24">
      <SectionTag label="Features 02" />
      <Reveal amount={0.2}>
        <div className="mx-auto max-w-[1440px] px-5 lg:px-10">
          <div
            ref={containerRef}
            className="relative aspect-[2816/1536] select-none overflow-hidden bg-black"
            onPointerDown={(e) => {
              dragging.current = true;
              updateFromClientX(e.clientX);
            }}
          >
            {/* WX130 (base layer) */}
            <img
              src={sectionImages.compareOld}
              alt="Previous generation WX130 in green"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
            {/* New WX140 (clipped layer) */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
            >
              <img
                src={sectionImages.compareNew}
                alt="New WX140 in blue"
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
              />
            </div>

            {/* Labels */}
            <span className="tracked-tagline absolute left-5 top-5 text-xs text-white lg:left-8 lg:top-8">
              New WX140
            </span>
            <span className="tracked-tagline absolute right-5 top-5 text-xs text-white/50 lg:right-8 lg:top-8">
              WX130
            </span>

            {/* Divider + handle */}
            <div
              className="absolute inset-y-0 z-10 w-0.5 bg-white"
              style={{ left: `${pos}%` }}
            >
              <motion.button
                aria-label="Drag to compare frames"
                className="compare-handle absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                whileTap={{ scale: 1.1 }}
              >
                <span className="flex size-14 items-center justify-center rounded-full bg-white text-ink shadow-lg transition-transform duration-300 hover:scale-110">
                  <MoveHorizontal className="size-5" />
                </span>
                <span className="tracked-tagline mt-2 text-[10px] text-white">Pull</span>
              </motion.button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
