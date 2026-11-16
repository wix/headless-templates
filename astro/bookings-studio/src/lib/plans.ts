// Pricing Plans read live as a visitor (Plans V3, public plans). Price and cycle come from pricingVariants[0]
// (billingTerms + the flat-rate strategy: a decimal string); the perks are display-only text.
import { plansV3 } from "@wix/pricing-plans";
import { formatMoney } from "./services";

export type PlanDTO = { id: string; name: string; description: string; amount: number; currency: string; priceLabel: string; cycleLabel: string; perks: string[] };

function cycleLabel(t: any): string {
  const c = t?.billingCycle;
  if (t?.endType === "CYCLES_COMPLETED" || !c) return "once";
  const n = Number(c.count ?? 1);
  const unit = { DAY: "day", WEEK: "week", MONTH: "month", YEAR: "year" }[c.period as string] ?? "cycle";
  return n === 1 ? `per ${unit}` : `every ${n} ${unit}s`;
}

export function toPlan(p: any): PlanDTO {
  const v = p.pricingVariants?.[0];
  const amount = Number(v?.pricingStrategies?.[0]?.flatRate?.amount ?? 0);
  const currency = p.currency ?? "";
  return { id: p._id, name: p.name ?? "", description: p.description ?? "", amount, currency, priceLabel: amount ? formatMoney(amount, currency) : "Free", cycleLabel: cycleLabel(v?.billingTerms), perks: (p.perks ?? []).map((x: any) => x.description).filter(Boolean) };
}

/** Public, buyable plans, cheapest first. A failed read returns [] (the band and the page hide it). */
export async function getPlans(): Promise<PlanDTO[]> {
  try {
    const { items } = await plansV3.queryPlans().eq("visibility", "PUBLIC").find();
    return items.filter((p: any) => p.buyable && !p.archived).map(toPlan).sort((a, b) => a.amount - b.amount || a.name.localeCompare(b.name, "en", { numeric: true }));
  } catch (err) { console.error(err);
    return [];
  }
}
