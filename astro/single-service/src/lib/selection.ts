// The visitor's one chosen appointment: held in memory on the client, backed up in sessionStorage so a reload or a trip to the
// hosted checkout does not lose it. Nothing exists in Bookings until "Book now" on Confirm. Browser storage throws (private
// windows, blocked site data): every read and write is guarded and the selection still lives for the page.
import { useSyncExternalStore } from "react";
import { SELECTION_STORAGE_KEY } from "./site";

export type Appointment = {
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
  /** The staff member the booking names (always concrete). */
  staff: { id: string; name: string };
  /** Where Edit / Back return to: the calendar the time was picked on. */
  from: "home" | "service";
  /** The free intro call (shown as an online call). */
  intro: boolean;
};

/** Where "Edit" / "Back" / "Choose another time" leads: the page that holds the date picker for that booking, never the Home page. */
export const changeTimeHref = (a: Pick<Appointment, "from">) => (a.from === "home" ? "/intro" : "/service#book");

let current: Appointment | null = read();
const listeners = new Set<() => void>();

function read(): Appointment | null {
  try {
    const raw = typeof sessionStorage === "undefined" ? null : sessionStorage.getItem(SELECTION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Appointment) : null;
  } catch {
    return null;
  }
}
function commit(next: Appointment | null) {
  current = next;
  try { if (next) sessionStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(next)); else sessionStorage.removeItem(SELECTION_STORAGE_KEY); } catch { /* storage unavailable: keep the in-memory value */ }
  listeners.forEach((l) => l());
}

export const getSelection = () => current;
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
/** The live selection in React. The server snapshot is null: every consumer is a client:only island. */
export const useSelection = () => useSyncExternalStore(subscribe, getSelection, () => null);
export const setSelection = (a: Appointment) => commit(a);
export const clearSelection = () => commit(null);
