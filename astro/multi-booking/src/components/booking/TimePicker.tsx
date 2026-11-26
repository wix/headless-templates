// Book a service — the time step: the service photo held on the left; on the right the service (category chip, name,
// description, Featuring / Where / Duration / Price; staff as chips) and then the time widget (monochrome, after the
// "Book appointment" reference): month + week arrows, the day strip, the day's times grouped Morning / Afternoon / Evening,
// "Next Week"; and a fixed footer: the pick, Subtotal, "+ Add another service", Next. Nothing scrolls inside.
// A slot is a claim, not a reservation: it is re-checked on Confirm. A time that overlaps another appointment in the
// list for the same staff member is disabled here, because Wix refuses that pair at checkout.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchSlots, nextAvailable, groupByDay, type Slot } from "../../lib/availability";
import { upsert, newId, useAppointments, getAppointments, conflictsSameStaff, totalOf, type Appointment } from "../../lib/cart";
import { formatMoney, formatDuration, type ServiceDTO, type StaffDTO } from "../../lib/services";
import { addDays, dayLongOfKey, dayNumOfKey, dayPart, monthLabel, monthStart, timeLabel, todayIn, weekDays, weekStart, weekdayOfKey, zoneLabel, type DayPart, parts } from "../../lib/dates";
import { visitorZone } from "../../lib/hooks";
import { WEEKS_AHEAD } from "../../lib/site";
import ConfirmDrawer from "./ConfirmDrawer";

