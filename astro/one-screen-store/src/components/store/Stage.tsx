// The open tile, in place over the faded catalog (the reference store's pattern): a large photo with its thumbnails on the
// left, and a dark floating panel on the right with the name, price, Close, the description (scrolls) and the purchase
// controls (pinned at its foot). Phone: the photo on top, the same panel below it, the whole stage scrolls.
// ProductStage drives the shipped useProductDetail + OptionPicker; GiftStage sells the gift card's preset amounts.
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useProductDetail } from "../../hooks/storefront/useProductDetail";
import { selectedChoiceImage } from "../../lib/choiceImage";
import { addGiftCardToCart, type GiftCardProduct } from "../../wix/storefront/gift-card";
import { imgAttrs, imgSrc, mediaKey } from "../../wix/media";
import type { ProductDetail } from "../../wix/storefront/types";
import { ChevronDown, CloseIcon, ExpandIcon } from "../Icons";
import Lightbox from "./Lightbox";
import OptionPicker from "../storefront/OptionPicker";

// Layout effects only run in the browser; on the server a plain effect keeps React quiet.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Where the clicked tile's photo was on screen (viewport px) and what it showed: the open photo grows out of it and shrinks back into it. */
export type Fly = { left: number; top: number; width: number; height: number; src: string; url: string };
type Motion = { from?: Fly | null; closing?: boolean };

