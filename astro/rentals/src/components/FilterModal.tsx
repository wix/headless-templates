import { useEffect, useState } from 'react';
import { CheckIcon, CloseIcon } from './icons';

export type RentalType = 'HOUR' | 'DAY';
export type PaymentOption = 'online' | 'inPerson';

export interface RentalFilters {
  showUnavailable: boolean;
  features: string[]; // attribute definition ids
  rentalTypes: RentalType[];
  payment: PaymentOption[];
}

export const EMPTY_FILTERS: RentalFilters = {
  showUnavailable: false,
  features: [],
  rentalTypes: [],
  payment: [],
};

interface Props {
  open: boolean;
  initial: RentalFilters;
  featureOptions: { id: string; name: string }[];
  onApply: (filters: RentalFilters) => void;
  onClose: () => void;
}

export function FilterModal({ open, initial, featureOptions, onApply, onClose }: Props) {
  const [showUnavailable, setShowUnavailable] = useState(initial.showUnavailable);
  const [feats, setFeats] = useState<Set<string>>(new Set(initial.features));
  const [types, setTypes] = useState<Set<RentalType>>(new Set(initial.rentalTypes));
  const [pay, setPay] = useState<Set<PaymentOption>>(new Set(initial.payment));

  useEffect(() => {
    if (open) {
      setShowUnavailable(initial.showUnavailable);
      setFeats(new Set(initial.features));
      setTypes(new Set(initial.rentalTypes));
      setPay(new Set(initial.payment));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const toggle = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  const Check = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-center gap-3 border-b border-line py-3.5 text-left last:border-0"
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
          checked ? 'border-ink bg-ink text-white' : 'border-muted/50'
        }`}
      >
        {checked && <CheckIcon size={13} strokeWidth={2.5} />}
      </span>
      <span className="text-ink">{label}</span>
    </button>
  );

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="animate-modal flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-surface shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-lg font-semibold tracking-tight text-ink">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-muted transition-colors hover:bg-cream hover:text-ink"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          <section className="border-b border-line py-5">
            <p className="mb-3 text-sm font-semibold text-ink">Results preferences</p>
            <button type="button" onClick={() => setShowUnavailable((v) => !v)} className="flex items-center gap-3">
              <span className={`relative h-6 w-11 rounded-full transition-colors ${showUnavailable ? 'bg-accent' : 'bg-line'}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${showUnavailable ? 'left-[22px]' : 'left-0.5'}`} />
              </span>
              <span className="text-ink">Show unavailable spaces</span>
            </button>
          </section>

          {featureOptions.length > 0 && (
            <section className="border-b border-line py-5">
              <p className="mb-3 text-sm font-semibold text-ink">Features</p>
              <div className="flex flex-wrap gap-2">
                {featureOptions.map((f) => {
                  const on = feats.has(f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFeats((s) => toggle(s, f.id))}
                      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                        on ? 'border-ink bg-ink text-white' : 'border-line text-ink hover:border-accent'
                      }`}
                    >
                      {f.name}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <section className="border-b border-line py-5">
            <p className="mb-1 text-sm font-semibold text-ink">Booking type</p>
            <Check checked={types.has('HOUR')} onChange={() => setTypes((s) => toggle(s, 'HOUR'))} label="Hourly" />
            <Check checked={types.has('DAY')} onChange={() => setTypes((s) => toggle(s, 'DAY'))} label="Daily" />
          </section>

          <section className="py-5">
            <p className="mb-1 text-sm font-semibold text-ink">Payment options</p>
            <Check checked={pay.has('inPerson')} onChange={() => setPay((s) => toggle(s, 'inPerson'))} label="In person" />
            <Check checked={pay.has('online')} onChange={() => setPay((s) => toggle(s, 'online'))} label="Online" />
          </section>
        </div>

        <div className="flex items-center justify-between border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={() => {
              setShowUnavailable(false);
              setFeats(new Set());
              setTypes(new Set());
              setPay(new Set());
            }}
            className="text-sm text-muted hover:text-ink"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={() =>
              onApply({
                showUnavailable,
                features: [...feats],
                rentalTypes: [...types],
                payment: [...pay],
              })
            }
            className="rounded-xl bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-black"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
