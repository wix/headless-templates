// The weekly timetable, client-only: availability is session- and time-zone-specific.
// Desktop (>=1280): week switcher, filters, a 7-day grid. Phone and tablet: week switcher, a day strip, a single-day list,
// filters in a sheet with an explicit Apply. Both read the same Session objects and draw the same TimetableCard.
// Filters are offered only where they vary across the sessions that exist (Service type, Service, Course status, Staff member;
// Location appears only when the services have more than one location).
import { useEffect, useMemo, useRef, useState } from "react";
import Overlay from "./Overlay";
import TimetableCard, { EmptyDay } from "./TimetableCard";
import SessionModal from "./SessionModal";
import { ChevronDown, ChevronLeft, ChevronRight, FilterIcon } from "./icons";
import type { ServiceDTO } from "../../lib/services";
import { fetchClassSessions, loadCourses, groupByDay, type CourseData, type Session } from "../../lib/schedule";
import { addDays, dayHeading, dayKey, displayZone, localInZone, todayIn, weekDays, weekRangeLabel, weekStart, weekdayOfKey, dayNumOfKey, zoneLabel, dayLong } from "../../lib/dates";
import { WEEKS_AHEAD } from "../../lib/site";

type Filters = { type: string; category: string; service: string; status: string; staff: string; location: string };
const NO_FILTERS: Filters = { type: "", category: "", service: "", status: "", staff: "", location: "" };

function readUrl(): { week?: string; day?: string; filters: Filters } {
  try {
    const q = new URLSearchParams(location.search);
    const slug = q.get("service") ?? "";
    return { week: q.get("week") ?? undefined, day: q.get("day") ?? undefined, filters: { type: q.get("type") ?? "", category: q.get("category") ?? "", service: slug, status: q.get("status") ?? "", staff: q.get("staff") ?? "", location: q.get("location") ?? "" } };
  } catch (err) { console.error(err); return { filters: NO_FILTERS }; }
}
function writeUrl(week: string, thisWeek: string, day: string | null, f: Filters) {
  try {
    const q = new URLSearchParams(location.search); // keeps ?tz=
    const set = (k: string, v: string | null) => (v ? q.set(k, v) : q.delete(k));
    set("week", week === thisWeek ? null : week); set("day", day);
    set("type", f.type || null); set("category", f.category || null); set("service", f.service || null); set("status", f.status || null); set("staff", f.staff || null); set("location", f.location || null);
    const s = q.toString();
    history.replaceState(null, "", `${location.pathname}${s ? `?${s}` : ""}${location.hash}`);
  } catch (err) { console.error(err); /* history unavailable: the page works without it */ }
}

const cache = new Map<string, Session[]>();

