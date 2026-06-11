import { getWixClient } from '@app/hooks/useWixClientServer';
import { ProductView } from '@app/components/Product/ProductView';

export default async function StoresCategoryPage({ params }: any) {
  if (!params.slug) {
    return;
  }
  const wixClient = await getWixClient();
  const { product } = await wixClient.productsV3.getProductBySlug(
    decodeURIComponent(params.slug),
    {
      fields: [
        'PLAIN_DESCRIPTION',
        'CURRENCY',
        'MEDIA_ITEMS_INFO',
        'INFO_SECTION',
        'INFO_SECTION_PLAIN_DESCRIPTION',
        'VARIANT_OPTION_CHOICE_NAMES',
      ],
    }
  );
  return <ProductView product={product!} />;
}

export async function generateStaticParams(): Promise<{ slug?: string }[]> {
  const wixClient = await getWixClient();
  return wixClient.productsV3
    .queryProducts()
    .limit(10)
    .find()
    .then(({ items }) => {
      return items.map((product) => ({
        slug: product.slug ?? undefined,
      }));
    })
    .catch((err) => {
      console.error(err);
      return [];
    });
}
