import { useService } from "@wix/services-manager-react";
import { CurrentCartServiceDefinition } from "@wix/ecom/services";
import { checkout } from "@wix/ecom";
import { redirects } from "@wix/redirects";

/** CMS App ID for catalog references */
const CMS_APP_ID = "e593b0bd-b783-45b8-97c2-873d42aacaf4";

/**
     * Buy now - skips the cart and goes directly to checkout.
     * Creates a checkout with the specified items and redirects to payment.
     * NOTE: Always show a loading state - this redirects and takes time!
     *
     * @param items - Array of items with collectionId, itemId, and optional quantity
     */
export async function buyNow(
      items: Array<{ collectionId: string; itemId: string; quantity?: number }>
): Promise<void> {
      if (items.length === 0) {
        throw new Error("At least one item is required for checkout");
      }

  const lineItems = items.map((item) => ({
        catalogReference: {
          catalogItemId: item.itemId,
          appId: CMS_APP_ID,
          options: { collectionId: item.collectionId },
        },
        quantity: item.quantity ?? 1,
      }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const checkoutResult = await (checkout.createCheckout as any)({
        lineItems,
        channelType: checkout.ChannelType.WEB,
      });

      if (!checkoutResult._id) {
        throw new Error("Failed to create checkout: missing checkout ID");
      }

      const { redirectSession } = await redirects.createRedirectSession({
        ecomCheckout: { checkoutId: checkoutResult._id },
        callbacks: {
          postFlowUrl: typeof window !== "undefined" ? window.location.href : "",
        },
      });

      if (!redirectSession?.fullUrl) {
        throw new Error("Failed to create redirect session: missing redirect URL");
      }

      if (typeof window !== "undefined") {
        window.location.href = redirectSession.fullUrl;
      }
}

/**
 * Hook providing eCommerce API for catalog collections.
 * NOTE: Cart operations (addToCart, checkout) require the CurrentCart provider
 * which comes from @wix/ecom/providers and is set up in the app's router configuration.
 * If not available, use the standalone buyNow() function instead.
 */
export function useEcomService() {
  let cartService: ReturnType<typeof useService<typeof CurrentCartServiceDefinition>> | null = null;
  let isCartAvailable = false;

  try {
    cartService = useService(CurrentCartServiceDefinition);
    isCartAvailable = true;
  } catch {
    // Cart provider not available - cart operations won't work
    console.warn(
      "Cart service not available. Use buyNow() for direct purchases."
    );
  }

  /**
   * Add items to the cart
   * @param items - Array of items with collectionId, itemId, and optional quantity
   */
  const addToCart = async (
    items: Array<{ collectionId: string; itemId: string; quantity?: number }>
  ): Promise<void> => {
    if (!cartService) {
      throw new Error("Cart service not available. Use buyNow() instead.");
    }
    const lineItems = items.map((item) => ({
      catalogReference: {
        catalogItemId: item.itemId,
        appId: CMS_APP_ID,
        options: { collectionId: item.collectionId },
      },
      quantity: item.quantity ?? 1,
    }));
    await cartService.addToCart(lineItems);
  };

  /**
   * Proceed to checkout with current cart items.
   * NOTE: This redirects to the checkout page - always show a loading state!
   */
  const checkout = async (): Promise<void> => {
    if (!cartService) {
      throw new Error("Cart service not available. Use buyNow() instead.");
    }
    await cartService.proceedToCheckout();
  };

  return {
    /** Whether cart operations are available */
    isCartAvailable,
    addToCart,
    checkout,
  };
}
