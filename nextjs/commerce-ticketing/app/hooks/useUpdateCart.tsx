import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WixClient } from '@app/components/Provider/ClientProvider';
import { useWixClient } from './useWixClient';

// Cart V2 quantity update: identify the line by `_id` and set the new quantity.
// (Built into the SDK's `currentCartV2.LineItemUpdate` / `QuantityUpdate` shape at call time.)
type LineItemQuantityUpdate = { _id: string; quantity: number };

export const useUpdateCart = () => {
  const wixClient = useWixClient();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (item: LineItemQuantityUpdate) =>
      updateLineItemQuantity(wixClient, item),
    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data.cart);
    },
  });
  return mutation.mutate;
};

async function updateLineItemQuantity(
  wixClient: WixClient,
  item: LineItemQuantityUpdate
) {
  return wixClient.currentCartV2.updateLineItemsInCurrentCart({
    lineItems: [
      { lineItemId: item._id, quantity: { newQuantity: item.quantity } },
    ],
  });
}
