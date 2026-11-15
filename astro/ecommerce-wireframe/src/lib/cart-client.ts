// Client cart store shared by every island on the page (header badge, drawer,
// cards, quick add, product page). All changes go through /api/cart and are
// serialized, so a stale response can never overwrite a newer one.
import { useSyncExternalStore } from "react";

type State = { cart: any; summary: any; open: boolean; loaded: boolean; pending: boolean; error: string | null; lastAddedId: string | null };
let state: State = { cart: null, summary: null, open: false, loaded: false, pending: false, error: null, lastAddedId: null };
const subs = new Set<() => void>();
const set = (patch: Partial<State>) => { state = { ...state, ...patch }; subs.forEach((f) => f()); };
export const useCart = () => useSyncExternalStore((f) => (subs.add(f), () => subs.delete(f)), () => state, () => state);

let chain: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.catch(() => {});
  return run;
}
async function call(body?: unknown) {
  const res = await fetch("/api/cart", body ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : undefined);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? "Something went wrong");
  return data;
}

let loading: Promise<void> | null = null;
export function loadCart() {
  if (state.loaded || loading) return loading ?? Promise.resolve();
  loading = serial(async () => {
    try { const d = await call(); set({ cart: d.cart, summary: d.summary, loaded: true }); }
    catch (e) { console.error("cart load", e); set({ loaded: true }); }
  });
  return loading;
}

/** Adds, confirms the line actually landed, then opens the drawer. Throws a shopper-readable message on refusal. */
export function addToCart(items: any[]) {
  return serial(async () => {
    set({ pending: true, error: null });
    try {
      const d = await call({ action: "add", items });
      const want = items[0]?.catalogReference;
      const line = (d.cart?.lineItems ?? []).find((l: any) => l.source?.catalogReference?.catalogItemId === want?.catalogItemId && (l.source?.catalogReference?.options?.variantId ?? l.catalogReference?.options?.variantId) === want?.options?.variantId)
        ?? (d.cart?.lineItems ?? []).find((l: any) => l.source?.catalogReference?.catalogItemId === want?.catalogItemId);
      if (!line || line.quantityInfo?.confirmedQuantity === 0) throw new Error("This item couldn't be added. It may have just sold out.");
      set({ cart: d.cart, summary: d.summary, loaded: true, open: true, lastAddedId: line._id });
    } finally { set({ pending: false }); }
  });
}
export function updateLine(lineItemId: string, quantity: number) {
  return serial(async () => {
    set({ pending: true, error: null });
    try { const d = await call({ action: "update", lineItemId, quantity }); set({ cart: d.cart, summary: d.summary }); }
    catch (e: any) { set({ error: e.message }); throw e; }
    finally { set({ pending: false }); }
  });
}
export function removeLine(lineItemId: string) {
  return serial(async () => {
    set({ pending: true, error: null });
    try { const d = await call({ action: "remove", lineItemId }); set({ cart: d.cart, summary: d.summary }); }
    catch (e: any) { set({ error: e.message }); throw e; }
    finally { set({ pending: false }); }
  });
}
export async function checkout() {
  await chain; // never check out mid-update
  const res = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ origin: window.location.origin }) });
  const d = await res.json().catch(() => ({}));
  if (!res.ok || !d.url) throw new Error(d.error ?? "Checkout is unavailable right now. Please try again.");
  window.location.assign(d.url);
}
export const openCart = () => { set({ open: true }); loadCart(); };
export const closeCart = () => set({ open: false, lastAddedId: null });
export const itemCount = (cart: any) => (cart?.lineItems ?? []).reduce((n: number, l: any) => n + (l.quantityInfo?.confirmedQuantity ?? l.quantity ?? 0), 0);
