import { useEffect, useMemo, useState } from 'react';
import { hasAvailabilityInRange, listRentals } from '../lib/rentals';
import type { RentalSummary } from '../lib/types';
import { RentalCard } from '../components/RentalCard';
import { DateRangeSearch, type DateRange } from '../components/DateRangeSearch';
import { EMPTY_FILTERS, FilterModal, type RentalFilters } from '../components/FilterModal';
import { EmptyState, ErrorNote, Spinner } from '../components/ui';
import { FilterIcon } from '../components/icons';
import { isClientConfigured } from '../lib/wix-client';

export function RentalsList() {
  const [rentals, setRentals] = useState<RentalSummary[]>([]);
  const [loading, setLoading] = useState(isClientConfigured);
  const [error, setError] = useState<string | null>(null);

  const [range, setRange] = useState<DateRange | null>(null);
  const [availableIds, setAvailableIds] = useState<Set<string> | null>(null);
  const [availLoading, setAvailLoading] = useState(false);

  const [filters, setFilters] = useState<RentalFilters>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    if (!isClientConfigured) return;
    let cancelled = false;
    listRentals()
      .then((r) => !cancelled && setRentals(r))
      .catch((e) => !cancelled && setError(e?.message ?? 'Failed to load rentals.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Availability filtering — only when a date range is applied.
  useEffect(() => {
    if (!range || rentals.length === 0) {
      setAvailableIds(null);
      return;
    }
    let cancelled = false;
    setAvailLoading(true);
    const from = `${range.start}T00:00:00`;
    const to = `${range.end}T23:59:59`;
    Promise.all(
      rentals.map((r) =>
        hasAvailabilityInRange(r.id, from, to)
          .then((ok) => (ok ? r.id : null))
          .catch(() => null),
      ),
    )
      .then((ids) => {
        if (!cancelled) setAvailableIds(new Set(ids.filter((x): x is string => Boolean(x))));
      })
      .finally(() => !cancelled && setAvailLoading(false));
    return () => {
      cancelled = true;
    };
  }, [range, rentals]);

  const featureOptions = useMemo(() => {
    const map = new Map<string, string>();
    rentals.forEach((r) => r.features?.forEach((f) => map.set(f.id, f.name)));
    return [...map].map(([id, name]) => ({ id, name }));
  }, [rentals]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    rentals.forEach((r) => r.category?.name && set.add(r.category.name));
    return [...set].sort();
  }, [rentals]);

  const activeFilterCount =
    filters.features.length + filters.rentalTypes.length + filters.payment.length;

  const filtered = useMemo(() => {
    return rentals.filter((r) => {
      if (category !== 'all' && r.category?.name !== category) return false;
      if (filters.rentalTypes.length && !(r.rentalUnit && filters.rentalTypes.includes(r.rentalUnit)))
        return false;
      if (
        filters.payment.length &&
        !filters.payment.some((p) => (p === 'online' ? r.paymentOnline : r.paymentInPerson))
      )
        return false;
      if (filters.features.length) {
        const ids = new Set((r.features ?? []).map((f) => f.id));
        if (!filters.features.every((id) => ids.has(id))) return false;
      }
      if (range && availableIds && !filters.showUnavailable && !availableIds.has(r.id)) return false;
      return true;
    });
  }, [rentals, category, filters, range, availableIds]);

  // Signature of the current result set — changes when filtering settles, which
  // remounts the grid and replays the staggered entrance animation.
  const resultKey = filtered.map((r) => r.id).join(',');

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Search + filter toolbar */}
      <section className="pt-6 sm:pt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <DateRangeSearch onApply={setRange} initial={range} />
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-medium text-ink shadow-sm transition-colors hover:border-accent sm:w-auto"
          >
            <FilterIcon size={16} /> Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </section>

      {/* Category filters + results */}
      <div className="mt-8">
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-3">
            {['all', ...categories].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  category === cat ? 'bg-ink text-white' : 'bg-cream-deep text-ink-soft hover:bg-line'
                }`}
              >
                {cat === 'all' ? 'All spaces' : cat}
              </button>
            ))}
          </div>
        )}

        {!isClientConfigured ? (
          <EmptyState title="Connect your Wix site to see spaces">
            Add your Headless <code>PUBLIC_WIX_CLIENT_ID</code> to a <code>.env</code> file and
            restart the dev server.
          </EmptyState>
        ) : loading ? (
          <Spinner label="Loading spaces…" />
        ) : error ? (
          <ErrorNote title="Couldn’t load spaces" detail={error} />
        ) : (
          <>
            {availLoading && (
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink-soft shadow-sm">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-soft border-t-accent" />
                Filtering spaces for your dates…
              </div>
            )}
            {filtered.length === 0 ? (
              <EmptyState title="No spaces match your filters">
                Try clearing filters or choosing different dates.
              </EmptyState>
            ) : (
              <div
                key={resultKey}
                className={`grid grid-cols-1 gap-x-6 gap-y-9 pb-10 transition-opacity duration-300 sm:grid-cols-2 lg:grid-cols-3 ${
                  availLoading ? 'opacity-40' : 'opacity-100'
                }`}
              >
                {filtered.map((rental, i) => (
                  <div
                    key={rental.id}
                    className="animate-card-in"
                    style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                  >
                    <RentalCard rental={rental} queryDate={range?.start} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <FilterModal
        open={filterOpen}
        initial={filters}
        featureOptions={featureOptions}
        onApply={(f) => {
          setFilters(f);
          setFilterOpen(false);
        }}
        onClose={() => setFilterOpen(false)}
      />
    </div>
  );
}
