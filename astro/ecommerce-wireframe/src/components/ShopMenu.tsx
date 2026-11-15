// Desktop "Shop" mega menu: opens on hover (with a short close delay so the
// pointer can cross the gap), also on click/Enter for keyboard and touch;
// closes on Escape, outside click or focus leaving.
import { useEffect, useRef, useState } from "react";
import { IconChevronDown } from "./Icons";

type Cat = { name: string; slug: string; href: string; count: number; thumb: string };
type Promo = { title?: string; body?: string; href: string; image: string } | null;

export default function ShopMenu({ categories, promo }: { categories: Cat[]; promo: Promo }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const show = () => { clearTimeout(timer.current); setOpen(true); };
  const hide = () => { clearTimeout(timer.current); timer.current = window.setTimeout(() => setOpen(false), 150); };
  useEffect(() => {
    if (!open) return;
    const away = (e: Event) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); btn.current?.focus(); } };
    document.addEventListener("pointerdown", away); document.addEventListener("focusin", away); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("focusin", away); document.removeEventListener("keydown", esc); };
  }, [open]);
  const cats = categories.filter((c) => c.slug !== "sale");
  return (
    <div className="shopmenu" ref={root} onPointerEnter={(e) => e.pointerType === "mouse" && show()} onPointerLeave={(e) => e.pointerType === "mouse" && hide()}>
      <button ref={btn} type="button" className="nav-link shopmenu__btn" aria-expanded={open} aria-controls="shopmenu-panel" onClick={() => setOpen((o) => !o)}>
        Shop <IconChevronDown />
      </button>
      <div id="shopmenu-panel" className="shopmenu__panel mega" hidden={!open}>
        <div className="mega__main">
          <p className="mega__label">Categories</p>
          <ul role="list" className="mega__grid">
            {cats.map((c) => (
              <li key={c.slug}>
                <a className="mega__item" href={c.href}>
                  <span className="mega__thumb media">{c.thumb ? <img src={c.thumb} width={48} height={48} alt="" loading="lazy" /> : null}</span>
                  <span className="mega__text">
                    <span className="mega__name">{c.name}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="mega__side">
          <p className="mega__label">Trending</p>
          {promo ? (
            <a className="mega__promo" href={promo.href}>
              <span className="mega__promo-media media">{promo.image ? <img src={promo.image} width={120} height={120} alt="" loading="lazy" /> : null}</span>
              <span className="mega__text">
                <span className="mega__name">{promo.title}</span>
                {promo.body ? <span className="mega__meta">{promo.body}</span> : null}
              </span>
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
