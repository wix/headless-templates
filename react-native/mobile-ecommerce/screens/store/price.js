const formatCurrency = (price = 0, currency = "USD") =>
  Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(price));

function formatVariantPrice({ amount, baseAmount, currencyCode, locale }) {
  const hasDiscount = baseAmount > amount;
  const formatDiscount = new Intl.NumberFormat(locale, { style: "percent" });
  const discount = hasDiscount
    ? formatDiscount.format((baseAmount - amount) / baseAmount)
    : null;

  const price = formatCurrency(amount, currencyCode);
  const basePrice = hasDiscount
    ? formatCurrency(baseAmount, currencyCode)
    : null;

  return price;
}

export function usePrice(data) {
  const { amount, baseAmount, currencyCode } = data ?? {};
  if (typeof amount !== "number" || !currencyCode) return "";

  return baseAmount
    ? formatVariantPrice({ amount, baseAmount, currencyCode, locale: "en" })
    : formatCurrency(amount, currencyCode);
}
