// The one-screen store: a header (wordmark · Grid / Strip · About · Reviews · cart), the catalog as square tiles (Grid) or
// as one horizontal ribbon (Strip), and a tiny footer. A tile opens in place (Stage) and the URL follows
// (/products/<slug>?Colour=…, /gift-card), so the page can be reloaded, shared and left with the back button.
// About and Reviews are side panels: they slide in from the right, push the site to the left and dim it.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { StoreData, StoreItem } from "../../lib/store-data";
import { targetFromUrl, type OpenTarget } from "../../lib/store-route";
import { imgAttrs } from "../../wix/media";
import { CloseIcon } from "../Icons";
import WixForm from "../WixForm";
import { CONTACT_FORM_ID } from "../../lib/site";
import CartButton from "../storefront/CartButton";
import { holdFocus } from "../../lib/a11y";
import { GiftStage, ProductStage, type Fly } from "./Stage";

// Layout effects only run in the browser; on the server a plain effect keeps React quiet.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type View = "grid" | "strip";
type Panel = "about" | "reviews" | null;
const VIEW_KEY = "store-view";

const sameTarget = (a: OpenTarget, it: StoreItem) =>
  !!a && (a.kind === "gift" ? it.kind === "gift" : it.kind === "product" && it.slug === a.slug && (!a.pick || it.pick?.choice === a.pick.choice));

// The caption: name on the left, price on the right, one line (phone and tablet: the price under the name). A product with
// colours adds a row of its colour dots (the shown colour ringed); on desktop each dot is a control: hover lifts it, a
// click switches the tile to that colour (photo, price, link) without opening the product.
function Caption({ it, small = false, onPick }: { it: StoreItem; small?: boolean; onPick?: (k: number) => void }) {
  return (
    <span className={`flex flex-col ${small ? "gap-1 text-xs" : "gap-1.5 text-sm"}`}>
      <span className="flex flex-col gap-0.5 lg:flex-row lg:items-baseline lg:justify-between lg:gap-3">
        <span className="min-w-0 truncate">{it.name}</span>
        <span className="shrink-0 whitespace-nowrap">{it.compareAtPrice && <span className="sr-only">Sale price: </span>}{it.price}{it.compareAtPrice && <s className="ml-1.5 text-muted-foreground"><span className="sr-only">. Original price: </span>{it.compareAtPrice}</s>}</span>
      </span>
      {it.swatches.length > 0 && (
        // a radio group: one Tab stop (the shown colour), arrow keys move along the colours and pick them
        <span className="-m-1 hidden flex-wrap items-center lg:flex" role={onPick ? "radiogroup" : "group"} aria-label={`Colour: ${it.label}. ${it.swatches.length} colours`}>
          {it.swatches.map((s, k) => {
            const pick = (e: React.SyntheticEvent) => { e.preventDefault(); e.stopPropagation(); onPick?.(k); };
            const step = (e: React.KeyboardEvent<HTMLElement>) => {
              const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
              if (e.key === "Enter" || e.key === " ") { pick(e); return; }
              if (!dir) return;
              e.preventDefault(); e.stopPropagation();
              const n = (k + dir + it.swatches.length) % it.swatches.length;
              onPick?.(n);
              (e.currentTarget.parentElement?.children[n] as HTMLElement | undefined)?.focus();
            };
            return (
              <span key={s.name} title={s.name} role={onPick ? "radio" : undefined} tabIndex={onPick ? (s.current ? 0 : -1) : undefined}
                aria-label={onPick ? s.name : undefined} aria-checked={onPick ? s.current : undefined}
                onClick={onPick ? pick : undefined} onKeyDown={onPick ? step : undefined}
                className={`swatch-dot ${onPick ? "cursor-pointer" : ""} inline-flex p-1`}>
                <span aria-hidden="true" className={`swatch-dot-fill block shrink-0 rounded-full ${small ? "h-2.5 w-2.5" : "h-3 w-3"}`}
                  style={{ background: s.code, boxShadow: s.current ? "0 0 0 1.5px var(--color-background), 0 0 0 2.5px var(--color-foreground)" : "inset 0 0 0 1px rgb(0 0 0 / 0.12)" }} />
              </span>
            );
          })}
        </span>
      )}
    </span>
  );
}

