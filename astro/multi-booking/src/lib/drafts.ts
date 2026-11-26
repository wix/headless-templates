// Small per-tab drafts in sessionStorage, every access guarded (storage throws in private windows or with site data blocked).
const get = <T,>(key: string, fallback: T): T => { try { const v = sessionStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; } };
const set = (key: string, value: unknown) => { try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable: the draft lives for the page only */ } };
const del = (key: string) => { try { sessionStorage.removeItem(key); } catch { /* ignore */ } };

/** The typed client details, kept so a trip to Edit an appointment does not lose them. */
export const loadDetails = () => get<Record<string, string>>("details.v1", {});
export const saveDetails = (v: Record<string, string>) => set("details.v1", v);
export const clearDetails = () => del("details.v1");

/** What the last successful placeOrder booked: the only thing the confirmation page can show. */
import type { Appointment } from "./cart";
export type Placed = { appointments: Appointment[]; email?: string; at: number };
export const loadPlaced = () => get<Placed | null>("placed.v1", null);
export const savePlaced = (p: Placed) => set("placed.v1", p);
