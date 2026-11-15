// A set of cards as one island: a rail (home) or a grid. Rails pull to the
// viewport edge with a peek; on desktop they get prev/next controls.
import { useRef, useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { IconChevronLeft, IconChevronRight } from "./Icons";

export default function ProductList({ products, layout = "grid", label }: { products: any[]; layout?: "grid" | "rail" | "rail-grid"; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  useEffect(() => {
    const el = ref.current; if (!el || layout === "grid") return;
    const upd = () => setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
    upd(); el.addEventListener("scroll", upd, { passive: true }); window.addEventListener("resize", upd);
    return () => { el.removeEventListener("scroll", upd); window.removeEventListener("resize", upd); };
  }, [layout]);
  const page = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: "smooth" });
  const cls = layout === "grid" ? "grid grid--4" : layout === "rail-grid" ? "rail rail--grid-desktop" : "rail";
  const sizes = layout === "grid" ? undefined : "(min-width: 1024px) 24vw, (min-width: 768px) 30vw, 53vw";
  return (
    <div className="plist">
      {layout === "rail" ? (
        <div className="rail-nav plist__nav">
          <button type="button" className="icon-btn" onClick={() => page(-1)} disabled={edge.start} aria-label={`Previous ${label ?? "products"}`}><IconChevronLeft /></button>
          <button type="button" className="icon-btn" onClick={() => page(1)} disabled={edge.end} aria-label={`Next ${label ?? "products"}`}><IconChevronRight /></button>
        </div>
      ) : null}
      <div ref={ref} className={cls} role="list" aria-label={label}>
        {products.map((p, i) => <div role="listitem" key={p._id}><ProductCard product={p} sizes={sizes} eager={i < 2} /></div>)}
      </div>
    </div>
  );
}