function Tile({ it: base, view, onOpen, eager }: { it: StoreItem; view: View; onOpen: (it: StoreItem, e: React.MouseEvent) => void; eager: boolean }) {
  // One tile for both views: a 3:4 photo; on a pointer screen the caption rises over the photo on hover (or keyboard focus),
  // on a touch screen it sits under the photo on two lines. A colour dot picked in the caption makes this tile that colour.
  const [picked, setPicked] = useState<number | null>(null);
  const it: StoreItem = (() => {
    const s = picked === null ? null : base.swatches[picked];
    if (!s || s.current) return base;
    return {
      ...base, imageUrl: s.imageUrl, href: s.href, label: s.name, price: s.price, compareAtPrice: s.compareAtPrice, soldOut: s.soldOut,
      pick: base.pick ? { option: base.pick.option, choice: s.name } : base.pick,
      swatches: base.swatches.map((o, k) => ({ ...o, current: k === picked })),
    };
  })();
  const img = imgAttrs(it.imageUrl, view === "grid" ? "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" : "(min-width: 1024px) 28rem, 42svh", 4 / 3);
  return (
    <a href={it.href} data-key={base.key} onClick={(e) => onOpen(it, e)} className="tile group block text-foreground no-underline">
      <span className="tile-frame relative block aspect-[3/4] w-full overflow-hidden rounded-card bg-muted">
        {"src" in img && <img {...img} loading={eager ? "eager" : "lazy"} alt="" className="tile-photo absolute inset-0 h-full w-full object-cover" />}
        {/* hover: the second photo fades in over the first (pointer screens only); it steps aside while the caption is
            pointed at, so a colour pick shows its photo */}
        {it.hoverUrl && "src" in img && (
          <img {...imgAttrs(it.hoverUrl, img.sizes, 4 / 3)} alt="" aria-hidden="true" className="tile-photo tile-photo-alt absolute inset-0 hidden h-full w-full object-cover [@media(hover:hover)]:block" />
        )}
        {it.soldOut && <span className="tile-ribbon ribbon absolute left-3 top-3">Sold out</span>}
        {it.kind === "gift" && <span className="tile-ribbon ribbon absolute left-3 top-3">Gift Card</span>}
        <span className="tile-caption absolute inset-x-3 top-3 hidden rounded-md bg-background/90 px-3 py-2 [@media(hover:hover)]:block">
          <Caption it={it} onPick={setPicked} />
        </span>
      </span>
      <span className="mt-2 block [@media(hover:hover)]:hidden"><Caption it={it} small /></span>
    </a>
  );
}

function Drawer({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  // a modal while open: focus moves in, Tab stays inside, the page behind is inert; closing returns focus to the opener
  useEffect(() => {
    const el = ref.current;
    if (!open || !el) return;
    const opener = document.activeElement;
    el.focus({ preventScroll: true });
    return holdFocus(el, opener);
  }, [open]);
  return (
    <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} aria-hidden={!open} {...(open ? {} : ({ inert: "" } as Record<string, string>))}
      className={`drawer fixed inset-y-0 right-0 z-50 w-(--drawer-w) overflow-y-auto bg-background p-6 outline-none lg:p-8 ${open ? "is-open" : ""}`}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-h2">{title}</h2>
        <button type="button" onClick={onClose} className="close-btn icon-btn inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-foreground hover:bg-transparent" aria-label="Close"><CloseIcon size={22} /></button>
      </div>
      {children}
    </div>
  );
}

/** `page="contact"`: the Contact page in the store's chrome (header, side panels, footer) instead of the catalog.
 *  `page="content"`: any other page (FAQ, policies, 404) — its markup arrives as children and sits in the same chrome. */
