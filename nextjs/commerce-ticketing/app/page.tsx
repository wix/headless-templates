import { getWixClient } from '@app/hooks//useWixClientServer';
import { wixEventsV2 as wixEvents } from '@wix/events';
import { productsV3 } from '@wix/stores';
import { HomeScreen } from '@app/components/HomeScreen/HomeScreen';

export default async function Home() {
  const wixClient = await getWixClient();
  let productsForCategories: {
    category: string;
    product: productsV3.V3Product;
  }[] = [];
  try {
    const { items: collectionsItems } = await wixClient.collections
      .queryCollections()
      .ne('_id', '00000000-000000-000000-000000000001')
      .limit(3)
      .find();
    productsForCategories = await Promise.all(
      collectionsItems.map((collection) =>
        wixClient.productsV3
          .searchProducts(
            {
              filter: {
                'directCategoriesInfo.categories': {
                  $matchItems: [{ _id: collection._id! }],
                },
              } as any,
              cursorPaging: { limit: 1 },
            },
            { fields: ['CURRENCY'] }
          )
          .then((result) => ({
            product: result.products![0],
            category: collection.name!,
          }))
      )
    );
  } catch (e) {}

  let events: wixEvents.Event[] = [];
  try {
    events = (
      await wixClient.wixEvents
        .queryEvents({
          fields: [wixEvents.RequestedFields.DETAILS],
        })
        .limit(10)
        .ascending('dateAndTimeSettings.startDate')
        .find()
    ).items;
  } catch (e) {}
  return (
    <HomeScreen events={events} productsForCategories={productsForCategories} />
  );
}
