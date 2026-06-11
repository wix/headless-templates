import { getWixClient } from '@app/hooks/useWixClientServer';
import { productsV3 } from '@wix/stores';
import { Shop } from '@app/components/Shop/Shop';

export default async function StoresCategoryPage() {
  const wixClient = await getWixClient();
  let items: productsV3.V3Product[] = [];
  try {
    items =
      (
        await wixClient.productsV3.searchProducts(
          { cursorPaging: { limit: 20 } },
          { fields: ['CURRENCY'] }
        )
      ).products ?? [];
  } catch (err) {
    console.error(err);
  }
  return <Shop items={items} />;
}