export default function StoreApp({ data, businessName: fallbackName, initialUrl, page, pinFooter, children }: { data: StoreData; businessName: string; initialUrl: string; page?: "contact" | "content"; pinFooter?: boolean; children?: React.ReactNode }) {
  // Contact (and any page that asks, e.g. FAQ): the footer is a bar fixed at the foot of the screen at every height.
  const pinned = page === "contact" || !!pinFooter;
  const businessName = data.businessName || fallbackName;
  const [view, setView] = useState<View>("grid");
  const [open, setOpen] = useState<OpenTarget>(() => targetFromUrl(new URL(initialUrl)));
  const [panel, setPanel] = useState<Panel>(null);
  const [mounted, setMounted] = useState(false);
  const pushed = useRef(false);
  const [fly, setFly] = useState<Fly | null>(null);
  const [closing, setClosing] = useState(false);
  const main = useRef<HTMLElement>(null);
  const openRef = useRef(open);
  openRef.current = open;
  const strip = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setMounted(true);
    try { const v = localStorage.getItem(VIEW_KEY); if (v === "grid" || v === "strip") setView(v); } catch { /* storage blocked */ }
    try { const q = new URLSearchParams(location.search).get("panel"); if (q === "about" || q === "reviews") setPanel(q); } catch { /* no query */ }
    const onPop = () => {
      pushed.current = false;
      const t = targetFromUrl(new URL(location.href));
      if (!t) beginClose.current(); else { setFly(null); setOpen(t); }
    };
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, []);

  // Grid ⇄ Strip. Only the first row keeps its place in both layouts, so only it morphs (moves a little and resizes,
  // FLIP by tile key). Every other tile never travels between the layouts: the ones on screen leave through the edge the
  // OLD layout continues to (Grid: the bottom; Strip: the right), and the ones that land on screen arrive through the edge
  // the NEW layout continues from. Leaving tiles are snapshots (clones) of the old layout, since React replaces them.
  type Was = { x: number; y: number; w: number; vx: number; vy: number; vw: number; vh: number; clone: HTMLElement | null };
  const flip = useRef<{ from: View; tiles: Map<string, Was>; scrolled: boolean } | null>(null);
  const firstRow = () => (matchMedia("(min-width: 1024px)").matches ? 4 : matchMedia("(min-width: 768px)").matches ? 3 : 2);
  const onScreen = (r: DOMRect | { left: number; top: number; width: number; height: number }) =>
    r.left < innerWidth && r.left + r.width > 0 && r.top < innerHeight && r.top + r.height > 0;
  const chooseView = (v: View) => {
    if (v === view) return;
    const tiles = new Map<string, Was>();
    const cols = firstRow();
    main.current?.querySelectorAll<HTMLElement>(".tile[data-key]").forEach((t, k) => {
      const r = t.getBoundingClientRect();
      tiles.set(t.dataset.key!, {
        x: r.left, y: r.top + window.scrollY, w: r.width, vx: r.left, vy: r.top, vw: r.width, vh: r.height,
        clone: k >= cols && onScreen(r) ? (t.cloneNode(true) as HTMLElement) : null,
      });
    });
    // the page jumps back to its top for the new layout, so the morph is measured on screen (viewport), not in the page
    flip.current = { from: view, tiles, scrolled: window.scrollY > 4 };
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    setView(v);
    try { localStorage.setItem(VIEW_KEY, v); } catch { /* storage blocked */ }
  };
  useIsoLayoutEffect(() => {
    const snap = flip.current;
    flip.current = null;
    if (!snap || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ease = "cubic-bezier(0.32, 0.72, 0, 1)";
    const cols = firstRow();
    // 1. the first row morphs
    // 2. the rest arrive through the new layout's edge
    let n = 0;
    main.current?.querySelectorAll<HTMLElement>(".tile[data-key]").forEach((t, k) => {
      const was = snap.tiles.get(t.dataset.key!);
      const r = t.getBoundingClientRect();
      // a first-row tile morphs only when it was on screen; scrolled down the grid it was not, so it arrives like the rest
      if (k < cols && was && onScreen({ left: was.vx, top: was.vy, width: was.vw, height: was.vh })) {
        const dx = was.vx - r.left, dy = was.vy - r.top, s = r.width ? was.vw / r.width : 1;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(s - 1) < 0.01) return;
        t.animate([{ transform: `translate3d(${dx}px, ${dy}px, 0) scale(${s})` }, { transform: "translate3d(0,0,0) scale(1)" }],
          { duration: 680, easing: ease, fill: "backwards" });
        return;
      }
      if (!onScreen(r)) return;
      const from = view === "strip" ? `translate3d(${innerWidth - r.left + 40}px, 0, 0)` : `translate3d(0, ${innerHeight - r.top + 40}px, 0)`;
      t.animate([{ transform: from, opacity: 0 }, { transform: "translate3d(0,0,0)", opacity: 1 }],
        { duration: 720, delay: 120 + Math.min(n++, 8) * 40, easing: ease, fill: "backwards" });
    });
    // the title above the catalog was scrolled away: it fades in at the top instead of appearing at once
    if (snap.scrolled) main.current?.querySelector<HTMLElement>("[data-intro]")?.animate(
      [{ opacity: 0, transform: "translate3d(0, -8px, 0)" }, { opacity: 1, transform: "none" }], { duration: 480, delay: 160, easing: ease, fill: "backwards" });
    // 3. the old layout's other tiles leave through its edge
    let m = 0;
    snap.tiles.forEach((was) => {
      const c = was.clone;
      if (!c) return;
      Object.assign(c.style, { position: "fixed", left: `${was.vx}px`, top: `${was.vy}px`, width: `${was.vw}px`, margin: "0", zIndex: "20", pointerEvents: "none", transition: "none" });
      c.removeAttribute("data-key");
      document.body.appendChild(c);
      const to = snap.from === "strip" ? `translate3d(${innerWidth - was.vx + 40}px, 0, 0)` : `translate3d(0, ${innerHeight - was.vy + 40}px, 0)`;
      c.animate([{ transform: "translate3d(0,0,0)", opacity: 1 }, { transform: to, opacity: 0 }],
        { duration: 560, delay: Math.min(m++, 8) * 30, easing: ease, fill: "forwards" }).finished.finally(() => c.remove());
    });
  }, [view]);

  // Opening: the clicked photo is measured, every other tile gets a direction to slide away in (away from the clicked one),
  // then the stage mounts and grows the photo out of the tile (Stage.tsx). Works the same in Grid and Strip: it reads the
  // tiles where they are on screen, whatever moved them there.
  const openItem = useCallback((it: StoreItem, e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // a new tab keeps the plain link
    e.preventDefault();
    const tile = e.currentTarget as HTMLElement;
    openerTile.current = tile;
    const frameEl = tile.querySelector<HTMLElement>(".tile-frame");
    const img = tile.querySelector<HTMLImageElement>("img.tile-photo:not(.tile-photo-alt)");
    if (frameEl) {
      const r = frameEl.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      main.current?.querySelectorAll<HTMLElement>(".tile").forEach((t) => {
        const q = t.getBoundingClientRect();
        const dx = q.left + q.width / 2 - cx, dy = q.top + q.height / 2 - cy, len = Math.hypot(dx, dy) || 1;
        t.style.setProperty("--leave-x", `${(dx / len) * 120}px`);
        t.style.setProperty("--leave-y", `${(dy / len) * 120}px`);
        t.toggleAttribute("data-active", t === tile);
      });
      // The photo that flies is the one on screen: the hover photo when the pointer is showing it.
      const alt = tile.querySelector<HTMLImageElement>("img.tile-photo-alt");
      const shown = alt && parseFloat(getComputedStyle(alt).opacity) > 0.5 ? alt : img;
      setFly({ left: r.left, top: r.top, width: r.width, height: r.height, src: shown?.currentSrc || shown?.src || "", url: shown === alt ? it.hoverUrl : it.imageUrl });
    } else setFly(null);
    history.pushState({ store: true }, "", it.href);
    pushed.current = true;
    setClosing(false);
    setOpen(it.kind === "gift" ? { kind: "gift" } : { kind: "product", slug: it.slug!, pick: it.pick });
  }, []);

  // Closing plays the opening backwards: the photo shrinks into its tile, the panel fades, the tiles slide back; then the
  // stage unmounts and the clicked tile shows again.
  // the tile that opened the product: focus goes back to it when the product closes
  const openerTile = useRef<HTMLElement | null>(null);
  const beginClose = useRef(() => {});
  beginClose.current = () => {
    if (!openRef.current) return;
    // the photo shrinks into its tile where the tile is NOW (the page under the product may have moved since it opened)
    const frameEl = main.current?.querySelector<HTMLElement>(".tile[data-active] .tile-frame");
    if (frameEl) {
      const r = frameEl.getBoundingClientRect();
      setFly((f) => (f ? { ...f, left: r.left, top: r.top, width: r.width, height: r.height } : f));
    }
    setClosing(true);
    window.setTimeout(() => {
      setOpen(null); setClosing(false); setFly(null);
      // the tile takes over from the landed photo at once: no fade, or it would blink
      main.current?.querySelectorAll<HTMLElement>(".tile[data-active]").forEach((t) => {
        t.style.transition = "none"; t.removeAttribute("data-active"); void t.offsetWidth; t.style.transition = "";
      });
      // once the catalog is live again (next frame), focus returns to the tile, unless focus moved on elsewhere
      const back = openerTile.current;
      openerTile.current = null;
      requestAnimationFrame(() => {
        const at = document.activeElement;
        if (back?.isConnected && (!at || at === document.body || !at.isConnected || at.closest(".stage"))) back.focus({ preventScroll: true });
      });
    }, 540);
  };
  const close = useCallback(() => {
    if (pushed.current) { history.back(); return; } // popstate runs the closing
    history.replaceState(null, "", "/");
    beginClose.current();
  }, []);

  // Escape closes the side panel first, then the open tile. The page behind a panel does not scroll.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key !== "Escape") return; if (panel) setPanel(null); else if (open) close(); };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [panel, open, close]);
  useEffect(() => {
    document.documentElement.classList.toggle("scroll-locked", !!panel || (!!open && matchMedia("(min-width: 1024px)").matches));
  }, [panel, open]);

  // Title follows the open tile.
  useEffect(() => {
    const it = data.items.find((x) => sameTarget(open, x));
    if (page && !it) return; // a page keeps its own title
    document.title = it ? `${it.kind === "gift" ? data.giftTitle : it.name} | ${businessName}` : businessName;
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Strip: the page scrolls down, the ribbon moves sideways. The section is as tall as the ribbon is wide (plus one
  // screen), its frame sticks under the header, and the ribbon's offset follows how far the section has been scrolled.
  // Phone + tablet: the strip is a plain horizontal row you swipe; from 1024 the page's vertical scroll drives it.
  const [swipe, setSwipe] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(max-width: 1023px)");
    const on = () => setSwipe(mq.matches);
    on(); mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const stripOuter = useRef<HTMLDivElement>(null);
  const stripFrame = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  useEffect(() => {
    const outer = stripOuter.current, frame = stripFrame.current, track = strip.current;
    if (!outer || !frame || !track || view !== "strip") return;
    if (swipe) { track.style.transform = ""; setDist(0); return; }
    let raf = 0;
    const place = () => {
      const top = parseFloat(getComputedStyle(frame).top) || 0;
      const x = Math.min(maxShift(), Math.max(0, top - outer.getBoundingClientRect().top));
      track.style.transform = `translate3d(${-x}px,0,0)`;
    };
    const maxShift = () => {
      const wrap = track.parentElement!;
      const gutter = parseFloat(getComputedStyle(wrap).paddingRight) || 0;
      return Math.max(0, wrap.offsetLeft + parseFloat(getComputedStyle(wrap).paddingLeft) + track.scrollWidth + gutter - frame.clientWidth);
    };
    const measure = () => { setDist(maxShift()); place(); };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(place); };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track); ro.observe(frame);
    addEventListener("scroll", onScroll, { passive: true });
    return () => { ro.disconnect(); removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [view, data.items.length, swipe]);

  const detail = open?.kind === "product" ? data.details[open.slug] : undefined;
  const [tipFlash, setTipFlash] = useState<View | null>(null);
  const tipTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => clearTimeout(tipTimer.current), []);
  // Grid / Strip: two icon buttons in a bar fixed at the foot of the screen; the name shows on hover (and keyboard focus).
  // On phone/tablet there is no hover: a tap shows the name for a second, then it fades.
  const flashTip = (v: View) => {
    if (!matchMedia("(max-width: 1023px), (hover: none)").matches) return;
    clearTimeout(tipTimer.current);
    setTipFlash(v);
    tipTimer.current = window.setTimeout(() => setTipFlash(null), 1000);
  };
  const toggle = (v: View, label: string, icon: React.ReactNode) => (
    <button type="button" onClick={() => { chooseView(v); flashTip(v); }} aria-pressed={view === v} aria-label={label}
      className={`view-btn group/vb relative inline-flex h-9 w-9 items-center justify-center rounded-full ${view === v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
      {icon}
      <span role="tooltip" className={`view-tip ${tipFlash === v ? "view-tip-on" : ""} pointer-events-none absolute bottom-full left-1/2 mb-2 whitespace-nowrap rounded-full bg-foreground px-2.5 py-1 text-xs text-background`}>{label}</span>
    </button>
  );
  const gridIcon = <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2" /><rect x="13" y="3.5" width="7.5" height="7.5" rx="2" /><rect x="3.5" y="13" width="7.5" height="7.5" rx="2" /><rect x="13" y="13" width="7.5" height="7.5" rx="2" /></svg>;
  const stripIcon = <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="2" y="5.5" width="5.5" height="13" rx="2" /><rect x="9.25" y="5.5" width="5.5" height="13" rx="2" /><rect x="16.5" y="5.5" width="5.5" height="13" rx="2" /></svg>;
  const panelBtn = (p: Exclude<Panel, null>, label: string) => (
    <button type="button" onClick={() => setPanel(p)} aria-expanded={panel === p} className="hdr-btn inline-flex h-8 items-center rounded-full px-1.5 sm:px-3">{label}</button>
  );
  const path = new URL(initialUrl).pathname.replace(/\/$/, "") || "/";
  const hasAbout = !!data.about, hasReviews = data.reviews.quotes.length > 0;
  // The footer's links: About and Reviews open their side panels, then Contact, FAQ and the legal pages.
  const footLinks = (cls: string) => [
    ...(hasAbout ? [<button key="about" type="button" onClick={() => setPanel("about")} className={`${cls} text-left`}>About</button>] : []),
    ...(hasReviews ? [<button key="reviews" type="button" onClick={() => setPanel("reviews")} className={`${cls} text-left`}>Reviews</button>] : []),
    ...[{ href: "/contact", title: "Contact" }, { href: "/faq", title: "FAQ" }, ...data.legal.map((l) => ({ href: `/policies/${l.slug}`, title: l.title }))].map((l) => (
      // the current page reads in ink and underlined; hover dims the label (so current and hovered never look the same)
      <a key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined} className={`${cls} aria-[current=page]:text-foreground aria-[current=page]:underline aria-[current=page]:underline-offset-4`}>{l.title}</a>
    )),
  ];
  // Contact is a page of its own (About and Reviews stay side panels): a link styled like the panel buttons.
  const contactLink = <a href="/contact" aria-current={page === "contact" ? "page" : undefined} className="hdr-btn inline-flex h-8 items-center rounded-full px-1.5 no-underline sm:px-3">Contact</a>;
  // The Home title: top left under the header, the welcome text below it; the products start well below (Grid) or sit
  // at the foot of the screen (Strip, where the title stays in place while the ribbon moves).
  // One H1 per page: the Home title is the H1, except while a product is open (its name is then the page's H1).
  const IntroTitle = (open ? "h2" : "h1") as "h1";
  const intro = (
    <div data-intro className="fade-on-open wrap pt-(--gutter)">
      {/* a big display title (6.25vw: about 95px on a 1520 screen), tight leading and tracking; one short line under it */}
      <IntroTitle className="text-[clamp(2.75rem,6.25vw,6.25rem)] leading-[0.95] tracking-[-0.035em]">{data.intro.title ?? businessName}</IntroTitle>
      {data.intro.body && <p className="mt-2 max-w-[36rem] text-base leading-[1.35] lg:mt-2 lg:text-lg lg:leading-[1.35]">{data.intro.body}</p>}
    </div>
  );

  return (
    <div className="overflow-x-clip">
      <div className={`store-shell ${panel ? "is-pushed" : ""}`}>
        <header className="sticky top-0 z-40 bg-secondary">
          {/* one compact row at every width: wordmark · About · Reviews · Contact · cart */}
          <div className="wrap flex h-(--header-h) items-center gap-1 sm:gap-2">
            <a href="/" onClick={(e) => { if (open) { e.preventDefault(); close(); } }} className="text-btn inline-flex min-h-11 min-w-0 items-center truncate whitespace-nowrap font-display text-base tracking-tight text-foreground no-underline sm:text-lg lg:text-xl">{businessName}</a>
            <div className="ml-auto flex shrink-0 items-center text-sm sm:gap-1">
              {hasAbout && panelBtn("about", "About")}
              {hasReviews && panelBtn("reviews", "Reviews")}
              {contactLink}
            </div>
            <div className="shrink-0">{mounted && <CartButton />}</div>
          </div>
        </header>

        <main ref={main} id="main" aria-hidden={!!open || undefined} {...(open ? ({ inert: "" } as Record<string, string>) : {})} className={`catalog flex min-h-[calc(100svh-var(--store-header))] flex-col ${pinned ? "lg:pb-(--footer-h)" : ""} ${open && !closing ? "is-open" : ""}`}>
          {page === "content" ? (
            <div className="wrap pb-16 pt-(--gutter)">{children}</div>
          ) : page === "contact" ? (
            <section className="wrap grid gap-10 pb-16 pt-(--gutter) lg:grid-cols-12 lg:gap-16" aria-labelledby="contact-title">
              <div className="lg:col-span-5">
                <h1 id="contact-title" className="text-[clamp(2rem,1.2rem+2.6vw,3.25rem)] leading-[1.1] tracking-[-0.025em]">{data.contact.title}</h1>
                {data.contact.details.length > 0 && (
                  <dl className="mt-(--gutter) grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                    {data.contact.details.map((d, k) => (
                      <div key={k}>
                        {d.title && <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{d.title}</dt>}
                        {d.body && <dd className="mt-1.5 whitespace-pre-line">{d.body}</dd>}
                      </div>
                    ))}
                  </dl>
                )}
              </div>
              <div className="lg:col-span-6 lg:col-start-7">{mounted && <WixForm formId={CONTACT_FORM_ID} idPrefix="ct" thanks="Thanks for submitting!" again="Send another message" />}</div>
            </section>
          ) : data.items.length === 0 ? (
            <p className="wrap py-24 text-lg">There are no products to show yet.</p>
          ) : view === "grid" ? (
            <>
            {intro}
            <ul className="wrap grid grid-cols-2 gap-(--grid-gap) pb-10 pt-(--catalog-top) md:grid-cols-3 lg:grid-cols-4">
              {data.items.map((it, k) => <li key={it.key}><Tile it={it} view="grid" onOpen={openItem} eager={k < 4} /></li>)}
            </ul>
            </>
          ) : (
            <div ref={stripOuter} style={{ height: `calc(100svh - var(--store-header) + ${swipe ? 0 : dist}px)` }}>
              <div ref={stripFrame} className={`${swipe ? "relative" : "sticky top-(--store-header)"} flex h-[calc(100svh-var(--store-header))] flex-col overflow-hidden`}>
                {intro}
                {/* Strip: same container and gap as the grid, but bigger cards: they fill the height from just under the title
                    down to the foot of the screen, and the width follows from 3:4. */}
                {/* below the tiles, room for the Grid / Strip bar fixed at the foot (20px + 44px) and a gap, so no caption sits under it */}
                <div className={`strip-wrap wrap min-h-0 flex-1 pb-20 pt-(--catalog-top) lg:pb-8 [@media(hover:none)]:pb-20 ${swipe ? "strip-swipe" : ""}`}>
                  <ul ref={strip} className="flex h-full w-max gap-(--grid-gap) will-change-transform" aria-label="Products">
                    {data.items.map((it) => (
                      <li key={it.key} className="strip-item h-full shrink-0"><Tile it={it} view="strip" onOpen={openItem} eager /></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          {/* the footer in the page's flow. Phone and tablet: every page link on its own row, the rows split by 20% black
              rules as wide as the content; desktop: the links in one line, the credit on the right. Contact and FAQ use it
              on phone and tablet too (their fixed bar is desktop only), so it sits at the foot of the screen there. */}
          <footer className={`fade-on-open wrap mt-auto flex flex-col gap-4 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between lg:gap-2 ${pinned ? "pb-(--gutter) lg:hidden" : "pb-24"}`}>
            <nav aria-label="Pages" className="flex flex-col divide-y divide-foreground/20 lg:-ml-2 lg:flex-row lg:flex-wrap lg:divide-y-0">
              {footLinks("text-btn inline-flex h-11 shrink-0 items-center no-underline lg:h-9 lg:px-2")}
            </nav>
            {data.credit && <p>{data.credit}</p>}
          </footer>
        </main>

        {open?.kind === "product" && detail && <ProductStage key={detail.id} detail={detail} media={data.choiceMedia[open.slug] ?? {}} pick={open.pick} onClose={close} from={fly} closing={closing} />}
        {open?.kind === "gift" && data.gift && <GiftStage product={data.gift} title={data.giftTitle} intro={data.giftIntro} onClose={close} from={fly} closing={closing} />}
        {open && !(detail || (open.kind === "gift" && data.gift)) && (
          <div className="fixed inset-x-0 top-(--store-header) z-30 flex flex-col items-center gap-4 p-10 text-center">
            <p className="text-lg">This item isn’t available anymore.</p>
            <button type="button" onClick={close} className="btn btn-secondary">Back to the store</button>
          </div>
        )}
      </div>

      {/* the Grid / Strip bar, fixed at the foot of the screen, as tall as the Wix badge beside it (44px) and level with it;
          on a narrow phone it sits at the left gutter, since the badge (bottom right) reaches past the middle there */}
      {!page && <div role="group" aria-label="Layout" className={`view-bar fixed bottom-5 left-1/2 z-[44] flex -translate-x-1/2 gap-1 max-sm:left-(--gutter) max-sm:translate-x-0 rounded-full bg-background p-1 shadow-[0_0_0_1px_var(--color-border),0_8px_24px_rgb(0_0_0/0.08)] ${open ? "pointer-events-none opacity-0" : ""}`}>
        {toggle("grid", "Grid", gridIcon)}
        {toggle("strip", "Strip", stripIcon)}
      </div>}

      {/* Contact only: the footer as a compact bar fixed at the foot of the screen at every height (the header's mirror):
          pages on the left (a phone scrolls them sideways), the credit on the right */}
      {pinned && <footer className={`fixed inset-x-0 bottom-0 z-[43] hidden h-(--footer-h) lg:block bg-background transition-opacity duration-[420ms] ${open && !closing ? "pointer-events-none opacity-0" : ""}`}>
        <div className="wrap flex h-full items-center gap-6 text-sm text-muted-foreground">
          <nav aria-label="Pages" className="-ml-2 flex min-w-0 flex-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {footLinks("text-btn inline-flex h-9 shrink-0 items-center px-2 no-underline")}
          </nav>
          {data.credit && <p className="hidden shrink-0 md:block">{data.credit}</p>}
        </div>
      </footer>}

      {/* the dim layer over the pushed site; a click on it closes the panel */}
      <button type="button" tabIndex={-1} aria-hidden="true" data-keep-live onClick={() => setPanel(null)} className={`dim fixed inset-0 z-[45] bg-foreground/40 ${panel ? "opacity-100" : "pointer-events-none opacity-0"}`} />

      {hasAbout && (
        <Drawer open={panel === "about"} title={data.about!.title ?? "About"} onClose={() => setPanel(null)}>
          {data.about!.image && (
            <div className="mb-6 aspect-square overflow-hidden rounded-card bg-muted">
              <img {...imgAttrs(data.about!.image, "26rem", 1)} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          {data.about!.body && <p className="text-lg leading-[1.35] text-muted-foreground">{data.about!.body}</p>}
          {data.about!.benefits.length > 0 && (
            <div className="mt-8">
              {data.about!.benefitsTitle && <h3 className="mb-3 text-h3">{data.about!.benefitsTitle}</h3>}
              <ul className="flex flex-col gap-3">
                {data.about!.benefits.map((b, i) => (
                  <li key={i} className="flex gap-3"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mt-0.5 shrink-0" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg><span>{b}</span></li>
                ))}
              </ul>
            </div>
          )}
        </Drawer>
      )}
      {hasReviews && (
        <Drawer open={panel === "reviews"} title={data.reviews.title} onClose={() => setPanel(null)}>
          <ul className="flex flex-col gap-3">
            {data.reviews.quotes.map((q, i) => (
              <li key={i}>
                <figure className="rounded-card bg-secondary p-5">
                  <blockquote className="leading-relaxed">{`“${q.quote}”`}</blockquote>
                  <figcaption className="mt-4 text-sm text-muted-foreground">{q.name}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </Drawer>
      )}

    </div>
  );
}