function StageFrame({ urls, name, head, body, foot, onClose, from, closing }: {
  urls: string[]; name: string; head: ReactNode; body?: ReactNode; foot: ReactNode; onClose: () => void;
} & Motion) {
  // Start on the photo the tile showed, so the photo that grows is the photo that was clicked.
  // The gallery always opens on its first photo, at every size; the clicked tile's photo flies into that place.
  const start = 0;
  const [i, setI] = useState(start);
  const track = useRef<HTMLDivElement>(null);    // phone + tablet: a horizontal slider, one photo per swipe
  const feed = useRef<HTMLDivElement>(null);     // desktop: every photo, one per screen, scrolled through
  const wide = () => typeof window !== "undefined" && matchMedia("(min-width: 1024px)").matches;
  const shot = (k: number) => feed.current?.querySelectorAll<HTMLElement>(".stage-shot")[k] ?? null;
  const slide = (k: number) => track.current?.querySelectorAll<HTMLElement>(".stage-slide")[k] ?? null;
  const flyEl = (k: number) => (wide() ? shot(k) : slide(k));

  // Desktop: a thumbnail (or a colour pick) scrolls the feed to its photo; scrolling the feed updates the thumbnail.
  const go = (k: number, smooth = true) => {
    setI(k);
    if (!wide()) {
      const sl = slide(k), tr = track.current;
      if (!sl || !tr) return;
      const left = sl.offsetLeft - tr.offsetLeft - (parseFloat(getComputedStyle(tr).paddingLeft) || 0);
      if (smooth) tr.scrollTo({ left, behavior: "smooth" });
      else { tr.style.scrollSnapType = "none"; tr.scrollLeft = left; void tr.offsetWidth; tr.style.scrollSnapType = ""; }
      return;
    }
    const el = shot(k), list = feed.current;
    if (!el || !list) return;
    if (smooth) list.scrollTo({ top: el.offsetTop, behavior: "smooth" });
    else { list.style.scrollSnapType = "none"; list.scrollTop = el.offsetTop; void list.offsetHeight; list.style.scrollSnapType = ""; }
  };
  const onTrackScroll = () => {
    const tr = track.current, first = slide(0), second = slide(1);
    if (!tr || !first) return;
    const step = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
    setI(Math.max(0, Math.min(urls.length - 1, Math.round(tr.scrollLeft / step))));
  };
  const onFeedScroll = () => {
    const list = feed.current;
    if (!list) return;
    const shots = [...list.querySelectorAll<HTMLElement>(".stage-shot")];
    const mid = list.scrollTop + list.clientHeight / 2;
    let best = 0;
    shots.forEach((el, k) => { if (Math.abs(el.offsetTop + el.offsetHeight / 2 - mid) < Math.abs(shots[best].offsetTop + shots[best].offsetHeight / 2 - mid)) best = k; });
    setI(best);
  };
  // A colour pick swaps the gallery's photos in place (ProductStage passes that colour's set): the slide or photo in
  // view stays where it is, only what it shows changes. A shorter set pulls a position past its end back in.
  const setKey = urls.join("|");
  useEffect(() => {
    if (i > urls.length - 1) go(urls.length - 1, false);
  }, [setKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // FLIP with a stand-in: the photo lives inside a rounded, clipping mask (the feed), which would clip it mid-flight, so a
  // copy of the photo flies on top of everything between the tile and the photo's place, and the real photo shows once it
  // lands (and hides the moment it lifts off on close). Uniform scale: tile and photo are both 3:4.
  const ghost = (at: DOMRect, src: string) => {
    const g = document.createElement("div");
    Object.assign(g.style, {
      position: "fixed", left: `${at.left}px`, top: `${at.top}px`, width: `${at.width}px`, height: `${at.height}px`,
      backgroundImage: `url("${src}")`, backgroundSize: "cover", backgroundPosition: "center", borderRadius: "var(--radius-card)",
      transformOrigin: "0 0", zIndex: "60", pointerEvents: "none",
    });
    document.body.appendChild(g);
    return g;
  };
  const offset = (at: DOMRect, f: Fly) => `translate3d(${f.left - at.left}px, ${f.top - at.top}px, 0) scale(${f.width / at.width})`;
  const ease = "cubic-bezier(0.32, 0.72, 0, 1)";
  useIsoLayoutEffect(() => {
    if (start > 0) go(start, false);
    const el = flyEl(start);
    if (!el || !from) return;
    const at = el.getBoundingClientRect();
    // the flying copy shows the gallery's first photo (where it lands), so nothing swaps on landing
    const first = el.querySelector("img");
    const g = ghost(at, mediaKey(from.url) === mediaKey(urls[0]) ? from.src : first?.currentSrc || first?.src || from.src);
    el.style.visibility = "hidden";
    g.animate([{ transform: offset(at, from), borderRadius: `calc(0.75rem * ${at.width / from.width})` }, { transform: "translate3d(0,0,0) scale(1)", borderRadius: "var(--radius-stage)" }], { duration: 640, easing: ease })
      .finished.finally(() => { el.style.visibility = ""; g.remove(); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const el = flyEl(i);
    if (!el || !closing || !from) return;
    const at = el.getBoundingClientRect();
    const img = el.querySelector("img");
    const g = ghost(at, img?.currentSrc || img?.src || from.src);
    el.style.visibility = "hidden";
    // the ghost stays on its tile a beat past the stage's unmount, so the tile takes over without a blink
    g.animate([{ transform: "translate3d(0,0,0) scale(1)", borderRadius: "var(--radius-stage)" }, { transform: offset(at, from), borderRadius: `calc(0.75rem * ${at.width / from.width})` }], { duration: 520, easing: ease, fill: "forwards" })
      .finished.finally(() => window.setTimeout(() => g.remove(), 80));
  }, [closing]); // eslint-disable-line react-hooks/exhaustive-deps

  // Desktop: the mouse wheel anywhere on the open product turns the photos, not only over the photo itself. Over the
  // photo the feed scrolls natively (snapped); elsewhere one wheel gesture glides to the next or previous photo. A part of
  // the panel that can still scroll that way (a long description) scrolls first.
  const stageRef = useRef<HTMLDivElement>(null);
  // opening moves focus into the product: the next Tab reaches its own controls, not the catalog behind
  useEffect(() => { stageRef.current?.focus({ preventScroll: true }); }, []);
  const iRef = useRef(i);
  iRef.current = i;
  useEffect(() => {
    const root = stageRef.current;
    if (!root) return;
    let locked = false, since = 0, quiet = 0;
    const onWheel = (e: WheelEvent) => {
      const list = feed.current;
      if (!wide() || !list || list.contains(e.target as Node) || document.querySelector(".lightbox")) return;
      for (let n = e.target as HTMLElement | null; n && n !== root; n = n.parentElement) {
        if (n.scrollHeight > n.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(n).overflowY)) {
          const can = e.deltaY > 0 ? n.scrollTop + n.clientHeight < n.scrollHeight - 1 : n.scrollTop > 0;
          if (can) return;
        }
      }
      e.preventDefault();
      const now = performance.now();
      clearTimeout(quiet);
      quiet = window.setTimeout(() => { locked = false; }, 200);
      if (locked && now - since < 700) return;
      if (Math.abs(e.deltaY) < 4) return;
      const k = iRef.current + (e.deltaY > 0 ? 1 : -1);
      if (k < 0 || k > urls.length - 1) return;
      locked = true; since = now;
      go(k);
    };
    root.addEventListener("wheel", onWheel, { passive: false });
    return () => { root.removeEventListener("wheel", onWheel); clearTimeout(quiet); };
  }, [urls.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const thumbs = (cls: string) => urls.length > 1 && (
    <ul className={`stage-thumbs z-10 flex flex-col gap-1.5 overflow-y-auto p-1 [scrollbar-width:none] ${cls}`} aria-label="Choose a photo">
      {urls.map((u, k) => (
        <li key={k} className="shrink-0">
          <button type="button" onClick={() => go(k)} aria-label={`Show photo ${k + 1}`} aria-current={k === i}
            className={`block h-10 w-[1.875rem] overflow-hidden rounded-[0.3rem] bg-muted transition-opacity lg:h-12 lg:w-9 ${k === i ? "opacity-100 ring-[1.5px] ring-foreground ring-offset-[1.5px] ring-offset-background hover:opacity-70" : "opacity-50 hover:opacity-100"}`}>
            <img src={imgSrc(u, 72, 96)} alt="" className="h-full w-full object-cover" loading="lazy" />
          </button>
        </li>
      ))}
    </ul>
  );
  // Full screen: a button in the photo's top-right corner opens every photo in a viewer; closing it brings the
  // stage to the photo the viewer was on.
  const [full, setFull] = useState<number | null>(null);
  const expandBtn = (k: number, cls: string) => (
    <button type="button" onClick={() => setFull(k)} aria-label="View photos full screen"
      className={`stage-expand icon-btn absolute z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground hover:bg-transparent ${cls}`}>
      <ExpandIcon size={18} />
    </button>
  );
  const closeBtn = (cls: string) => (
    <button type="button" onClick={onClose} aria-label="Close" className={`stage-close close-btn inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground ${cls}`}>
      <CloseIcon size={18} />
    </button>
  );

  return (
    <div ref={stageRef} tabIndex={-1} className={`stage fixed outline-none inset-x-0 bottom-0 top-(--store-header) z-30 overflow-y-auto overscroll-contain lg:overflow-hidden ${from ? "stage--fly" : "stage--fade"} ${closing ? "is-closing" : ""}`} role="dialog" aria-modal="false" aria-label={name}>
      {/* phone + tablet: every photo in one horizontal rail that runs edge to edge (the first one lines up with the page
          gutter, the rest run on to the screen's edge), so the width is always filled with photos; swipe snaps photo by
          photo. No Close here: Back (or the wordmark) leaves the product. */}
      <div className="pt-3 lg:hidden">
        <div ref={track} onScroll={onTrackScroll} className="stage-track flex snap-x snap-mandatory gap-2 overflow-x-auto px-(--gutter) [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" tabIndex={0} aria-label={`${name} photos`}>
          {urls.map((u, k) => (
            <div key={k} className="stage-slide relative aspect-[3/4] shrink-0 snap-start overflow-hidden rounded-card bg-muted">
              <img {...imgAttrs(u, "(min-width: 768px) 50vw, 86vw", 4 / 3)} loading={k <= start + 1 ? "eager" : "lazy"} alt="" className="stage-photo absolute inset-0 h-full w-full object-cover" />
              {expandBtn(k, "right-2.5 top-2.5")}
            </div>
          ))}
        </div>
      </div>

      {/* desktop: every photo as tall as the panel beside it (same top, same bottom), one under the other; the wheel turns
          them one at a time (snap) while the panel stays where it is. Close sits quietly in the dark panel's top-right
          corner; the thumbnails ride over the photo's top-left corner and mark the photo in view. The feed is a rounded mask exactly
          one photo wide, so a photo cut by the edge while scrolling keeps rounded corners. */}
      <div className="stage-gallery absolute inset-y-0 left-0 right-[calc(var(--panel-w)+2*var(--gutter))] hidden lg:block">
        <div ref={feed} onScroll={onFeedScroll} className="stage-feed absolute bottom-(--gutter) top-(--gutter) snap-y snap-mandatory overflow-y-auto rounded-card [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex flex-col gap-4">
            {urls.map((u, k) => (
              <div key={k} className="stage-shot stage-frame relative aspect-[3/4] h-(--shot-h) shrink-0 origin-top-left snap-start overflow-hidden rounded-card bg-muted bg-cover bg-center will-change-transform" >
                <img {...imgAttrs(u, "50vw", 4 / 3)} loading={k === start ? "eager" : "lazy"} alt="" className="stage-photo absolute inset-0 h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
        {thumbs("stage-thumbs-over absolute max-h-[calc(var(--shot-h)-1.5rem)]")}
        {expandBtn(i, "stage-expand-over")}
      </div>

      {/* the dark panel: it slides in a beat after the photo, and its parts rise in one after another */}
      <aside className="stage-panel theme-inverse relative mx-2 mb-2 mt-4 flex flex-col rounded-(--radius-stage) bg-background p-5 text-foreground lg:absolute lg:bottom-(--gutter) lg:right-(--gutter) lg:top-(--gutter) lg:m-0 lg:w-(--panel-w) lg:overflow-hidden">
        {/* name and price, then the purchase controls right under them; the description and info sections sit at the foot */}
        {closeBtn("absolute right-3 top-3 z-10 hidden lg:inline-flex")}
        <div className="min-w-0 lg:pr-8">{head}</div>
        <div className="mt-4 border-y border-border py-4">{foot}</div>
        {body && <div className="mt-6 lg:mt-auto lg:min-h-0 lg:overflow-y-auto lg:pr-1 lg:pt-6">{body}</div>}
      </aside>
      {full !== null && <Lightbox urls={urls} start={full} name={name} source={(k) => (wide() ? shot(k) : null)} sync={(k) => go(k, false)} onClose={() => setFull(null)} />}
    </div>
  );
}

// One info section (Product Info, Shipping Info, …): a button row that opens and closes its text smoothly. The text's
// height animates from 0 to its own height (a grid row from 0fr to 1fr) while it fades and settles in; the chevron turns.
function InfoRow({ title, html }: { title: string; html: string }) {
  const [open, setOpen] = useState(false);
  const id = `info-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="border-t border-border last:border-b">
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}
        className="text-btn flex min-h-12 w-full items-center justify-between gap-4 text-left font-medium">
        {title}<ChevronDown className={`shrink-0 transition-transform duration-[360ms] ease-(--ease-push) ${open ? "rotate-180" : ""}`} />
      </button>
      <div id={id} role="region" aria-label={title} className={`info-body grid ${open ? "is-open" : ""}`} {...(open ? {} : ({ inert: "" } as Record<string, string>))}>
        <div className="min-h-0 overflow-hidden">
          <div className="info-text prose-site pb-4 text-muted-foreground" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </div>
  );
}

const Price = ({ price, was }: { price: string; was?: string | null }) => (
  <p className="mt-1 text-muted-foreground">
    {/* both amounts say what they are to a screen reader */}
    <span className="text-foreground">{was && <span className="sr-only">Sale price: </span>}{price}</span>
    {was && <span className="ml-2"><span className="sr-only">Original price: </span><s>{was}</s></span>}
  </p>
);

export function ProductStage({ detail, media, pick, onClose, from, closing }: {
  detail: ProductDetail; media: Record<string, string>; pick?: { option: string; choice: string }; onClose: () => void;
} & Motion) {
  const d = useProductDetail({ initial: detail });
  // The tile's colour (or the URL's ?Colour=…) is chosen once, when the stage opens.
  useEffect(() => {
    if (!d.product || !pick) return;
    const g = d.optionGroups.find((x) => x.name === pick.option);
    const c = g?.choices.find((x) => x.name === pick.choice);
    if (g && c) d.selectOption(g.id, c.choiceId);
  }, [d.product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const p = d.product ?? detail;
  // The gallery follows the colour: the chosen colour's own photo, then the photos no colour claims (shared shots).
  // Changing the colour swaps these photos in place. The tile's colour counts from the first render, before the pick
  // above lands, so the stage never opens on the full set and then shrinks.
  const all = p.gallery.length ? p.gallery : [p.imageUrl].filter(Boolean);
  const pickUrl = (() => {
    if (!pick) return null;
    const c = d.optionGroups.find((x) => x.name === pick.option)?.choices.find((x) => x.name === pick.choice);
    return c ? media[c.choiceId] ?? null : null;
  })();
  const wantedUrl = selectedChoiceImage(d.optionGroups, media) ?? pickUrl;
  const colourUrl = wantedUrl ? all.find((u) => mediaKey(u) === mediaKey(wantedUrl)) ?? wantedUrl : null;
  const claimed = new Set(Object.values(media).map(mediaKey));
  const urls = colourUrl ? [colourUrl, ...all.filter((u) => !claimed.has(mediaKey(u)))] : all;
  return (
    <StageFrame
      urls={urls}
      name={p.name}
      onClose={onClose}
      from={from}
      closing={closing}
      head={<><h1 className="text-h3">{p.name}</h1><Price price={d.price || p.price} was={d.compareAtPrice} /></>}
      body={
        <div className="flex flex-col gap-5 text-sm">
          {p.descriptionHtml && <div className="prose-site text-muted-foreground" dangerouslySetInnerHTML={{ __html: p.descriptionHtml }} />}
          {p.infoSections.length > 0 && (
            <div>
              {p.infoSections.map((s) => <InfoRow key={s.title} title={s.title} html={s.html} />)}
            </div>
          )}
        </div>
      }
      foot={<OptionPicker detail={d} showQuantity />}
    />
  );
}

export function GiftStage({ product, title, intro, onClose, from, closing }: { product: GiftCardProduct; title: string; intro?: string; onClose: () => void } & Motion) {
  const [variantId, setVariantId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chosen = product.presets.find((p) => p.variantId === variantId);
  const add = async () => {
    if (!chosen || adding) return;
    setAdding(true); setError(null);
    try { await addGiftCardToCart(product.id, chosen.variantId); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setAdding(false); }
  };
  return (
    <StageFrame
      urls={[product.imageUrl].filter(Boolean)}
      name={title}
      onClose={onClose}
      from={from}
      closing={closing}
      head={<><h1 className="text-h3">{title}</h1><Price price={chosen?.price ?? (product.presets[0] ? `From ${product.presets[0].price}` : "")} /></>}
      body={(intro || product.description) ? <p className="text-sm text-muted-foreground">{intro || product.description}</p> : undefined}
      foot={
        <div className="flex flex-col gap-4">
          <fieldset>
            <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Amount</legend>
            <div className="flex flex-wrap gap-2">
              {product.presets.map((p) => (
                <button key={p.variantId} type="button" aria-pressed={p.variantId === variantId} onClick={() => setVariantId(p.variantId)}
                  className={`pill min-h-11 rounded-control border px-4 text-sm ${p.variantId === variantId ? "border-foreground bg-foreground text-background" : "border-border"}`}>
                  {p.price}
                </button>
              ))}
            </div>
          </fieldset>
          <button type="button" disabled={!chosen || adding} onClick={add} className="btn btn-primary w-full">{adding ? "Adding…" : "Add to cart"}</button>
          {!chosen && <p className="text-xs text-muted-foreground">Choose Amount</p>}
          {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
        </div>
      }
    />
  );
}
