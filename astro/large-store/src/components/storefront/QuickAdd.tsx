// The card's purchase control — the gallery purchase paths, decided from the product:
//   • no options            → Direct Add: one click, the cheapest variant, quantity 1
//   • options / choice mods → Quick Add: a picker on the card (bottom sheet on small screens)
//   • free-text modifier    → the product page (the gallery can't collect the text)
//   • subscription plans    → the product page (the plan is chosen there, as on Wix's own storefront)
// Mount as the LAST ROW of the tile's text block (under name and price), as a direct child of the
// tile root that carries `relative flex flex-col` — the picker anchors to that root and takes its
// width, and the control pins itself to the tile's bottom (mt-auto) so the action row lines up
// across a grid row whether or not a neighbour carries swatches or a struck price. Never overlay
// it on the image, never wrap it in a narrower positioned box.
//   <QuickAdd product={p} />   Wire as-is; style via the tokens.
import { useEffect, useRef, useState } from "react";
import { useCart } from "../../hooks/storefront/useCart";
import { useProductDetail } from "../../hooks/storefront/useProductDetail";
import type { ProductSummary } from "../../wix/storefront/types";
import OptionPicker from "./OptionPicker";
import CloseButton from "../CloseButton";

export default function QuickAdd({ product, inline = false, onOptions }: { product: ProductSummary; inline?: boolean; onOptions?: () => void }) {
  return (
    // A tile is often one big <a>. A click inside the buy control must never become a navigation
    // to the product page — this boundary cancels the link's default for everything below it
    // (the button, the picker, the sheet). Still: keep the control OUTSIDE the tile's link.
    <div
      className="contents"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <QuickAddControl product={product} inline={inline} onOptions={onOptions} />
    </div>
  );
}

// Quiet fill, not an outline (a border draws four hard edges on every card of a grid); 44px tall.
const control = "btn btn-primary w-full disabled:opacity-50";

// Inline variant (product-card price row): a quiet text action, "+ Add to cart", no fill.
const inlineControl = "inline-flex min-h-11 items-center gap-1 whitespace-nowrap text-sm font-medium text-foreground underline-offset-4 hover:opacity-60 transition-opacity disabled:opacity-50";

function QuickAddControl({ product, inline, onOptions }: { product: ProductSummary; inline: boolean; onOptions?: () => void }) {
  const ctl = inline ? inlineControl : control;
  const wrap = inline ? "" : "mt-auto pt-3";
  const plus = inline ? "+ " : "";
  const { addToCart, pendingProductId } = useCart();
  // This card's add only: the cart's `busy` is the drawer's flag, and binding to it dims every card.
  const adding = pendingProductId === product.id;
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (product.availability === "OUT_OF_STOCK" && !product.preorder) {
    // the PDP offers "notify me" when the merchant collects requests; a tile only says so
    return <a href={`/products/${encodeURIComponent(product.slug)}`} className={`${inline ? "" : "mt-auto pt-3 "}flex min-h-11 items-center text-sm text-muted-foreground transition-opacity hover:opacity-60`}>Out of Stock</a>;
  }
  if (product.hasSubscriptions) {
    return (
      <div className={wrap}>
        <a href={`/products/${encodeURIComponent(product.slug)}`} className={inline ? ctl : `block ${control}`}>{plus}{inline ? "Plans" : "Choose a Plan"}</a>
      </div>
    );
  }
  if (product.quickAddable) {
    return (
      <div className={wrap}>
        <button
          type="button"
          disabled={adding}
          aria-busy={adding}
          onClick={() =>
            addToCart(product.id, product.minPriceVariantId, 1).catch((e) => setError(e instanceof Error ? e.message : String(e)))
          }
          className={ctl}
        >
          {adding ? "Adding…" : `${plus}${product.preorder ? "Pre-Order" : "Add to Cart"}`}
        </button>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
    );
  }
  // Options to pick, or a single variant that isn't plainly in stock (pre-order, partial stock):
  // the picker resolves it through useProductDetail, exactly as the PDP would.
  return (
    <div className={wrap}>
      <button type="button" onClick={() => (onOptions ? onOptions() : setOpen(true))} className={ctl}>
        {plus}{product.optionsSummary ? (inline ? "Options" : "Choose Options") : product.preorder ? "Pre-Order" : "Add to Cart"}
      </button>
      {open && <QuickAddPicker product={product} onClose={() => setOpen(false)} />}
    </div>
  );
}

