// Full-screen photo viewer for the open product: every photo in a horizontal rail, one per screen (swipe on touch,
// arrows or the keyboard elsewhere), a counter and Close in the top corners. Desktop: the photo is exactly as tall as
// the window (top and bottom edges touch it) and grows smoothly out of the product photo on open, shrinking back into
// it on close (FLIP; both are 3:4, so one uniform scale). Rendered into <body> so no
// transformed ancestor (the side-panel push) can trap its fixed position. Escape closes the viewer only, not the product.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { holdFocus } from "../../lib/a11y";
import { imgAttrs } from "../../wix/media";
import { ChevronLeft, ChevronRight, CloseIcon } from "../Icons";

const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
const wide = () => matchMedia("(min-width: 1024px)").matches;

export default function Lightbox({ urls, start, name, onClose, source, sync }: {
  urls: string[]; start: number; name: string; onClose: (at: number) => void;
  /** the product photo k on the page (desktop), to grow out of and shrink back into */
  source?: (k: number) => HTMLElement | null;
  /** bring the page's gallery to photo k (before the viewer shrinks back into it) */
  sync?: (k: number) => void;
}) {
  const [i, setI] = useState(start);
  const rail = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const chrome = useRef<HTMLDivElement>(null);
  const leaving = useRef(false);
  const photo = (k: number) => rail.current?.querySelectorAll<HTMLImageElement>(".lightbox-photo")[k] ?? null;
  // the transform that puts the viewer's photo exactly over the page's photo
  const offset = (to: DOMRect, from: DOMRect) => `translate3d(${from.left - to.left}px, ${from.top - to.top}px, 0) scale(${from.width / to.width})`;

  const close = () => {
    if (leaving.current) return;
    leaving.current = true;
    const k = iRef.current;
    sync?.(k);
    const img = photo(k), src = source?.(k);
    if (!wide() || !img || !src) { onClose(k); return; }
    const to = img.getBoundingClientRect(), from = src.getBoundingClientRect();
    src.style.visibility = "hidden";
    const o = { duration: 460, easing: EASE, fill: "forwards" as const };
    chrome.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "forwards" });
    bg.current?.animate([{ opacity: 1 }, { opacity: 0 }], o);
    img.animate([{ transform: "none", borderRadius: "0px" }, { transform: offset(to, from), borderRadius: `calc(var(--radius-stage) * ${to.width / from.width})` }], o)
      .finished.finally(() => { src.style.visibility = ""; onClose(k); });
  };
  const closeRef = useRef<HTMLButtonElement>(null);
  const iRef = useRef(i);
  iRef.current = i;

  const go = (k: number, smooth = true) => {
    const r = rail.current;
    if (!r) return;
    const n = Math.max(0, Math.min(urls.length - 1, k));
    r.scrollTo({ left: n * r.clientWidth, behavior: smooth ? "smooth" : "auto" });
    setI(n);
  };
  const onScroll = () => {
    const r = rail.current;
    if (r) setI(Math.max(0, Math.min(urls.length - 1, Math.round(r.scrollLeft / r.clientWidth))));
  };

  useLayoutEffect(() => {
    const r = rail.current;
    if (r) r.scrollLeft = start * r.clientWidth;
    const img = photo(start), src = source?.(start);
    if (!wide() || !img || !src) { root.current?.classList.add("lightbox--fade"); return; }
    const to = img.getBoundingClientRect(), from = src.getBoundingClientRect();
    src.style.visibility = "hidden";
    const o = { duration: 560, easing: EASE };
    bg.current?.animate([{ opacity: 0 }, { opacity: 1 }], o);
    chrome.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: 300, easing: "ease-out", fill: "backwards" });
    img.animate([{ transform: offset(to, from), borderRadius: `calc(var(--radius-stage) * ${to.width / from.width})` }, { transform: "none", borderRadius: "0px" }], o)
      .finished.finally(() => { src.style.visibility = ""; });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    // a modal: Tab stays in the viewer, the page behind is inert
    const release = root.current ? holdFocus(root.current, null) : () => {};
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopImmediatePropagation(); e.preventDefault(); close(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); go(iRef.current + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(iRef.current - 1); }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      release();
      html.style.overflow = prevOverflow;
      prevFocus?.focus?.({ preventScroll: true });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const navBtn = "lightbox-nav icon-btn absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-foreground hover:bg-transparent disabled:pointer-events-none disabled:opacity-0 md:inline-flex";

  return createPortal(
    <div ref={root} className="lightbox fixed inset-0 z-[80] text-foreground" role="dialog" aria-modal="true" aria-label={`${name} photos, full screen`}>
      <div ref={bg} className="absolute inset-0 bg-background" />
      <div ref={rail} onScroll={onScroll} className="relative flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {urls.map((u, k) => (
          <div key={u} className="relative h-full w-full shrink-0 snap-center snap-always lg:flex lg:justify-center" aria-hidden={k !== i}>
            <img {...imgAttrs(u, "100vw", 4 / 3)} loading={Math.abs(k - start) <= 1 ? "eager" : "lazy"} alt=""
              className="lightbox-photo absolute inset-0 m-auto max-h-[calc(100%-7rem)] max-w-[calc(100%-2*var(--gutter))] origin-top-left object-contain md:max-w-[calc(100%-9rem)] lg:static lg:m-0 lg:aspect-[3/4] lg:h-full lg:max-h-none lg:w-auto lg:max-w-none lg:object-cover" />
          </div>
        ))}
      </div>
      <div ref={chrome}>
      <button ref={closeRef} type="button" onClick={close} aria-label="Close full screen"
        className="close-btn icon-btn absolute right-(--gutter) top-(--gutter) z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-muted text-foreground hover:bg-transparent">
        <CloseIcon size={22} />
      </button>
      {urls.length > 1 && (
        <>
          <button type="button" onClick={() => go(i - 1)} disabled={i === 0} aria-label="Previous photo" className={`${navBtn} left-(--gutter)`}><ChevronLeft size={22} /></button>
          <button type="button" onClick={() => go(i + 1)} disabled={i === urls.length - 1} aria-label="Next photo" className={`${navBtn} right-(--gutter)`}><ChevronRight size={22} /></button>
          <p className="absolute left-(--gutter) top-(--gutter) z-10 flex h-11 items-center text-sm tabular-nums" aria-live="polite">{i + 1} / {urls.length}</p>
        </>
      )}
      </div>
    </div>,
    document.body,
  );
}
