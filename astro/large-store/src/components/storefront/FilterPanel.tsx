// The gallery's filter layout — wire as-is, your grid goes inside:
//
//   <FilterPanel shop={shop}>
//     …your loading / empty / error states and your grid of tiles…
//   </FilterPanel>
//
// Renders: a toolbar (a button per filter group + "All Filters", the result count and the sort), active-filter chips, then your results
// at full width. The filters live in a side drawer that slides in from the right (every screen size): changes are staged and commit on
// Apply; dismissing keeps the current results. A group button opens the drawer scrolled to that group. Picks inside one facet OR
// together, facets AND together — the store owns that. Styled from the @theme tokens.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SORTS, type ShopFilters, type UseShop } from "../../hooks/storefront/useShop";
import type { CatalogSort } from "../../wix/storefront/catalog";
import Dropdown from "../Dropdown";
import CloseButton from "../CloseButton";

interface Draft {
  min: string;
  max: string;
  inStockOnly: boolean;
  choiceIds: string[];
}

const draftFrom = (shop: UseShop): Draft => ({
  min: String(shop.filters.minPrice ?? ""),
  max: String(shop.filters.maxPrice ?? ""),
  inStockOnly: !!shop.filters.inStockOnly,
  choiceIds: shop.selectedChoiceIds,
});

function validPricePair(min: string, max: string): boolean {
  if (min && !Number.isFinite(Number(min))) return false;
  if (max && !Number.isFinite(Number(max))) return false;
  if (min && max && Number(min) > Number(max)) return false;
  return true;
}

