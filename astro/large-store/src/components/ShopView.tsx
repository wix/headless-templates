// The listing island, mounted by /shop AND /category/[slug] — one component, two pages.
// The shipped FilterPanel owns the toolbar (result count, sort), active chips and the filter
// sidebar / sheet; this file owns only the results: grid, states, "load more".
// A search arrives as ?q= (the header's form), which useShop reads and runs on Wix across the
// whole catalog — so a search result page is this same listing with a heading line above it.
import { useEffect, useState } from "react";
import { useShop } from "../hooks/storefront/useShop";
import type { Category, ProductSummary } from "../wix/storefront/types";
import Dropdown from "./Dropdown";
import FilterPanel from "./storefront/FilterPanel";
import type { GridBanner } from "../lib/site";
import ProductCard from "./ProductCard";
import PromoBanner from "./PromoBanner";

export default function ShopView(props: { initialProducts?: ProductSummary[]; initialCategories?: Category[]; initialCategoryId?: string | null; banners?: GridBanner[] }) {
  const banners = props.banners ?? [];
  const shop = useShop(props);
  // Desktop grid layout, chosen by the visitor and remembered: "mix" (default: two rows of 4, one row of 2 larger cards), "4" or "2" columns.
  const [layout, setLayout] = useState<GridLayout>("mix");
  useEffect(() => { try { const v = window.localStorage.getItem("shop-layout"); if (v === "mix" || v === "4" || v === "2") setLayout(v); } catch { /* storage unavailable: the default stays */ } }, []);
  const chooseLayout = (v: GridLayout) => { setLayout(v); try { window.localStorage.setItem("shop-layout", v); } catch { /* ignore */ } };
  const { products, loading, error, hasMore, loadMore, loadingMore, hasActiveFilters, clearFilters, retry, filters } = shop;
  const search = String(filters.search ?? "").trim();
  // hasActiveFilters counts the text search too; the empty state needs to know about filters OTHER than it.
  const otherFilters = !!(filters.minPrice || filters.maxPrice || filters.inStockOnly || shop.selectedChoiceIds.length);

  return (
    <div>
      {search && (
        <p className="mb-6 text-center text-base">
          Results for <strong className="font-semibold">“{search}”</strong>{" "}
          <a href="/shop" className="ml-2 text-sm text-muted-foreground underline underline-offset-4 transition-opacity hover:opacity-60">Clear search</a>
        </p>
      )}
      <FilterPanel shop={shop} extra={<LayoutSwitch value={layout} onChange={chooseLayout} />}>
        {error && (
          <div role="alert" className="bg-secondary p-6">
            <p className="text-sm text-destructive">{error}</p>
            <button type="button" onClick={retry} className="btn btn-secondary mt-4">Try Again</button>
          </div>
        )}

        {!error && products === null && (
          <ul data-layout={layout} className="shop-grid grid grid-cols-2 gap-x-(--card-gap) gap-y-(--card-gap-y) lg:grid-cols-12" aria-label="Loading products" aria-busy="true">
            {Array.from({ length: 8 }, (_, i) => (
              <li key={i}><div className="aspect-[3/4] animate-pulse bg-muted" /><div className="mt-3 h-4 w-3/4 animate-pulse bg-muted" /><div className="mt-2 h-4 w-1/3 animate-pulse bg-muted" /></li>
            ))}
          </ul>
        )}

        {!error && products && products.length === 0 && (
          <div className="bg-secondary p-8 text-center lg:p-14">
            {otherFilters ? (
              <>
                <p className="text-lg font-medium">No products match these filters</p>
                <p className="mt-2 text-muted-foreground">Loosen a filter or start again.</p>
                <button type="button" onClick={clearFilters} className="btn btn-primary mt-6">Clear All Filters</button>
              </>
            ) : search ? (
              <>
                <p className="text-lg font-medium">Nothing found for “{search}”</p>
                <p className="mt-2 text-muted-foreground">Check the spelling, or browse everything.</p>
                <a href="/shop" className="btn btn-primary mt-6">Shop All Products</a>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">There are no products here yet</p>
                <a href="/shop" className="btn btn-primary mt-6">Shop All Products</a>
              </>
            )}
          </div>
        )}

        {!error && products && products.length > 0 && (
          <>
            <h2 className="sr-only">Products</h2>
            <ul data-layout={layout} className={`shop-grid grid grid-cols-2 gap-x-(--card-gap) gap-y-(--card-gap-y) transition-opacity lg:grid-cols-12 ${loading ? "opacity-50" : ""}`} aria-busy={loading}>
              {(() => {
                // Desktop rhythm (see .shop-grid in global.css): two rows of 4 across, then one row of 2 (larger), repeating — the cells at grid
                // position 9 and 10 of every 10 is a "large" one, so its photo is requested at about a third of the window.
                let pos = 0;
                const big = (k: number) => layout === "2" || (layout === "mix" && k % 10 >= 8);
                const cell = (k: number) => (big(k) ? "(min-width: 1024px) 36vw, 50vw" : layout === "4" ? "(min-width: 1024px) 24vw, 50vw" : undefined);
                return products.flatMap((p, i) => {
                  // A banner sits IN the grid, as one cell, before the product at its index — never after the last product.
                  const banner = banners.find((b) => b.at === i);
                  const out = [];
                  if (banner) out.push(<li key={`banner-${banner.at}`}><PromoBanner banner={banner} /></li>), pos++;
                  out.push(<li key={p.id}><ProductCard p={p} priority={i < 4} sizes={cell(pos)} /></li>);
                  pos++;
                  return out;
                });
              })()}
            </ul>
            {hasMore && (
              <div className="mt-12 flex justify-center">
                <button type="button" onClick={loadMore} disabled={loadingMore} className="btn btn-secondary min-w-48 disabled:opacity-50">
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </FilterPanel>
    </div>
  );
}

type GridLayout = "mix" | "4" | "2";

// The grid switcher in the toolbar (desktop only — under 1024px the grid is always two across): a dropdown. Closed, it reads "Layout"
// (the default, Mix); once another layout is chosen it names that one. Options: Mix · 4 columns · 2 columns.
const LAYOUTS: { value: GridLayout; label: string }[] = [
  { value: "mix", label: "Mix" },
  { value: "4", label: "4 columns" },
  { value: "2", label: "2 columns" },
];
function LayoutSwitch({ value, onChange }: { value: GridLayout; onChange: (v: GridLayout) => void }) {
  return (
    <Dropdown className="hidden lg:block" ariaLabel="Grid layout" value={value} onChange={onChange} options={LAYOUTS}
      label={value === "mix" ? "Layout" : LAYOUTS.find((l) => l.value === value)!.label} />
  );
}
