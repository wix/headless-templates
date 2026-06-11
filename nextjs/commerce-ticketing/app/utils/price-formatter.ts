export const formatCurrency = (
  price: number | string = 0,
  currency: string = 'USD'
) =>
  Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(Number(price));

export function formatPrice(
  data?: {
    amount: number | string;
    baseAmount?: number | string;
    currencyCode?: string;
  } | null
): string {
  const { amount, baseAmount, currencyCode } = data ?? {};
  if (
    (typeof amount !== 'number' && typeof amount !== 'string') ||
    !currencyCode
  )
    return '';

  return baseAmount
    ? formatVariantPrice({
        amount,
        baseAmount,
        currencyCode,
        locale: 'en',
      })
    : formatCurrency(amount, currencyCode);
}

function formatVariantPrice({
  amount,
  baseAmount,
  currencyCode,
  locale,
}: {
  baseAmount: number | string;
  amount: number | string;
  currencyCode: string;
  locale: string;
}) {
  const hasDiscount = Number(baseAmount) > Number(amount);
  const formatDiscount = new Intl.NumberFormat(locale, { style: 'percent' });
  const discount = hasDiscount
    ? formatDiscount.format(
        (Number(baseAmount) - Number(amount)) / Number(baseAmount)
      )
    : null;

  const price = formatCurrency(amount, currencyCode);
  const basePrice = hasDiscount
    ? formatCurrency(baseAmount, currencyCode)
    : null;

  return price;
}
