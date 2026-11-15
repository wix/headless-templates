// One card at a time with prev/next and position dots; wraps around.
import { useState } from "react";
import ProductCard from "./ProductCard";
import { IconChevronLeft, IconChevronRight } from "./Icons";

export default function ProductSlider({ products, label }: { products: any[]; label: string }) {
  const [i, setI] = useState(0);
  const n = products.length;
  if (!n) return null;
  const go = (k: number) => setI((k + n) % n);
  return (
    <div className="pslider" role="region" aria-roledescription="carousel" aria-label={label}>
      <div className="pslider__viewport">
        <ul role="list" className="pslider__track" style={{ transform: `translateX(-${i * 100}%)` }}>
          {products.map((p, k) => (
            <li key={p._id} className="pslider__slide" aria-hidden={k !== i} inert={k !== i ? true : undefined} role="group" aria-roledescription="slide" aria-label={`${k + 1} of ${n}`}>
              <ProductCard product={p} sizes="(min-width: 1024px) 22vw, 90vw" />
            </li>
          ))}
        </ul>
      </div>
      {n > 1 ? (
        <div className="pslider__nav">
          <button type="button" className="icon-btn" aria-label="Previous product" onClick={() => go(i - 1)}><IconChevronLeft /></button>
          <div className="pslider__dots">
            {products.map((p, k) => <button key={p._id} type="button" className="pslider__dot" aria-label={`Show product ${k + 1}`} aria-current={k === i} onClick={() => go(k)} />)}
          </div>
          <button type="button" className="icon-btn" aria-label="Next product" onClick={() => go(i + 1)}><IconChevronRight /></button>
        </div>
      ) : null}
    </div>
  );
}
