// Header search. The trigger (an icon on phones, a field-shaped button from lg up) opens a full-width panel
// that hangs from the top of the page over a dimmed scrim:
//   • empty field  → "Trending now": the store's departments as image tiles (a way to start browsing)
//   • typing       → live product results (Wix search across the whole catalog, debounced), each a link
//   • Enter / "View all results" → /shop?q=…, the full listing (useShop reads ?q=)
// The catalog module is imported on first use, so the header ships without the SDK weight.
import { useEffect, useId, useRef, useState } from "react";
import type { ProductSummary } from "../wix/storefront/types";
import { SearchIcon } from "./Icons";
import CloseButton from "./CloseButton";

export type TrendingTile = { name: string; href: string; imageUrl: string };

const escapeRe = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** "Related terms" for the typed query, derived from what the catalog actually returned: phrases around the matching word in the
 *  product names ("ankle socks", "sporty ankle socks", "socks set"), most frequent first, then matching categories. */
function relatedTerms(query: string, names: string[], categories: string[]): string[] {
  const q = query.trim().toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);
  const last = tokens[tokens.length - 1] ?? "";
  const count = new Map<string, number>();
  const add = (words: string[]) => {
    const phrase = words.join(" ");
    if (phrase === q || words.some((w) => /^\d+$/.test(w))) return;
    count.set(phrase, (count.get(phrase) ?? 0) + 1);
  };
  for (const name of names) {
    const w = name.toLowerCase().replace(/[^\p{L}\p{N}\s'-]/gu, " ").split(/\s+/).filter(Boolean);
    const i = w.findIndex((x) => x.includes(last));
    if (i < 0) continue;
    if (i >= 1) add([w[i - 1], w[i]]);
    if (i >= 2) add([w[i - 2], w[i - 1], w[i]]);
    if (i + 1 < w.length) add([w[i], w[i + 1]]);
  }
  const phrases = [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].length - b[0].length).map(([k]) => k);
  const cats = categories.map((c) => c.toLowerCase()).filter((c) => c !== q && tokens.some((t) => c.includes(t)));
  return [q, ...phrases, ...cats].filter((x, i, a) => a.indexOf(x) === i).slice(0, 8);
}

/** The term with the user's words set heavier, the rest regular (so "ankle socks" reads "ankle **socks**" like the reference). */
function Highlighted({ text, tokens }: { text: string; tokens: string[] }) {
  const re = new RegExp(`(${tokens.map(escapeRe).join("|")})`, "gi");
  return <>{text.split(re).map((part, i) => (i % 2 ? <strong key={i} className="font-semibold">{part}</strong> : <span key={i}>{part}</span>))}</>;
}
const MIN_CHARS = 2;
const RESULTS = 8;

