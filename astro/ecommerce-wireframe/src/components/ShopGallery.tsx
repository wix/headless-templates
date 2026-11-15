// The gallery for /shop and /category/<slug>. Server renders the first page;
// this island re-queries Wix on every change (sort/filter/search/page) —
// never re-sorting a loaded slice. Desktop: a filter rail that commits
// immediately. Phone: a bottom sheet that stages changes until Apply.
import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import Overlay from "./Overlay";
import { IconFilter, IconClose } from "./Icons";

type Facet = { name: string; swatch: boolean; choices: { name: string; colorCode?: string; ids: string[] }[] };
type Filters = { sort: string; min: string; max: string; inStock: boolean; choices: string[]; q: string };
type Props = {
  categoryId?: string; initial: { products: any[]; nextCursor: string | null; count: number | null };
  initialFilters: Filters; facets: Facet[]; priceMin: number; priceMax: number; sortLabels: Record<string, string>;
};

const toParams = (f: Filters) => {
  const p = new URLSearchParams();
  if (f.sort && f.sort !== "featured") p.set("sort", f.sort);
  if (f.min) p.set("min", f.min);
  if (f.max) p.set("max", f.max);
  if (f.inStock) p.set("instock", "1");
  if (f.choices.length) p.set("choices", f.choices.join(","));
  if (f.q) p.set("q", f.q);
  return p;
};
const activeCount = (f: Filters) => (f.min ? 1 : 0) + (f.max ? 1 : 0) + (f.inStock ? 1 : 0) + f.choices.length;

// Two-handle price slider (monochrome). Drags locally; commits to the filters on release so the
// gallery re-queries once per gesture, not on every pixel.
function PriceRange({ min, max, lo, hi, currency, idPrefix, onCommit }: { min: number; max: number; lo: string; hi: string; currency: string; idPrefix: string; onCommit: (lo: number, hi: number) => void }) {
  const lo0 = Math.max(min, Math.min(max, lo ? Number(lo) : min)), hi0 = Math.max(min, Math.min(max, hi ? Number(hi) : max));
  const [a, setA] = useState(lo0), [b, setB] = useState(hi0);
  const fmt = (n: number) => new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  const pct = (n: number) => (max > min ? ((n - min) / (max - min)) * 100 : 0);
  const commit = () => onCommit(a, b);
  const handlers = { onPointerUp: commit, onKeyUp: commit, onTouchEnd: commit };
  return (
    <div className="prange">
      <p className="prange__value" aria-live="polite">{fmt(a)}–{fmt(b)}</p>
      <div className="prange__track" style={{ ["--a" as any]: `${pct(a)}%`, ["--b" as any]: `${pct(b)}%` }}>
        <input type="range" className="prange__input prange__input--lo" id={`${idPrefix}-min`} aria-label="Minimum price" min={min} max={max} step={1} value={a}
          onChange={(e) => setA(Math.min(Number(e.target.value), b))} {...handlers} />
        <input type="range" className="prange__input prange__input--hi" id={`${idPrefix}-max`} aria-label="Maximum price" min={min} max={max} step={1} value={b}
          onChange={(e) => setB(Math.max(Number(e.target.value), a))} {...handlers} />
      </div>
    </div>
  );
}

