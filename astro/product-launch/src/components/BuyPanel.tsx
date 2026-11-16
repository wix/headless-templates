// The purchase column of the buy showcase (reference layout): a QTY row with a stepper, one row per
// choice of each option (radio + swatch + name + price), and a full-width "Add to bag". Same
// selection / stock / add logic as the PDP's OptionPicker — it reads useProductDetail, nothing
// about buying is re-implemented here. Products with plans or free-text modifiers send the buyer
// to the product page, where those controls live.
import { useProductDetail, type UseProductDetail } from "../hooks/storefront/useProductDetail";
import type { ProductDetail } from "../wix/storefront/types";

export default function BuyPanel({ initial, productUrl }: { initial: ProductDetail; productUrl: string }) {
  const d = useProductDetail({ initial });
  return <BuyPanelView d={d} productUrl={productUrl} />;
}

// The same panel for a page that already owns the product hook (the product page).
export function BuyPanelView({ d, productUrl }: { d: UseProductDetail; productUrl: string }) {
  const p = d.product;
  if (!p) return null;
  const needsPdp = d.plans.length > 0 || p.modifiers.some((m) => m.type === "text");
  const row = "flex items-center justify-between gap-4 border-t border-border py-4";
  return (
    <div className="grid">
      <div className={`${row} min-h-[4.5rem]`}>
        <span className="kicker text-foreground">Qty</span>
        <div className="stepper">
          <button type="button" aria-label="Decrease quantity" disabled={d.quantity <= 1} onClick={() => d.setQuantity(d.quantity - 1)}>−</button>
          <span aria-live="polite" aria-label={`Quantity ${d.quantity}`}>{d.quantity}</span>
          <button type="button" aria-label="Increase quantity" disabled={d.quantity >= d.maxQuantity} onClick={() => d.setQuantity(d.quantity + 1)}>+</button>
        </div>
      </div>

      {d.optionGroups.map((g) => (
        <fieldset key={g.id} className="grid">
          <legend className="sr-only">{g.name}</legend>
          {g.choices.map((c) => {
            const unavailable = !c.inStock || !c.exists;
            return (
              <button key={c.choiceId} type="button" role="radio" aria-checked={c.selected} disabled={unavailable} onClick={() => d.selectOption(g.id, c.choiceId)}
                className={`${row} group w-full text-left disabled:cursor-not-allowed disabled:opacity-45`}>
                <span className="flex items-center gap-4">
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-[border-color,transform,box-shadow] duration-200 group-hover:scale-110 group-enabled:group-hover:border-foreground group-enabled:group-hover:shadow-[0_0_0_3px_var(--color-secondary)] ${c.selected ? "border-foreground" : "border-border"}`}>
                    <span className="h-3.5 w-3.5 rounded-full border border-foreground/15 transition-transform duration-200 group-enabled:group-hover:scale-110" style={{ backgroundColor: c.colorCode ?? "var(--color-foreground)", opacity: c.selected || c.colorCode ? 1 : 0.0 }} />
                  </span>
                  <span className="kicker text-foreground">{c.name}{unavailable ? " · sold out" : ""}</span>
                </span>
                <span className="text-sm tabular-nums">{c.selected ? d.price : ""}</span>
              </button>
            );
          })}
        </fieldset>
      ))}
      <div className="border-t border-border pt-4">
        {needsPdp ? (
          <a href={productUrl} className="btn btn-primary w-full">Customize on the product page</a>
        ) : (
          <button type="button" disabled={!d.canAdd || d.adding} onClick={() => d.add().catch(() => {})} className="btn btn-primary w-full">
            {d.adding ? "Adding…" : d.isPreorder ? "Pre-order" : "Add to bag"}
          </button>
        )}
        {d.blockedReason && !d.canAdd && <p className="mt-3 text-sm text-muted-foreground">{d.blockedReason}</p>}
        {d.remaining !== null && d.remaining > 0 && d.remaining <= 10 && d.canAdd && !d.isPreorder && <p className="mt-3 text-sm text-muted-foreground">Only {d.remaining} left in stock</p>}
        {d.error && <p className="field-error mt-3">{d.error}</p>}
      </div>
    </div>
  );
}