export default function HeaderSearch({ initial = "", tiles = [], brand: BUSINESS_NAME = "" }: { initial?: string; tiles?: TrendingTile[]; brand?: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(initial);
  const [results, setResults] = useState<ProductSummary[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const term = q.trim();
  const searching = term.length >= MIN_CHARS;

  // open: lock page scroll, focus the field, Escape closes
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [open]);

  // live results: debounced; a stale response (the term moved on) is dropped
  useEffect(() => {
    if (!open || !searching) { setResults(null); setTotal(null); setFailed(false); return; }
    let stale = false;
    setResults(null);
    setFailed(false);
    const t = window.setTimeout(async () => {
      try {
        const { searchCatalog } = await import("../wix/storefront/catalog");
        const res = await searchCatalog({ limit: RESULTS, search: term });
        if (!stale) { setResults(res.products); setTotal(res.total); }
      } catch (err) {
        console.error("search: request failed", err);if (!stale) { setResults([]); setFailed(true); }
      }
    }, 250);
    return () => { stale = true; window.clearTimeout(t); };
  }, [open, searching, term]);

  const close = () => { setOpen(false); trigger.current?.focus(); };
  const shopUrl = `/shop?q=${encodeURIComponent(term)}`;

  return (
    <>
      <button ref={trigger} type="button" aria-label="Search" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}
        className="hbtn inline-flex h-11 w-11 items-center justify-center text-foreground lg:h-9 lg:w-9">
        <SearchIcon />
      </button>

      {open && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <div className="absolute inset-0 bg-foreground/40" onClick={close} aria-hidden="true" />
          <div className="relative max-h-[92svh] overflow-y-auto bg-background">
            <h2 id={titleId} className="sr-only">Search</h2>
            {/* Phone / tablet: logo + × on the first row, the field on its own row below, the full content width. From lg up: one row. */}
            <div className="wrap flex flex-wrap items-center gap-x-3 lg:h-[calc(var(--header-h)+2rem)] lg:flex-nowrap lg:gap-x-8 lg:pt-4">
              <a href="/" className="logo order-1 mr-auto inline-flex h-(--header-h) shrink-0 items-center font-display text-base font-bold tracking-tight text-foreground no-underline lg:mr-0 lg:h-auto">{BUSINESS_NAME}</a>
              <CloseButton label="Close search" onClick={close} className="order-2 -mr-2.5 lg:order-3 lg:mr-0" />
              <form action="/shop" method="get" role="search" className="order-3 mb-3 w-full lg:order-2 lg:mx-auto lg:mb-0 lg:max-w-[48rem]">
                <label htmlFor="site-search" className="sr-only">Search products</label>
                <div className="search-box relative">
                  <SearchIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input id="site-search" ref={input} name="q" type="search" value={q} onChange={(e) => setQ(e.target.value)}
                    placeholder="Start searching…" autoComplete="off"
                    style={{ paddingLeft: "2.5rem" }} className="w-full text-foreground" />
                </div>
              </form>
            </div>

            <div className="wrap pb-10 pt-4 lg:pb-14 lg:pt-8" aria-live="polite">
              {!searching && tiles.length > 0 && (
                <section aria-label="Trending now">
                  <p className="text-sm text-muted-foreground">Trending now</p>
                  <ul className="mt-4 grid grid-cols-2 gap-x-(--card-gap) gap-y-(--card-gap-y) lg:grid-cols-4">
                    {tiles.slice(0, 4).map((t) => (
                      <li key={t.href}>
                        <a href={t.href} className="group block text-foreground no-underline">
                          <div className="aspect-[3/4] overflow-hidden bg-muted">
                            {t.imageUrl && <img src={t.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />}
                          </div>
                          <p className="mt-3 text-base transition-opacity group-hover:opacity-60">{t.name}</p>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {term.length > 0 && !searching && <p className="text-sm text-muted-foreground">Keep typing — at least {MIN_CHARS} characters.</p>}

              {searching && results === null && (
                <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-x-10" aria-busy="true" aria-label="Searching">
                  <div className="hidden space-y-3 lg:block">{Array.from({ length: 5 }, (_, i) => <div key={i} className="h-5 w-2/3 animate-pulse bg-muted" />)}</div>
                  <ul className="grid grid-cols-2 gap-x-(--card-gap) gap-y-(--card-gap-y) lg:grid-cols-4">
                    {Array.from({ length: 4 }, (_, i) => (
                      <li key={i}><div className="aspect-[4/5] animate-pulse bg-muted" /><div className="mt-3 h-4 w-3/4 animate-pulse bg-muted" /></li>
                    ))}
                  </ul>
                </div>
              )}

              {searching && results && results.length > 0 && (
                // Typed-query layout: "Related terms" on the left (a two-column list), "Suggested items" on the right (four small cards).
                <section aria-label="Results" className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-x-10">
                  <div>
                    <h3 className="font-sans text-base font-medium tracking-normal">Related terms</h3>
                    <ul className="mt-4 grid grid-cols-2 gap-x-6">
                      {relatedTerms(term, results.map((p) => p.name), tiles.map((t) => t.name)).map((t) => (
                        <li key={t}>
                          <a href={`/shop?q=${encodeURIComponent(t)}`} className="inline-block py-1.5 text-base text-foreground no-underline transition-opacity hover:opacity-60">
                            <Highlighted text={t} tokens={term.toLowerCase().split(/\s+/).filter(Boolean)} />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-sans text-base font-medium tracking-normal">Suggested items</h3>
                    <ul className="mt-4 grid grid-cols-2 gap-x-(--card-gap) gap-y-(--card-gap-y) lg:grid-cols-4">
                      {results.slice(0, 4).map((p) => (
                        <li key={p.id}>
                          <a href={`/products/${encodeURIComponent(p.slug)}`} className="group block text-foreground no-underline">
                            <div className="aspect-[4/5] overflow-hidden bg-muted">
                              {p.imageUrl && <img src={p.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />}
                            </div>
                            <p className="mt-2 break-words text-sm leading-snug transition-opacity group-hover:opacity-60">{p.name}</p>
                            <p className="mt-0.5 text-sm font-medium">{p.price}</p>
                          </a>
                        </li>
                      ))}
                    </ul>
                    <a href={shopUrl} className="btn btn-outline mt-8">View All Results</a>
                  </div>
                </section>
              )}

              {searching && results && results.length === 0 && (
                <div className="py-6">
                  <p className="text-lg font-medium">{failed ? "Search is unavailable right now" : `Nothing found for “${term}”`}</p>
                  <p className="mt-2 text-muted-foreground">{failed ? "Try again in a moment." : "Check the spelling, or browse everything."}</p>
                  <a href="/shop" className="btn btn-secondary mt-6">Shop All Products</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
