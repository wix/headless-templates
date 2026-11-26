// Slide-over cart with quantity stepper (capped at the stock left), remove, struck line prices
// on discounted lines, per-line availability, a coupon field, a note to the merchant, the totals
// breakdown from the cart estimate (subtotal, named discounts, fees, taxes when prices exclude
// them, the total before shipping), and Wix-hosted checkout. Mount ONCE per page, as-is; opens via
// useCart().openCart() / CartButton. Styled from the @theme tokens.
import { useEffect, useRef, useState } from "react";
import { useCart } from "../../hooks/storefront/useCart";
import { holdFocus } from "../../lib/a11y";
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

/** Another product to suggest in the cart's slider: a small 3:4 preview, name and price, linking to its page. */
export type CartSuggestion = { slug: string; name: string; price: string; imageUrl: string };

export default function CartDrawer({ suggestions = [] }: { suggestions?: CartSuggestion[] }) {
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
    // a modal: Tab stays in the cart and the page behind is inert until it closes (focus then returns)
    const release = panelRef.current ? holdFocus(panelRef.current, opener) : () => {};
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      release();
    };
  }, [open, closeCart]);

  // Like the About / Reviews panels (site edit): the cart stays mounted and slides in from the right while the site is
  // pushed left (html.cart-open moves .store-shell, see global.css) and dimmed; closed, it is hidden and inert.
  useEffect(() => {
    document.documentElement.classList.toggle("cart-open", open);
    return () => document.documentElement.classList.remove("cart-open");
  }, [open]);

  const lines = cart?.lines ?? [];
  const row = "flex justify-between gap-3 text-sm";

  return (
    <>
      <button type="button" tabIndex={-1} aria-hidden="true" data-keep-live onClick={closeCart}
        className={`dim fixed inset-0 z-[45] bg-foreground/40 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
        aria-hidden={!open}
        {...(open ? {} : ({ inert: "" } as Record<string, string>))}
        className={`drawer fixed inset-y-0 right-0 z-50 flex w-(--drawer-w) flex-col overflow-y-auto overscroll-contain bg-background text-foreground outline-none ${open ? "is-open" : ""}`}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-display text-xl font-medium">
            Cart{cart && cart.itemCount > 0 ? ` (${cart.itemCount})` : ""}
          </h2>
          <button
            type="button"
            aria-label="Close cart"
            onClick={closeCart}
            className="close-btn icon-btn -mr-1 inline-flex h-11 w-11 items-center justify-center rounded-full bg-muted text-foreground hover:bg-transparent"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 [@media(max-height:640px)]:flex-none [@media(max-height:640px)]:overflow-visible">
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
                  <div className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-1">
                    <div className="inline-flex items-center gap-0.5 rounded-full bg-secondary p-1">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        disabled={busy || line.quantity <= 1}
                        onClick={() => updateQuantity(line.lineItemId, line.quantity - 1).catch(() => {})}
                        className="step-btn inline-flex h-9 w-9 items-center justify-center rounded-full text-base disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="min-w-6 text-center text-sm tabular-nums">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        disabled={busy || atMax}
                        onClick={() => updateQuantity(line.lineItemId, line.quantity + 1).catch(() => {})}
                        className="step-btn inline-flex h-9 w-9 items-center justify-center rounded-full text-base disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => removeLine(line.lineItemId).catch(() => {})}
                      className="text-btn inline-flex min-h-11 items-center px-2 text-sm text-muted-foreground underline disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium">{line.compareAtLinePrice && <span className="sr-only">Sale price: </span>}{line.linePrice}</p>
                  {line.compareAtLinePrice && <p className="text-xs text-muted-foreground line-through"><span className="sr-only">Original price: </span>{line.compareAtLinePrice}</p>}
                </div>
              </div>
            );
          })}

          {/* other products, not already in the cart: a sideways slider of small previews */}
          {(() => {
            const inCart = new Set(lines.map((l) => l.productName));
            const more = suggestions.filter((p) => !inCart.has(p.name));
            if (!more.length) return null;
            return (
              <section aria-labelledby="cart-more" className={`${lines.length ? "mb-6" : ""} -mx-6`}>
                <h3 id="cart-more" className="mb-3 px-6 text-base font-medium">You may also like</h3>
                <ul className="flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {more.map((p) => (
                    <li key={p.slug} className="w-28 shrink-0 snap-start">
                      <a href={`/products/${encodeURIComponent(p.slug)}`} className="cart-more group block no-underline">
                        <span className="block aspect-[3/4] overflow-hidden rounded-md bg-secondary">
                          {p.imageUrl && <img src={p.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />}
                        </span>
                        <span className="mt-1.5 block truncate text-sm">{p.name}</span>
                        <span className="block text-sm text-muted-foreground">{p.price}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })()}

          {lines.length > 0 && (
            <div className="mt-2 flex flex-col gap-4 border-t border-border pt-4">
              {/* Coupon */}
              {cart?.coupon ? (
                <div className={row}>
                  <span className="text-muted-foreground">Code <span className="font-medium text-foreground">{cart.coupon.code}</span></span>
                  <button type="button" disabled={busy} onClick={() => removeCoupon().catch(() => {})} className="text-btn inline-flex min-h-11 items-center px-2 text-sm underline disabled:opacity-40">Remove</button>
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
                  <button type="submit" disabled={busy || !code.trim()} className="btn btn-primary btn-sm min-h-11">Apply</button>
                </form>
              ) : (
                <button type="button" onClick={() => setCodeOpen(true)} className="text-btn inline-flex min-h-11 items-center self-start text-sm underline">Have a promo code?</button>
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
              className="btn btn-primary w-full"
            >
              {busy ? "One moment…" : "Continue to secure checkout"}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
