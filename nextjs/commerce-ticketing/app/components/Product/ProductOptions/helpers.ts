import { productsV3 } from '@wix/stores';

export type SelectedOptions = Record<string, string | null>;
import { Dispatch, SetStateAction } from 'react';

export function selectDefaultOptionFromProduct(
  product: productsV3.V3Product,
  updater: Dispatch<SetStateAction<SelectedOptions>>
) {
  // Selects the default option
  product.options?.forEach((option) => {
    updater((choices) => ({
      ...choices,
      [option.name!]: option.choicesSettings?.choices?.[0]?.name!,
    }));
  });
}
