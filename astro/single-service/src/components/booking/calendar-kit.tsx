// Pieces both calendars share (the Home month calendar and the service page week calendar): the time list, the action that
// carries the visitor to Confirm, the time-zone line, the slot loader and the Appointment a picked slot becomes.
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchSlots, type Slot } from "../../lib/availability";
import { setSelection, type Appointment } from "../../lib/selection";
import { timeLabel, whenLabel, zoneLabel } from "../../lib/dates";
import { formatDuration, type ServiceDTO } from "../../lib/services";
import { isIntro } from "../../lib/site";

export const Chevron = ({ dir }: { dir: "left" | "right" }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d={dir === "left" ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** A slot becomes the visitor's one appointment. The staff member is always concrete (the slot's, else the service's only one). */
export function toAppointment(service: ServiceDTO, slot: Slot, timeZone: string, from: Appointment["from"]): Appointment {
  const staff = slot.staff[0] ?? service.staff[0];
  return {
    serviceId: service.id, serviceName: service.name, minutes: service.minutes, price: service.price, payment: service.payment,
    formId: service.formId, locationLabel: service.locationLabel,
    startDate: slot.localStartDate, endDate: slot.localEndDate, timeZone, scheduleId: slot.scheduleId,
    staff: { id: staff?.id ?? "", name: staff?.name ?? "" }, from, intro: isIntro(service),
  };
}

/** Loads [fromKey, toKey] for the service in the visitor's zone, cached per range so paging back and forth costs nothing. */
export function useSlotLoader(serviceId: string, timeZone: string) {
  const cache = useRef(new Map<string, Slot[]>());
  return useCallback(async (fromKey: string, toKey: string) => {
    const k = `${fromKey}|${toKey}`;
    const hit = cache.current.get(k);
    if (hit) return hit;
    const res = await fetchSlots({ serviceId, fromKey, toKey, timeZone });
    cache.current.set(k, res);
    return res;
  }, [serviceId, timeZone]);
}

/** The times of one day: 3 columns inside a bounded, scrolling area (a 40-time day never grows the page). */
export function TimeList({ slots, picked, onPick, label }: { slots: Slot[]; picked?: string; onPick: (s: Slot) => void; label: string }) {
  return (
    <div className="time-list" tabIndex={-1}>
      <ul className="time-grid" aria-label={label}>
        {slots.map((s) => (
          <li key={s.localStartDate}>
            <button type="button" className="slot" aria-pressed={picked === s.localStartDate} onClick={() => onPick(s)}>{timeLabel(s.localStartDate)}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const TimeSkeleton = () => (
  <div className="time-grid" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-11 animate-pulse bg-secondary" />)}</div>
);

export const ZoneLine = ({ timeZone }: { timeZone: string }) => <p className="text-xs text-muted-foreground">Time zone: {zoneLabel(timeZone)}</p>;

/**
 * The one action of a calendar. It sits in the card; on a phone, once a time is picked and the card's button has scrolled out of
 * view, the same action is also carried by a bar at the foot of the viewport (price and action stay reachable).
 */
export function PickAction({ label, picked, service, onGo }: { label: string; picked: Slot | null; service: ServiceDTO; onGo: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <>
      <button ref={ref} type="button" className="btn btn-primary btn-sm w-full sm:w-auto" disabled={!picked} onClick={onGo}>{label}</button>
      {picked && !visible && (
        <div className="action-bar">
          <div className="wrap flex items-center justify-between gap-4">
            <p className="min-w-0 text-sm leading-tight"><span className="block truncate font-semibold">{service.name}</span><span className="block truncate text-muted-foreground">{whenLabel(picked.localStartDate)} <span aria-hidden="true">·</span> {formatDuration(service.minutes)}</span></p>
            <button type="button" className="btn btn-primary btn-sm shrink-0" onClick={onGo}>{label}</button>
          </div>
        </div>
      )}
    </>
  );
}

/** Pick a slot: store the appointment and go to Confirm. */
export function goToConfirm(service: ServiceDTO, slot: Slot, timeZone: string, from: Appointment["from"]) {
  setSelection(toAppointment(service, slot, timeZone, from));
  location.assign("/book/confirm");
}
