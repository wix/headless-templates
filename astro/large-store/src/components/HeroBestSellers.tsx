// Best Sellers: a compact hero widget that sits under the hero copy, left-aligned with it. Header row (label + "‹ 1 / 5 ›"),
// a hairline, then a horizontal slide: small square photo on the left; name, detail and "price + add" on the right.
// Every slide is rendered in one sliding track, so the widget keeps the height of its tallest slide whichever is showing;
// changing slide animates the track. Photo and text share the panel's side padding.
import { useState } from "react";
import type { ProductSummary } from "../wix/storefront/types";
import { ChevronLeft, ChevronRight } from "./Icons";
import MiniProductCard from "./MiniProductCard";

export default function HeroBestSellers({ products, label = "Best Sellers" }: { products: ProductSummary[]; label?: string }) {
  const [i, setI] = useState(0);
  if (!products.length) return null;
  const n = products.length;
  const step = (d: 1 | -1) => setI((x) => (x + d + n) % n);
  const btn = "hbtn inline-flex h-7 w-7 items-center justify-center text-foreground disabled:opacity-30";

  return (
    <section aria-roledescription="carousel" aria-label={label} className="w-full overflow-hidden bg-secondary">
      <div className="mx-4 flex h-12 items-center justify-between border-b border-foreground/80">
        <p className="text-sm font-medium">{label}</p>
        <div className="flex items-center gap-1">
          <button type="button" className={btn} aria-label="Previous product" disabled={n < 2} onClick={() => step(-1)}><ChevronLeft size={16} /></button>
          <span className="min-w-9 text-center text-sm tabular-nums" aria-live="polite">{i + 1} / {n}</span>
          <button type="button" className={btn} aria-label="Next product" disabled={n < 2} onClick={() => step(1)}><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="flex transition-transform duration-[320ms] ease-(--ease-site)" style={{ transform: `translateX(-${i * 100}%)` }}>
        {products.map((p, k) => (
          <div key={p.id} role="group" aria-roledescription="slide" aria-label={`${k + 1} of ${n}`} aria-hidden={k !== i}
            {...(k !== i ? ({ inert: "" } as Record<string, string>) : {})} className="w-full shrink-0">
            <MiniProductCard p={p} focusable={k === i} eager={k === 0} />
          </div>
        ))}
      </div>
    </section>
  );
}
