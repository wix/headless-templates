// The catalog-items collection carries its own `currency` field per item
// (ISO 4217, e.g. "USD") — there's no site-wide currency setting to bind CMS
// prices to, so this is sourced from the item's own CMS data rather than
// hardcoded to a symbol.
export function money(amount, currency) {
	if (typeof amount !== "number") return "";
	if (!currency) return String(amount);
	try {
		return new Intl.NumberFormat(undefined, {
			style: "currency",
			currency,
			maximumFractionDigits: 0,
		}).format(amount);
	} catch {
		return `${amount} ${currency}`;
	}
}
