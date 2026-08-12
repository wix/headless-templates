import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { addToCart, removeFromCart, updateCart } from "../lib/wix";

const variant = z.union([
  z.object({
    variantId: z.string(),
  }),
  z.object({
    options: z.record(z.string()),
  }),
]);

export const server = {
  addItemToCart: defineAction({
    input: z.object({
      productId: z.string(),
      variant: z.string().transform((str) => variant.parse(JSON.parse(str))),
    }),
    accept: "form",
    async handler(input) {
      if (!input.productId) {
        return "Missing product ID";
      }

      try {
        await addToCart([
          { productId: input.productId, variant: input.variant, quantity: 1 },
        ]);
        return null;
      } catch (e) {
        return "Error adding item to cart";
      }
    },
  }),
  deleteItemFromCart: defineAction({
    input: z.object({
      lineId: z.string(),
    }),
    accept: "form",
    async handler(input) {
      try {
        await removeFromCart([input.lineId]);
        return null;
      } catch (e) {
        return "Error removing item from cart";
      }
    },
  }),
  updateItemQuantity: defineAction({
    input: z.object({
      lineId: z.string(),
      variantId: z.string(),
      quantity: z.number(),
    }),
    accept: "form",
    async handler(input) {
      try {
        await updateCart([
          {
            id: input.lineId,
            merchandiseId: input.variantId,
            quantity: input.quantity,
          },
        ]);
        return null;
      } catch (e) {
        console.error(e);
        return "Error updating item quantity";
      }
    },
  }),
};
