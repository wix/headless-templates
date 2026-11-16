// The product page island. Selection, variant resolution and the add gate all live in the shipped useProductDetail / OptionPicker —
// this file is layout only.
//
// Layout (desktop, ≥1024): the photos run down the LEFT half as a flush column (3:4 frames, one under the other, to the window's left
// edge); the buy column sits on the right and stays pinned under the header while the photos scroll: breadcrumb, name + price on one
// line, a short summary, the shipped OptionPicker (options, quantity, add), then rows for the product's details — each row opens a
// side drawer (like the cart) with the full text. On a phone the photos are a swipe track with a "1 / N" indicator and the buy
// column follows; a full-width buy bar takes over once the in-flow button has scrolled away.
import { useEffect, useRef, useState } from "react";
import { useProductDetail } from "../hooks/storefront/useProductDetail";
import { imgAttrs, mediaKey } from "../wix/media";
import type { ProductDetail } from "../wix/storefront/types";
import { ChevronLeft, ChevronRight } from "./Icons";
import OptionPicker from "./storefront/OptionPicker";
import { titleCase } from "../lib/text";
import CloseButton from "./CloseButton";

const FRAME = "(min-width: 1024px) 51vw, 100vw";

function Gallery({ urls, name, wanted }: { urls: string[]; name: string; wanted: string | null }) {
  const [i, setI] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const frames = useRef<(HTMLDivElement | null)[]>([]);

  // A colour pick brings its own photo into view.
  useEffect(() => {
    if (!wanted) return;
    const k = urls.findIndex((u) => mediaKey(u) === mediaKey(wanted));
    if (k < 0) return;
    if (window.matchMedia("(min-width: 1024px)").matches) frames.current[k]?.scrollIntoView({ behavior: "smooth", block: "start" });
    else go(k);
  }, [wanted]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (k: number) => {
    setI(k);
    const el = track.current;
    if (el) el.scrollTo({ left: k * el.clientWidth, behavior: "smooth" });
  };
  const onScroll = () => {
    const el = track.current;
    if (el && el.clientWidth) setI(Math.round(el.scrollLeft / el.clientWidth));
  };

  if (!urls.length) return <div className="aspect-[3/4] bg-muted" role="img" aria-label={name} />;
  return (
    <>
      {/* phone + tablet: a swipe track of 3:4 frames, full width */}
      <div className="relative lg:hidden">
        <div ref={track} onScroll={onScroll} className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" tabIndex={0} aria-label={`${name} photos`}>
          {urls.map((u, k) => (
            <div key={u} className="aspect-[3/4] max-h-[75svh] w-full shrink-0 snap-center bg-muted">
              <img {...imgAttrs(u, "100vw", 1.333)} loading={k === 0 ? "eager" : "lazy"} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
        {urls.length > 1 && <span className="pointer-events-none absolute bottom-3 right-(--gutter) rounded-control bg-background/90 px-2.5 py-1 text-xs font-semibold">{i + 1} / {urls.length}</span>}
      </div>

      {/* desktop: every photo in a flush column, the grid's card gap between them */}
      <div className="hidden flex-col gap-(--card-gap) lg:flex">
        {urls.map((u, k) => (
          <div key={u} ref={(el) => { frames.current[k] = el; }} className="aspect-[3/4] scroll-mt-(--header-h) overflow-hidden bg-muted">
            <img {...imgAttrs(u, FRAME, 1.333)} loading={k < 2 ? "eager" : "lazy"} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    </>
  );
}

const plain = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

export default function ProductDetailView({ initial }: { initial: ProductDetail }) {
  const d = useProductDetail({ initial });
  const picker = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const [barVisible, setBarVisible] = useState(false);
  const [drawer, setDrawer] = useState<string | null>(null); // the details row currently open in the side drawer

  // The buy bar shows only once the in-flow purchase block has left the screen.
  useEffect(() => {
    const el = picker.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setBarVisible(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [d.product?.id]);

  // The drawer is an overlay: scroll lock, Escape, focus in and back (same contract as the cart).
  useEffect(() => {
    if (!drawer) return;
    const opener = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(null);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; if (opener instanceof HTMLElement) opener.focus(); };
  }, [drawer]);

  if (d.notFound) return <p className="wrap section">This product doesn’t exist anymore.</p>;
  if (!d.product) return <div className="wrap section" aria-busy="true"><div className="aspect-square animate-pulse bg-muted lg:aspect-[16/9]" /></div>;

  const p = d.product;
  const crumbs = p.breadcrumbs ?? [];
  const barLabel = d.canAdd ? (d.isPreorder ? "Pre-Order" : "Add to Cart") : d.blockedReason || "Choose Options";
  const onBar = () => (d.canAdd ? void d.add() : picker.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  const summary = p.descriptionHtml ? plain(p.descriptionHtml) : "";
  // The rows: the description first, then every info section the merchant wrote.
  const rows: { key: string; title: string; html: string }[] = [
    ...(p.descriptionHtml ? [{ key: "details", title: "Product details", html: p.descriptionHtml }] : []),
    ...p.infoSections.map((s) => ({ key: s.title, title: s.title, html: s.html })),
  ];
  const open = rows.find((r) => r.key === drawer) ?? null;

  return (
    <div className="pb-(--section-y) lg:pb-0">
      {crumbs.length > 0 && (
        // phone: ONE line — a back link to the nearest category (a wrapping trail would push the buy button below the fold)
        <a href={`/category/${crumbs[crumbs.length - 1].slug}`} className="mx-(--gutter) inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground no-underline transition-opacity hover:opacity-60 lg:hidden">
          <ChevronLeft size={16} /> {crumbs[crumbs.length - 1].name}
        </a>
      )}

      <div className="lg:grid lg:grid-cols-[51fr_49fr]">
        {/* the photo column keeps the page gutter on its left and top, like every other element on the page */}
        <div className="lg:pl-(--gutter) lg:pt-(--gutter)"><Gallery urls={p.gallery} name={p.name} wanted={d.imageUrl} /></div>

        {/* the buy column: pinned under the header while the photos scroll (it scrolls itself if it is taller than the window) */}
        <div className="lg:sticky lg:top-(--header-h) lg:max-h-[calc(100svh-var(--header-h))] lg:self-start lg:overflow-y-auto">
          <div className="flex flex-col gap-5 px-(--gutter) pb-8 pt-5 lg:pt-(--gutter)">
            {crumbs.length > 0 && (
              <nav aria-label="Breadcrumb" className="hidden text-sm text-muted-foreground lg:block">
                <ol className="flex flex-wrap items-center gap-x-2">
                  <li><a href="/" className="no-underline transition-opacity hover:opacity-60">Home</a></li>
                  {crumbs.map((c) => <li key={c.id} className="flex items-center gap-2"><span aria-hidden="true">›</span><a href={`/category/${c.slug}`} className="no-underline transition-opacity hover:opacity-60">{c.name}</a></li>)}
                </ol>
              </nav>
            )}

            <header className="flex flex-col gap-2">
              {p.ribbons.length > 0 && <div className="flex flex-wrap gap-1.5">{p.ribbons.map((r) => <span key={r} className="ribbon bg-secondary">{r}</span>)}</div>}
              {/* name and price share one line, the price at the right edge */}
              <div className="flex items-baseline justify-between gap-4">
                <h1 className="text-h3">{p.name}</h1>
                <p className="shrink-0 whitespace-nowrap text-base font-medium">
                  <span>{d.price}</span>
                  {d.compareAtPrice && <span className="ml-2 font-normal text-muted-foreground"><span className="sr-only">Was </span><s>{d.compareAtPrice}</s></span>}
                </p>
              </div>
              {d.pricePerUnit && <p className="text-sm text-muted-foreground">{d.pricePerUnit}</p>}
              {p.discountNames.length > 0 && <p className="text-sm text-muted-foreground">{p.discountNames.join(", ")}</p>}
              {summary && <p className="line-clamp-3 text-muted-foreground">{summary}</p>}
            </header>

            {/* A product with nothing buyable says so plainly and points onward — "Choose Size" over a row of
                disabled sizes is a dead end. (Pre-order products report OUT_OF_STOCK too, but are buyable.) */}
            {p.availability === "OUT_OF_STOCK" && !p.preorder && !d.isPreorder && (
              <p role="status" className="bg-secondary p-4 text-sm">
                <strong className="font-semibold">Out of stock.</strong> This product isn’t available right now.
                {crumbs.length > 0 && <> <a href={`/category/${crumbs[crumbs.length - 1].slug}`} className="underline underline-offset-4 transition-opacity hover:opacity-60">See more in {crumbs[crumbs.length - 1].name}</a></>}
              </p>
            )}
            <div ref={picker} id="purchase" className="scroll-mt-24"><OptionPicker detail={d} showQuantity /></div>

            {/* Details: rows that open the side drawer (the rows are the page's only hairlines: identical rows) */}
            {rows.length > 0 && (
              <ul className="mt-2 [&>li:hover+li]:border-t-transparent" aria-label="Product information">
                {rows.map((r) => (
                  <li key={r.key} className="border-t border-border last:border-b hover:border-t-transparent hover:last:border-b-transparent">
                    <button type="button" onClick={() => setDrawer(r.key)} aria-haspopup="dialog" className="flex min-h-14 w-full items-center justify-between gap-4 px-0 text-left text-base font-medium transition-[background-color,padding] duration-[160ms] hover:bg-secondary hover:px-3">
                      {titleCase(r.title)}<ChevronRight size={18} className="shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Side drawer with the full text of the chosen row — the same shell as the cart: scrim, panel from the right, close ×. */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-foreground/40" onClick={() => setDrawer(null)}>
          <aside ref={drawerRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={open.title} onClick={(e) => e.stopPropagation()}
            className="filter-drawer flex h-full w-[min(26rem,100%)] flex-col bg-background text-foreground outline-none">
            <div className="flex h-16 shrink-0 items-center justify-between px-6">
              <h2 className="text-h3">{open.title}</h2>
              <CloseButton label="Close" onClick={() => setDrawer(null)} className="-mr-2.5" />
            </div>
            <div className="prose-site min-h-0 flex-1 overflow-y-auto px-6 py-5" dangerouslySetInnerHTML={{ __html: open.html }} />
          </aside>
        </div>
      )}

      {/* Phone buy bar: price + the one action, reachable once the in-flow button has scrolled away. */}
      <div aria-hidden={!barVisible} className={`fixed inset-x-0 bottom-0 z-30 flex items-center gap-4 bg-background px-(--gutter) pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-1px_0_var(--color-border)] transition-transform duration-[260ms] md:hidden ${barVisible ? "translate-y-0" : "translate-y-full"}`}>
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{p.name}</p><p className="text-sm text-muted-foreground">{d.price}</p></div>
        <button type="button" tabIndex={barVisible ? 0 : -1} onClick={onBar} disabled={d.adding} className={`btn shrink-0 ${d.canAdd ? "btn-primary" : "btn-secondary"} disabled:opacity-50`}>{d.adding ? "Adding…" : barLabel}</button>
      </div>
    </div>
  );
}
