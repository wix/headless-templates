import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WixClient } from '@app/components/Provider/ClientProvider';
import { useWixClient } from './useWixClient';

// NOTE: Cart V2 catalog-item shape passed to `addLineItemsToCurrentCart`.
// The precise exported V2 type (likely `currentCartV2.CatalogItem`) could not be
// verified without installed deps, so a structural type is used to keep this compiling.
type AddToCartCatalogItem = {
  quantity?: number;
  catalogReference: {
    catalogItemId: string;
    appId?: string;
    options?: Record<string, unknown>;
  };
};

export const useAddItemToCart = () => {
  const wixClient = useWixClient();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (item: AddToCartCatalogItem) => addItemFromCart(wixClient, item),
    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data.cart);
    },
  });
  return mutation.mutate;
};

async function addItemFromCart(
  wixClient: WixClient,
  item: AddToCartCatalogItem
) {
  const data = await wixClient.currentCartV2.addLineItemsToCurrentCart({
    catalogItems: [item],
  });
  if (!data?.cart?.customCheckoutUrl) {
    // Cart V2 renamed overrideCheckoutUrl -> customCheckoutUrl, and updateCurrentCart
    // takes the Cart object directly (no cartInfo wrapper).
    void wixClient.currentCartV2.updateCurrentCart({
      customCheckoutUrl: `${window.location.origin}/api/redirect-to-checkout?checkoutId={checkoutId}`,
    });
  }
  return data;
}
