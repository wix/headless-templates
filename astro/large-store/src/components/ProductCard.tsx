// THE product card — one component for the shop grid, category pages, search and every home /
// product-page rail, so the same product never looks different in two places.
// Anatomy, top to bottom: image (4:5, second frame on hover where there is one) with every ribbon
// → name → price → colour dots → the shipped QuickAdd as the LAST row. The tile root is a <div>, not
// the link: a button inside an <a> is invalid and its click would navigate instead of adding.
// Data points shown are only those a shopper acts on — no option / image counts.
import { useEffect, useRef, useState } from "react";
import { imgAttrs } from "../wix/media";
import { ChevronLeft, ChevronRight } from "./Icons";
import type { ProductSummary } from "../wix/storefront/types";
import QuickAdd, { CardOptions } from "./storefront/QuickAdd";

export const CARD_SIZES = "(min-width: 1280px) 22vw, (min-width: 1024px) 28vw, (min-width: 768px) 30vw, 50vw";
const MAX_DOTS = 4;

export function PriceLine({ p }: { p: ProductSummary }) {
  // The DTO decides what to show: "From X" (discounted, variants differ), a range, or price + a labelled "was".
  if (p.fromPrice) return <span>From {p.price}</span>;
  if (p.price !== p.maxPrice) return <span>{p.price} – {p.maxPrice}</span>;
  return (
    <>
      <span>{p.price}</span>
      {p.compareAtPrice && (
        <span className="ml-2 whitespace-nowrap text-muted-foreground">
          <span className="sr-only">Was </span>
          <s>{p.compareAtPrice}</s>
        </span>
      )}
    </>
  );
}

