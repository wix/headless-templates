// The product page — the site's Wix Stores surface and the end of every "Buy Now".
// Same design as the home page's buy showcase: on desktop one pinned frame (name, description and
// price on the left, the purchase column on the right) while the product photos scroll through the
// middle with a 10px gap; on phones everything stacks and the photos swipe. Selection, variant
// resolution, stock and add-to-cart live in useProductDetail / BuyPanelView (or the full
// OptionPicker for products with plans or free-text options). Product details (info sections) follow
// below the pinned frame.
import { useEffect, useRef, useState } from "react";
import { useProductDetail } from "../../hooks/storefront/useProductDetail";
import OptionPicker from "./OptionPicker";
import { BuyPanelView } from "../BuyPanel";
import { imgSrc } from "../../wix/media";
import type { ProductDetail } from "../../wix/storefront/types";

const srcset = (url: string, ratio = 1.3333) =>
  [480, 768, 1080, 1440].map((w) => `${imgSrc(url, w, Math.round(w * ratio))} ${w}w`).join(", ");

export default function ProductDetailView(props: { initial?: ProductDetail | null; slug?: string }) {
  const d = useProductDetail(props);
  const [buyVisible, setBuyVisible] = useState(true);
  const buyRef = useRef<HTMLDivElement>(null);
  const sec = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const win = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const gallery = d.product?.gallery ?? [];

  // Mobile buy bar: shown only while the in-flow purchase controls are off-screen.
  useEffect(() => {
    const el = buyRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setBuyVisible(e.isIntersecting || (e.boundingClientRect.top > 0 && e.boundingClientRect.top < window.innerHeight)), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [d.product?.id]);

  // Desktop: the frame is sticky for the section's extra height; that scroll slides the photo
  // track up one photo (+ the 10px gap) per screen while the side columns stay put.
  useEffect(() => {
    const wide = matchMedia("(min-width: 1024px)");
    let raf = 0;
    const slide = () => {
      raf = 0;
      const s = sec.current, f = frame.current, w = win.current, t = track.current;
      if (!s || !f || !w || !t) return;
      if (!wide.matches) { t.style.transform = ""; return; }
      const r = s.getBoundingClientRect();
      const hdr = parseFloat(getComputedStyle(f).top) || 0;
      const dist = r.height - f.offsetHeight;
      const k = dist > 0 ? Math.min(1, Math.max(0, (hdr - r.top) / dist)) : 0;
      const gap = parseFloat(getComputedStyle(t).rowGap) || 0;
      t.style.transform = `translate3d(0, ${-k * (t.children.length - 1) * (w.offsetHeight + gap)}px, 0)`;
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(slide); };
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    slide();
    return () => { removeEventListener("scroll", queue); removeEventListener("resize", queue); cancelAnimationFrame(raf); };
  }, [gallery.length, d.product?.id]);

  if (d.notFound) {
    return (
      <div className="wrap section text-center">
        <h1 className="text-h2">This product isn't available</h1>
        <p className="mt-4 text-muted-foreground">It may have been removed or renamed.</p>
        <a href="/" className="btn btn-primary mt-8">Back to home</a>
      </div>
    );
  }
  if (!d.product) return <div className="wrap section"><div className="aspect-[3/4] max-h-[45vh] animate-pulse bg-secondary md:max-h-none md:w-1/2" /></div>;

  const p = d.product;
  const n = gallery.length;
  const fullPicker = d.plans.length > 0 || p.modifiers.length > 0; // controls BuyPanelView doesn't cover
  const purchase = fullPicker ? <OptionPicker detail={d} showQuantity /> : <BuyPanelView d={d} productUrl={`/products/${p.slug}`} />;

  return (
    <>
      <section ref={sec} className="relative bg-background lg:h-[calc(var(--n)*(100svh-var(--header-h)))]" style={{ ["--n" as string]: Math.max(1, n) }} aria-labelledby="pdp-title">
        <div ref={frame} className="flex flex-col gap-(--gutter) p-(--gutter) lg:sticky lg:top-(--header-h) lg:grid lg:h-[calc(100svh-var(--header-h))] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-(--gutter) lg:[&>*]:min-h-0">
          {/* left: name, description, price */}
          <div className="order-1 flex flex-col gap-6">
            {p.ribbons.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {p.ribbons.map((r) => <span key={r} className="rounded-control bg-secondary px-3 py-1 text-xs font-semibold">{r}</span>)}
              </div>
            )}
            <h1 id="pdp-title" className="text-h2">{p.name}</h1>
            {p.descriptionHtml && <div className="prose-site max-w-[44ch] text-muted-foreground" dangerouslySetInnerHTML={{ __html: p.descriptionHtml }} />}
            <div className="mt-4">
              <p className="flex flex-wrap items-baseline gap-x-3 font-display text-h2 font-semibold leading-none">
                <span className="tabular-nums">{d.price}</span>
                {d.compareAtPrice && <span className="text-lg font-normal text-muted-foreground tabular-nums"><span className="sr-only">Was </span><s>{d.compareAtPrice}</s></span>}
              </p>
              {d.pricePerUnit && <p className="mt-2 text-sm text-muted-foreground">{d.pricePerUnit}</p>}
              {p.discountNames.length > 0 && <p className="mt-3 text-muted-foreground">{p.discountNames.join(" · ")}</p>}
            </div>
          </div>

          {/* middle: photo window */}
          <div className="order-2 lg:h-full">
            <div ref={win} role="region" aria-label={`${p.name} images`} className="flex aspect-[3/4] w-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] lg:h-full lg:w-auto lg:snap-none lg:overflow-hidden">
              <div ref={track} className="flex h-full w-full shrink-0 lg:w-auto lg:flex-col lg:gap-[10px] lg:will-change-transform">
                {gallery.map((url, i) => (
                  <div key={url} className="aspect-[3/4] h-full shrink-0 snap-center overflow-hidden bg-secondary max-lg:w-full">
                    <img src={imgSrc(url, 1080, 1440)} srcSet={srcset(url)} sizes="(min-width: 1024px) 40vw, 100vw" alt=""
                      loading={i === 0 ? "eager" : "lazy"} decoding="async" className="h-full w-full object-cover" />
                  </div>
                ))}
                {n === 0 && <div className="h-full w-full bg-muted" aria-hidden="true" />}
              </div>
            </div>
          </div>

          {/* right: purchase controls */}
          <div ref={buyRef} id="purchase" className="order-3 flex flex-col gap-(--gutter)">
            {purchase}
            <p className="text-muted-foreground">Shipping and taxes are calculated at checkout.</p>
          </div>
        </div>
      </section>

      {p.infoSections.length > 0 && (
        <section className="bg-background" aria-label="Product details">
          <div className="wrap pb-(--section-y) lg:grid lg:grid-cols-[minmax(0,1fr)_var(--photo-w)_minmax(0,1fr)] lg:gap-x-(--gutter)">
            <div className="border-t border-border lg:col-start-2">
              {p.infoSections.map((s) => (
                <details key={s.title} className="group border-b border-border transition-colors duration-200 hover:bg-secondary open:bg-secondary">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 font-medium [&::-webkit-details-marker]:hidden">
                    {s.title}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="shrink-0 transition-transform duration-200 group-hover:scale-110 group-open:rotate-45"><path d="M8 2v12M2 8h12" /></svg>
                  </summary>
                  <div className="prose-site px-4 pb-6 text-muted-foreground" dangerouslySetInnerHTML={{ __html: s.html }} />
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Mobile buy bar ── appears once the in-flow controls have scrolled away. */}
      <div aria-hidden={buyVisible} {...(buyVisible ? { inert: "" } : {})}
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur transition-transform duration-[260ms] ease-(--ease-site) lg:hidden ${buyVisible ? "translate-y-full" : "translate-y-0"}`}>
        <div className="wrap flex items-center gap-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{p.name}</p>
            <p className="text-sm font-semibold tabular-nums">{d.price}</p>
          </div>
          {d.canAdd ? (
            <button type="button" disabled={d.adding} onClick={() => d.add().catch(() => {})} className="btn btn-primary shrink-0 disabled:opacity-50">
              {d.adding ? "Adding…" : d.isPreorder ? "Pre-order" : "Add to bag"}
            </button>
          ) : (
            <a href="#purchase" className="btn btn-primary shrink-0">{d.blockedReason ?? "Choose options"}</a>
          )}
        </div>
      </div>
    </>
  );
}
