// Slide-over cart with quantity stepper (capped at the stock left), remove, struck line prices
// on discounted lines, per-line availability, a coupon field, a note to the merchant, the totals
// breakdown from the cart estimate (subtotal, named discounts, fees, taxes when prices exclude
// them, the total before shipping), and Wix-hosted checkout. Mount ONCE per page, as-is; opens via
// useCart().openCart() / CartButton. Styled from the @theme tokens.
import { useEffect, useRef, useState } from "react";
import { useCart } from "../../hooks/storefront/useCart";
import type { CartLine, ProductSummary } from "../../wix/storefront/types";
import MiniProductCard from "../MiniProductCard";
import CloseButton from "../CloseButton";

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

export default function CartDrawer({ recommended = [], recommendedTitle = "Best Sellers", freeShippingThreshold = null }: { recommended?: ProductSummary[]; recommendedTitle?: string; freeShippingThreshold?: number | null }) {
  const { cart, open, closeCart, busy, error, updateQuantity, removeLine, applyCoupon, removeCoupon, setNote, checkout } = useCart();
  const [code, setCode] = useState("");
  const [codeOpen, setCodeOpen] = useState(false);
  const [note, setNoteDraft] = useState<string | null>(null); // null = not edited: show the cart's

  // The overlay contract, done here rather than assumed from CSS: Escape closes (the backdrop
  // click is pointer-only), the page behind stops scrolling, focus moves into the panel on open
  // and returns to whatever opened it on close. Hooks run before the early return below.
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

  if (!open) return null;
  const lines = cart?.lines ?? [];
  const row = "flex justify-between gap-3 text-sm";

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-foreground/40 backdrop-blur-[2px]"
      onClick={closeCart}
    >
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col bg-background text-foreground shadow-2xl outline-none"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
          <span className="text-base font-semibold">
            Cart{cart && cart.itemCount > 0 ? ` (${cart.itemCount})` : ""}
          </span>
          <CloseButton label="Close cart" onClick={closeCart} className="-mr-2.5" />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Free-shipping progress: the cart's subtotal against the threshold set in the store's shipping rules (Dashboard). */}
          {lines.length > 0 && freeShippingThreshold !== null && cart && (() => {
            const money = (n: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: cart.currency || "USD", minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }).format(n);
            const left = Math.max(0, freeShippingThreshold - cart.subtotalAmount);
            const pct = Math.min(100, Math.round((cart.subtotalAmount / freeShippingThreshold) * 100));
            return (
              <div className="mb-6" role="group" aria-label="Free shipping progress">
                <div className="h-2 w-full bg-secondary" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
                  <div className="h-full bg-foreground transition-[width] duration-[320ms] ease-(--ease-site)" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-3 text-base">
                  {left > 0
                    ? <>You are <strong className="font-semibold">{money(left)}</strong> away from <strong className="font-semibold">free shipping</strong></>
                    : <>You’ve unlocked <strong className="font-semibold">free shipping</strong></>}
                </p>
              </div>
            );
          })()}
          {lines.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">Your cart is empty.</p>
          )}
          {lines.map((line) => {
            const status = lineStatusCopy(line);
            const atMax = line.availableQuantity !== null && line.quantity >= line.availableQuantity;
            return (
              <div className="mb-6 flex gap-4" key={line.lineItemId}>
                {line.imageUrl ? (
                  <img
                    src={line.imageUrl}
                    alt=""
                    loading="lazy"
                    className="h-16 w-16 flex-shrink-0 rounded-md bg-secondary object-cover"
                  />
                ) : (
                  <div aria-hidden="true" className="h-16 w-16 flex-shrink-0 rounded-md bg-secondary" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{line.productName}</p>
                  {line.descriptionLines.map((d) => (
                    <p className="mt-0.5 text-xs text-muted-foreground" key={d}>
                      {d}
                    </p>
                  ))}
                  {line.subscription && (
                    <p className="mt-0.5 text-xs text-muted-foreground">Subscription: {line.subscription}</p>
                  )}
                  {status && <p className="mt-1 text-xs text-destructive">{status}</p>}
                  <div className="mt-2 flex items-center">
                    <div className="stepper inline-flex items-center bg-secondary">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        disabled={busy || line.quantity <= 1}
                        onClick={() => updateQuantity(line.lineItemId, line.quantity - 1).catch(() => {})}
                        className="min-h-11 min-w-11 text-base disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="min-w-6 text-center text-sm tabular-nums">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        disabled={busy || atMax}
                        onClick={() => updateQuantity(line.lineItemId, line.quantity + 1).catch(() => {})}
                        className="min-h-11 min-w-11 text-base disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => removeLine(line.lineItemId).catch(() => {})}
                      className="ml-2 inline-flex min-h-11 items-center px-2 text-xs text-muted-foreground underline transition-opacity hover:opacity-60 disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{line.linePrice}</p>
                  {line.compareAtLinePrice && <p className="text-xs text-muted-foreground line-through">{line.compareAtLinePrice}</p>}
                </div>
              </div>
            );
          })}

          {/* Best Sellers slider: the footer widget's card, swiped sideways; products already in the cart are left out */}
          {(() => {
            const inCart = new Set(lines.map((l) => l.productName));
            const recs = recommended.filter((p) => !inCart.has(p.name));
            return lines.length > 0 && recs.length > 0 ? (
              <section aria-label={recommendedTitle} className="mt-6">
                <h3 className="font-display text-h3">{recommendedTitle}</h3>
                <ul className="rail mt-4" style={{ "--rail-item": "88%" } as React.CSSProperties}>
                  {recs.map((p) => <li key={p.id}><MiniProductCard p={p} className="bg-secondary" /></li>)}
                </ul>
              </section>
            ) : null;
          })()}

          {lines.length > 0 && (
            <div className="mt-2 flex flex-col gap-4 border-t border-border pt-4">
              {/* Coupon */}
              {cart?.coupon ? (
                <div className={row}>
                  <span className="text-muted-foreground">Code <span className="font-medium text-foreground">{cart.coupon.code}</span></span>
                  <button type="button" disabled={busy} onClick={() => removeCoupon().catch(() => {})} className="inline-flex min-h-11 items-center px-2 text-xs underline transition-opacity hover:opacity-60 disabled:opacity-40">Remove</button>
                </div>
              ) : codeOpen ? (
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    applyCoupon(code).then(() => setCode("")).catch(() => {});
                  }}
                >
                  <label className="sr-only" htmlFor="cart-coupon">Promo code</label>
                  <input id="cart-coupon" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Promo code" autoFocus
                    className="min-h-11 min-w-0 flex-1 rounded-control border border-border bg-background px-3 text-sm" />
                  <button type="submit" disabled={busy || !code.trim()} className="min-h-11 rounded-control bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-40">Apply</button>
                </form>
              ) : (
                <button type="button" onClick={() => setCodeOpen(true)} className="inline-flex min-h-11 items-center self-start text-sm underline transition-opacity hover:opacity-60">Have a Promo Code?</button>
              )}

              {/* Note to the merchant — saved on blur */}
              <label className="flex flex-col gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Note to seller
                <textarea
                  rows={2}
                  value={note ?? cart?.note ?? ""}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  onBlur={() => { if (note !== null) setNote(note).then(() => setNoteDraft(null)).catch(() => {}); }}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm normal-case tracking-normal text-foreground"
                />
              </label>
            </div>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-border px-6 py-5">
            <div className="mb-3 flex flex-col gap-1.5">
              {cart?.subtotal && (
                <div className={row}>
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{cart.subtotal}</span>
                </div>
              )}
              {(cart?.discounts ?? []).map((d, i) => (
                <div className={row} key={`d${i}`}>
                  <span className="text-muted-foreground">{d.name || "Discount"}</span>
                  <span>−{d.amount}</span>
                </div>
              ))}
              {(cart?.fees ?? []).map((f, i) => (
                <div className={row} key={`f${i}`}>
                  <span className="text-muted-foreground">{f.name || "Fee"}</span>
                  <span>{f.amount}</span>
                </div>
              ))}
              {!cart?.pricesIncludeTax && (cart?.taxes ?? []).map((t, i) => (
                <div className={row} key={`t${i}`}>
                  <span className="text-muted-foreground">{t.name || "Tax"}</span>
                  <span>{t.amount}</span>
                </div>
              ))}
              {cart?.total && (
                <div className={`${row} mt-1 border-t border-border pt-2`}>
                  <span className="font-semibold">Total</span>
                  <strong className="font-semibold">{cart.total}</strong>
                </div>
              )}
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              {cart?.pricesIncludeTax ? "Prices include tax. Shipping is calculated at checkout." : cart?.taxes.length ? "Shipping is calculated at checkout." : "Shipping and taxes are calculated at checkout."}
            </p>
            {error && <p className="mb-3 text-xs text-destructive">{error}</p>}
            <button
              type="button"
              disabled={busy}
              onClick={() => checkout().catch(() => {})}
              className="min-h-12 w-full rounded-control bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-[#3a3a38] disabled:opacity-50"
            >
              {busy ? "One moment…" : "Continue to Secure Checkout"}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
