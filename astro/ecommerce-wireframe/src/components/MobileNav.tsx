// Phone/tablet navigation: a left drawer with search, every category from the
// live tree, and the site pages. Nothing runs off-screen, nothing needs hover.
import { useState } from "react";
import Overlay from "./Overlay";
import SearchSuggest from "./SearchSuggest";
import { IconMenu, IconSearch } from "./Icons";

type Cat = { name: string; slug: string; href: string; count: number; thumb: string };
export default function MobileNav({ categories, pages, current }: { categories: Cat[]; pages: { label: string; href: string }[]; current: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="icon-btn header__menu" onClick={() => setOpen(true)} aria-label="Open menu" aria-haspopup="dialog"><IconMenu /></button>
      <Overlay open={open} onClose={() => setOpen(false)} side="right" title="Menu">
        <SearchSuggest id="mnav-q" className="mnav__search" inputClassName="input" placeholder="Search products" button />
        <nav aria-label="Shop">
          <p className="kicker mnav__label">Shop</p>
          <ul role="list" className="mnav__cats">
            {categories.map((c) => (
              <li key={c.slug}>
                <a className="mega__item" href={c.href} aria-current={current === c.href ? "page" : undefined}>
                  <span className="mega__thumb media">{c.thumb ? <img src={c.thumb} width={48} height={48} alt="" loading="lazy" /> : null}</span>
                  <span className="mega__text">
                    <span className="mega__name">{c.name}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="kicker mnav__label">Store</p>
          <ul role="list" className="mnav__list mnav__list--quiet">
            {pages.map((p) => <li key={p.href}><a href={p.href} aria-current={current === p.href ? "page" : undefined}>{p.label}</a></li>)}
          </ul>
        </nav>
      </Overlay>
    </>
  );
}
