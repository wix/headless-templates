// Selection state + validation for one product; the single path from choices
// to a Cart V2 add, used by quick add and the product page.
import { useMemo, useState } from "react";
import { variantIndex, resolveVariant, available, catalogItem } from "../lib/store";
import { addToCart } from "../lib/cart-client";

export function usePurchase(product: any, initial: Record<string, string> = {}) {
  const idx = useMemo(() => variantIndex(product), [product]);
  const [selected, setSelected] = useState<Record<string, string>>(initial); // starts empty: no pre-picked choice
  const [mods, setMods] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [tried, setTried] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const opts = product?.options ?? [];
  const complete = opts.every((o: any) => selected[o._id]);
  const variant = resolveVariant(product, idx, selected);
  const modsMissing = (product?.modifiers ?? []).filter((m: any) => m.mandatory && !(mods[m.modifierRenderType === "FREE_TEXT" ? m.freeTextSettings?.key ?? m.key : m.key] ?? "").trim());
  const preorder = variant ? variant.inventoryStatus?.inStock === false && variant.inventoryStatus?.preorderEnabled === true
    : product?.inventory?.preorderStatus === "ENABLED" && product?.inventory?.availabilityStatus === "OUT_OF_STOCK";

  // Action precedence: unavailable combination → pre-order → out of stock → purchasable.
  let state: "incomplete" | "unavailable" | "soldOut" | "ok" = "ok";
  let reason = "";
  if (!complete) { state = "incomplete"; const first = opts.find((o: any) => !selected[o._id]); reason = `Choose a ${String(first?.name).toLowerCase()}`; }
  else if (!variant) { state = "unavailable"; reason = "This combination isn't available"; }
  else if (!available(variant)) { state = "soldOut"; reason = "Out of stock — try another option"; }
  // One label everywhere; the button is disabled (grey) until every choice is made and the variant can be bought.
  const label = "Add to Cart";

  const select = (optionId: string, choiceId: string) => { setSelected((s) => ({ ...s, [optionId]: choiceId })); setQty(1); setError(null); };
  const setMod = (k: string, v: string) => setMods((m) => ({ ...m, [k]: v }));

  async function add() {
    if (busy) return false; // buttons stay focusable while busy (a disabled button drops focus); ignore repeats here
    setTried(true); setError(null);
    if (state !== "ok" || modsMissing.length) return false;
    const modifierChoices: Record<string, string> = {}; const customTextFields: Record<string, string> = {};
    for (const m of product.modifiers ?? []) {
      if (m.modifierRenderType === "FREE_TEXT") { const k = m.freeTextSettings?.key ?? m.key; if (mods[k]?.trim()) customTextFields[k] = mods[k].trim(); }
      else if (mods[m.key]) modifierChoices[m.key] = mods[m.key];
    }
    setBusy(true);
    try { await addToCart([catalogItem({ product, variant, quantity: qty, modifierChoices, customTextFields, preorder })]); return true; }
    catch (e: any) { setError(e.message ?? "Couldn't add to bag. Please try again."); return false; }
    finally { setBusy(false); }
  }
  return { idx, selected, select, mods, setMod, qty, setQty, variant, state, reason, label, preorder, tried, add, busy, error, modsMissing };
}
