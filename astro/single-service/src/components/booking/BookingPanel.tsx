// The booking card's content, shared by the Home widget (HomeWidget.tsx, which animates it) and the stand-alone booking pages (BookingCard):
// a centred service heading, the location plaque, a month header with week arrows, a 7-day strip and ALL of the selected day's times together,
// then "Book now". A time is picked first; Book now takes it to Confirm (or to `fallbackHref` when nothing is picked).
// Client-only: availability is session- and time-zone-specific. A slot is re-checked on Confirm.
import { useEffect, useMemo, useState } from "react";
import { nextAvailable, groupByDay, type Slot } from "../../lib/availability";
import { addDays, dayLongOfKey, dayNumOfKey, monthLabel, timeLabel, todayIn, weekDays, weekStart, weekdayOfKey } from "../../lib/dates";
import { visitorZone } from "../../lib/drafts";
import { MONTHS_AHEAD } from "../../lib/site";
import { formatDuration, formatPrice, type ServiceDTO } from "../../lib/services";
import type { Appointment } from "../../lib/selection";
import { Chevron, ZoneLine, goToConfirm, useSlotLoader } from "./calendar-kit";

/** The visitor's week-by-week view of one service's availability: which week, which day, which time is picked. */
export function useWeekAvailability(service: ServiceDTO) {
  const tz = useMemo(() => visitorZone(), []);
  const today = useMemo(() => todayIn(tz), [tz]);
  const load = useSlotLoader(service.id, tz);
  const firstWeek = weekStart(today);
  const lastWeek = useMemo(() => weekStart(addDays(today, MONTHS_AHEAD * 30)), [today]);

  const [week, setWeek] = useState(firstWeek);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [day, setDay] = useState<string | null>(null);
  const [picked, setPicked] = useState<Slot | null>(null);
  const [jump, setJump] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [first, setFirst] = useState(true);

  useEffect(() => {
    let live = true;
    setStatus("loading"); setSlots(null); setJump(null); setPicked(null);
    (async () => {
      try {
        const from = week > today ? week : today;
        const [res, ahead] = await Promise.all([
          load(from, addDays(week, 6)),
          first ? nextAvailable({ serviceId: service.id, fromKey: today, timeZone: tz }).catch(() => undefined) : Promise.resolve(undefined),
        ]);
        if (!live) return;
        setFirst(false);
        if (!res.length && ahead) { const k = ahead.localStartDate.slice(0, 10); setDay(k); setWeek(weekStart(k)); return; }
        setSlots(res);
        setDay([...groupByDay(res).keys()].sort()[0] ?? null);
        setStatus("ready");
        if (!res.length) {
          const next = await nextAvailable({ serviceId: service.id, fromKey: addDays(week, 7), timeZone: tz }).catch(() => undefined);
          if (live && next) setJump(next.localStartDate.slice(0, 10));
        }
      } catch (e) { console.error("availability failed", e); if (live) setStatus("error"); }
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week, retry]);

  const byDay = useMemo(() => groupByDay(slots ?? []), [slots]);
  const keys = useMemo(() => weekDays(week), [week]);
  const daySlots = day ? byDay.get(day) ?? [] : [];
  return { tz, week, setWeek, firstWeek, lastWeek, slots, status, day, setDay, picked, setPicked, jump, setRetry, byDay, keys, daySlots };
}

export type WeekAvailability = ReturnType<typeof useWeekAvailability>;

export function BookingPanel({ av, service, eyebrow, from = "service", fallbackHref = "/service#book" }: { av: WeekAvailability; service: ServiceDTO; eyebrow?: string; from?: Appointment["from"]; fallbackHref?: string }) {
  const { tz, week, setWeek, firstWeek, lastWeek, slots, status, day, setDay, picked, setPicked, jump, setRetry, byDay, keys, daySlots } = av;
  // A real address when the service carries one (a custom location); otherwise the template placeholder.
  // An online service has no address or map: it says where the link comes from instead.
  const online = service.locationLabel === "Online";
  const address = online ? "Online · video link sent after booking" : ["At the business", "At your location", "At a set location"].includes(service.locationLabel) ? "Add the address here" : service.locationLabel;
  return (
    <>
      <div className="hw-top">
        {eyebrow && <p className="text-base font-medium text-muted-foreground">{eyebrow}</p>}
        <h3 className="mt-2 text-h2">{service.name}</h3>
        <p className="mt-3 flex items-center justify-center gap-4 text-lg font-medium">
          <span className="inline-flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" /><path d="M8 4.5V8l2.25 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {formatDuration(service.minutes)}
          </span>
          <span aria-hidden="true" className="text-muted-foreground">·</span>
          <span>{formatPrice(service.price)}</span>
        </p>
      </div>

      <div className="hw-loc">
        <p className="hw-addr">{address}</p>
        {/* On hover the map slides down out of view (clipped) and the Show on Maps button rides in from above. */}
        {!online && (
          <div className="hw-aside">
            <svg className="hw-map" width="64" height="40" viewBox="0 0 64 40" aria-hidden="true">
              <rect width="64" height="40" fill="#ececea" />
              <path d="M-4 28L68 14M22 -4l10 48M44 -4l5 48" stroke="#fff" strokeWidth="4" fill="none" />
              <path d="M50 26l18 7v14H48z" fill="#d8e6d2" />
              <circle cx="33" cy="20" r="9" fill="#fff" />
              <circle cx="33" cy="20" r="6" fill="#3f9d63" />
            </svg>
            <a className="hw-maps-btn" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer">Show on Maps</a>
          </div>
        )}
      </div>

      <div className="hw-cal">
        <div className="hw-cal-head">
          <button type="button" className="hw-nav" aria-label="Previous week" disabled={week <= firstWeek} onClick={() => setWeek(addDays(week, -7))}><Chevron dir="left" /></button>
          <h3 className="text-base font-medium" aria-live="polite">{monthLabel(day ?? week)}</h3>
          <button type="button" className="hw-nav" aria-label="Next week" disabled={week >= lastWeek} onClick={() => setWeek(addDays(week, 7))}><Chevron dir="right" /></button>
        </div>
        <ul className="hw-days" aria-label="Days" aria-busy={status === "loading"}>
          {keys.map((d) => (
            <li key={d}>
              <button type="button" className="hw-day" aria-pressed={day === d} disabled={!byDay.has(d)} aria-label={`${dayLongOfKey(d)}${byDay.has(d) ? "" : ", no times"}`} onClick={() => { setDay(d); setPicked(null); }}>
                <span className="hw-wd" aria-hidden="true">{weekdayOfKey(d).charAt(0)}</span><span className="hw-num">{dayNumOfKey(d)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="hw-times" aria-live="polite">
          {status === "loading" && <div className="hw-grid" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-11 animate-pulse rounded-chip bg-secondary" />)}</div>}
          {status === "error" && (
            <div className="py-4 text-center text-sm">
              <p>Times could not be loaded.</p>
              <button type="button" className="btn btn-secondary btn-sm mt-3" onClick={() => setRetry((n) => n + 1)}>Try again</button>
            </div>
          )}
          {status === "ready" && !slots?.length && (
            <div className="py-4 text-center text-sm">
              <p>No times this week.</p>
              {jump && <button type="button" className="btn btn-secondary btn-sm mt-3" onClick={() => setWeek(weekStart(jump))}>Next available: {dayLongOfKey(jump)}</button>}
            </div>
          )}
          {status === "ready" && !!slots?.length && (
            <ul className="hw-grid" aria-label={day ? `Times on ${dayLongOfKey(day)}` : "Times"}>
              {daySlots.map((s) => (
                <li key={s.localStartDate}>
                  <button type="button" className="hw-slot" aria-pressed={picked?.localStartDate === s.localStartDate} onClick={() => setPicked(s)}>{timeLabel(s.localStartDate)}</button>
                </li>
              ))}
            </ul>
          )}
        </div>

      <button type="button" className="btn btn-primary mt-4 w-full" onClick={() => (picked ? goToConfirm(service, picked, tz, from) : location.assign(fallbackHref))}>Book now</button>
      <div className="mt-3 text-center"><ZoneLine timeZone={tz} /></div>
    </>
  );
}
