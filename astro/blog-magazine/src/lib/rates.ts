// Exchange rates for the top bar, in US dollars: what 1 EUR and 1 GBP cost in USD today. Read from the National Bank of
// Ukraine's official daily rates (each currency against the hryvnia) and crossed through the USD rate, so every figure on the
// site is in USD. Public, keyless, read on the server and kept for an hour. A failed or slow read hides the widget.
// Source: https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json
const URL = "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json";
export const RATE_CODES = ["EUR", "GBP"] as const;
export type Rate = { code: (typeof RATE_CODES)[number]; rate: number; date: string };

let memo: { at: number; value: Rate[] } | null = null;
const TTL = 60 * 60 * 1000;

export async function getRates(): Promise<Rate[]> {
  if (memo && Date.now() - memo.at < TTL) return memo.value;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(URL, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error(String(res.status));
    const list: any[] = await res.json();
    const usd = Number(list.find((x) => x.cc === "USD")?.rate);
    if (!usd) throw new Error("no USD rate");
    const value = RATE_CODES.map((code) => list.find((x) => x.cc === code)).filter(Boolean)
      .map((x) => ({ code: x.cc, rate: Number(x.rate) / usd, date: String(x.exchangedate) })) as Rate[];
    memo = { at: Date.now(), value };
    return value;
  } catch (e) {
    console.error("[rates] read failed", e);
    return memo?.value ?? [];
  }
}
