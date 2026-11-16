// Browser-side timetable reads (a client:only island: availability is session- and zone-specific).
//   Classes: eventTimeSlots.listEventTimeSlots with includeNonBookable, so full sessions come back (totalCapacity,
//            remainingCapacity, bookableCapacity, nonBookableReasons, eventInfo.waitingList).
//   Courses: Time Slots V2 does not cover courses. Their sessions are read from Calendar events.queryEvents by scheduleId
//            (visitor-readable) and carry remainingCapacity, so "N spots left" is live.
// Every state a card can be in is decided here, once; the components only draw it.
import { eventTimeSlots } from "@wix/bookings";
import { events } from "@wix/calendar";
import { addDays, dayKey, localInZone, minutesBetween } from "./dates";
import type { ServiceDTO } from "./services";

export type CardState =
  | "book"              // Class · Book
  | "waitlist"          // Class · Waitlist  (full, and the service's waitlist has places)
  | "full"              // Class · Full      (no spots, no waitlist places) / Course with no spots
  | "unavailable"       // a class the booking policy does not allow now
  | "enroll"            // Course · Enroll
  | "enrollment-closed";// Course · Enrollment closed

export type Session = {
  id: string; // stable client key: serviceId@start (an eventId can change when a series is edited, so it is never stored)
  serviceId: string;
  kind: "class" | "course";
  start: string; // local, in the display zone
  end: string;
  minutes: number;
  staff: { id: string; name: string } | null;
  state: CardState;
  total: number;
  left: number;
  waitlist?: { total: number; left: number };
  eventId?: string;
  course?: { first: string; last: string; sessions: number; status: "in-progress" | "upcoming"; index: number };
};

/** At or below this many spots a session shows its "N spots left" label (with a flame). One decision, here: a design choice, never an owner setting. */
export const LOW_SPOTS = 5;

/** The ribbon on a card or row, from live capacity only: few spots left, Full, or Waitlist. Plenty of room draws nothing. */
export function ribbonOf(s: Pick<Session, "state" | "left">): { kind: "low" | "full" | "waitlist"; label: string } | null {
  if (s.state === "full") return { kind: "full", label: "Full" };
  if (s.state === "waitlist") return { kind: "waitlist", label: "Waitlist" };
  if ((s.state === "book" || s.state === "enroll") && s.left > 0 && s.left <= LOW_SPOTS) return { kind: "low", label: `${s.left} ${s.left === 1 ? "Spot" : "Spots"} Left` };
  return null;
}

const idOf = (serviceId: string, start: string) => `${serviceId}@${start}`;

/** Class sessions for a window, paged to the end. */
export async function fetchClassSessions(classes: ServiceDTO[], fromKey: string, toKey: string, tz: string): Promise<Session[]> {
  if (!classes.length) return [];
  const byId = new Map(classes.map((c) => [c.id, c]));
  const out: Session[] = [];
  let cursor: string | undefined;
  for (let guard = 0; guard < 6; guard++) {
    const res: any = await eventTimeSlots.listEventTimeSlots({
      serviceIds: classes.map((c) => c.id),
      fromLocalDate: `${fromKey}T00:00:00`,
      toLocalDate: `${toKey}T23:59:59`,
      timeZone: tz,
      includeNonBookable: true,
      cursorPaging: cursor ? { limit: 1000, cursor } : { limit: 1000 },
    } as any);
    for (const s of res.timeSlots ?? []) {
      const svc = byId.get(s.serviceId);
      if (!svc) continue;
      out.push(classSession(s, svc));
    }
    cursor = res.cursorPagingMetadata?.cursors?.next;
    if (!res.cursorPagingMetadata?.hasNext || !cursor) break;
  }
  return out;
}

export function classSession(s: any, svc: ServiceDTO): Session {
  const total = s.totalCapacity ?? svc.capacity;
  const left = s.bookableCapacity ?? s.remainingCapacity ?? 0;
  const wl = s.eventInfo?.waitingList ? { total: s.eventInfo.waitingList.totalCapacity ?? 0, left: s.eventInfo.waitingList.remainingCapacity ?? 0 } : undefined;
  const noRoom = s.nonBookableReasons?.noRemainingCapacity || s.nonBookableReasons?.reservedForWaitingList || left <= 0;
  let state: CardState;
  if (s.bookable && left > 0) state = "book";
  else if (noRoom && wl && wl.left > 0) state = "waitlist";
  else if (noRoom) state = "full";
  else state = "unavailable";
  const r = s.availableResources?.[0]?.resources?.[0];
  return {
    id: idOf(svc.id, s.localStartDate), serviceId: svc.id, kind: "class", start: s.localStartDate, end: s.localEndDate,
    minutes: minutesBetween(s.localStartDate, s.localEndDate), staff: r ? { id: r._id, name: r.name } : null,
    state, total, left: Math.max(0, left), waitlist: wl, eventId: s.eventInfo?.eventId,
  };
}

