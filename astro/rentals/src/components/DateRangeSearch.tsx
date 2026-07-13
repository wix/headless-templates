import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
} from './icons';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const nice = (s: string) =>
  parseYmd(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export interface DateRange {
  start: string;
  end: string;
}

export function DateRangeSearch({
  onApply,
  initial,
}: {
  onApply: (range: DateRange | null) => void;
  initial?: DateRange | null;
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [start, setStart] = useState<string | null>(initial?.start ?? null);
  const [end, setEnd] = useState<string | null>(initial?.end ?? null);
  const [applied, setApplied] = useState<DateRange | null>(initial ?? null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const pick = (key: string) => {
    if (!start || (start && end)) {
      setStart(key);
      setEnd(null);
    } else if (key >= start) {
      setEnd(key);
    } else {
      setStart(key);
      setEnd(null);
    }
  };

  const canPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());
  const shift = (delta: number) => {
    if (delta < 0 && !canPrev) return;
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const apply = () => {
    if (start) {
      const r = { start, end: end ?? start };
      setApplied(r);
      onApply(r);
    }
    setOpen(false);
  };
  const clear = () => {
    setStart(null);
    setEnd(null);
    setApplied(null);
    onApply(null);
  };

  const label = applied
    ? applied.start === applied.end
      ? nice(applied.start)
      : `${nice(applied.start)} – ${nice(applied.end)}`
    : 'Select dates';

  const renderMonth = (year: number, month: number) => {
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < first.getDay(); i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return (
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">{w}</div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`} />;
          const key = ymd(date);
          const past = date < today;
          const isEdge = key === start || key === end;
          const within = start && end && key > start && key < end;
          return (
            <button
              key={key}
              type="button"
              disabled={past}
              onClick={() => pick(key)}
              className={`aspect-square rounded-lg text-sm transition-colors ${
                isEdge
                  ? 'bg-ink font-semibold text-white'
                  : within
                    ? 'bg-accent-soft text-ink'
                    : past
                      ? 'cursor-not-allowed text-muted/40'
                      : 'text-ink hover:bg-cream'
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    );
  };

  const next = new Date(viewYear, viewMonth + 1, 1);

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <div className="flex overflow-hidden rounded-xl border border-line bg-surface shadow-sm transition-colors focus-within:border-accent">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center gap-2.5 px-4 py-3 text-left text-sm"
        >
          <CalendarIcon size={18} className="shrink-0 text-muted" />
          <span className={applied ? 'text-ink' : 'text-muted'}>{label}</span>
          <ChevronDownIcon
            size={16}
            className={`ml-auto text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>
        <button
          type="button"
          onClick={() => (open ? apply() : setOpen(true))}
          className="flex items-center justify-center bg-accent px-4 text-white transition-colors hover:bg-accent-hover"
          aria-label="Search dates"
        >
          <SearchIcon size={18} />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 z-40 mt-2 w-[min(680px,calc(100vw-2rem))]">
          <div className="animate-scale-in rounded-2xl border border-line bg-surface p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => shift(-1)}
                disabled={!canPrev}
                className="rounded-lg p-1.5 text-ink transition-colors enabled:hover:bg-cream disabled:opacity-30"
                aria-label="Previous month"
              >
                <ChevronLeftIcon size={18} />
              </button>
              <div className="flex flex-1 justify-around px-4 text-sm font-medium text-ink">
                <span>{MONTHS[viewMonth]} {viewYear}</span>
                <span className="hidden sm:inline">{MONTHS[next.getMonth()]} {next.getFullYear()}</span>
              </div>
              <button
                type="button"
                onClick={() => shift(1)}
                className="rounded-lg p-1.5 text-ink transition-colors hover:bg-cream"
                aria-label="Next month"
              >
                <ChevronRightIcon size={18} />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {renderMonth(viewYear, viewMonth)}
              <div className="hidden sm:block">{renderMonth(next.getFullYear(), next.getMonth())}</div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
              <button type="button" onClick={clear} className="text-sm text-muted transition-colors hover:text-ink">
                Clear
              </button>
              <button
                type="button"
                onClick={apply}
                disabled={!start}
                className="rounded-lg bg-ink px-5 py-2 text-sm font-medium text-white transition-colors enabled:hover:bg-black disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
