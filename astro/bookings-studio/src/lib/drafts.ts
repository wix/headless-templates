// Small per-tab drafts in sessionStorage, every access guarded (storage throws in private windows or with site data blocked).
import { PLACED_STORAGE_KEY } from "./site";
const get = <T,>(key: string, fallback: T): T => { try { const v = sessionStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch (err) { console.error(err); return fallback; } };
const set = (key: string, value: unknown) => { try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (err) { console.error(err); /* storage unavailable: the draft lives for the page only */ } };
const del = (key: string) => { try { sessionStorage.removeItem(key); } catch (err) { console.error(err); /* ignore */ } };

/** The typed client details, kept across a failed attempt and a trip to hosted checkout and back. */
export const loadDetails = () => get<Record<string, string>>("details.v1", {});
export const saveDetails = (v: Record<string, string>) => set("details.v1", v);
export const clearDetails = () => del("details.v1");

/** What the last successful placeOrder booked: the only thing the confirmation page can show. */
export type Placed = { serviceName: string; kind: "class" | "course"; when: string; participants: number; total: string; email?: string; at: number };
export const loadPlaced = () => get<Placed | null>(PLACED_STORAGE_KEY, null);
export const savePlaced = (p: Placed) => set(PLACED_STORAGE_KEY, p);
/** What the visitor was booking when they left for hosted checkout (so the return page can offer a way back). */
export type Pending = { href: string; serviceName: string };
export const loadPending = () => get<Pending | null>("pending.v1", null);
export const savePending = (p: Pending) => set("pending.v1", p);
export const clearPending = () => del("pending.v1");