export default function ProductCard({ p, sizes = CARD_SIZES, priority = false, square = false, compact = false }: { p: ProductSummary; sizes?: string; priority?: boolean; square?: boolean; compact?: boolean }) {
  // compact (hero widget): white panel, photo inset to the same side padding as the text and hairlines, no ribbons.
  // square: the hero slider's shorter photo frame (it has to fit inside the first screen); everywhere else 3:4.
  const ratio = square ? 1 : 1.333;
  // The gallery: every photo, main first. Pointer devices page through it on hover (see below); a touch screen shows the main photo.
  const urls = p.imageUrls?.length ? p.imageUrls : [p.imageUrl, p.hoverImageUrl].filter((u, i, a) => u && a.indexOf(u) === i);
  const photos = urls.map((u) => imgAttrs(u, sizes, ratio));
  const [i, setI] = useState(0);
  // slide animation only for the arrows; the hover swap (to photo 2 and back) is an instant change
  const [anim, setAnim] = useState(false);
  const n = photos.length;
  const step = (d: 1 | -1) => { setAnim(true); setI((x) => (x + d + n) % n); };
  // Seamless loop: each photo sits at a signed slot around the current one (0 = shown, ±1 = waiting off to the side) and
  // slides between slots. A photo that wraps from one far side to the other (a jump of more than one slot) is
  // repositioned WITHOUT a transition, off-screen, so it never sweeps across the visible frame.
  const half = Math.floor(n / 2);
  const slot = (k: number) => ((k - i + n + half) % n) - half;
  const prevSlots = useRef<number[]>([]);
  const slots = photos.map((_, k) => slot(k));
  const animate = slots.map((sl, k) => prevSlots.current[k] === undefined || Math.abs(sl - prevSlots.current[k]) <= 1);
  useEffect(() => { prevSlots.current = slots; });
  // Options open INSIDE the card: the content slides up by the panel's height (its top hides under the card's edge) and the panel fills the freed space.
  const [picking, setPicking] = useState(false);
  // The panel is mounted (hidden) on first pointer contact so its content is loaded and its height known by the time it opens:
  // the content then slides up and the panel slides in as ONE movement.
  const [warm, setWarm] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const [panelH, setPanelH] = useState(0);
  useEffect(() => {
    if (!warm || !panel.current) return;
    const el = panel.current;
    const ro = new ResizeObserver(() => setPanelH(el.offsetHeight));
    ro.observe(el);
    setPanelH(el.offsetHeight);
    return () => ro.disconnect();
  }, [warm]);
  const dots = (p.swatches ?? []).slice(0, MAX_DOTS);
  const more = (p.swatches?.length ?? 0) - dots.length;
  // h-full: the tile fills its (stretched) list item, so the shipped QuickAdd — which pins itself to the
  // bottom with mt-auto — lands on one baseline across a row.
  return (
    // A panel: photo on top, then hairline-separated rows — name + detail, then price with the add action.
    // The tile root is a <div>, not the link: the add control (a button) must stay outside the <a>.
    <div
      className={`group/card relative flex h-full min-w-0 flex-col overflow-hidden ${compact ? "bg-background" : "bg-secondary"}`}
      // Hover = the photo swap (to photo 2) AND the arrows; leaving resets to the main photo. Mouse only.
      onPointerEnter={(e) => { if (p.optionsSummary) setWarm(true); if (e.pointerType === "mouse" && n > 1) { setAnim(false); setI(1); } }}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") { setAnim(false); setI(0); } }}
    >
      <div className="relative flex flex-1 flex-col" style={{ transform: `translateY(-${picking ? panelH : 0}px)`, transition: "transform 320ms var(--ease-site)" }}>
      <a href={`/products/${encodeURIComponent(p.slug)}`} className="group block text-foreground no-underline">
        <div className={`relative overflow-hidden bg-muted ${square ? "aspect-square" : "aspect-[3/4]"} ${compact ? "mx-4" : ""}`}>
          {/* every photo is a layer; the current one is at slot 0, the rest wait beside it */}
          {photos.map((ph, k) => "src" in ph ? (
            <img key={k} {...ph} loading={priority && k === 0 ? "eager" : "lazy"} alt="" aria-hidden={k === 0 ? undefined : true}
              style={{ transform: `translateX(${slots[k] * 100}%)`, transition: anim && animate[k] ? "transform 320ms var(--ease-site)" : "none" }}
              className="absolute inset-0 h-full w-full object-cover" />
          ) : null)}
          {!compact && p.ribbons.length > 0 && (
            <div className="absolute left-2 top-2 flex flex-wrap gap-1">
              {p.ribbons.map((r) => <span key={r} className="ribbon">{r}</span>)}
            </div>
          )}
        </div>
        <div className="mx-4 mt-3 pb-3">
          <h3 className="break-words font-sans text-base font-medium leading-snug tracking-normal">{p.name}</h3>
          {p.optionsSummary && <p className="mt-0.5 text-sm text-muted-foreground">{p.optionsSummary}</p>}
          {p.discountNames.length > 0 && <p className="mt-0.5 text-xs text-muted-foreground">{p.discountNames.join(", ")}</p>}
          {dots.length > 0 && (
            <div className={`mt-2 flex items-center gap-1.5 transition-opacity duration-[160ms] ${picking ? "opacity-0" : ""}`} aria-hidden="true">
              {dots.map((c, i) => <span key={`${c}-${i}`} className="h-3 w-3 rounded-full" style={{ background: c, boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 0.12)" }} />)}
              {more > 0 && <span className="text-xs text-muted-foreground">+{more}</span>}
            </div>
          )}
        </div>
      </a>
      {n > 1 && (
        // Arrows sit over the photo (siblings of the link: a button may not live inside an <a>), only on hover-capable pointers.
        <div className={`pointer-events-none absolute inset-x-0 top-0 hidden items-center justify-between px-2 opacity-0 transition-opacity duration-[160ms] group-hover/card:opacity-100 has-[:focus-visible]:opacity-100 [@media(hover:hover)]:flex ${square ? "aspect-square" : "aspect-[3/4]"} ${compact ? "mx-4 px-2" : ""}`}>
          <button type="button" aria-label="Previous photo" onClick={() => step(-1)} className="hbtn pointer-events-auto inline-flex h-8 w-8 items-center justify-center text-foreground"><ChevronLeft size={16} /></button>
          <button type="button" aria-label="Next photo" onClick={() => step(1)} className="hbtn pointer-events-auto inline-flex h-8 w-8 items-center justify-center text-foreground"><ChevronRight size={16} /></button>
        </div>
      )}
      {/* mt-auto: the price row pins to the bottom, so it lands on one line across a row of cards */}
      <div className="mx-4 mb-2 mt-auto flex flex-wrap items-center justify-between gap-x-3 border-t border-foreground/80 pt-1">
        <p className="whitespace-nowrap text-base font-medium"><PriceLine p={p} /></p>
        <div className={picking ? "invisible" : ""}><QuickAdd product={p} inline onOptions={() => { setWarm(true); setPicking(true); }} /></div>
      </div>
      </div>
      {warm && (
        <div ref={panel} aria-hidden={!picking} className={`absolute inset-x-0 bottom-0 ${compact ? "bg-background" : "bg-secondary"}`}
          style={{ transform: `translateY(${picking ? 0 : 100}%)`, visibility: picking ? "visible" : "hidden", transition: `transform 320ms var(--ease-site), visibility 0s linear ${picking ? "0s" : "320ms"}` }}>
          <CardOptions product={p} active={picking} onClose={() => setPicking(false)} />
        </div>
      )}
    </div>
  );
}
