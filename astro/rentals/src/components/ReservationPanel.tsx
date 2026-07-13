import { useEffect, useMemo, useRef, useState } from 'react';
import { getAvailability, reserve } from '../lib/rentals';
import type { AvailabilitySlot } from '../lib/types';
import { formatDurationRange, formatTimeLabel } from '../lib/format';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const localDT = (d: Date) =>
  `${ymd(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const parseYmd = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

interface LocationInfo {
  name?: string;
  address?: string;
}

interface Props {
  serviceId: string;
  minMinutes: number;
  maxMinutes: number;
  priceLabel?: string;
  priceUnit?: string;
  initialDate?: string;
  onLocation?: (loc: LocationInfo | null) => void;
}

export function ReservationPanel({
  serviceId,
  minMinutes,
  maxMinutes,
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
  const startBase = initialDate ? parseYmd(initialDate) : today;

  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate ?? null);
  const [viewYear, setViewYear] = useState(startBase.getFullYear());
  const [viewMonth, setViewMonth] = useState(startBase.getMonth());
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [timeZone, setTimeZone] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setStartTime('');
    setEndTime('');
    getAvailability(serviceId, `${selectedDate}T00:00:00`, `${selectedDate}T23:59:59`)
      .then((res) => {
        if (cancelled) return;
        setSlots(res.slots);
        setTimeZone(res.timeZone);
        onLocation?.(res.slots[0]?.location ?? null);
      })
      .catch((e) => !cancelled && setError(e?.message ?? 'Could not load availability.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // onLocation intentionally omitted to avoid refetch loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, selectedDate]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const byStart = useMemo(() => {
    const m = new Map<string, AvailabilitySlot>();
    for (const s of slots) if (s.bookable) m.set(s.localStartDate, s);
    return m;
  }, [slots]);

  const startOptions = useMemo(() => {
    const nowIso = localDT(new Date());
    const isToday = selectedDate === todayKey;
    return slots
      .filter((s) => s.bookable)
      .filter((s) => !isToday || s.localStartDate > nowIso)
      .map((s) => s.localStartDate)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort();
  }, [slots, selectedDate, todayKey]);

  const endOptions = useMemo(() => {
    type Opt = { value: string; endIso: string; label: string; hours: number };
    if (!startTime) return [] as Opt[];
    const base = byStart.get(startTime);
    if (!base) return [] as Opt[];
    // The atomic bookable unit for this service — e.g. 60 min for an hourly room,
    // or a fixed 240 min for a 4-hour-only room. A booking spans whole multiples of
    // it, so we must step by this (not a hardcoded hour) or we'd overshoot the end.
    const slotMinutes = Math.max(
      1,
      Math.round(
        (new Date(base.localEndDate).getTime() - new Date(base.localStartDate).getTime()) / 60000,
      ),
    );
    const minUnits = Math.max(1, Math.round(minMinutes / slotMinutes));
    const maxUnits = Math.max(minUnits, Math.round(maxMinutes / slotMinutes));
    const start = new Date(startTime);
    const opts: Opt[] = [];
    for (let k = 1; k <= maxUnits; k++) {
      // Each consecutive unit [start+(k-1) units] must be bookable for the span to be free.
      const unitStart = new Date(start);
      unitStart.setMinutes(unitStart.getMinutes() + (k - 1) * slotMinutes);
      const block = byStart.get(localDT(unitStart));
      if (!block) break; // stop at first gap
      if (k >= minUnits) {
        opts.push({
          value: block.localEndDate, // wall-clock end of the span (start + k units)
          endIso: (block.raw as { slot?: { endDate?: string } })?.slot?.endDate ?? '',
          label: formatTimeLabel(block.localEndDate),
          hours: (k * slotMinutes) / 60,
        });
      }
    }
    return opts;
  }, [startTime, byStart, minMinutes, maxMinutes]);

  const monthCells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < first.getDay(); i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));
    return cells;
  }, [viewYear, viewMonth]);

  const canPrevMonth =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const goMonth = (delta: number) => {
    const m = viewMonth + delta;
    const d = new Date(viewYear, m, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const durationLabel = () => formatDurationRange(minMinutes, maxMinutes) ?? '';

  const canReserve = Boolean(selectedDate && startTime && endTime && !reserving);

  const handleReserve = async () => {
    const base = byStart.get(startTime);
    const opt = endOptions.find((o) => o.value === endTime);
    if (!base || !opt) return;
    setReserving(true);
    setReserveError(null);
    try {
      // Clone the SlotAvailability entry and extend its end for multi-hour rentals.
      const raw = JSON.parse(JSON.stringify(base.raw));
      if (raw?.slot && opt.endIso) raw.slot.endDate = opt.endIso;
      await reserve(raw);
    } catch (e) {
      setReserveError((e as Error)?.message ?? 'Could not start checkout.');
      setReserving(false);
    }
  };

  const summary =
    selectedDate && startTime && endTime
      ? `${parseYmd(selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${formatTimeLabel(startTime)} – ${formatTimeLabel(endTime)}`
      : null;

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <p className="text-sm font-semibold tracking-wide text-ink">Reservation details</p>

      <div ref={popRef} className="relative mt-3">
        {/* Date/time field */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-2.5 rounded-xl border border-line bg-cream/40 px-3.5 py-3 text-left text-sm text-ink transition-colors hover:border-accent/50"
        >
          <CalendarIcon size={18} className="shrink-0 text-muted" />
          <span className={summary ? '' : 'text-muted'}>
            {summary ?? (selectedDate ?? 'Select a date & time')}
          </span>
        </button>

        {/* Popover */}
        {open && (
          <div className="animate-scale-in absolute right-0 z-30 mt-2 w-[520px] max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-surface p-4 shadow-xl">
            <div className="flex flex-col gap-5 sm:flex-row">
              {/* Calendar */}
              <div className="sm:w-1/2">
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
                    const isPast = date < today;
                    const isToday = key === todayKey;
                    const isSelected = key === selectedDate;
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={isPast}
                        onClick={() => setSelectedDate(key)}
                        className={`aspect-square rounded-lg text-sm transition-colors ${
                          isSelected
                            ? 'bg-ink font-semibold text-white ring-2 ring-accent ring-offset-1'
                            : isPast
                              ? 'cursor-not-allowed text-muted/40'
                              : 'text-ink hover:bg-cream'
                        } ${isToday && !isSelected ? 'ring-1 ring-inset ring-line' : ''}`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Times */}
              <div className="sm:w-1/2">
                {!selectedDate ? (
                  <p className="pt-2 text-sm text-muted">Pick a date to see available times.</p>
                ) : loading ? (
                  <p className="pt-2 text-sm text-muted">Loading times…</p>
                ) : error ? (
                  <p className="pt-2 text-sm text-red-600">{error}</p>
                ) : startOptions.length === 0 ? (
                  <p className="pt-2 text-sm text-muted">No availability on this date.</p>
                ) : (
                  <div className="space-y-3">
                    <label className="block">
                      <span className="mb-1 block text-sm text-ink">Start time</span>
                      <select
                        value={startTime}
                        onChange={(e) => {
                          setStartTime(e.target.value);
                          setEndTime('');
                        }}
                        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                      >
                        <option value="">Select</option>
                        {startOptions.map((s) => (
                          <option key={s} value={s}>{formatTimeLabel(s)}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm text-ink">End time</span>
                      <select
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        disabled={!startTime}
                        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent disabled:opacity-50"
                      >
                        <option value="">Select</option>
                        {endOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label} · {o.hours}h
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedDate(null);
                  setStartTime('');
                  setEndTime('');
                }}
                className="text-sm text-muted hover:text-ink"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={!(selectedDate && startTime && endTime)}
                className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition-colors enabled:hover:bg-black disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
              >
                Select
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Price + duration */}
      <div className="mt-4 flex items-baseline justify-between">
        <div>
          {priceLabel && <span className="text-xl font-semibold text-ink">{priceLabel}</span>}
          {priceUnit && <span className="text-sm text-muted"> /{priceUnit}</span>}
        </div>
        <span className="text-xs text-muted">{durationLabel()} booking</span>
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
