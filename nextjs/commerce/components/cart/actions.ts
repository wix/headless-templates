"use server";

import {
  addToCart,
  createCheckoutUrl,
  getCart,
  removeFromCart,
  updateCart,
} from "lib/wix";
import { ProductVariant } from "lib/wix/types";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const addItem = async (
  _prevState: unknown,
  item: {
    productId: string;
    variant?: ProductVariant;
  },
) => {
  if (!item.productId) {
    return "Missing product ID";
  }

  try {
    await addToCart([
      { productId: item.productId, variant: item.variant, quantity: 1 },
    ]);
    revalidatePath("/", "layout");
  } catch (e) {
    return "Error adding item to cart";
  }
};

export const removeItem = async (
  _prevState: unknown,
  lineId: string,
): Promise<String | undefined> => {
  try {
    await removeFromCart([lineId]);
    revalidatePath("/", "layout");
  } catch (e) {
    return "Error removing item from cart";
  }
};

export const updateItemQuantity = async (
  _prevState: unknown,
  {
    lineId,
    variantId,
    quantity,
  }: {
    lineId: string;
    variantId: string;
    quantity: number;
  },
) => {
  try {
    const cart = await getCart();

    if (!cart) {
      return "Error fetching cart";
    }

    const lineItem = cart.lines.find((line) => line.id === lineId);

    if (lineItem && lineItem.id) {
      if (quantity === 0) {
        await removeFromCart([lineItem.id]);
      } else {
        await updateCart([
          {
            id: lineItem.id,
            quantity,
          },
        ]);
      }
    }

    revalidatePath("/", "layout");
  } catch (e) {
    console.error(e);
    return "Error updating item quantity";
  }
};

export async function redirectToCheckout() {
  const checkoutUrl = await createCheckoutUrl(
    new URL((await headers()).get("referer")!).origin,
  );

  redirect(checkoutUrl);
}
