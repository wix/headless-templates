// Browser-side availability reads. Appointment availability only (availabilityTimeSlots); local date strings in, local
// strings out. Runs in React islands (availability is session- and time-zone-specific). Astro managed auth is ambient.
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

/** Slots for [fromKey, toKey] in `timeZone`. Paged to the end unless `limit` is given. */
export async function fetchSlots(opts: { serviceId: string; fromKey: string; toKey: string; timeZone: string; staffId?: string; limit?: number }): Promise<Slot[]> {
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

/** The next time for a service: a limit-1 ascending query (there is no dedicated next-available call). */
export async function nextAvailable(opts: { serviceId: string; fromKey: string; timeZone: string }): Promise<Slot | undefined> {
  const r = await fetchSlots({ serviceId: opts.serviceId, fromKey: opts.fromKey, toKey: addDays(opts.fromKey, NEXT_AVAILABLE_DAYS), timeZone: opts.timeZone, limit: 1 });
  return r[0];
}

export function groupByDay(slots: Slot[]): Map<string, Slot[]> {
  const m = new Map<string, Slot[]>();
  for (const s of slots) {
    const k = dayKey(s.localStartDate); // as returned: already in the selected time zone
    (m.get(k) ?? m.set(k, []).get(k)!).push(s);
  }
  return m;
}
