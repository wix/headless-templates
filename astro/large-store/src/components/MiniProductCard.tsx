// The compact product card of the footer widget and the cart's Best Sellers slider: a small square photo on the left; name, detail
// and "price + add" on the right. One component, so the two places can never drift apart.
import { imgSrc } from "../wix/media";
import type { ProductSummary } from "../wix/storefront/types";
import { PriceLine } from "./ProductCard";
import QuickAdd from "./storefront/QuickAdd";

export default function MiniProductCard({ p, className = "", focusable = true, eager = false }: { p: ProductSummary; className?: string; focusable?: boolean; eager?: boolean }) {
  const href = `/products/${encodeURIComponent(p.slug)}`;
  return (
    <div className={`flex gap-4 p-4 ${className}`}>
      <a href={href} tabIndex={focusable ? 0 : -1} aria-label={p.name} className="block aspect-square w-24 shrink-0 overflow-hidden bg-muted">
        {p.imageUrl && <img src={imgSrc(p.imageUrl, 192, 192)} alt="" loading={eager ? "eager" : "lazy"} className="h-full w-full object-cover" />}
      </a>
      <div className="flex min-w-0 flex-1 flex-col">
        <a href={href} tabIndex={focusable ? 0 : -1} className="break-words text-base font-medium leading-snug text-foreground no-underline hover:opacity-60 transition-opacity">{p.name}</a>
        {p.optionsSummary && <p className="mt-0.5 text-sm text-muted-foreground">{p.optionsSummary}</p>}
        {/* -mb-3: the control keeps its 44px tap height, but the text row sits flush with the photo's bottom edge */}
        <div className="-mb-3 mt-auto flex flex-wrap items-center justify-between gap-x-3">
          <p className="whitespace-nowrap text-sm font-medium"><PriceLine p={p} /></p>
          <QuickAdd product={p} inline />
        </div>
      </div>
    </div>
  );
}
