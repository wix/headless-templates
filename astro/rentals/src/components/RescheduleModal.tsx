import { useEffect, useMemo, useState } from 'react';
import {
  buildRescheduledSlot,
  getAvailability,
  rescheduleMyBooking,
  type MyBooking,
} from '../lib/rentals';
import type { AvailabilitySlot } from '../lib/types';
import { CloseIcon } from './icons';
import { formatMinutes, toLocalDateTime } from '../lib/format';

const pad = (n: number) => String(n).padStart(2, '0');
const todayYmd = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

interface Props {
  booking: MyBooking;
  onClose: () => void;
  onDone: () => void;
}

export function RescheduleModal({ booking, onClose, onDone }: Props) {
  const [date, setDate] = useState(todayYmd());
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSelected('');
    getAvailability(booking.serviceId, `${date}T00:00:00`, `${date}T23:59:59`)
      .then((r) => !cancelled && setSlots(r.slots.filter((s) => s.bookable)))
      .catch((e) => !cancelled && setError(e?.message ?? 'Could not load availability.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [booking.serviceId, date]);

  // Unique bookable starts on the chosen date (drop past times if it's today).
  const options = useMemo(() => {
    const now = toLocalDateTime(new Date());
    const isToday = date === todayYmd();
    const seen = new Set<string>();
    return slots
      .filter((s) => (!isToday || s.localStartDate > now) && !seen.has(s.localStartDate) && seen.add(s.localStartDate))
      .sort((a, b) => (a.localStartDate < b.localStartDate ? -1 : 1))
      .map((s) => ({
        key: s.key,
        label: booking.unit === 'DAY' ? 'All day' : s.startLabel,
      }));
  }, [slots, date, booking.unit]);

  const confirm = async () => {
    const slot = slots.find((s) => s.key === selected);
    if (!slot) return;
    setSaving(true);
    setError(null);
    try {
      const newSlot = buildRescheduledSlot(slot.raw, booking.durationMinutes);
      await rescheduleMyBooking(booking.id, booking.revision, newSlot);
      onDone();
    } catch (e) {
      setError((e as Error)?.message ?? 'Could not reschedule this booking.');
      setSaving(false);
    }
  };

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="animate-modal w-full max-w-md rounded-t-2xl bg-surface shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-lg font-semibold tracking-tight text-ink">Reschedule booking</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-muted transition-colors hover:bg-cream hover:text-ink"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <p className="text-sm text-muted">
            <span className="text-ink-soft">{booking.title}</span> · currently {booking.when}
          </p>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">New date</span>
            <input
              type="date"
              min={todayYmd()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </label>

          <div>
            <span className="mb-1 block text-sm font-medium text-ink">New time</span>
            {loading ? (
              <p className="text-sm text-muted">Loading availability…</p>
            ) : error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : options.length === 0 ? (
              <p className="text-sm text-muted">No availability on this date — try another.</p>
            ) : (
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              >
                <option value="">Select a time</option>
                {options.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          <p className="text-xs text-muted">
            Your booking keeps its original length ({formatMinutes(booking.durationMinutes)}).
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={!selected || saving}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors enabled:hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
          >
            {saving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            Confirm reschedule
          </button>
        </div>
      </div>
    </div>
  );
}
