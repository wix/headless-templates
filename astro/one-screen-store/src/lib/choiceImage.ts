import type { UseProductDetail } from "../hooks/storefront/useProductDetail";

/** The photo of the choice the shopper has picked (first option group with a picked choice that has its own photo), else null. */
export function selectedChoiceImage(groups: UseProductDetail["optionGroups"], choiceMedia: Record<string, string>): string | null {
  for (const g of groups) {
    const hit = g.choices.find((c) => c.selected && choiceMedia[c.choiceId]);
    if (hit) return choiceMedia[hit.choiceId];
  }
  return null;
}
