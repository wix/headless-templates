// Slide-in bag. Opens after every successful add and from the header. Shows
// what was added, editable lines, Wix-calculated subtotal/discount, and
// checkout straight from the drawer — no mandatory cart page.
import { useEffect, useState } from "react";
import Overlay from "./Overlay";
import { useCart, loadCart, closeCart, updateLine, removeLine, checkout, itemCount } from "../lib/cart-client";
import { formatCartMoney, imgSrc } from "../lib/store";
import { IconMinus, IconPlus, IconCheck } from "./Icons";

function Line({ line, cart, justAdded }: { line: any; cart: any; justAdded: boolean }) {
  const [err, setErr] = useState<string | null>(null);
  const qty = line.quantityInfo?.confirmedQuantity ?? 1;
  const max = line.quantityInfo?.availableQuantity;
  const ceiling = typeof max === "number" ? Math.max(0, max) : 99;
  const change = async (n: number) => {
    setErr(null);
    try { if (n < 1) await removeLine(line._id); else await updateLine(line._id, n); }
    catch (e: any) { setErr(e.message ?? "Couldn't update the quantity"); }
  };
  const img = imgSrc(line.image ?? line.attributes?.image, 160, 200);
  const desc = (line.descriptionLines ?? line.attributes?.descriptionLines ?? [])
    .map((d: any) => `${d.name?.original ?? d.name?.translated ?? ""}: ${d.plainText?.original ?? d.colorInfo?.original ?? d.plainText?.translated ?? ""}`)
    .filter((s: string) => !/^:\s*$/.test(s));
  const unavailable = line.status && line.status !== "IN_STOCK" && line.status !== "PREORDER";
  return (
    <li className="cart-line">
      <div className="cart-line__media media">{img ? <img src={img} alt="" width={80} height={100} loading="lazy" /> : null}</div>
      <div className="cart-line__info">
        {justAdded ? <p className="cart-line__added"><IconCheck /> Added to bag</p> : null}
        <div className="cart-line__top">
          <p className="cart-line__name">{line.productName?.original ?? line.name?.original}</p>
          <p className="price">{formatCartMoney(line.lineItemPrice ?? line.pricing?.totalPrice ?? line.price, cart)}</p>
        </div>
        {desc.length ? <p className="small muted">{desc.join(" · ")}</p> : null}
        {unavailable ? <p className="small" style={{ color: "var(--danger)" }}>No longer available — remove it to check out.</p> : null}
        <div className="cart-line__actions">
          <div className="stepper" role="group" aria-label={`Quantity, ${line.productName?.original ?? line.name?.original}`}>
            <button type="button" onClick={() => change(qty - 1)} aria-label={qty <= 1 ? "Remove" : "Decrease quantity"}><IconMinus /></button>
            <span aria-live="polite">{qty}</span>
            <button type="button" onClick={() => change(qty + 1)} disabled={qty >= ceiling} aria-label="Increase quantity"><IconPlus /></button>
          </div>
          <button type="button" className="link small cart-line__remove" onClick={() => change(0)}>Remove</button>
        </div>
        {err ? <p className="field__error" role="alert">{err}</p> : null}
      </div>
    </li>
  );
}

export default function CartDrawer() {
  const s = useCart();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { loadCart(); }, []);
  useEffect(() => { if (!s.open) setErr(null); }, [s.open]);
  const lines = s.cart?.lineItems ?? [];
  const n = itemCount(s.cart);
  const sub = s.summary?.priceSummary?.subtotal;
  const disc = s.summary?.priceSummary?.discount;
  const hasDiscount = disc && Number(disc.convertedAmount ?? disc.amount ?? 0) > 0;

  const go = async () => {
    setBusy(true); setErr(null);
    try { await checkout(); } catch (e: any) { setErr(e.message); setBusy(false); }
  };

  return (
    <Overlay open={s.open} onClose={closeCart} side="right" title={n ? `Your bag (${n})` : "Your bag"}
      footer={lines.length ? (
        <>
          {sub ? <div className="cart-sum"><span>Subtotal</span><span className="price">{formatCartMoney(sub, s.cart)}</span></div> : null}
          {hasDiscount ? <div className="cart-sum"><span>Discount</span><span className="price">−{formatCartMoney(disc, s.cart)}</span></div> : null}
          <p className="small muted">Shipping and taxes are calculated at checkout.</p>
          {err ? <p className="field__error" role="alert">{err}</p> : null}
          <button type="button" className="btn btn--primary btn--block" onClick={go} disabled={busy || s.pending}>
            {busy ? <span className="spinner" aria-hidden="true" /> : null}{busy ? "Opening checkout…" : "Continue to secure checkout"}
          </button>
          <button type="button" className="btn btn--secondary btn--block" onClick={closeCart}>Keep shopping</button>
        </>
      ) : undefined}>
      {!s.loaded ? (
        <div className="cart-empty"><div className="skeleton" style={{ height: 100 }} /><div className="skeleton" style={{ height: 100 }} /></div>
      ) : lines.length ? (
        <ul role="list" className="cart-lines" aria-busy={s.pending}>
          {lines.map((l: any) => <Line key={l._id} line={l} cart={s.cart} justAdded={l._id === s.lastAddedId} />)}
        </ul>
      ) : (
        <div className="cart-empty">
          <p className="h3">Your bag is empty</p>
          <p className="muted">Browse the store and add something you like.</p>
          <a className="btn btn--primary" href="/shop">Shop all products</a>
        </div>
      )}
      {s.error ? <p className="field__error" role="alert">{s.error}</p> : null}
    </Overlay>
  );
}
