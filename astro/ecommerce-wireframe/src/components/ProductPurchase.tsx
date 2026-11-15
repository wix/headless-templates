// The purchase region of the product page: price (the only one on the page,
// so it can follow the selected variant), options, quantity, the action with
// its neutral reason. On phones a
// buy bar appears once the in-flow button has scrolled away.
import { useEffect, useRef, useState } from "react";
import OptionPicker from "./OptionPicker";
import { usePurchase } from "./usePurchase";
import { listPrice, variantPrice } from "../lib/store";
import { IconMinus, IconPlus } from "./Icons";

export default function ProductPurchase({ product }: { product: any }) {
  const p = usePurchase(product);
  const price = p.variant ? variantPrice(p.variant) : listPrice(product);
  const btn = useRef<HTMLButtonElement>(null);
  const [barVisible, setBarVisible] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = btn.current; if (!el || !("IntersectionObserver" in window)) return;
    // Visible whenever the in-flow button is off-screen — above (scrolled past) or below (not reached yet on a short phone).
    const io = new IntersectionObserver(([e]) => setBarVisible(!e.isIntersecting), { threshold: 0 });
    io.observe(el); return () => io.disconnect();
  }, []);

  const oosAll = product.inventory?.availabilityStatus === "OUT_OF_STOCK" && product.inventory?.preorderStatus !== "ENABLED";

  const ready = !oosAll && p.state === "ok" && !p.modsMissing.length && !p.busy;
  async function onAdd() { const ok = await p.add(); if (ok) { setDone(true); setTimeout(() => setDone(false), 2000); } }

  return (
    <div className="purchase" id="purchase">
      <div className="purchase__row">
        <span className="purchase__label">Price</span>
        <p className="purchase__price price" aria-live="polite">
          {price.was ? <><span className="sr-only">was</span><s className="price__was">{price.was}</s> </> : null}{price.text}
        </p>
      </div>
      <OptionPicker product={product} idx={p.idx} selected={p.selected} onSelect={p.select} mods={p.mods} onMod={p.setMod} showErrors={p.tried} />
      <div className="purchase__buy">
        <div className="stepper stepper--lg" role="group" aria-label="Quantity">
          <button type="button" onClick={() => p.setQty(Math.max(1, p.qty - 1))} disabled={p.qty <= 1} aria-label="Decrease quantity"><IconMinus /></button>
          <span aria-live="polite">{p.qty}</span>
          <button type="button" onClick={() => p.setQty(Math.min(99, p.qty + 1))} aria-label="Increase quantity"><IconPlus /></button>
        </div>
        <button ref={btn} type="button" className="btn btn--primary purchase__cta" onClick={onAdd} disabled={!ready} aria-busy={p.busy || undefined} aria-describedby="purchase-reason">
          {p.busy ? <span className="spinner" aria-hidden="true" /> : null}{done ? "Added" : p.label}
        </button>
      </div>
      {/* Only after a failed add: the missing choice, as an error. No standing helper text under the quantity. */}
      <p id="purchase-reason" className="field__error" aria-live="polite" hidden={!(p.tried && (p.state !== "ok" || p.modsMissing.length))}>
        {p.state !== "ok" && !oosAll ? p.reason : p.modsMissing.length ? `Add ${String(p.modsMissing[0].name).toLowerCase()}` : ""}
      </p>
      {p.error ? <p className="field__error" role="alert">{p.error}</p> : null}
      <div className="buybar" data-visible={barVisible} aria-hidden={!barVisible}>
        <div className="buybar__info"><span className="buybar__name">{product.name}</span><span className="price">{price.text}</span></div>
        <button type="button" className="btn btn--primary" tabIndex={barVisible ? 0 : -1}
          onClick={onAdd} disabled={!ready} aria-busy={p.busy || undefined}>
          {p.label}
        </button>
      </div>
    </div>
  );
}
