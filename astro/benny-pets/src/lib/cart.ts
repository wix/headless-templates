import { currentCart } from "@wix/ecom";

/**
 * A visitor with no cart yet gets an error rather than an empty cart — that's
 * a normal state, not a failure.
 */
export async function getCartSafe() {
  try {
    return await currentCart.getCurrentCart();
  } catch {
    return null;
  }
}

export function countItems(cart: any): number {
  return cart?.lineItems?.reduce((sum: number, item: any) => sum + (item.quantity ?? 0), 0) ?? 0;
}

export async function getCartCount(): Promise<number> {
  return countItems(await getCartSafe());
}

/**
 * Totals come from the estimate call, which is what actually knows the
 * currency and the discounts — never add up line prices by hand.
 */
export async function getCartSubtotal(): Promise<string | null> {
  try {
    const { priceSummary }: any = await currentCart.estimateCurrentCartTotals({});
    return priceSummary?.subtotal?.formattedAmount ?? null;
  } catch (err) {
    console.error("[cart] could not estimate totals:", err);
    return null;
  }
}