export default function Timetable({ services, title, hideTitle = false, chips = false }: { services: ServiceDTO[]; title: string; hideTitle?: boolean; chips?: boolean }) {
  const tz = useMemo(() => displayZone(), []);
  const today = useMemo(() => todayIn(tz), [tz]);
  const nowLocal = useMemo(() => localInZone(new Date().toISOString(), tz), [tz]);
  const thisWeek = weekStart(today);
  const init = useMemo(readUrl, []);
  const bySlug = useMemo(() => new Map(services.map((s) => [s.slug, s])), [services]);
  const byId = useMemo(() => new Map(services.map((s) => [s.id, s])), [services]);
  const classes = useMemo(() => services.filter((s) => s.type === "CLASS"), [services]);
  const courseSvcs = useMemo(() => services.filter((s) => s.type === "COURSE"), [services]);

  const [week, setWeek] = useState(() => (init.week && init.week >= thisWeek ? weekStart(init.week) : thisWeek));
  const [pickedDay, setPickedDay] = useState<string | null>(init.day ?? null);
  const [filters, setFilters] = useState<Filters>(() => ({ ...init.filters, service: bySlug.get(init.filters.service)?.id ?? "" }));
  const [classSessions, setClassSessions] = useState<Session[] | null>(null);
  const [courses, setCourses] = useState<CourseData[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [coursesFailed, setCoursesFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  // A read that fails is retried ONCE automatically after a short delay; only then does the visitor see "Try again".
  // Keys already retried (a week, or "courses"); the button clears the key so a manual retry is a fresh attempt.
  const autoTried = useRef(new Set<string>());
  const AUTO_RETRY_MS = 1500;
  const [open, setOpen] = useState<Session | null>(null);
  const [sheet, setSheet] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [noMore, setNoMore] = useState(false); // a search for a later week with sessions found none

  useEffect(() => setNoMore(false), [filters]);

  // Courses: read once (few, and their sessions are bounded).
  useEffect(() => {
    let live = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    setCoursesFailed(false);
    loadCourses(courseSvcs, tz).then((c) => live && setCourses(c)).catch(() => {
      if (!live) return;
      if (!autoTried.current.has("courses")) { autoTried.current.add("courses"); timer = setTimeout(() => live && setRetry((r) => r + 1), AUTO_RETRY_MS); return; }
      setCourses([]); setCoursesFailed(true);
    });
    return () => { live = false; clearTimeout(timer); };
  }, [courseSvcs, tz, retry]);

  // Classes: one query per week, cached for the life of the page.
  useEffect(() => {
    let live = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const key = `${tz}|${week}`;
    const hit = cache.get(key);
    setFailed(false);
    if (hit) { setClassSessions(hit); return; }
    setClassSessions(null);
    fetchClassSessions(classes, week, addDays(week, 6), tz)
      .then((s) => { cache.set(key, s); live && setClassSessions(s); })
      .catch(() => {
        if (!live) return;
        if (!autoTried.current.has(key)) { autoTried.current.add(key); timer = setTimeout(() => live && setRetry((r) => r + 1), AUTO_RETRY_MS); return; }
        setFailed(true);
      });
    return () => { live = false; clearTimeout(timer); };
  }, [week, tz, classes, retry]);

  const courseSessions = useMemo(() => (courses ?? []).flatMap((c) => (c.status === "ended" ? [] : c.sessions)), [courses]);
  const all = useMemo(() => [...(classSessions ?? []), ...courseSessions.filter((s) => dayKey(s.start) >= week && dayKey(s.start) <= addDays(week, 6))], [classSessions, courseSessions, week]);

  // ── Filters: only those that vary across what exists ──
  const statusOf = (svcId: string) => courses?.find((c) => c.service.id === svcId)?.status;
  const staffAll = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of services) for (const st of s.staff) if (st.id) m.set(st.id, st.name);
    for (const s of [...(classSessions ?? []), ...courseSessions]) if (s.staff) m.set(s.staff.id, s.staff.name);
    return [...m].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }));
  }, [services, classSessions, courseSessions]);
  const categories = useMemo(() => [...new Map(services.map((s) => [s.category.id, s.category])).values()].filter((c) => c.id && c.name).sort((a, b) => a.order - b.order), [services]);
  const locations = useMemo(() => [...new Set(services.map((s) => s.locationLabel))], [services]);
  const statuses = useMemo(() => [...new Set((courses ?? []).map((c) => c.status).filter((s) => s !== "ended"))], [courses]);
  const available = {
    type: classes.length > 0 && courseSvcs.length > 0,
    category: categories.length > 1,
    service: services.length > 1,
    status: statuses.length > 1,
    staff: staffAll.length > 1,
    location: locations.length > 1,
  };
  const apply = (list: Session[]) =>
    list.filter((s) => {
      const svc = byId.get(s.serviceId);
      if (!svc || s.start <= nowLocal) return false; // sessions that already started cannot be booked
      if (filters.type && (filters.type === "course") !== (s.kind === "course")) return false;
      if (filters.category && svc.category.id !== filters.category) return false;
      if (filters.service && s.serviceId !== filters.service) return false;
      if (filters.status && (s.kind !== "course" || s.course?.status !== filters.status)) return false;
      if (filters.staff && s.staff?.id !== filters.staff && !(s.kind === "class" && !s.staff && svc.staff.some((x) => x.id === filters.staff))) return false;
      if (filters.location && svc.locationLabel !== filters.location) return false;
      return true;
    });
  const visible = useMemo(() => apply(all), [all, filters, nowLocal]);
  const byDay = useMemo(() => groupByDay(visible), [visible]);
  const days = weekDays(week);
  const loading = classSessions === null && !failed;
  const activeCount = Object.values(filters).filter(Boolean).length;

  // The phone's selected day: the one picked, else today when in this week, else the first with sessions, else Monday.
  const day = pickedDay && days.includes(pickedDay) ? pickedDay : days.includes(today) ? today : days.find((d) => byDay.has(d)) ?? days[0];
  useEffect(() => { writeUrl(week, thisWeek, pickedDay && days.includes(pickedDay) ? pickedDay : null, { ...filters, service: byId.get(filters.service)?.slug ?? "" }); }, [week, pickedDay, filters]);

  async function jumpToNext(from = addDays(week, 7)) {
    setJumping(true);
    try {
      const to = addDays(from, WEEKS_AHEAD * 7);
      const cls = await fetchClassSessions(classes, from, to, tz);
      const hit = apply([...cls, ...courseSessions.filter((s) => dayKey(s.start) >= from)]).sort((a, b) => a.start.localeCompare(b.start))[0];
      if (hit) { setNoMore(false); setWeek(weekStart(dayKey(hit.start))); setPickedDay(dayKey(hit.start)); } else setNoMore(true);
    } catch (err) { console.error(err); setFailed(true); } finally { setJumping(false); }
  }
  const nextDayWith = days.find((d) => d > day && byDay.has(d));
  // First visit, no week in the URL, and nothing left in this week (it is mostly past): open on the next week with sessions.
  const autoJumped = useRef(false);
  useEffect(() => {
    if (autoJumped.current || init.week || loading || failed || coursesFailed || courses === null || visible.length > 0) return;
    autoJumped.current = true;
    jumpToNext();
  }, [loading, failed, coursesFailed, courses, visible.length]);

  // Keep keyboard focus useful when the week changes.
  const svcOf = (s: Session) => byId.get(s.serviceId)!;
  const goWeek = (w: string) => { setWeek(w); setPickedDay(null); setNoMore(false); };
  const maxWeek = addDays(thisWeek, WEEKS_AHEAD * 7);

  const selects: { key: keyof Filters; label: string; options: { value: string; label: string }[] }[] = [
    { key: "type", label: "Service type", options: [{ value: "class", label: "Class" }, { value: "course", label: "Course" }] },
    { key: "category", label: "Category", options: categories.map((c) => ({ value: c.id, label: c.name })) },
    { key: "service", label: "Service", options: services.map((s) => ({ value: s.id, label: s.name })) },
    { key: "status", label: "Course status", options: statuses.map((s) => ({ value: s, label: s === "in-progress" ? "In progress" : "Upcoming" })) },
    { key: "staff", label: "Staff member", options: staffAll.map((s) => ({ value: s.id, label: s.name })) },
    { key: "location", label: "Location", options: locations.map((l) => ({ value: l, label: l })) },
  ].filter((f) => available[f.key as keyof typeof available]) as any;

  const rows = Math.max(1, ...days.map((d) => byDay.get(d)?.length ?? 0));
  const weekEmpty = !loading && !failed && visible.length === 0;
  const gridShown = !loading && !failed && !weekEmpty;

  return (
    <div>
      {!hideTitle && <h1 className="text-center text-h2">{title}</h1>}

      {/* Optional class-type chips (Home): one per class, plus All; they drive the same "service" filter as the dropdown. */}
      {chips && services.filter((x) => x.type === "CLASS").length > 1 && (
        <div className="up-cats tt-chips" role="group" aria-label="Class types">
          {[{ id: "", name: "All" }, ...services.filter((x) => x.type === "CLASS").map((x) => ({ id: x.id, name: x.name }))].map((c) => (
            <button key={c.id || "all"} type="button" className="up-cat" aria-pressed={filters.service === c.id} onClick={() => setFilters({ ...filters, service: c.id })}>{c.name}</button>
          ))}
        </div>
      )}

      <div className={`${hideTitle && !chips ? "week-nav" : "week-nav mt-6"}${gridShown ? " tt-list-only" : ""}`}>
        <button type="button" className="icon-btn" aria-label="Previous week" disabled={week <= thisWeek} onClick={() => goWeek(addDays(week, -7))}><ChevronLeft /></button>
        <p className="min-w-[12.5rem] text-center text-sm" aria-live="polite">{weekRangeLabel(week)}</p>
        <button type="button" className="icon-btn" aria-label="Next week" disabled={week >= maxWeek} onClick={() => goWeek(addDays(week, 7))}><ChevronRight /></button>
      </div>

      {/* Filters + time zone. Desktop: quiet text dropdowns, the zone at the right. Phone: one Filters button (sheet with Apply). */}
      <div className="tt-list-only mt-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-b border-border pb-1">
        {selects.length > 0 ? (
          <>
            <div className="tt-grid-only flex flex-wrap items-center gap-x-6">
              {selects.map((f) => (
                <label key={f.key} className="filter-select">
                  <span className="sr-only">{f.label}</span>
                  <select aria-label={f.label} value={filters[f.key]} data-active={filters[f.key] ? "true" : undefined} onChange={(e) => { setFilters({ ...filters, [f.key]: e.target.value }); }}>
                    <option value="">{f.label}</option>
                    {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown />
                </label>
              ))}
              {activeCount > 0 && <button type="button" className="link-btn" onClick={() => setFilters(NO_FILTERS)}>Clear</button>}
            </div>
            <button type="button" className="tt-list-only link-btn gap-2 no-underline" onClick={() => setSheet(true)} aria-haspopup="dialog"><FilterIcon />Filters{activeCount > 0 ? ` (${activeCount})` : ""}</button>
          </>
        ) : <span />}
        <p className="text-sm text-muted-foreground">Time zone: {zoneLabel(tz)}</p>
      </div>

      {/* Phone / tablet: the day strip. */}
      <div className="tt-list-only mt-4">
        <div className="day-rail" role="group" aria-label="Day of the week">
          {days.map((d) => {
            const n = byDay.get(d)?.length ?? 0;
            return (
              <button key={d} type="button" className="day-btn" aria-pressed={d === day} data-today={d === today ? "true" : undefined} onClick={() => setPickedDay(d)} aria-label={`${dayLong(d)}${n ? `, ${n} ${n === 1 ? "session" : "sessions"}` : ", no sessions"}`}>
                <span>{weekdayOfKey(d)}</span><span className="num">{dayNumOfKey(d)}</span><span className="dot" data-none={n ? undefined : "true"} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 lg:mt-8" aria-busy={loading} aria-live="polite">
        {(failed || coursesFailed) && (
          <div className="note mb-3 flex flex-wrap items-center justify-between gap-4" role="status"><p><strong>{failed ? "Sessions could not be loaded." : "Courses could not be loaded."}</strong> Check your connection and try again.</p><button type="button" className="btn btn-secondary btn-sm" onClick={() => { autoTried.current.clear(); setRetry((r) => r + 1); }}>Try again</button></div>
        )}
        {loading && <div className="grid gap-3" aria-label="Loading sessions">{[0, 1, 2].map((i) => <div key={i} className="h-40 animate-pulse bg-secondary" aria-hidden="true" />)}</div>}

        {weekEmpty && (
          <div className="note flex flex-wrap items-center justify-between gap-4">
            <p><strong>{activeCount ? "No sessions match these filters this week." : "No sessions this week."}</strong></p>
            <div className="flex flex-wrap gap-2">
              {activeCount > 0 && <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setFilters(NO_FILTERS); setNoMore(false); }}>Clear filters</button>}
              {noMore ? <p className="self-center text-sm">No later sessions{activeCount ? " match" : " are scheduled"}.</p> : <button type="button" className="btn btn-primary btn-sm" disabled={jumping} onClick={() => jumpToNext()}>{jumping ? "Looking…" : "Next week with sessions"}</button>}
            </div>
          </div>
        )}

        {/* Phone / tablet: a single-day list. */}
        {!loading && !failed && !weekEmpty && (
          <div className="tt-list-only">
            <h2 className="mb-3 text-lg font-medium">{dayLong(day)}</h2>
            <div className="tt-list">
              {(byDay.get(day) ?? []).map((s) => <TimetableCard key={s.id} session={s} service={svcOf(s)} tz={tz} onOpen={setOpen} />)}
              {!byDay.has(day) && <EmptyDay onNext={nextDayWith ? () => setPickedDay(nextDayWith) : () => jumpToNext(addDays(day, 1))} nextLabel={nextDayWith ? "Next day with sessions" : "Next week with sessions"} />}
            </div>
          </div>
        )}

        {/* Desktop: the 7-day grid, bounded. */}
        {!loading && !failed && !weekEmpty && (
          <div className="tt-grid-only tt-grid-wrap">
            <h3 className="sr-only">Sessions, {weekRangeLabel(week)}</h3>
            <div className="tt-grid">
              {days.map((d, i) => <div key={`h${d}`} data-col={i + 1} className="tt-head" data-today={d === today ? "true" : undefined} style={{ gridColumn: i + 1, gridRow: 1 }}>
                {i === 0 && <button type="button" className="icon-btn tt-wk tt-wk-prev" aria-label={`Previous week (now ${weekRangeLabel(week)})`} disabled={week <= thisWeek} onClick={() => goWeek(addDays(week, -7))}><ChevronLeft /></button>}
                <span>{dayHeading(d)}</span>
                {i === days.length - 1 && <button type="button" className="icon-btn tt-wk tt-wk-next" aria-label={`Next week (now ${weekRangeLabel(week)})`} disabled={week >= maxWeek} onClick={() => goWeek(addDays(week, 7))}><ChevronRight /></button>}
              </div>)}
              {days.map((d, i) => {
                const list = byDay.get(d) ?? [];
                if (!list.length) return <div key={d} data-col={i + 1} style={{ gridColumn: i + 1, gridRow: `2 / span ${rows}`, display: "flex", flexDirection: "column" }}><div className="tt-empty" data-filler={d < today ? "true" : undefined} role="status" style={{ flex: 1 }}><p>{d < today ? "Past" : "No sessions"}</p></div></div>;
                return Array.from({ length: rows }, (_, r) => (
                  <div key={`${d}-${r}`} data-col={i + 1} style={{ gridColumn: i + 1, gridRow: r + 2, display: "flex", flexDirection: "column" }}>
                    {list[r] ? <TimetableCard session={list[r]} service={svcOf(list[r])} tz={tz} onOpen={setOpen} /> : <EmptyDay filler />}
                  </div>
                ));
              })}
            </div>
          </div>
        )}
      </div>

      {open && svcOf(open) && <SessionModal session={open} service={svcOf(open)} tz={tz} onClose={() => setOpen(null)} />}
      {sheet && <FilterSheet selects={selects} value={filters} onApply={(f) => { setFilters(f); setSheet(false); }} onClose={() => setSheet(false)} />}
    </div>
  );
}

function FilterSheet({ selects, value, onApply, onClose }: { selects: { key: keyof Filters; label: string; options: { value: string; label: string }[] }[]; value: Filters; onApply: (f: Filters) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(value);
  return (
    <Overlay label="Filters" onClose={onClose}>
      <div className="flex items-center justify-between px-6 pt-5"><h2 className="text-h3">Filters</h2><button type="button" className="link-btn" onClick={() => setDraft(NO_FILTERS)}>Clear all</button></div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4 pt-4">
        <div className="grid gap-5">
          {selects.map((f) => (
            <div key={f.key}>
              <label htmlFor={`fs-${f.key}`} className="field-label">{f.label}</label>
              <select id={`fs-${f.key}`} className="field" value={draft[f.key]} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} data-autofocus={f.key === selects[0].key ? "" : undefined}>
                <option value="">All</option>
                {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3 border-t border-border px-6 py-4">
        <button type="button" className="btn btn-secondary flex-1" onClick={onClose}>Cancel</button>
        <button type="button" className="btn btn-primary flex-1" onClick={() => onApply(draft)}>Apply</button>
      </div>
    </Overlay>
  );
}