// The picker fetches the full product only when it opens — cards never carry PDP data. Its controls
// are the shipped OptionPicker, the same component the PDP mounts.
function QuickAddPicker({ product, onClose }: { product: ProductSummary; onClose: () => void }) {
  const d = useProductDetail({ slug: product.slug });
  const panelRef = useRef<HTMLElement>(null);

  // Overlay contract: Escape closes, scroll locks under md, focus moves in and back.
  useEffect(() => {
    const opener = document.activeElement;
    const isSmall = window.matchMedia("(max-width: 767px)").matches;
    const previousOverflow = document.body.style.overflow;
    if (isSmall) document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [onClose]);

  // Free text and plans belong on the product page.
  const needsPdp = (d.product?.modifiers ?? []).some((m) => m.type === "text") || (d.product?.subscriptions.length ?? 0) > 0;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-foreground/40 md:hidden" onClick={onClose} />
      <section
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Choose options for ${product.name}`}
        // md+: anchored to the tile (its nearest `relative` ancestor), the tile's full width — and never
        // narrower than 18rem even when mounted inside a small wrapper.
        className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-background p-5 text-foreground shadow-2xl outline-none md:absolute md:inset-x-auto md:bottom-0 md:right-0 md:w-[max(100%,18rem)] md:max-h-none md:rounded-lg md:p-4"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{product.name}</p>
            <p className="text-sm">
              {d.price}
              {d.compareAtPrice && <span className="ml-2 text-muted-foreground line-through">{d.compareAtPrice}</span>}
              {d.pricePerUnit && <span className="ml-2 text-xs text-muted-foreground">{d.pricePerUnit}</span>}
            </p>
          </div>
          <CloseButton label="Close" onClick={onClose} className="-mr-2.5 -mt-2.5" />
        </div>

        {!d.product && !d.notFound && <p className="text-sm text-muted-foreground">Loading options…</p>}
        {d.notFound && <p className="text-sm text-muted-foreground">This product isn't available anymore.</p>}

        {d.product && needsPdp && (
          <a href={`/products/${encodeURIComponent(product.slug)}`} className="block rounded-control bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground">
            Customize on the Product Page
          </a>
        )}

        {d.product && !needsPdp && <OptionPicker detail={d} onAdded={onClose} />}
      </section>
    </>
  );
}

/** The options panel INSIDE a product card: the card slides its content up and this takes the freed space (see ProductCard).
 *  Same controls as the popup (the shipped OptionPicker); closes on ×, Escape, or once the item is added. */
export function CardOptions({ product, onClose, active = true }: { product: ProductSummary; onClose: () => void; active?: boolean }) {
  const d = useProductDetail({ slug: product.slug });
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, active]);
  const needsPdp = (d.product?.modifiers ?? []).some((m) => m.type === "text") || (d.product?.subscriptions.length ?? 0) > 0;
  return (
    <div role="group" aria-label={`Choose options for ${product.name}`} className="relative px-4 pb-4 pt-3 text-foreground">
      <CloseButton label="Close options" onClick={onClose} className="absolute right-1 top-1" />
      {!d.product && !d.notFound && <p className="text-sm text-muted-foreground">Loading options…</p>}
      {d.notFound && <p className="text-sm text-muted-foreground">This product isn't available anymore.</p>}
      {d.product && needsPdp && <a href={`/products/${encodeURIComponent(product.slug)}`} className="btn btn-primary w-full">Customize on the Product Page</a>}
      {d.product && !needsPdp && <OptionPicker detail={d} onAdded={onClose} />}
    </div>
  );
}