export type CourseData = { service: ServiceDTO; sessions: Session[]; status: "in-progress" | "upcoming" | "ended"; closed: boolean; left: number; total: number; first: string; last: string };

/** Every course session, in the display zone, plus the course's status. Courses are few and their sessions bounded, so this is read once. */
export async function loadCourses(courses: ServiceDTO[], tz: string, now = new Date()): Promise<CourseData[]> {
  return Promise.all(courses.map(async (svc) => {
    const evs: any[] = [];
    let cursor: string | undefined;
    for (let guard = 0; guard < 5; guard++) {
      const res: any = await events.queryEvents({ filter: { scheduleId: svc.scheduleId }, sort: [{ fieldName: "start", order: "ASC" }], fields: ["RESOURCES"], cursorPaging: cursor ? { limit: 100, cursor } : { limit: 100 } } as any);
      evs.push(...(res.events ?? []));
      cursor = res.pagingMetadata?.cursors?.next ?? res.cursorPagingMetadata?.cursors?.next;
      if (!(res.pagingMetadata?.hasNext ?? res.cursorPagingMetadata?.hasNext) || !cursor) break;
    }
    const live = evs.filter((e) => e.status !== "CANCELLED");
    const local = (p: any) => (p?.timeZone === tz && p?.localDate ? p.localDate : p?.utcDate ? localInZone(p.utcDate, tz) : p?.localDate ?? "");
    const firstUtc = live[0]?.start?.utcDate ?? svc.courseSpan?.start;
    const lastUtc = live[live.length - 1]?.end?.utcDate ?? svc.courseSpan?.end;
    const t = now.getTime();
    const status = !firstUtc ? "upcoming" : t > Date.parse(lastUtc ?? firstUtc) ? "ended" : t >= Date.parse(firstUtc) ? "in-progress" : "upcoming";
    // Enrollment closes at the first session, or earlier when the course's booking policy cuts bookings off before the start.
    const closeAt = firstUtc ? Date.parse(firstUtc) - (svc.policy.limitLateMinutes ?? 0) * 60000 : Infinity;
    const total = live[0]?.totalCapacity ?? svc.capacity;
    const left = Math.max(0, live[0]?.remainingCapacity ?? total);
    const first = firstUtc ? localInZone(firstUtc, tz) : "";
    const last = lastUtc ? localInZone(lastUtc, tz) : "";
    const closed = t >= closeAt;
    const state: CardState = closed ? "enrollment-closed" : left <= 0 ? "full" : "enroll";
    const sessions: Session[] = live.map((e, i) => {
      const start = local(e.start), end = local(e.end);
      const r = e.resources?.[0];
      return { id: idOf(svc.id, start), serviceId: svc.id, kind: "course", start, end, minutes: minutesBetween(start, end), staff: r ? { id: r._id, name: r.name } : null,
        state, total, left, course: { first, last, sessions: live.length, status: status === "ended" ? "in-progress" : status, index: i + 1 } };
    });
    return { service: svc, sessions, status, closed, left, total, first, last };
  }));
}

export function groupByDay(sessions: Session[]): Map<string, Session[]> {
  const m = new Map<string, Session[]>();
  for (const s of [...sessions].sort((a, b) => a.start.localeCompare(b.start))) {
    const k = dayKey(s.start); // as returned: already in the selected time zone
    (m.get(k) ?? m.set(k, []).get(k)!).push(s);
  }
  return m;
}

/** The next upcoming class session per class service (Home tiles: "Next: Mon 6:00 PM"). One query for all classes. */
export async function nextClassSessions(classes: ServiceDTO[], fromKey: string, tz: string): Promise<Map<string, Session>> {
  const out = new Map<string, Session>();
  if (!classes.length) return out;
  const nowLocal = localInZone(new Date().toISOString(), tz);
  const all = await fetchClassSessions(classes, fromKey, addDays(fromKey, 14), tz);
  for (const s of all.sort((a, b) => a.start.localeCompare(b.start))) if (s.start > nowLocal && !out.has(s.serviceId)) out.set(s.serviceId, s);
  return out;
}

/** Re-read one class session just before booking: a slot is a claim, not a reservation. */
export async function findClassSession(svc: ServiceDTO, start: string, tz: string): Promise<Session | null> {
  const day = dayKey(start);
  const all = await fetchClassSessions([svc], day, day, tz);
  return all.find((s) => s.start === start) ?? null;
}
