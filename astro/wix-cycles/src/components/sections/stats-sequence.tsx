import * as React from "react";
import { useScroll } from "framer-motion";

import { stats } from "@/lib/data";
import { SectionTag } from "@/components/section-tag";
import { cn } from "@/lib/utils";

/**
 * Pinned scroll sequence cycling through the big frame-detail stats.
 * A single scroll subscription resolves the active slide index; slides
 * crossfade via CSS transitions, so exactly one slide is ever visible.
 */
export function StatsSequence() {
  const ref = React.useRef<HTMLElement>(null);
  const [active, setActive] = React.useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  React.useEffect(() => {
    const apply = (p: number) => {
      const idx = Math.max(0, Math.min(stats.length - 1, Math.floor(p * stats.length)));
      setActive(idx);
    };
    apply(scrollYProgress.get());
    return scrollYProgress.on("change", apply);
  }, [scrollYProgress]);

  return (
    <section
      ref={ref}
      className="relative bg-ink"
      style={{ height: `${(stats.length + 1) * 100}vh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <SectionTag label="Features 08" />
        {stats.map((stat, i) => (
          <div
            key={i}
            className={cn(
              "absolute inset-0 flex items-center transition-opacity duration-500 ease-out",
              active === i ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            <img
              src={stat.image}
              alt=""
              className="absolute right-0 top-1/2 h-[80%] w-[60%] -translate-y-1/2 object-cover opacity-50 [mask-image:linear-gradient(to_right,transparent,black_30%)]"
              draggable={false}
            />
            <h2
              className={cn(
                "display-heading relative z-10 mx-auto w-full max-w-[1440px] px-5 text-left text-[clamp(2.5rem,7vw,6rem)] leading-[1.05] text-white/70 transition-transform duration-700 ease-out lg:px-24",
                active === i ? "translate-y-0" : "translate-y-8"
              )}
            >
              {stat.lines.map((line, j) => (
                <span
                  key={j}
                  className={
                    j === stat.lines.length - 1 && stat.lines.length > 2
                      ? "mt-4 block max-w-md font-sans text-[0.32em] font-medium normal-case tracking-wide text-white/50"
                      : "block"
                  }
                >
                  {line}
                </span>
              ))}
            </h2>
          </div>
        ))}
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {stats.map((_, i) => (
            <span
              key={i}
              className={cn(
                "size-2 rounded-full bg-white transition-all duration-300",
                active === i ? "scale-150 opacity-100" : "opacity-40"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
