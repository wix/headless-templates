// Slide-over cart with quantity stepper (capped at the stock left), remove, struck line prices
// on discounted lines, per-line availability, a coupon field, a note to the merchant, the totals
// breakdown from the cart estimate (subtotal, named discounts, fees, taxes when prices exclude
// them, the total before shipping), and Wix-hosted checkout. Mount ONCE per page, as-is; opens via
// useCart().openCart() / CartButton. Styled from the @theme tokens.
import { useEffect, useRef, useState } from "react";
import { PRODUCT_URL } from "../../lib/site";
import { useCart } from "../../hooks/storefront/useCart";
import type { CartLine } from "../../wix/storefront/types";

// Wix's line statuses in buyer words; IN_STOCK says nothing.
function lineStatusCopy(line: CartLine): string | null {
  switch (line.status) {
    case "IN_STOCK": return null;
    case "PARTIALLY_IN_STOCK": return line.availableQuantity !== null ? `Only ${line.availableQuantity} available — lower the quantity` : "Only part of this quantity is available";
    case "REMOVED_FROM_CATALOG": return "No longer sold";
    case "OUT_OF_STOCK": return "Out of stock";
    default: return "No longer available at this quantity";
  }
}

// Template edits (presentation only): 44px steppers and Remove target, 4:5 line image (the
// catalog's frame ratio), "Was" announced before the struck price.
export default function CartDrawer() {
  const { cart, open, closeCart, busy, error, updateQuantity, removeLine, applyCoupon, removeCoupon, setNote, checkout } = useCart();
  const [code, setCode] = useState("");
  const [codeOpen, setCodeOpen] = useState(false);
  const [note, setNoteDraft] = useState<string | null>(null); // null = not edited: show the cart's
  // Slide in/out: stay mounted for the 260ms exit, then unmount.
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), 260);
    return () => clearTimeout(t);
  }, [open]);

  // The overlay contract: Escape closes, the page behind stops scrolling, focus moves into the
  // panel on open and returns to whatever opened it on close.
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [open, closeCart]);

  if (!mounted) return null;
  const lines = cart?.lines ?? [];
  const row = "flex justify-between gap-3 text-sm";

  return (
    <>
      <div className="scrim" data-open={shown} onClick={closeCart} />
      <aside ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="bag-title" data-open={shown} className="panel">
        <div className="panel__head">
          <h2 id="bag-title" className="panel__title">{lines.length > 0 ? `Your bag (${cart?.itemCount ?? lines.length})` : "Your bag"}</h2>
          <button type="button" aria-label="Close" onClick={closeCart} className="icon-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        <div className="panel__body">
          {lines.length === 0 && (
            <div className="cart-empty">
              <p className="font-display text-h3 font-medium">Your bag is empty</p>
              <p className="text-muted-foreground">Add the product and it will show up here.</p>
              <a href={PRODUCT_URL} className="btn btn-primary" onClick={closeCart}>View the product</a>
            </div>
          )}
          {lines.length > 0 && (
            <div className="cart-lines" aria-busy={busy}>
              {lines.map((line) => {
                const status = lineStatusCopy(line);
                const atMax = line.availableQuantity !== null && line.quantity >= line.availableQuantity;
                return (
                  <div className="cart-line" key={line.lineItemId}>
                    <div className="cart-line__media">
                      {line.imageUrl && <img src={line.imageUrl} alt="" loading="lazy" />}
                    </div>
                    <div className="cart-line__info">
                      <div className="cart-line__top">
                        <p className="cart-line__name">{line.productName}</p>
                        <div className="text-right">
                          <p className="font-medium">{line.linePrice}</p>
                          {line.compareAtLinePrice && <p className="text-sm text-muted-foreground"><span className="sr-only">Was </span><s>{line.compareAtLinePrice}</s></p>}
                        </div>
                      </div>
                      {line.descriptionLines.map((d) => <p className="text-sm text-muted-foreground" key={d}>{d}</p>)}
                      {line.subscription && <p className="text-sm text-muted-foreground">Subscription: {line.subscription}</p>}
                      {status && <p className="field-error">{status}</p>}
                      <div className="cart-line__actions">
                        <div className="stepper">
                          <button type="button" aria-label="Decrease quantity" disabled={busy || line.quantity <= 1}
                            onClick={() => updateQuantity(line.lineItemId, line.quantity - 1).catch(() => {})}>−</button>
                          <span aria-live="polite">{line.quantity}</span>
                          <button type="button" aria-label="Increase quantity" disabled={busy || atMax}
                            onClick={() => updateQuantity(line.lineItemId, line.quantity + 1).catch(() => {})}>+</button>
                        </div>
                        <button type="button" disabled={busy} onClick={() => removeLine(line.lineItemId).catch(() => {})} className="link cart-line__remove disabled:opacity-40">Remove</button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="grid gap-4 pt-2">
                {cart?.coupon ? (
                  <div className={row}>
                    <span className="text-muted-foreground">Code <span className="font-medium text-foreground">{cart.coupon.code}</span></span>
                    <button type="button" disabled={busy} onClick={() => removeCoupon().catch(() => {})} className="link text-sm disabled:opacity-40">Remove</button>
                  </div>
                ) : codeOpen ? (
                  <form className="grid grid-cols-[1fr_auto] gap-2" onSubmit={(e) => { e.preventDefault(); applyCoupon(code).then(() => setCode("")).catch(() => {}); }}>
                    <label className="sr-only" htmlFor="cart-coupon">Promo code</label>
                    <input id="cart-coupon" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Promo code" autoFocus className="input min-w-0" />
                    <button type="submit" disabled={busy || !code.trim()} className="btn btn-primary">Apply</button>
                  </form>
                ) : (
                  <button type="button" onClick={() => setCodeOpen(true)} className="link justify-self-start text-sm">Have a promo code?</button>
                )}
                <div className="grid gap-2">
                  <label htmlFor="cart-note" className="field-label">Note to seller</label>
                  <textarea id="cart-note" rows={2} value={note ?? cart?.note ?? ""} onChange={(e) => setNoteDraft(e.target.value)}
                    onBlur={() => { if (note !== null) setNote(note).then(() => setNoteDraft(null)).catch(() => {}); }}
                    className="input min-h-20 py-3" />
                </div>
              </div>
            </div>
          )}
        </div>

        {lines.length > 0 && (
          <div className="panel__foot">
            <div className="grid gap-2">
              {cart?.subtotal && <div className="cart-sum"><span>Subtotal</span><span>{cart.subtotal}</span></div>}
              {(cart?.discounts ?? []).map((d, i) => (
                <div className={row} key={`d${i}`}><span className="text-muted-foreground">{d.name || "Discount"}</span><span>−{d.amount}</span></div>
              ))}
              {(cart?.fees ?? []).map((f, i) => (
                <div className={row} key={`f${i}`}><span className="text-muted-foreground">{f.name || "Fee"}</span><span>{f.amount}</span></div>
              ))}
              {!cart?.pricesIncludeTax && (cart?.taxes ?? []).map((t, i) => (
                <div className={row} key={`t${i}`}><span className="text-muted-foreground">{t.name || "Tax"}</span><span>{t.amount}</span></div>
              ))}
              {cart?.total && <div className="cart-sum"><span>Total</span><strong className="font-medium">{cart.total}</strong></div>}
            </div>
            <p className="text-sm text-muted-foreground">
              {cart?.pricesIncludeTax ? "Prices include tax. Shipping is calculated at checkout." : cart?.taxes.length ? "Shipping is calculated at checkout." : "Shipping and taxes are calculated at checkout."}
            </p>
            {error && <p className="field-error">{error}</p>}
            <button type="button" disabled={busy} onClick={() => checkout().catch(() => {})} className="btn btn-primary w-full">
              {busy ? "One moment…" : "Continue to secure checkout"}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
