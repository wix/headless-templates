import { Link } from 'react-router-dom';
import type { RentalSummary } from '../lib/types';
import { formatDurationRange, formatMoney } from '../lib/format';
import { ArrowRightIcon, BuildingIcon } from './icons';

export function RentalCard({
  rental,
  queryDate,
}: {
  rental: RentalSummary;
  queryDate?: string;
}) {
  const price = formatMoney(rental.price);
  const to = queryDate
    ? `/rental/${encodeURIComponent(rental.slug)}?date=${queryDate}`
    : `/rental/${encodeURIComponent(rental.slug)}`;
  const badge =
    rental.rentalUnit === 'DAY' ? 'Daily' : rental.rentalUnit === 'HOUR' ? 'Hourly' : null;
  const minMax =
    formatDurationRange(rental.minMinutes, rental.maxMinutes) ?? rental.durationLabel;

  return (
    <div className="group flex flex-col">
      <Link
        to={to}
        className="hover-lift relative block aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-cream-deep"
      >
        {rental.image ? (
          <img
            src={rental.image.url}
            alt={rental.image.altText ?? rental.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            <BuildingIcon size={44} />
          </div>
        )}
        {badge && (
          <span className="absolute right-3 top-3 rounded-full bg-surface/95 px-3 py-1 text-xs font-medium text-ink shadow-sm ring-1 ring-line">
            {badge}
          </span>
        )}
      </Link>

      <div className="mt-3">
        <Link to={to}>
          <h3 className="text-lg font-semibold tracking-tight text-ink transition-colors group-hover:text-accent">
            {rental.name}
          </h3>
        </Link>
        {price && (
          <p className="mt-1 text-ink">
            <span className="font-semibold">{price}</span>
            {rental.priceUnit && <span className="text-muted"> / {rental.priceUnit}</span>}
          </p>
        )}
        {minMax && <p className="mt-0.5 text-sm text-muted">{minMax}</p>}
        <Link
          to={to}
          className="group/link mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
        >
          View & reserve
          <ArrowRightIcon
            size={16}
            className="transition-transform duration-200 group-hover/link:translate-x-0.5"
          />
        </Link>
      </div>
    </div>
  );
}
