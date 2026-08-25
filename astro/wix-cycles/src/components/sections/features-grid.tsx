import Image from "@/components/compat/image";

import { sectionImages } from "@/lib/data";
import { Reveal } from "@/components/reveal";
import { SectionTag } from "@/components/section-tag";

const GRID_ITEMS = [
  {
    title: "Silent Routing.",
    text: "Every cable runs through guided internal channels, clamped at both ends. No rattle on the rough stuff, no rub on the frame — just a bike that stays quiet at speed.",
    image: sectionImages.cableManagement,
  },
  {
    title: "Threaded BB.",
    text: "A threaded aluminum bottom bracket shell with accessory mounts built in. Creak-free by design, and serviceable with basic tools in any garage on earth.",
    image: sectionImages.threadedBB,
  },
  {
    title: "Standard Everything.",
    text: "Universal hanger, standard bearings, common hardware. When something needs replacing, the part is already on the shelf at your nearest shop.",
    image: sectionImages.udh,
  },
];

export function FeaturesGrid() {
  return (
    <>
      {/* FlowLink — 50/50 split: dark copy panel left, macro image right */}
      <section className="relative grid bg-[#161616] text-white lg:grid-cols-2">
        <SectionTag label="Features 01" />
        <div className="flex items-center px-6 py-20 lg:px-16 lg:py-32">
          <Reveal>
            <h2 className="tracked-tagline text-base text-white lg:text-lg">
              FlowLink. Reinvented.
            </h2>
            <p className="mt-8 max-w-md text-xl font-light leading-relaxed text-white/75 lg:text-2xl">
              Our next-generation suspension platform tracks the ground like
              it&rsquo;s reading it — supple off the top, supportive in the
              middle, and built to shrug off seasons of abuse.
            </p>
            <a
              href="#compare"
              className="mt-10 inline-block bg-white px-8 py-3 text-[11px] font-bold uppercase tracking-[0.25em] text-ink transition-colors duration-300 hover:bg-turq hover:text-white"
            >
              Explore
            </a>
          </Reveal>
        </div>
        <div className="relative min-h-[50svh]">
          <Image
            src={sectionImages.bearing}
            alt="FlowLink hardware macro"
            fill
            className="object-cover"
            sizes="(min-width:1024px) 50vw, 100vw"
          />
        </div>
      </section>

      {/* Three-up grid on light ground */}
      <section className="bg-gray-light py-24 lg:py-32">
        <div className="mx-auto grid max-w-[1440px] gap-6 px-5 md:grid-cols-3 lg:px-10">
          {GRID_ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.15} className="h-full">
              <article className="group flex h-full flex-col bg-white">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(min-width:768px) 30vw, 100vw"
                  />
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <h3 className="tracked-tagline text-sm text-ink">{item.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-black/60">{item.text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Full drop — full-bleed photo with a black overlay card */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink">
        <Image
          src={sectionImages.wishbone}
          alt="Riders climbing at golden hour"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 lg:px-10">
          <Reveal className="ml-auto max-w-md bg-black/90 p-10 text-white lg:p-12">
            <h2 className="tracked-tagline text-base">Full Drop.</h2>
            <p className="mt-6 text-sm leading-loose text-white/75">
              A shorter seat tube means more room for modern long-stroke
              dropper posts. Small frames clear a 150mm post, Mediums take
              175mm, and Large through XXL swallow 200mm and beyond.*
            </p>
            <p className="mt-6 text-xs leading-relaxed text-white/45">
              *Actual post length depends on rider saddle height.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
