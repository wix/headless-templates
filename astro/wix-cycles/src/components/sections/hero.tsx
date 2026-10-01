import * as React from "react";
import Image from "@/components/compat/image";
import { motion, useScroll } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";

type HeroModelComponent = React.ComponentType<{ onReady: () => void }>;

/**
 * Pinned two-phase hero. All scroll-linked values are written imperatively
 * from a single scroll subscription so phases can never bleed into each
 * other: letters fade out staggered and are fully gone before the intro
 * paragraph fades in.
 */
const LETTERS: { char: string; left: string; top: string }[] = [
  { char: "W", left: "36%", top: "38%" },
  { char: "I", left: "49%", top: "38%" },
  { char: "X", left: "62%", top: "38%" },
  { char: "C", left: "27.5%", top: "60%" },
  { char: "Y", left: "36.5%", top: "60%" },
  { char: "C", left: "45.5%", top: "60%" },
  { char: "L", left: "54.5%", top: "60%" },
  { char: "E", left: "63.5%", top: "60%" },
  { char: "S", left: "72.5%", top: "60%" },
];

const INTRO_LINES = [
  "One bike for the whole mountain.",
  "It climbs without complaint,",
  "descends without hesitation,",
  "and turns every stretch of dirt",
  "into the best part of your day.",
];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** 0 → 1 across [a, b] */
const ramp = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

// 3D model is desktop-only and skipped for reduced-motion users.
const MODEL_MEDIA_QUERY =
  "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

const subscribeModelMedia = (onChange: () => void) => {
  const mql = window.matchMedia(MODEL_MEDIA_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
};

export function Hero() {
  const ref = React.useRef<HTMLElement>(null);
  const bgRef = React.useRef<HTMLDivElement>(null);
  const gridRef = React.useRef<HTMLHeadingElement>(null);
  const letterRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const introRef = React.useRef<HTMLDivElement>(null);

  // Desktop gets the 3D model (fading in from black once the GLB has
  // parsed); mobile and reduced-motion users get the static photo.
  const wants3d = React.useSyncExternalStore(
    subscribeModelMedia,
    () => window.matchMedia(MODEL_MEDIA_QUERY).matches,
    () => false
  );
  const [modelReady, setModelReady] = React.useState(false);
  const handleModelReady = React.useCallback(() => setModelReady(true), []);

  // Load the three.js hero model chunk only when the desktop 3D path is
  // actually wanted — mobile / reduced-motion never fetch the ~1.3 MB bundle.
  const [HeroModel, setHeroModel] =
    React.useState<HeroModelComponent | null>(null);
  React.useEffect(() => {
    if (!wants3d || HeroModel) return;
    let alive = true;
    import("./hero-model").then((mod) => {
      if (alive) setHeroModel(() => mod.HeroModel);
    });
    return () => {
      alive = false;
    };
  }, [wants3d, HeroModel]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  React.useEffect(() => {
    const apply = (p: number) => {
      // Letters: staggered fade-out, all gone by p = 0.38
      letterRefs.current.forEach((el, i) => {
        if (!el) return;
        const start = 0.08 + i * 0.025;
        el.style.opacity = String(1 - ramp(p, start, start + 0.1));
      });
      if (gridRef.current) {
        gridRef.current.style.transform = `scale(${1 + 0.12 * clamp01(p / 0.45)})`;
      }
      // Background dims through both phases
      if (bgRef.current) {
        const o = p < 0.35 ? 1 - 0.45 * ramp(p, 0, 0.35) : 0.55 - 0.25 * ramp(p, 0.35, 0.6);
        bgRef.current.style.opacity = String(Math.max(0.3, o));
        bgRef.current.style.transform = `scale(${1 + 0.06 * p})`;
      }
      // Intro copy: fades in only after every letter is gone (0.42+)
      if (introRef.current) {
        const inO = ramp(p, 0.42, 0.56);
        const outO = 1 - 0.4 * ramp(p, 0.9, 1);
        introRef.current.style.opacity = String(Math.min(inO, outO));
        introRef.current.style.transform = `translateY(${60 * (1 - ramp(p, 0.42, 0.62))}px)`;
      }
    };
    apply(scrollYProgress.get());
    return scrollYProgress.on("change", apply);
  }, [scrollYProgress]);

  return (
    <section ref={ref} id="overview" className="relative h-[260vh] bg-black text-white">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div ref={bgRef} className="absolute inset-0 will-change-[opacity,transform]">
          {wants3d && (
            <InteractiveGridPattern
              width={48}
              height={48}
              squares={[42, 24]}
              className="border-none"
              squaresClassName="stroke-white/[0.07]"
            />
          )}
          {!wants3d && (
            <Image
              src="/hero-bike.webp"
              alt="WX140 studio profile in Reservoir Green"
              fill
              priority
              className="pointer-events-none object-cover object-center"
              sizes="100vw"
            />
          )}
          {wants3d && HeroModel && (
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 [&_*]:pointer-events-none! ${
                modelReady ? "opacity-100" : "opacity-0"
              }`}
            >
              <HeroModel onReady={handleModelReady} />
            </div>
          )}
        </div>

        {/* Contrast scrim between the bike and the hero copy */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0.2)_55%,rgba(0,0,0,0.05)_100%)]"
        />

        <h1
          ref={gridRef}
          aria-label="Wix Cycles"
          className="pointer-events-none absolute inset-0 will-change-transform"
        >
          {LETTERS.map((l, i) => (
            <span
              key={i}
              ref={(el) => {
                letterRefs.current[i] = el;
              }}
              aria-hidden
              className="absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden"
              style={{ left: l.left, top: l.top }}
            >
              <motion.span
                style={{ fontWeight: 700 }}
                className="display-heading block text-[clamp(5rem,10.2vw,10rem)] leading-[1.25] tracking-[0.0625em]"
                initial={{ y: "115%" }}
                animate={{ y: 0 }}
                transition={{
                  duration: 1,
                  ease: [0.165, 0.84, 0.44, 1],
                  delay: 0.35 + i * 0.08,
                }}
              >
                {l.char}
              </motion.span>
            </span>
          ))}
        </h1>

        <div
          ref={introRef}
          className="pointer-events-none absolute inset-0 flex items-center will-change-[opacity,transform]"
          style={{ opacity: 0 }}
        >
          <p className="mx-auto w-full max-w-[1440px] px-5 text-sm font-semibold uppercase leading-[2.6] tracking-[0.35em] sm:text-base lg:px-32 lg:text-lg">
            {INTRO_LINES.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <span className="block text-white/60">Ride everything.</span>
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="animate-scroll-cue size-7 text-white/70" />
        </motion.div>
      </div>
    </section>
  );
}
