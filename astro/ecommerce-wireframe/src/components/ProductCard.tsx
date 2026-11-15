// One product card for every surface (home rails, shop grid, category grid).
// The whole card links to the product page; on hover the image reveals
// a full-width "Add to Cart" (which asks only for what is left, in quick add).
import { useState } from "react";
import { imgSrc, imgSrcSet, listPrice, ribbons, ribbonClass, isColorOption, purchasePath, catalogItem, resolveVariant, variantIndex, available, productImages } from "../lib/store";
import { addToCart } from "../lib/cart-client";
import QuickAdd from "./QuickAdd";

const isPhone = () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

export default function ProductCard({ product: p, sizes = "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw", eager = false }: { product: any; sizes?: string; eager?: boolean }) {
  const color = (p.options ?? []).find(isColorOption);
  const [picked, setPicked] = useState<string | undefined>();
  const price = listPrice(p);
  const imgs = productImages(p);
  const main = imgs[0]?.m, alt = imgs[1]?.m;
  const rbs = ribbons(p);
  const oos = p.inventory?.availabilityStatus === "OUT_OF_STOCK";
  const preorder = oos && p.inventory?.preorderStatus === "ENABLED";

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [qa, setQa] = useState<{ open: boolean; full: any; initial: Record<string, string>; side: "bottom" | "right" }>({ open: false, full: null, initial: {}, side: "right" });
  const path = purchasePath(p);

  async function act() {
    if (busy) return;
    setMsg(null);
    setBusy(true);
    try {
      if (path === "directAdd") {
        await addToCart([catalogItem({ product: p, variant: p.variantSummary?.minPriceVariant, preorder })]);
        return;
      }
      const r = await fetch(`/api/product?id=${encodeURIComponent(p._id)}`);
      const { product: full, error } = await r.json();
      if (!full) throw new Error(error ?? "Couldn't load this product");
      const initial: Record<string, string> = color && picked ? { [color._id]: picked } : {};
      const v = resolveVariant(full, variantIndex(full), initial);
      const needsMods = (full.modifiers ?? []).some((m: any) => m.mandatory);
      if (v && !needsMods && (full.options ?? []).length === Object.keys(initial).length && available(v)) {
        const pre = v.inventoryStatus?.inStock === false && v.inventoryStatus?.preorderEnabled === true;
        await addToCart([catalogItem({ product: full, variant: v, preorder: pre })]);
      } else {
        setQa({ open: true, full, initial, side: isPhone() ? "bottom" : "right" });
      }
    } catch (e: any) { setMsg(e.message); }
    finally { setBusy(false); }
  }

  return (
    <article className="card">
      <div className="card__media media media--product">
        {rbs.length ? <div className="card__ribbons ribbons">{rbs.map((r) => <span key={r} className={ribbonClass(r)}>{r}</span>)}</div> : null}
        {main ? <img src={imgSrc(main, 640, 800)} srcSet={imgSrcSet(main)} sizes={sizes} width={640} height={800} alt={imgs[0].alt} loading={eager ? "eager" : "lazy"} decoding="async" /> : <span className="media__fallback" />}
        {alt ? <img className="card__img-alt" src={imgSrc(alt, 640, 800)} srcSet={imgSrcSet(alt)} sizes={sizes} width={640} height={800} alt="" loading="lazy" decoding="async" aria-hidden="true" /> : null}
        <div className="card__hover">
          <button type="button" className="btn btn--primary card__cta" onClick={act} disabled={path === "soldOut"} aria-busy={busy || undefined} aria-label={`Add ${p.name} to cart`}>
            {busy ? <span className="spinner" aria-hidden="true" /> : null}Add to Cart
          </button>
        </div>
      </div>
      <div className="card__body">
        <a className="card__name" href={`/products/${p.slug}`}>{p.name}</a>
        <p className="card__meta">
          <span className="price">{price.text}</span>
          {price.was ? <><span className="sr-only">was</span><s className="price__was">{price.was}</s></> : null}
        </p>
        {color?.choicesSettings?.choices?.length ? (
          <div className="card__swatches" role="radiogroup" aria-label={`${color.name ?? "Color"} of ${p.name}`}>
            {color.choicesSettings.choices.map((c: any) => (
              <button key={c.choiceId} type="button" role="radio" className="card__swatch" aria-checked={picked === c.choiceId} aria-label={c.name} title={c.name} onClick={() => setPicked(picked === c.choiceId ? undefined : c.choiceId)}>
                <span style={{ background: c.colorCode ?? "var(--media)" }} />
              </button>
            ))}
          </div>
        ) : null}
        {oos && !preorder ? <p className="card__stock">Out of stock</p> : preorder ? <p className="card__stock">Available for pre-order</p> : null}
      </div>
      {msg ? <p className="card__action-msg field__error" role="alert">{msg}</p> : null}
      {qa.full ? <QuickAdd product={qa.full} initial={qa.initial} open={qa.open} side={qa.side} onClose={() => setQa((q) => ({ ...q, open: false }))} /> : null}
    </article>
  );
}
