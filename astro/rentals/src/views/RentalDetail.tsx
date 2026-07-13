import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getAvailability, getRentalBySlug } from '../lib/rentals';
import type { PolicyItem, RentalDetails } from '../lib/types';
import { ReservationPanel } from '../components/ReservationPanel';
import { DayReservationPanel } from '../components/DayReservationPanel';
import { EmptyState, ErrorNote, Spinner } from '../components/ui';
import { buildBookingPolicy, formatMoney } from '../lib/format';
import {
  BuildingIcon,
  CardIcon,
  ChevronLeftIcon,
  MapPinIcon,
  ShieldIcon,
  UsersIcon,
} from '../components/icons';
import { isClientConfigured } from '../lib/wix-client';

interface LocationInfo {
  name?: string;
  address?: string;
}

const POLICY_ICON: Record<PolicyItem['kind'], typeof ShieldIcon> = {
  cancellation: ShieldIcon,
  payment: CardIcon,
  capacity: UsersIcon,
};

export function RentalDetail() {
  const { slug = '' } = useParams();
  const [searchParams] = useSearchParams();
  const initialDate = searchParams.get('date') ?? undefined;

  const [rental, setRental] = useState<RentalDetails | undefined>();
  const [loading, setLoading] = useState(isClientConfigured);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [location, setLocation] = useState<LocationInfo | null>(null);

  useEffect(() => {
    if (!isClientConfigured) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    getRentalBySlug(slug)
      .then((r) => {
        if (cancelled) return;
        if (!r) {
          setNotFound(true);
          return;
        }
        setRental(r);
        // Fetch a small availability window to surface the location up-front.
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const fmt = (d: Date) =>
          `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T00:00:00`;
        const to = new Date(now);
        to.setDate(to.getDate() + 7);
        getAvailability(r.id, fmt(now), fmt(to))
          .then((res) => {
            if (cancelled) return;
            if (res.slots[0]?.location) setLocation(res.slots[0].location);
          })
          .catch(() => {});
      })
      .catch((e) => !cancelled && setError(e?.message ?? 'Failed to load this rental.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!isClientConfigured) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState title="Connect your Wix site first">
          Add <code>PUBLIC_WIX_CLIENT_ID</code> to a <code>.env</code> file to load space details.
        </EmptyState>
      </div>
    );
  }
  if (loading) return <Spinner label="Loading space…" />;
  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <ErrorNote title="Something went wrong" detail={error} />
      </div>
    );
  }
  if (notFound || !rental) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <EmptyState title="Space not found">
          This space may have been removed. Browse the full list to find another.
        </EmptyState>
        <Link to="/" className="mt-4 inline-block font-medium text-accent hover:text-accent-hover">
          ← All spaces
        </Link>
      </div>
    );
  }

  const price = formatMoney(rental.price);
  const images = rental.images;
  const hero = images[activeImage] ?? images[0];
  const range = rental.durationRange;
  const policy = buildBookingPolicy(rental);

  // Concise meta line — category and rental type. Duration lives in the
  // reservation panel and location on its own line, so neither is repeated here.
  const meta: string[] = [];
  if (rental.category?.name) meta.push(rental.category.name);
  if (range) meta.push(range.unit === 'HOUR' ? 'Booked by the hour' : 'Booked by the day');

  // Show the location once — prefer the full address, fall back to its name.
  const locationText = location?.address ?? location?.name;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ChevronLeftIcon size={16} /> Back to spaces
      </Link>

      {/* Hero */}
      <div className="animate-fade-up mt-4 overflow-hidden rounded-2xl border border-line bg-cream-deep">
        {hero ? (
          <img
            src={hero.url}
            alt={hero.altText ?? rental.name}
            className="h-[240px] w-full object-cover sm:h-[380px]"
          />
        ) : (
          <div className="flex h-[240px] w-full items-center justify-center text-muted sm:h-[380px]">
            <BuildingIcon size={72} />
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActiveImage(i)}
              aria-label={`View image ${i + 1}`}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                i === activeImage ? 'border-accent' : 'border-transparent hover:border-line'
              }`}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Body */}
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {rental.name}
            </h1>
            {price && (
              <div className="whitespace-nowrap text-right">
                <span className="text-2xl font-semibold text-ink">{price}</span>
                {rental.priceUnit && <span className="text-sm text-muted"> / {rental.priceUnit}</span>}
              </div>
            )}
          </div>

          {meta.length > 0 && (
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {meta.map((m, i) => (
                <span key={m}>
                  {i > 0 && <span className="px-2 text-line">•</span>}
                  {m}
                </span>
              ))}
            </p>
          )}

          {locationText && (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-soft">
              <MapPinIcon size={16} className="shrink-0 text-muted" />
              {locationText}
            </p>
          )}

          {rental.description && (
            <p className="mt-6 whitespace-pre-line leading-relaxed text-ink-soft">
              {rental.description}
            </p>
          )}

          {rental.features && rental.features.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold tracking-tight text-ink">What’s included</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {rental.features.map((f) => (
                  <span
                    key={f.id}
                    className="rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink"
                  >
                    {f.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Booking policy — cancellation, payment and capacity in plain language. */}
          {policy.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold tracking-tight text-ink">Booking policy</h2>
              <ul className="mt-4 space-y-3.5 rounded-2xl border border-line bg-surface p-5">
                {policy.map((item) => {
                  const PolicyIcon = POLICY_ICON[item.kind];
                  return (
                    <li key={item.kind} className="flex items-start gap-3 text-sm text-ink-soft">
                      <PolicyIcon size={18} className="mt-0.5 shrink-0 text-accent" />
                      <span className="leading-relaxed">{item.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Reservation card — day rentals use a date-range picker, hourly rentals
            use a single-day + time-slot picker. */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {range?.unit === 'DAY' ? (
            <DayReservationPanel
              serviceId={rental.id}
              minDays={Math.max(1, Math.round((range.minMinutes ?? 1440) / (24 * 60)))}
              maxDays={Math.max(1, Math.round((range.maxMinutes ?? range.minMinutes ?? 1440) / (24 * 60)))}
              priceLabel={price}
              priceUnit={rental.priceUnit}
              initialDate={initialDate}
              onLocation={setLocation}
            />
          ) : (
            <ReservationPanel
              serviceId={rental.id}
              minMinutes={range?.minMinutes ?? 60}
              maxMinutes={range?.maxMinutes ?? range?.minMinutes ?? 60}
              priceLabel={price}
              priceUnit={rental.priceUnit}
              initialDate={initialDate}
              onLocation={setLocation}
            />
          )}
        </div>
      </div>
    </div>
  );
}
