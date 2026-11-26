// Browser-side availability reads. Appointment availability only (availabilityTimeSlots); local date
// strings in, local strings out; one query per week. Runs in React islands (availability is session- and
// time-zone-specific). Astro managed auth is ambient: no client, no clientId.
import { availabilityTimeSlots } from "@wix/bookings";
import { STAFF_RESOURCE_TYPE_ID, NEXT_AVAILABLE_DAYS } from "./site";
import { addDays, dayKey } from "./dates";

export type Slot = {
  localStartDate: string;
  localEndDate: string;
  scheduleId?: string | null;
  staff: { id: string; name: string }[]; // who can take this slot (from availableResources)
};

const toSlot = (s: any): Slot => ({
  localStartDate: s.localStartDate,
  localEndDate: s.localEndDate,
  scheduleId: s.scheduleId,
  // nested resource ids are `_id`, never `id`
  staff: (s.availableResources ?? []).flatMap((g: any) => (g.resources ?? []).map((r: any) => ({ id: r._id, name: r.name }))),
});

const ATTEMPT_MS = 10000; // one attempt that never answers ends in a failure, not an endless skeleton
const RETRY_DELAY_MS = 1500;

/** Every availability read gets ONE automatic retry after a short delay (a blip heals itself); the caller then shows "Try again". */
async function withRetry<T>(run: () => Promise<T>, retry: boolean): Promise<T> {
  const attempt = () => Promise.race([run(), new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), ATTEMPT_MS))]);
  try { return await attempt(); } catch (e) {
    if (!retry) throw e;
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    return attempt();
  }
}

/** Slots for [fromKey, toKey] in `timeZone`, optionally for one staff resource. Paged to the end. `retry: false` for a read that must not wait (the pre-submit re-check). */
export function fetchSlots(opts: { serviceId: string; fromKey: string; toKey: string; timeZone: string; staffId?: string; limit?: number; retry?: boolean }): Promise<Slot[]> {
  return withRetry(() => readSlots(opts), opts.retry !== false);
}

async function readSlots(opts: { serviceId: string; fromKey: string; toKey: string; timeZone: string; staffId?: string; limit?: number }): Promise<Slot[]> {
  const out: Slot[] = [];
  let cursor: string | undefined;
  const pageSize = opts.limit ?? 1000;
  for (let guard = 0; guard < 5; guard++) {
    const res: any = await availabilityTimeSlots.listAvailabilityTimeSlots({
      serviceId: opts.serviceId,
      fromLocalDate: `${opts.fromKey}T00:00:00`,
      toLocalDate: `${opts.toKey}T23:59:59`,
      timeZone: opts.timeZone,
      bookable: true,
      cursorPaging: cursor ? { limit: pageSize, cursor } : { limit: pageSize },
      includeResourceTypeIds: [STAFF_RESOURCE_TYPE_ID],
      ...(opts.staffId ? { resourceTypes: [{ resourceTypeId: STAFF_RESOURCE_TYPE_ID, resourceIds: [opts.staffId] }] } : {}),
    } as any);
    for (const s of res.timeSlots ?? []) out.push(toSlot(s));
    cursor = res.cursorPagingMetadata?.cursors?.next;
    if (opts.limit || !res.cursorPagingMetadata?.hasNext || !cursor) break;
  }
  return out.sort((a, b) => a.localStartDate.localeCompare(b.localStartDate));
}

/** The next `count` times for a service: a limit-N ascending query (there is no dedicated next-available call). */
export async function nextAvailable(opts: { serviceId: string; fromKey: string; timeZone: string; count: number; staffId?: string }): Promise<Slot[]> {
  return fetchSlots({ serviceId: opts.serviceId, fromKey: opts.fromKey, toKey: addDays(opts.fromKey, NEXT_AVAILABLE_DAYS), timeZone: opts.timeZone, staffId: opts.staffId, limit: opts.count });
}

export function groupByDay(slots: Slot[]): Map<string, Slot[]> {
  const m = new Map<string, Slot[]>();
  for (const s of slots) {
    const k = dayKey(s.localStartDate); // as returned: already in the selected time zone
    (m.get(k) ?? m.set(k, []).get(k)!).push(s);
  }
  return m;
}