const Chevron = ({ dir }: { dir: "left" | "right" | "down" }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d={dir === "left" ? "M10 3L5 8l5 5" : dir === "right" ? "M6 3l5 5-5 5" : "M3 6l5 5 5-5"} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Avatar({ staff }: { staff?: StaffDTO }) {
  return staff?.photo
    ? <img src={staff.photo} alt="" width="40" height="40" className="h-10 w-10 shrink-0 rounded-full object-cover" />
    : <span aria-hidden="true" className={`h-10 w-10 shrink-0 rounded-full ${staff ? "bg-muted" : "bg-foreground ring-2 ring-background"}`} />;
}

type Picked = { slot: Slot; staff: { id: string; name: string } };

// Server-rendered (client:load): the query comes from the page, and everything only the browser knows — the visitor's
// time zone and the list in sessionStorage (Edit) — is read once after hydration ("boot"), so the server HTML and the
// first client render match.
type Query = { service?: string; edit?: string; slot?: string };

export default function TimePicker({ services, query }: { services: ServiceDTO[]; query: Query }) {
  const appts = useAppointments();
  const editId = query.edit;
  const editing = useMemo(() => appts.find((a) => a.id === editId), [appts, editId]);
  const service = useMemo(() => services.find((s) => s.slug === query.service) ?? services.find((s) => s.id === editing?.serviceId), [services, query.service, editing]);
  const [booted, setBooted] = useState(false);
  const [tz, setTz] = useState("UTC"); // the visitor's zone replaces it on boot
  const today = useMemo(() => todayIn(tz), [tz]);
  const lastWeek = useMemo(() => weekStart(addDays(today, WEEKS_AHEAD * 7 - 1)), [today]);

  const [staffChoice, setStaffChoice] = useState<string>("any");
  const [week, setWeek] = useState<string>(weekStart(today));
  const [day, setDay] = useState<string | null>(null);
  const [cache, setCache] = useState<Record<string, Slot[]>>({});
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [picked, setPicked] = useState<Picked | null>(null);
  const [retry, setRetry] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false); // Confirm, as a drawer over this page
  const committedId = useRef<string | undefined>(undefined); // Next twice (after closing Confirm) updates the same appointment
  const [jump, setJump] = useState<string | null>(null); // next available day when this week is empty
  const wantSlot = useRef<string | null>(query.slot ?? null);
  const preferDay = useRef<string | null>(null); // a month pick: land on the first day with times on or after the 1st
  const initialised = useRef(false);

  const staffId = staffChoice === "any" ? undefined : staffChoice;
  const cacheKey = (w: string) => `${staffChoice}|${w}`;
  const weekKeys = useMemo(() => weekDays(week), [week]);
  const slots = cache[cacheKey(week)];
  const byDay = useMemo(() => groupByDay(slots ?? []), [slots]);

  // Load a week (cached per staff choice).
  const load = useCallback(async (w: string) => {
    if (!service) return [];
    const k = `${staffChoice}|${w}`;
    if (cache[k]) return cache[k];
    const res = await fetchSlots({ serviceId: service.id, fromKey: w, toKey: addDays(w, 6), timeZone: tz, staffId });
    setCache((c) => ({ ...c, [k]: res }));
    return res;
  }, [service, staffChoice, tz, staffId, cache]);

  // Boot, once after hydration: the visitor's time zone (and so today's week) and, for Edit, the appointment's staff
  // choice and time from the list.
  useEffect(() => {
    const zone = visitorZone();
    const ed = editId ? getAppointments().find((a) => a.id === editId) : undefined;
    if (ed) { setStaffChoice(ed.staffChoice); wantSlot.current = query.slot ?? ed.startDate; }
    setTz(zone);
    setWeek(weekStart(todayIn(zone)));
    setBooted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On a week / staff change: load the week, then settle the selected day. The handlers that change the week or the
  // staff null `day` first, so this always lands on the wanted day (Edit / modal row) or the first day with times.
  useEffect(() => {
    if (!booted || !service) return;
    let live = true;
    setStatus("loading"); setJump(null);
    (async () => {
      try {
        const first = !initialised.current;
        const want = wantSlot.current;
        // First arrival with a wanted slot (Edit, or "Book" on a modal row): go straight to its week.
        if (first && want && weekStart(want.slice(0, 10)) !== week) { setWeek(weekStart(want.slice(0, 10))); return; }
        // First arrival without one: ask for the next available time in parallel, so an empty first week costs no second round trip.
        const [res, ahead] = await Promise.all([
          load(week),
          first && !want ? nextAvailable({ serviceId: service.id, fromKey: today, timeZone: tz, count: 1, staffId }).catch(() => null) : Promise.resolve([] as Slot[]),
        ]);
        if (!live) return;
        initialised.current = true;
        // The "next available" lookup failed (after its automatic retry) and this week is empty: say so with Try again, never a silent "No times".
        if (!res.length && ahead === null) throw new Error("next available failed");
        if (!res.length && ahead?.[0]) { const k = ahead[0].localStartDate.slice(0, 10); setDay(k); setWeek(weekStart(k)); return; }
        const g = groupByDay(res);
        const wanted = want?.slice(0, 10);
        const pref = preferDay.current;
        const open = weekDays(week).filter((d) => g.has(d));
        // A month pick lands on the week of the 1st; if that week has no time on or after the 1st, move on to the next week.
        if (pref && !open.some((d) => d >= pref) && week < lastWeek) { setWeek(addDays(week, 7)); return; }
        preferDay.current = null;
        setDay(wanted && g.has(wanted) ? wanted : open.find((d) => !pref || d >= pref) ?? open[0] ?? null);
        if (want) {
          wantSlot.current = null;
          const hit = res.find((s) => s.localStartDate === want);
          if (hit) setPicked(resolve(hit));
        }
        setStatus("ready");
        if (!res.length) {
          const next = await nextAvailable({ serviceId: service.id, fromKey: addDays(week, 7), timeZone: tz, count: 1, staffId }); // a failure lands in the catch below: "Times could not be loaded" + Try again
          if (live && next[0]) setJump(next[0].localStartDate.slice(0, 10));
        }
      } catch (e) { console.error("availability read failed", e); if (live) setStatus("error"); }
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted, week, staffChoice, service?.id, retry]);

  /** Which staff member would take this slot: the chosen one, or (Any) the first free one who does not overlap the list. */
  function usableStaff(s: Slot): { id: string; name: string }[] {
    const pool = s.staff.length ? s.staff : staffChoice !== "any" ? service!.staff.filter((m) => m.id === staffChoice) : service!.staff.slice(0, 1);
    return pool.filter((m) => !conflictsSameStaff(appts, m.id, s.localStartDate, s.localEndDate, editing?.id));
  }
  function resolve(s: Slot): Picked | null {
    const usable = usableStaff(s);
    // Edit keeps the staff member the appointment already had, when that person is still free for the time.
    const st = (editing && s.localStartDate === editing.startDate && usable.find((m) => m.id === editing.staff.id)) || usable[0];
    return st ? { slot: s, staff: { id: st.id, name: st.name } } : null;
  }

  // Edit before boot: the appointment is in sessionStorage, which the server cannot read
  if (!service && editId && !booted) return <div className="mt-10 h-40 animate-pulse rounded-[18px] bg-secondary" aria-busy="true" aria-label="Loading" />;
  if (!service) {
    return (
      <div className="mt-10">
        <p className="text-lg">That service could not be found.</p>
        <a href="/book" className="btn btn-primary mt-6">Select Service</a>
      </div>
    );
  }

  const index = editing ? appts.findIndex((a) => a.id === editing.id) + 1 : appts.length + 1;
  const count = editing ? appts.length : appts.length + 1;
  const others = appts.filter((a) => a.id !== editing?.id);
  const t = totalOf(others);
  const subtotal = t.amount + (service.price ? Number(service.price.value) : 0);
  const currency = service.price?.currency ?? t.currency;
  const hasMoney = t.hasPaid || !!service.price;


  const choice = staffChoice === "any" ? undefined : service.staff.find((m) => m.id === staffChoice);

  function commitPick(): Appointment | null {
    if (!picked) return null;
    const a: Appointment = {
      id: editing?.id ?? committedId.current ?? newId(),
      serviceId: service!.id, serviceName: service!.name, minutes: service!.minutes, price: service!.price, payment: service!.payment,
      formId: service!.formId, locationLabel: service!.locationLabel,
      startDate: picked.slot.localStartDate, endDate: picked.slot.localEndDate, timeZone: tz, scheduleId: picked.slot.scheduleId,
      staff: picked.staff, staffChoice,
    };
    upsert(a);
    committedId.current = a.id;
    return a;
  }

  const pickStaff = (v: string) => { if (v !== staffChoice) { setPicked(null); setDay(null); setStaffChoice(v); } };
  const staffNames = service.staff.map((m) => m.name).join(", ");
  const arrow = (dir: "left" | "right") => (
    <button type="button" className="bk-week__arrow" aria-label={dir === "left" ? "Previous week" : "Next week"}
      disabled={dir === "left" ? week <= weekStart(today) : week >= lastWeek}
      onClick={() => { setDay(null); setPicked(null); setWeek(addDays(week, dir === "left" ? -7 : 7)); }}>
      <Chevron dir={dir} />
    </button>
  );

  const daySlots = day ? byDay.get(day) ?? [] : [];
  const groups = (["Morning", "Afternoon", "Evening"] as DayPart[]).map((g) => [g, daySlots.filter((x) => dayPart(x.localStartDate) === g)] as const).filter(([, l]) => l.length);

  return (
    <>
      <div className="bk-layout">
        {/* Left: the service photo, held in place while the right column scrolls. */}
        <div className="bk-layout__media"><div className="bk-head__media">{service.image ? <img src={service.image} alt="" width="1200" height="1500" /> : null}</div></div>

        <div className="bk-layout__main">
          {/* The service: chip, name, description, the facts, staff as chips. */}
          <section className="bk-head__info" aria-labelledby="bk-title">
            {service.category?.name && <span className="bk-chip">{service.category.name}</span>}
            <h1 id="bk-title" className="text-h2">{service.name}</h1>
            {service.description && <p className="bk-head__desc">{service.description}</p>}
            <dl className="bk-spec">
              {staffNames && <div><dt>Featuring</dt><dd>{choice ? choice.name : staffNames}</dd></div>}
              <div><dt>Where</dt><dd>{service.locationLabel}</dd></div>
              <div><dt>Duration</dt><dd>{formatDuration(service.minutes)}</dd></div>
              <div><dt>Price</dt><dd>{service.price ? formatMoney(Number(service.price.value), service.price.currency) : "Free"}</dd></div>
            </dl>
            {service.staff.length > 1 && (
              <div className="bk-staff" role="radiogroup" aria-label="Staff member">
                {[{ id: "any", name: "Any staff member" } as const, ...service.staff].map((m: any) => (
                  <button key={m.id} type="button" role="radio" aria-checked={staffChoice === m.id} className="bk-staff__chip" onClick={() => pickStaff(m.id)}>
                    {m.id !== "any" && <Avatar staff={m} />}{m.name}
                  </button>
                ))}
              </div>
            )}
            <p className="bk-meta">Appointment {index} of {count} <span aria-hidden="true">·</span> Time zone: {zoneLabel(tz)}</p>
          </section>

          {/* The times, as on the reference widget (monochrome): month + week arrows, the day strip, the day's times by
              part of day, and "Next Week". Nothing scrolls inside: the column grows. */}
          <section id="dates" className="bk-cal" aria-labelledby="bk-cal-title" aria-live="polite" aria-busy={status === "loading"}>
            <div className="bk-cal__head">
              {arrow("left")}
              <h2 id="bk-cal-title" className="bk-cal__month">{monthLabel(day ?? week)}</h2>
              {arrow("right")}
            </div>
            <ul className="bk-cal__days" aria-label="Days">
              {weekKeys.map((d) => (
                <li key={d}>
                  <button type="button" className="bk-cal__day" aria-pressed={day === d} disabled={!byDay.has(d)} aria-label={`${dayLongOfKey(d)}${byDay.has(d) ? "" : ", no times"}`} onClick={() => setDay(d)}>
                    <span>{weekdayOfKey(d)}</span><b>{Number(dayNumOfKey(d))}</b>
                  </button>
                </li>
              ))}
            </ul>
            <div className="bk-cal__body">
              {status === "loading" && <div className="bk-cal__slots" aria-hidden="true">{[0, 1, 2, 3, 4].map((k) => <div key={k} className="h-12 w-28 animate-pulse book-skel" />)}</div>}
              {status === "error" && (
                <div className="bk-note"><p>Times could not be loaded.</p><button type="button" className="btn btn-secondary btn-sm" onClick={() => setRetry((n) => n + 1)}>Try again</button></div>
              )}
              {status === "ready" && slots && slots.length === 0 && (
                <div className="bk-note"><p>No times this week.</p>{jump && <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setWeek(weekStart(jump)); setDay(jump); }}>Next available: {dayLongOfKey(jump)}</button>}</div>
              )}
              {status === "ready" && groups.map(([g, list]) => (
                <section key={g} className="bk-cal__group" aria-label={g}>
                  <h3 className="bk-cal__part">{g}</h3>
                  <ul className="bk-cal__slots">{list.map((x) => {
                    const ok = usableStaff(x).length > 0;
                    const on = picked?.slot.localStartDate === x.localStartDate;
                    return (
                      <li key={x.localStartDate}>
                        <button type="button" className="bk-slot" aria-pressed={on} disabled={!ok} title={ok ? undefined : "Overlaps another appointment in your list"} onClick={() => setPicked(resolve(x))}>{timeLabel(x.localStartDate)}</button>
                      </li>
                    );
                  })}</ul>
                </section>
              ))}
            </div>
            <button type="button" className="bk-cal__more" disabled={week >= lastWeek} onClick={() => { setDay(null); setPicked(null); setWeek(addDays(week, 7)); }}>Next Week</button>
          </section>
        </div>
      </div>

      {/* Fixed footer, only once a time is picked: the pick, subtotal and the two ways on. */}
      {picked && (
      <div className="action-bar action-bar--in">
        <div className="flow flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{dayLongOfKey(picked.slot.localStartDate.slice(0, 10))}, {timeLabel(picked.slot.localStartDate)}</span>
            <span className="ml-2">Subtotal <span className="font-medium text-foreground">{hasMoney ? formatMoney(subtotal, currency) : "Free"}</span></span></p>
          <div className="flex gap-3">
            <button type="button" className="btn btn-outline btn-sm flex-1 sm:flex-none" disabled={!picked} onClick={() => { if (commitPick()) location.assign("/book"); }}>+ Add another service</button>
            <button type="button" className="btn btn-primary btn-sm flex-1 sm:flex-none sm:px-8" disabled={!picked} onClick={() => { if (commitPick()) setConfirmOpen(true); }}>Continue</button>
          </div>
        </div>
      </div>
      )}
      <ConfirmDrawer open={confirmOpen} onClose={() => setConfirmOpen(false)} policies={services.map((x) => ({ name: x.name, lines: x.policy }))} />
    </>
  );
}
