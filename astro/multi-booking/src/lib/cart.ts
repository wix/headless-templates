// The visitor's list of chosen appointments: held in memory on the client, backed up in sessionStorage so a
// reload or a trip to the hosted checkout does not lose it. Nothing exists in Bookings until "Book now".
// Browser storage throws (private windows, blocked site data): every read and write is guarded, and the
// list still works for the life of the page without it. It is per-device and per-tab by nature.
import { useSyncExternalStore } from "react";
import { CART_STORAGE_KEY } from "./site";
import { overlaps } from "./dates";

export type Appointment = {
  id: string; // client-side id of this selection
  serviceId: string;
  serviceName: string;
  minutes: number;
  price: { value: string; currency: string } | null;
  payment: { online: boolean; inPerson: boolean };
  formId?: string;
  locationLabel: string;
  startDate: string; // local "YYYY-MM-DDThh:mm:ss" in `timeZone`
  endDate: string;
  timeZone: string;
  scheduleId?: string | null;
  /** The staff member the booking will name (always concrete: "Any staff member" resolves to one). */
  staff: { id: string; name: string };
  /** What the visitor chose in the dropdown: "any" or a staff resource id. Kept so Edit reopens it. */
  staffChoice: string;
};

let list: Appointment[] = read();
const listeners = new Set<() => void>();

function read(): Appointment[] {
  try {
    const raw = typeof sessionStorage === "undefined" ? null : sessionStorage.getItem(CART_STORAGE_KEY);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function commit(next: Appointment[]) {
  list = next;
  try { sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next)); } catch { /* storage unavailable: keep the in-memory list */ }
  listeners.forEach((l) => l());
}

export const getAppointments = () => list;
export const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
/** The live list in React. Server snapshot is empty: every consumer is a client:only island. */
export const useAppointments = () => useSyncExternalStore(subscribe, getAppointments, () => [] as Appointment[]);

export const newId = () => (globalThis.crypto?.randomUUID?.() ?? `a${Date.now()}${Math.random().toString(36).slice(2, 8)}`);

/** Add a selection, or replace the one with the same id (Edit). */
export function upsert(a: Appointment) {
  const i = list.findIndex((x) => x.id === a.id);
  commit(i >= 0 ? list.map((x, j) => (j === i ? a : x)) : [...list, a]);
}
export const remove = (id: string) => commit(list.filter((x) => x.id !== id));
export const clear = () => commit([]);

/**
 * Wix rejects two overlapping bookings for the SAME staff member in one cart (createCart: INSUFFICIENT_INVENTORY), and a CREATED booking holds nothing, so availability keeps offering the time. So the
 * time step must not offer a time that overlaps another appointment in the list for the same staff member.
 * `ignoreId` is the appointment being edited.
 */
export function conflictsSameStaff(appts: Appointment[], staffId: string, start: string, end: string, ignoreId?: string) {
  return appts.some((a) => a.id !== ignoreId && a.staff.id === staffId && overlaps(a.startDate, a.endDate, start, end));
}
/** Different staff, same clock time: Wix allows it, but one client cannot be in two places. Flagged, not blocked. */
export function overlapsAnyOther(appts: Appointment[], a: Appointment) {
  return appts.some((b) => b.id !== a.id && overlaps(a.startDate, a.endDate, b.startDate, b.endDate));
}

export const totalOf = (appts: Appointment[]) => {
  const priced = appts.filter((a) => a.price);
  const currency = priced[0]?.price?.currency ?? "";
  return { amount: priced.reduce((s, a) => s + Number(a.price!.value), 0), currency, hasPaid: priced.length > 0 };
};