export default function FilterPanel({ shop, children, extra }: { shop: UseShop; children?: ReactNode; extra?: ReactNode }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [focusGroup, setFocusGroup] = useState<string | null>(null); // the group the drawer scrolls to on open
  const openDrawer = (group: string | null = null) => { setFocusGroup(group); setSheetOpen(true); };
  const [staged, setStaged] = useState<Draft>(() => draftFrom(shop));
  const panelRef = useRef<HTMLElement>(null);

  // The sheet is an overlay: root-level, scrim, scroll lock, Escape, focus in and back.
  useEffect(() => {
    if (!sheetOpen) return;
    setStaged(draftFrom(shop));
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    if (focusGroup) panelRef.current?.querySelector(`[data-group="${focusGroup}"]`)?.scrollIntoView({ block: "start" });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheetOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      if (opener instanceof HTMLElement) opener.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetOpen]);

  const commit = (d: Draft) => {
    if (!validPricePair(d.min, d.max)) return;
    const next: ShopFilters = {
      ...shop.filters,
      minPrice: d.min || undefined,
      maxPrice: d.max || undefined,
      inStockOnly: d.inStockOnly || undefined,
    };
    const same =
      next.minPrice === shop.filters.minPrice &&
      next.maxPrice === shop.filters.maxPrice &&
      !!next.inStockOnly === !!shop.filters.inStockOnly;
    if (!same) shop.setFilters(next);
    for (const id of d.choiceIds) if (!shop.selectedChoiceIds.includes(id)) shop.toggleChoice(id);
    for (const id of shop.selectedChoiceIds) if (!d.choiceIds.includes(id)) shop.toggleChoice(id);
  };

  const activeCount =
    shop.selectedChoiceIds.length + (shop.filters.inStockOnly ? 1 : 0) + (shop.filters.minPrice || shop.filters.maxPrice ? 1 : 0);
  const choiceName = (id: string) => shop.facets.flatMap((f) => f.choices).find((c) => c.id === id)?.name ?? id;

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar, centred: Filters (opens the drawer) · layout dropdown (passed in) · sort */}
      <div className="flex flex-wrap items-center justify-center gap-(--card-gap)">
        <button type="button" onClick={() => openDrawer()} className="chip">Filters{activeCount ? ` (${activeCount})` : ""}</button>
        {extra}
        <Dropdown ariaLabel="Sort by" value={shop.sort} onChange={(v) => shop.setSort(v as CatalogSort)}
          label={`Sort by: ${SORTS[shop.sort as keyof typeof SORTS]?.label ?? ""}`}
          options={Object.entries(SORTS).map(([key, { label }]) => ({ value: key, label }))} />
      </div>

      {/* Active chips */}
      {shop.hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-center gap-1.5" aria-label="Active filters">
          {shop.selectedChoiceIds.map((id) => (
            <button key={id} type="button" onClick={() => shop.toggleChoice(id)} className="inline-flex min-h-11 items-center rounded-control bg-secondary px-3 text-xs text-foreground">
              {choiceName(id)} ×
            </button>
          ))}
          {shop.filters.inStockOnly && (
            <button type="button" onClick={() => shop.setFilters({ ...shop.filters, inStockOnly: undefined })} className="inline-flex min-h-11 items-center rounded-control bg-secondary px-3 text-xs">In stock ×</button>
          )}
          {(shop.filters.minPrice || shop.filters.maxPrice) && (
            <button type="button" onClick={() => shop.setFilters({ ...shop.filters, minPrice: undefined, maxPrice: undefined })} className="inline-flex min-h-11 items-center rounded-control bg-secondary px-3 text-xs">
              Price {shop.filters.minPrice ?? shop.priceRange?.min ?? "…"}–{shop.filters.maxPrice ?? shop.priceRange?.max ?? "…"} ×
            </button>
          )}
          <button type="button" onClick={shop.clearFilters} className="inline-flex min-h-11 items-center px-1 text-xs text-muted-foreground underline transition-opacity hover:opacity-60">Clear All</button>
        </div>
      )}

      <div className="min-w-0">{children}</div>

      {/* Drawer: slides in from the right; staged until Apply */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-foreground/40" onClick={() => setSheetOpen(false)}>
          <section ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Filters" onClick={(e) => e.stopPropagation()}
            className="filter-drawer flex h-full w-[min(26rem,100%)] flex-col bg-background text-foreground outline-none">
            <div className="flex h-16 shrink-0 items-center justify-between px-6">
              <h2 className="text-h3">Filters</h2>
              <CloseButton label="Close filters" onClick={() => setSheetOpen(false)} className="-mr-2.5" />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <Groups shop={shop} draft={staged} onChange={setStaged} />
            </div>
            <div className="flex gap-3 border-t border-border bg-background px-6 py-4">
              <button type="button" onClick={() => setStaged({ min: "", max: "", inStockOnly: false, choiceIds: [] })} className="btn btn-outline flex-1">Clear</button>
              <button type="button" onClick={() => { commit(staged); setSheetOpen(false); }} className="btn btn-primary flex-1">Apply</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

// The filter groups — one markup for the sidebar (immediate commit) and the sheet (staged).
function Groups({ shop, draft, onChange, immediate = false }: { shop: UseShop; draft: Draft; onChange: (d: Draft) => void; immediate?: boolean }) {
  const toggle = (id: string) =>
    onChange({ ...draft, choiceIds: draft.choiceIds.includes(id) ? draft.choiceIds.filter((x) => x !== id) : [...draft.choiceIds, id] });
  return (
    <div className="flex flex-col divide-y divide-border">
      <Group title="Price" id="Price">
        <PriceControl
          range={shop.priceRange}
          min={draft.min}
          max={draft.max}
          onCommit={(min, max) => onChange({ ...draft, min, max })}
          immediate={immediate}
        />
      </Group>
      <Group title="Availability" id="Availability">
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm transition-opacity hover:opacity-60">
          <input type="checkbox" className="h-5 w-5 accent-foreground" checked={draft.inStockOnly} onChange={(e) => onChange({ ...draft, inStockOnly: e.target.checked })} />
          In stock only
        </label>
      </Group>
      {shop.facets.map((facet) => (
        <Group key={facet.id} id={facet.name} title={facet.name} count={facet.choices.filter((c) => draft.choiceIds.includes(c.id)).length}>
          <div className="flex flex-wrap gap-2">
            {facet.choices.map((c) => {
              const on = draft.choiceIds.includes(c.id);
              return facet.isColor && c.colorCode ? (
                <button key={c.id} type="button" aria-pressed={on} aria-label={c.name} title={c.name} onClick={() => toggle(c.id)}
                  // 44px hit area around a 28px dot; the selection is an offset ring, so the swatch still reads as its colour
                  className="group/sw flex h-11 w-11 items-center justify-center rounded-full">
                  <span className={`block h-7 w-7 rounded-full outline-offset-2 transition-[outline-color,outline-width] duration-[160ms] ${on ? "outline-2 outline-foreground" : "outline-1 outline-border group-hover/sw:outline-2 group-hover/sw:outline-foreground"}`} style={{ backgroundColor: c.colorCode }} />
                </button>
              ) : (
                <button key={c.id} type="button" aria-pressed={on} onClick={() => toggle(c.id)}
                  className={`min-h-11 min-w-11 rounded-control border px-4 text-sm transition-colors duration-[160ms] ${on ? "border-foreground bg-foreground text-background" : "border-border bg-background text-foreground hover:border-foreground hover:bg-foreground hover:text-background"}`}>
                  {c.name}
                </button>
              );
            })}
          </div>
        </Group>
      ))}
    </div>
  );
}

// A collapsible group — native <details>, open by default, the selected count on the summary.
function Group({ title, id, count = 0, children }: { title: string; id: string; count?: number; children: ReactNode }) {
  return (
    <details open data-group={id} className="group py-3">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-medium transition-opacity hover:opacity-60">
        <span>{title}</span>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground transition-transform group-open:rotate-180"><path d="M5 9l7 7 7-7" /></svg>
      </summary>
      <div className="pt-3">{children}</div>
    </details>
  );
}

// Two-handle range slider bounded by the scope's real prices, with the numeric pair under it.
// Local drafts while dragging/typing; a VALID pair commits on release / blur / Enter (immediate mode)
// or on every change (staged mode, where Apply commits later).
function PriceControl({ range, min, max, onCommit, immediate }: {
  range: UseShop["priceRange"]; min: string; max: string; onCommit: (min: string, max: string) => void; immediate: boolean;
}) {
  const [lo, setLo] = useState(min);
  const [hi, setHi] = useState(max);
  useEffect(() => { setLo(min); setHi(max); }, [min, max]);
  const bounds = range ?? null;
  const loN = lo === "" ? (bounds?.min ?? 0) : Number(lo);
  const hiN = hi === "" ? (bounds?.max ?? 0) : Number(hi);
  const step = bounds ? Math.max(1, Math.round((bounds.max - bounds.min) / 100)) : 1;
  const pct = (v: number) => (bounds ? ((v - bounds.min) / (bounds.max - bounds.min)) * 100 : 0);
  const publish = (a: string, b: string) => {
    // at the bounds the filter is "no bound" — omit it rather than sending the catalog's own extremes
    const A = bounds && a !== "" && Number(a) <= bounds.min ? "" : a;
    const B = bounds && b !== "" && Number(b) >= bounds.max ? "" : b;
    if (validPricePair(A, B)) onCommit(A, B);
  };
  const setFromSlider = (which: "lo" | "hi", v: number) => {
    const a = which === "lo" ? String(Math.min(v, hiN)) : lo;
    const b = which === "hi" ? String(Math.max(v, loN)) : hi;
    setLo(a); setHi(b);
    if (!immediate) publish(a, b);
  };
  const release = () => immediate && publish(lo, hi);
  const thumb = "pointer-events-none absolute inset-x-0 top-0 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-foreground [&::-webkit-slider-thumb]:bg-background [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-foreground [&::-moz-range-thumb]:bg-background";
  return (
    <div className="flex flex-col gap-3">
      {bounds && (
        <div className="relative h-6" aria-hidden={false}>
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded bg-secondary" />
          <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded bg-foreground" style={{ left: `${pct(loN)}%`, right: `${100 - pct(hiN)}%` }} />
          <input type="range" aria-label="Minimum price" min={bounds.min} max={bounds.max} step={step} value={loN}
            onChange={(e) => setFromSlider("lo", Number(e.target.value))} onPointerUp={release} onKeyUp={release} className={thumb} />
          <input type="range" aria-label="Maximum price" min={bounds.min} max={bounds.max} step={step} value={hiN}
            onChange={(e) => setFromSlider("hi", Number(e.target.value))} onPointerUp={release} onKeyUp={release} className={thumb} />
        </div>
      )}
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="filter-min">Minimum price</label>
        <input id="filter-min" inputMode="decimal" placeholder={bounds ? String(bounds.min) : "Min"} value={lo}
          onChange={(e) => { setLo(e.target.value); if (!immediate) publish(e.target.value, hi); }}
          onBlur={release} onKeyDown={(e) => e.key === "Enter" && release()}
          className="w-full min-w-0 min-h-11 rounded-control border border-border bg-background px-3 text-sm" />
        <span className="text-muted-foreground">–</span>
        <label className="sr-only" htmlFor="filter-max">Maximum price</label>
        <input id="filter-max" inputMode="decimal" placeholder={bounds ? String(bounds.max) : "Max"} value={hi}
          onChange={(e) => { setHi(e.target.value); if (!immediate) publish(lo, e.target.value); }}
          onBlur={release} onKeyDown={(e) => e.key === "Enter" && release()}
          className="w-full min-w-0 min-h-11 rounded-control border border-border bg-background px-3 text-sm" />
      </div>
    </div>
  );
}
