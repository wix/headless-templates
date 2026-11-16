// Horizontal rails for the home page and the product page. On a phone every repeating collection is a
// rail (a grid of N is N/2 rows nobody reaches, and it grows with the count; a rail is one row whatever
// the count). The peek of the next item is the whole affordance. On desktop the same rail shows prev /
// next buttons only when its content actually overflows — six department tiles fit and show none.
// Item widths live in global.css (.rail-products / .rail-tiles / .rail-quotes), not here.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { imgAttrs, imgSrc } from "../wix/media";
import { titleCase } from "../lib/text";
import type { ProductSummary } from "../wix/storefront/types";
import { ChevronLeft, ChevronRight, GridDotsIcon } from "./Icons";
import type { GridBanner } from "../lib/site";
import ProductCard from "./ProductCard";
import PromoBanner from "./PromoBanner";

type Head = { title?: string; body?: string; ctaLabel?: string; ctaHref?: string; chips?: { label: string; href: string; imageUrl?: string | null }[] };

function Shell({ head, kind, children }: { head: Head; kind: string; children: ReactNode }) {
  const track = useRef<HTMLUListElement>(null);
  // Category slider only: the grid-dots button expands every category into a grid (4 across on desktop), the ones the slider hid
  // wrapping onto new rows below the first four.
  const [expanded, setExpanded] = useState(false);
  const [edge, setEdge] = useState({ overflow: false, start: true, end: false });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => setEdge({ overflow: el.scrollWidth > el.clientWidth + 4, start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", measure); ro.disconnect(); };
  }, []);

  // Arrow zone: the cards' horizontal band across the WHOLE window — from the left screen edge to the right one, whatever the
  // layout width. A CSS :hover can't reach past the page container, so the pointer's Y is tested against the band on any move.
  const band = useRef<HTMLDivElement>(null);
  const [zone, setZone] = useState(false);
  useEffect(() => {
    let raf = 0;
    const test = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = band.current?.getBoundingClientRect();
        setZone(!!r && e.clientY >= r.top && e.clientY <= r.bottom);
      });
    };
    const out = () => setZone(false);
    window.addEventListener("pointermove", test, { passive: true });
    document.documentElement.addEventListener("pointerleave", out);
    return () => { window.removeEventListener("pointermove", test); document.documentElement.removeEventListener("pointerleave", out); cancelAnimationFrame(raf); };
  }, []);

  const by = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.85, behavior: "smooth" });
  // Side arrows: shown while the pointer is over the section, only if the rail overflows, and each one only while there is
  // more to scroll that way. Mouse-capable devices only (a touch screen swipes). Vertically centred on the cards.
  const arrow = "hbtn absolute z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center bg-foreground text-background transition-[opacity,background-color,color] duration-[160ms] hover:bg-background hover:text-foreground [@media(hover:hover)]:inline-flex";
  const arrowTop = "top-1/2"; // centred on the full height of the cards
  // visible + clickable inside the zone (or on keyboard focus); otherwise invisible and inert. Never both pointer-events utilities at once.
  const shown = zone ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0 group-has-[:focus-visible]/rail:pointer-events-auto group-has-[:focus-visible]/rail:opacity-100";

  return (
    <div className="group/rail">
      {(head.title || head.ctaHref) && (
        <div className="mb-4 flex items-end justify-between gap-6 lg:mb-5">
          <div className="min-w-0">
            {head.title && <h2 className="text-h2">{head.title}</h2>}
            {head.body && <p className="mt-2 max-w-[60ch] text-muted-foreground">{head.body}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {head.ctaHref && (
              kind === "rail-tiles" ? (
                // the category slider's toggle is an icon (a 3×3 grid of dots): expand all categories into a grid / collapse back
                <button type="button" aria-expanded={expanded} aria-label={expanded ? "Show categories as a slider" : "Show all categories"} title={expanded ? "Show as a slider" : "Show all categories"} onClick={() => { setExpanded((v) => !v); if (track.current) track.current.scrollLeft = 0; }} className="hbtn inline-flex h-11 w-11 items-center justify-center text-foreground"><GridDotsIcon /></button>
              ) : (
                <a href={head.ctaHref} className="btn btn-outline">{titleCase(head.ctaLabel || "View all")}</a>
              )
            )}
          </div>
        </div>
      )}
      {head.chips && head.chips.length > 0 && (
        // Subcategory previews (same tiles as the category pages): small square photo, name underneath.
        <ul className="rail rail-subs mb-6 lg:mb-8" aria-label="Subcategories">
          {head.chips.map((c) => (
            <li key={c.href}>
              <a href={c.href} className="subtile group block text-foreground no-underline">
                <span className="subtile__media relative block aspect-square overflow-hidden bg-muted">
                  {c.imageUrl && <img src={imgSrc(c.imageUrl, 288, 288)} alt="" width={288} height={288} loading="lazy" className="h-full w-full object-cover" />}
                </span>
                <span className="mt-2 block text-sm leading-snug">{c.label}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
      <div ref={band} className="relative">
        <ul ref={track} className={`rail ${kind}${expanded ? " rail-grid" : ""}`}>{children}</ul>
        {!expanded && edge.overflow && !edge.start && <button type="button" aria-label="Previous" onClick={() => by(-1)} className={`${arrow} ${arrowTop} -left-7 ${shown}`}><ChevronLeft /></button>}
        {!expanded && edge.overflow && !edge.end && <button type="button" aria-label="Next" onClick={() => by(1)} className={`${arrow} ${arrowTop} -right-7 ${shown}`}><ChevronRight /></button>}
      </div>
    </div>
  );
}

const RAIL_SIZES = "(min-width: 1024px) 22vw, (min-width: 768px) 31vw, 53vw";

export function ProductRail({ products, banner, four = false, ...head }: { products: ProductSummary[]; banner?: GridBanner; four?: boolean } & Head) {
  return (
    <Shell head={head} kind={four ? "rail-products rail-four" : "rail-products"}>
      {products.flatMap((p, i) => {
        // The banner is one more cell in the rail, before the product at its index; skipped when the rail is shorter.
        const card = <li key={p.id}><ProductCard p={p} sizes={RAIL_SIZES} /></li>;
        return banner && banner.at === i ? [<li key="banner"><PromoBanner banner={banner} /></li>, card] : [card];
      })}
    </Shell>
  );
}

export type Tile = { name: string; href: string; imageUrl: string };
export function TileRail({ tiles, ...head }: { tiles: Tile[] } & Head) {
  return (
    <Shell head={head} kind="rail-tiles">
      {tiles.map((t) => {
        // Compact tile: name on the quiet fill, a square photo on the right. Hover = the 1px ink ring (see .tile).
        const img = imgAttrs(t.imageUrl, "96px");
        return (
          <li key={t.href}>
            <a href={t.href} className="tile group relative flex h-20 items-stretch bg-secondary text-foreground no-underline lg:h-24">
              <span className="flex min-w-0 flex-1 items-center px-4 text-base font-medium leading-tight lg:px-5">{t.name}</span>
              <span className="w-20 shrink-0 overflow-hidden bg-muted lg:w-24">
                {"src" in img && <img {...img} alt="" className="h-full w-full object-cover" />}
              </span>
            </a>
          </li>
        );
      })}
    </Shell>
  );
}

export function QuoteRail({ quotes, ...head }: { quotes: { quote: string; name: string }[] } & Head) {
  return (
    <Shell head={head} kind="rail-quotes">
      {quotes.map((q, i) => (
        <li key={i}>
          <figure className="flex h-full flex-col bg-secondary p-6 lg:p-8">
            <blockquote className="text-base leading-relaxed xl:text-lg">{q.quote}</blockquote>
            <figcaption className="mt-auto pt-6 text-sm font-semibold">{q.name}</figcaption>
          </figure>
        </li>
      ))}
    </Shell>
  );
}
