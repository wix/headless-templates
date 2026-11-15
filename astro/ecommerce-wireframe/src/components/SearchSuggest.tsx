// Search field with a suggestions panel. Empty + focused: a few popular products; typing: live
// product matches from Wix (debounced). Enter / "See all results" goes to the shop search page.
import { useEffect, useId, useRef, useState } from "react";
import { imgSrc, listPrice, productImages } from "../lib/store";
import { IconSearch } from "./Icons";

const THUMB = { quality: 90, unsharpMask: { radius: 0, amount: 0, threshold: 0 } };
let popularCache: any[] | null = null;
const fetchProducts = async (q: string, limit: number) => {
  const r = await fetch(`/api/products?limit=${limit}${q ? `&q=${encodeURIComponent(q)}` : ""}`);
  return ((await r.json()).products ?? []) as any[];
};

export default function SearchSuggest({ id, placeholder = "Search", className = "", inputClassName = "", defaultValue = "", button = false }: { id: string; placeholder?: string; className?: string; inputClassName?: string; defaultValue?: string; button?: boolean }) {
  const [q, setQ] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const root = useRef<HTMLFormElement>(null);
  const listId = useId();
  const term = q.trim();

  useEffect(() => {
    if (!open) return;
    let off = false;
    const t = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = term ? await fetchProducts(term, 5) : (popularCache ??= await fetchProducts("", 4));
        if (!off) { setItems(res); setActive(-1); }
      } catch (e) { console.error("search suggestions", e); if (!off) setItems([]); }
      finally { if (!off) setLoading(false); }
    }, term ? 200 : 0);
    return () => { off = true; clearTimeout(t); };
  }, [term, open]);

  useEffect(() => {
    if (!open) return;
    const away = (e: Event) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", away); document.addEventListener("focusin", away);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("focusin", away); };
  }, [open]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); return; }
    if (!open || !items.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % items.length); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a <= 0 ? items.length - 1 : a - 1)); }
    if (e.key === "Enter" && active >= 0) { e.preventDefault(); location.href = `/products/${items[active].slug}`; }
  };

  return (
    <form ref={root} className={`ssearch ${className}`} action="/shop" role="search" onSubmit={(e) => { if (!term) e.preventDefault(); }}>
      <label className="sr-only" htmlFor={id}>Search products</label>
      {!button ? <IconSearch /> : null}
      <input id={id} className={inputClassName} type="search" name="q" placeholder={placeholder} value={q} autoComplete="off"
        role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list" aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={onKey} />
      {button ? <button className="icon-btn" aria-label="Search"><IconSearch /></button> : null}
      {open ? (
        <div className="ssearch__panel">
          <p className="ssearch__label">{term ? `Results for “${term}”` : "Popular right now"}</p>
          {loading && !items.length ? <p className="ssearch__empty">Searching…</p> : null}
          {!loading && term && !items.length ? <p className="ssearch__empty">No products match “{term}”.</p> : null}
          <ul role="listbox" id={listId} className="ssearch__list">
            {items.map((p, k) => {
              const im = productImages(p)[0]?.m;
              return (
                <li key={p._id} role="option" id={`${listId}-${k}`} aria-selected={k === active}>
                  <a className="ssearch__item" href={`/products/${p.slug}`} data-active={k === active || undefined}>
                    <span className="media ssearch__thumb">{im ? <img src={imgSrc(im, 144, 192, THUMB)} width={36} height={48} alt="" loading="lazy" /> : null}</span>
                    <span className="ssearch__name">{p.name}</span>
                    <span className="ssearch__price">{listPrice(p).text}</span>
                  </a>
                </li>
              );
            })}
          </ul>
          {term && items.length ? <a className="ssearch__all" href={`/shop?q=${encodeURIComponent(term)}`}>See all results</a> : null}
        </div>
      ) : null}
    </form>
  );
}
