import { useEffect, useMemo, useRef, useState } from 'react';
import { getAvailability, reserve } from '../lib/rentals';
import { formatDurationRange } from '../lib/format';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MINUTES_PER_DAY = 24 * 60;

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const daysBetween = (a: string, b: string) =>
  Math.round((parseYmd(b).getTime() - parseYmd(a).getTime()) / 86_400_000);
const niceDate = (s: string) =>
  parseYmd(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

interface LocationInfo {
  name?: string;
  address?: string;
}

/** Per-day availability: whether it can start/continue a stay, the raw Wix entry
 *  (needed to build the booking) and the ISO end of that day's slot. */
interface DayInfo {
  bookable: boolean;
  raw: unknown;
  endIso: string;
}

interface Props {
  serviceId: string;
  minDays: number;
  maxDays: number;
  priceLabel?: string;
  priceUnit?: string;
  initialDate?: string;
  onLocation?: (loc: LocationInfo | null) => void;
}

export function DayReservationPanel({
  serviceId,
  minDays,
  maxDays,
  priceLabel,
  priceUnit,
  initialDate,
  onLocation,
}: Props) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayKey = ymd(today);
  const base = initialDate ? parseYmd(initialDate) : today;

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(base.getFullYear());
  const [viewMonth, setViewMonth] = useState(base.getMonth());
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [dayInfo, setDayInfo] = useState<Map<string, DayInfo>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const fetched = useRef<Set<string>>(new Set());

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  // Load availability for the viewed month (+ a buffer so stays crossing into the
  // next month can be validated). Results are merged and each month fetched once.
  useEffect(() => {
    const key = `${viewYear}-${viewMonth}`;
    if (fetched.current.has(key)) return;
    fetched.current.add(key);
    let cancelled = false;
    setLoading(true);
    setError(null);
    const from = `${viewYear}-${pad(viewMonth + 1)}-01T00:00:00`;
    const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate();
    const end = new Date(viewYear, viewMonth, lastDay + maxDays + 1);
    const to = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T23:59:59`;
    getAvailability(serviceId, from, to)
      .then((res) => {
        if (cancelled) return;
        setDayInfo((prev) => {
          const next = new Map(prev);
          for (const s of res.slots) {
            const endIso = (s.raw as { slot?: { endDate?: string } })?.slot?.endDate ?? '';
            next.set(s.dayKey, { bookable: s.bookable, raw: s.raw, endIso });
          }
          return next;
        });
        onLocation?.(res.slots[0]?.location ?? null);
      })
      .catch((e) => {
        if (!cancelled) {
          fetched.current.delete(key); // allow a retry
          setError(e?.message ?? 'Could not load availability.');
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // onLocation intentionally omitted to avoid refetch loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, viewYear, viewMonth, maxDays]);

  const canPrevMonth =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());
  const goMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  // Every day in [a, b] inclusive is bookable.
  const spanBookable = (a: string, b: string) => {
    const start = parseYmd(a);
    const days = daysBetween(a, b);
    for (let i = 0; i <= days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      if (!dayInfo.get(ymd(d))?.bookable) return false;
    }
    return true;
  };

  const pickDay = (key: string) => {
    if (!dayInfo.get(key)?.bookable) return;
    // Starting fresh, or restarting after a complete range.
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(key);
      setCheckOut(null);
      return;
    }
    // Choosing the check-out: must be after check-in, within maxDays, and the
    // whole span available. Otherwise treat the click as a new check-in.
    if (key > checkIn && daysBetween(checkIn, key) + 1 <= maxDays && spanBookable(checkIn, key)) {
      setCheckOut(key);
    } else {
      setCheckIn(key);
      setCheckOut(null);
    }
  };

  // Whether a day should be disabled while picking the check-out.
  const disabledAsEnd = (key: string) =>
    !!checkIn &&
    !checkOut &&
    key > checkIn &&
    (daysBetween(checkIn, key) + 1 > maxDays || !spanBookable(checkIn, key));

  const monthCells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < first.getDay(); i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));
    return cells;
  }, [viewYear, viewMonth]);

  const start = checkIn;
  const end = checkOut ?? checkIn;
  const span = start && end ? daysBetween(start, end) + 1 : 0;
  const validSpan = span >= minDays && span <= maxDays;

  const clear = () => {
    setCheckIn(null);
    setCheckOut(null);
  };

  const summary = start
    ? checkOut && checkOut !== checkIn
      ? `${niceDate(start)} – ${niceDate(checkOut)} · ${span} days`
      : `${niceDate(start)} · ${span} day${span > 1 ? 's' : ''}`
    : null;

  const allowedLabel = formatDurationRange(minDays * MINUTES_PER_DAY, maxDays * MINUTES_PER_DAY);
  const canReserve = Boolean(start && end && validSpan && !reserving);

  const handleReserve = async () => {
    if (!start || !end) return;
    const baseInfo = dayInfo.get(start);
    const endInfo = dayInfo.get(end);
    if (!baseInfo?.raw || !endInfo?.endIso) return;
    setReserving(true);
    setReserveError(null);
    try {
      // Clone the check-in day's slot and extend its end to the check-out day's
      // end, producing a single multi-day booking entry.
      const raw = JSON.parse(JSON.stringify(baseInfo.raw));
      if (raw?.slot) raw.slot.endDate = endInfo.endIso;
      await reserve(raw);
    } catch (e) {
      setReserveError((e as Error)?.message ?? 'Could not start checkout.');
      setReserving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <p className="text-sm font-semibold tracking-wide text-ink">Reservation details</p>

      <div ref={popRef} className="relative mt-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-2.5 rounded-xl border border-line bg-cream/40 px-3.5 py-3 text-left text-sm text-ink transition-colors hover:border-accent/50"
        >
          <CalendarIcon size={18} className="shrink-0 text-muted" />
          <span className={summary ? '' : 'text-muted'}>{summary ?? 'Select check-in & check-out'}</span>
        </button>

        {open && (
          <div className="animate-scale-in absolute right-0 z-30 mt-2 w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-surface p-4 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => canPrevMonth && goMonth(-1)}
                disabled={!canPrevMonth}
                className="rounded-lg p-1.5 text-ink transition-colors enabled:hover:bg-cream disabled:opacity-30"
                aria-label="Previous month"
              >
                <ChevronLeftIcon size={18} />
              </button>
              <span className="text-sm font-medium text-ink">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={() => goMonth(1)}
                className="rounded-lg p-1.5 text-ink transition-colors hover:bg-cream"
                aria-label="Next month"
              >
                <ChevronRightIcon size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
              {WEEKDAYS.map((w) => (
                <div key={w} className="py-1">{w}</div>
              ))}
              {monthCells.map((date, i) => {
                if (!date) return <div key={`e${i}`} />;
                const key = ymd(date);
                const info = dayInfo.get(key);
                const isPast = date < today;
                const unavailable = isPast || !info?.bookable || disabledAsEnd(key);
                const isEdge = key === checkIn || key === checkOut;
                const within = checkIn && checkOut && key > checkIn && key < checkOut;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={unavailable}
                    onClick={() => pickDay(key)}
                    className={`aspect-square rounded-lg text-sm transition-colors ${
                      isEdge
                        ? 'bg-ink font-semibold text-white'
                        : within
                          ? 'bg-accent-soft text-ink'
                          : unavailable
                            ? 'cursor-not-allowed text-muted/40'
                            : 'text-ink hover:bg-cream'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-center text-xs text-muted">
              {loading
                ? 'Loading availability…'
                : error
                  ? error
                  : checkIn && !checkOut
                    ? 'Now pick your check-out day.'
                    : `Stays of ${allowedLabel}. Dimmed days are unavailable.`}
            </p>

            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <button type="button" onClick={clear} className="text-sm text-muted transition-colors hover:text-ink">
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={!canReserve}
                className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition-colors enabled:hover:bg-black disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Price + allowed duration */}
      <div className="mt-4 flex items-baseline justify-between">
        <div>
          {priceLabel && <span className="text-xl font-semibold text-ink">{priceLabel}</span>}
          {priceUnit && <span className="text-sm text-muted"> /{priceUnit}</span>}
        </div>
        {allowedLabel && <span className="text-xs text-muted">{allowedLabel} booking</span>}
      </div>

      {reserveError && <p className="mt-3 text-sm text-red-600">{reserveError}</p>}

      <button
        type="button"
        disabled={!canReserve}
        onClick={handleReserve}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors enabled:hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
      >
        {reserving ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Starting checkout…
          </>
        ) : (
          'Reserve'
        )}
      </button>
      <p className="mt-2 text-center text-xs text-muted">
        You won’t be charged until you review and confirm at checkout.
      </p>
    </div>
  );
}
