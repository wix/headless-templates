// The free-shipping threshold, read from the store's own shipping rules (Dashboard → Settings → Shipping & delivery) so the cart's
// progress bar follows whatever amount the owner sets there — no second copy of the number in code or CMS.
// It is the lowest "free" rate (amount 0) that is gated by a cart-total minimum (BY_TOTAL_PRICE ≥ X) across the shipping options.
// null = no such rule (free for everyone, or no free option) or the read failed: the bar is simply not shown.
// Server-side only: visitors may not read shipping options, so the call is elevated (the value, not the rules, goes to the page).
import { auth } from "@wix/essentials";
import { shippingOptions } from "@wix/ecom";

let cache: { at: number; value: number | null } | null = null;

export async function getFreeShippingThreshold(): Promise<number | null> {
  if (cache && Date.now() - cache.at < 60_000) return cache.value;
  try {
    const query = auth.elevate(shippingOptions.queryShippingOptions) as unknown as () => { find: () => Promise<{ items?: any[] }> };
    const { items = [] } = await query().find();
    const mins: number[] = [];
    for (const o of items) {
      for (const r of (o.rates ?? []) as { amount?: string; active?: boolean; conditions?: { type?: string; operator?: string; value?: string }[] }[]) {
        if (r.active === false || Number(r.amount) !== 0) continue;
        const c = (r.conditions ?? []).find((x) => x.type === "BY_TOTAL_PRICE" && (x.operator === "GTE" || x.operator === "GT"));
        if (c && Number(c.value) > 0) mins.push(Number(c.value));
      }
    }
    const value = mins.length ? Math.min(...mins) : null;
    cache = { at: Date.now(), value };
    return value;
  } catch (err) {
    console.error("shipping: threshold read failed", err);return cache?.value ?? null; // not cached: the next request tries again
  }
}
