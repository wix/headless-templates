import * as React from "react";
import Image from "@/components/compat/image";
import { AnimatePresence, motion } from "framer-motion";

import { geoPoints, geometryRows, geometrySizes, sectionImages } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

export function Geometry() {
  const [active, setActive] = React.useState(0);

  return (
    <>
      {/* Intro banner */}
      <section id="geometry" className="relative flex min-h-[70svh] items-center overflow-hidden bg-ink text-white">
        <Image
          src={sectionImages.massiveDays}
          alt="Alpine peaks rising above a sea of clouds"
          fill
          className="object-cover opacity-70"
          sizes="100vw"
        />
        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 py-24 lg:px-10">
          <Reveal>
            <h2 className="display-heading max-w-4xl text-4xl leading-[0.95] lg:text-6xl">
              Geometry for the biggest days.
            </h2>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/80">
              Numbers on a chart don&rsquo;t win you anything at hour six of an
              all-day epic. Position does. Every WX140 size is drawn around the
              rider it fits — not scaled up from a Medium — so you stay
              balanced, comfortable, and in control from the first switchback
              to the last.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Interactive geometry callouts */}
      <section className="bg-gray-light py-20 lg:py-28">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 lg:grid-cols-[1fr_1.2fr] lg:gap-16 lg:px-10">
          <div>
            {geoPoints.map((point, i) => (
              <button
                key={point.n}
                onClick={() => setActive(i)}
                className={cn(
                  "group flex w-full items-start gap-5 border-b border-black/10 py-5 text-left transition-colors",
                  active === i ? "text-ink" : "text-black/40 hover:text-black/70"
                )}
              >
                <span
                  className={cn(
                    "display-heading mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border text-base transition-colors duration-300",
                    active === i
                      ? "border-ink bg-ink text-white"
                      : "border-current"
                  )}
                >
                  {point.n}
                </span>
                <span>
                  <span className="tracked-tagline block text-xs">{point.title}</span>
                  <AnimatePresence initial={false}>
                    {active === i && (
                      <motion.span
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.165, 0.84, 0.44, 1] }}
                        className="block overflow-hidden"
                      >
                        <span className="block pt-3 text-sm leading-relaxed text-black/60">
                          {point.text}
                        </span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </button>
            ))}
          </div>
          <div className="relative aspect-[4/3]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.45, ease: [0.165, 0.84, 0.44, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={geoPoints[active].image}
                  alt={geoPoints[active].title}
                  fill
                  className="object-cover"
                  sizes="(min-width:1024px) 55vw, 100vw"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Geometry table */}
      <section className="bg-ink py-20 text-white lg:py-28">
        <div className="mx-auto max-w-[1440px] px-5 lg:px-10">
          <Reveal>
            <p className="tracked-tagline text-xs text-white/50">WX140</p>
            <h2 className="display-heading mt-3 text-4xl lg:text-6xl">Geometry</h2>
          </Reveal>
          <Reveal delay={0.15} amount={0.15}>
            <div className="mt-12">
              <Table className="text-white/80">
                <TableHeader>
                  <TableRow className="border-white/20 hover:bg-transparent">
                    <TableHead className="tracked-tagline text-[11px] text-white/50">
                      MM
                    </TableHead>
                    {geometrySizes.map((size) => (
                      <TableHead
                        key={size}
                        className="display-heading text-center text-xl text-white"
                      >
                        {size}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {geometryRows.map((row) => (
                    <TableRow key={row.label}>
                      <TableCell className="font-semibold text-white">
                        {row.label}
                      </TableCell>
                      {row.values.map((value, i) => (
                        <TableCell key={i} className="text-center">
                          {value}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="mt-6 text-xs text-white/40">
              All measurements in millimeters unless noted, taken at full
              travel sag with a 160mm fork.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