function FilterFields({ f, set, facets, priceMin, priceMax, idPrefix, currency }: { f: Filters; set: (p: Partial<Filters>) => void; facets: Facet[]; priceMin: number; priceMax: number; idPrefix: string; currency: string }) {
  const toggle = (ids: string[]) => {
    const on = ids.every((id) => f.choices.includes(id));
    set({ choices: on ? f.choices.filter((c) => !ids.includes(c)) : [...new Set([...f.choices, ...ids])] });
  };
  return (
    <div className="filters">
      <fieldset className="filters__group">
        <legend className="filters__legend">Price range</legend>
        <PriceRange key={`${f.min}|${f.max}`} min={priceMin} max={priceMax} lo={f.min} hi={f.max} currency={currency} idPrefix={idPrefix}
          onCommit={(lo, hi) => set({ min: lo <= priceMin ? "" : String(lo), max: hi >= priceMax ? "" : String(hi) })} />
      </fieldset>
      {facets.map((fc) => (
        <fieldset key={fc.name} className="filters__group">
          <legend className="filters__legend">{fc.name}</legend>
          <div className={fc.swatch ? "choice-row choice-row--swatches" : "choice-row"}>
            {fc.choices.map((c) => {
              const on = c.ids.every((id) => f.choices.includes(id));
              return fc.swatch ? (
                <button key={c.name} type="button" className="swatch" aria-pressed={on} aria-label={c.name} onClick={() => toggle(c.ids)}>
                  <span className="swatch__dot" style={{ background: c.colorCode }} />
                </button>
              ) : (
                <button key={c.name} type="button" className="pill" aria-pressed={on} onClick={() => toggle(c.ids)}>{c.name}</button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

export default function ShopGallery({ categoryId, initial, initialFilters, facets, priceMin, priceMax, sortLabels }: Props) {
  const [f, setF] = useState<Filters>(initialFilters);
  const currency = initial.products.find((p: any) => p.currency)?.currency ?? "USD"; // the store currency, as returned with the products
  const [draft, setDraft] = useState<Filters>(initialFilters);
  const [sheet, setSheet] = useState(false);
  // Filters live in a popup at every width: a side panel on desktop, a bottom sheet on phones.
  const [wide, setWide] = useState(false);
  useEffect(() => { const mq = window.matchMedia("(min-width: 1024px)"); const on = () => setWide(mq.matches); on(); mq.addEventListener("change", on); return () => mq.removeEventListener("change", on); }, []);
  const [data, setData] = useState(initial);
  const [status, setStatus] = useState<"idle" | "loading" | "more" | "error">("idle");
  const version = useRef(0);
  const [retry, setRetry] = useState(0);
  const first = useRef(true);

  // Debounce only the typed price bounds; everything else commits now.
  const key = useMemo(() => toParams(f).toString(), [f]);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const v = ++version.current;
    const t = setTimeout(async () => {
      setStatus("loading");
      const url = new URL(window.location.href); url.search = key; history.replaceState(null, "", url);
      try {
        const p = new URLSearchParams(key); if (categoryId) p.set("category", categoryId);
        const r = await fetch(`/api/products?${p}`); const d = await r.json();
        if (v !== version.current) return; // a newer selection superseded this response
        if (!r.ok) throw new Error(d.error);
        setData(d); setStatus("idle");
      } catch (e) { console.error("gallery", e); if (v === version.current) setStatus("error"); }
    }, 250);
    return () => clearTimeout(t);
  }, [key, retry]);

  async function more() {
    if (!data.nextCursor) return;
    const v = version.current;
    setStatus("more");
    try {
      const r = await fetch(`/api/products?cursor=${encodeURIComponent(data.nextCursor)}`); const d = await r.json();
      if (v !== version.current) return;
      if (!r.ok) throw new Error(d.error);
      setData((s) => ({ ...s, products: [...s.products, ...d.products], nextCursor: d.nextCursor })); setStatus("idle");
    } catch (e) { console.error("gallery", e); setStatus("error"); }
  }

  const set = (p: Partial<Filters>) => setF((s) => ({ ...s, ...p }));
  const clearAll = () => setF((s) => ({ ...s, min: "", max: "", inStock: false, choices: [], q: "" }));
  const chips: { label: string; clear: () => void }[] = [];
  if (f.q) chips.push({ label: `“${f.q}”`, clear: () => set({ q: "" }) });
  if (f.min) chips.push({ label: `From ${f.min}`, clear: () => set({ min: "" }) });
  if (f.max) chips.push({ label: `Up to ${f.max}`, clear: () => set({ max: "" }) });
  if (f.inStock) chips.push({ label: "In stock", clear: () => set({ inStock: false }) });
  for (const fc of facets) for (const c of fc.choices) if (c.ids.every((id) => f.choices.includes(id))) chips.push({ label: c.name, clear: () => set({ choices: f.choices.filter((x) => !c.ids.includes(x)) }) });

  const n = activeCount(f);
  const count = data.count;
  const loading = status === "loading";

  return (
    <div className="gallery">
      <div className="gallery__main">
        <div className="toolbar">
          <p className="toolbar__count" aria-live="polite">{count == null ? "" : `${count} product${count === 1 ? "" : "s"}`}</p>
          <div className="toolbar__controls">
            <button type="button" className="btn btn--secondary toolbar__filter" onClick={() => { setDraft(f); setSheet(true); }} aria-haspopup="dialog">
              <IconFilter /> Filter{n ? ` (${n})` : ""}
            </button>
            <label className="toolbar__sort">
              <span className="sr-only">Sort by</span>
              <select className="select" value={f.sort} onChange={(e) => set({ sort: e.target.value })}>
                {Object.entries(sortLabels).map(([k, v]) => <option key={k} value={k}>{k === "featured" ? "Sort: Featured" : v}</option>)}
              </select>
            </label>
          </div>
        </div>
        {chips.length ? (
          <div className="chips" aria-label="Active filters">
            {chips.map((c) => <button key={c.label} type="button" className="chip" onClick={c.clear} aria-label={`Remove filter ${c.label}`}>{c.label}<IconClose /></button>)}
            <button type="button" className="btn btn--secondary btn--sm chips__clear" onClick={clearAll}>Clear all filters</button>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="state"><p className="h3">We couldn't load products</p><p className="muted">Check your connection and try again.</p>
            <button type="button" className="btn btn--secondary" onClick={() => setRetry((r) => r + 1)}>Try again</button></div>
        ) : loading ? (
          <div className="grid" aria-busy="true" aria-label="Loading products">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card"><div className="skeleton media--product" /><div className="skeleton" style={{ height: 16, width: "70%" }} /><div className="skeleton" style={{ height: 16, width: "30%" }} /></div>)}
          </div>
        ) : data.products.length ? (
          <>
            <div className="grid" role="list">
              {data.products.map((p: any, i: number) => <div role="listitem" key={p._id}><ProductCard product={p} eager={i < 4} /></div>)}
            </div>
            {data.nextCursor ? (
              <div className="gallery__more">
                <p className="small muted">Showing {data.products.length}{count != null ? ` of ${count}` : ""}</p>
                <button type="button" className="btn btn--secondary" onClick={more} disabled={status === "more"}>
                  {status === "more" ? <span className="spinner" aria-hidden="true" /> : null}Load more
                </button>
              </div>
            ) : null}
          </>
        ) : chips.length ? (
          <div className="state"><p className="h3">No products match these filters</p><p className="muted">Try removing a filter or widening the price range.</p>
            <button type="button" className="btn btn--secondary" onClick={clearAll}>Clear all filters</button></div>
        ) : (
          <div className="state"><p className="h3">No products here yet</p><p className="muted">New products will appear here as soon as they're added.</p>
            <a className="btn btn--secondary" href="/shop">Browse all products</a></div>
        )}
      </div>

      <Overlay open={sheet} onClose={() => setSheet(false)} side={wide ? "right" : "bottom"} title="Filter"
        footer={<div className={`sheet-actions${activeCount(draft) ? "" : " sheet-actions--single"}`}>
          {activeCount(draft) ? <button type="button" className="btn btn--secondary" onClick={() => setDraft((d) => ({ ...d, min: "", max: "", inStock: false, choices: [] }))}>Clear filters</button> : null}
          <button type="button" className="btn btn--primary" onClick={() => { setF(draft); setSheet(false); }}>Apply filters</button>
        </div>}>
        <FilterFields f={draft} set={(p) => setDraft((d) => ({ ...d, ...p }))} facets={facets} priceMin={priceMin} priceMax={priceMax} idPrefix="sheet" currency={currency} />
      </Overlay>
    </div>
  );
}
